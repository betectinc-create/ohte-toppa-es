import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = (...args: unknown[]) => console.log('[webhook]', ...args);
const errLog = (...args: unknown[]) => console.error('[webhook]', ...args);

const getPeriodEndSec = (sub: Stripe.Subscription): number | undefined => {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (typeof top === 'number') return top;
  return sub.items?.data?.[0]?.current_period_end;
};

const toIso = (sec: number | undefined): string =>
  new Date((sec ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60) * 1000).toISOString();

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
  });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      errLog('no stripe-signature header');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    errLog('signature verification failed:', (err as Error)?.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  log('event:', event.type, event.id);

  const resolveUserIdFromCustomer = async (
    customerId: string
  ): Promise<string | undefined> => {
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .not('user_id', 'is', null)
      .limit(1)
      .maybeSingle();
    if (existing?.user_id) return existing.user_id as string;

    try {
      const sessions = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 10,
      });
      const withUser = sessions.data.find((s) => s.metadata?.userId);
      const uid = withUser?.metadata?.userId;
      if (uid) log('resolved userId via checkout sessions list:', uid);
      return uid ?? undefined;
    } catch (e) {
      errLog('checkout sessions lookup err:', e);
      return undefined;
    }
  };

  const writeSubscriptionRow = async (row: {
    user_id: string;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    status: string;
    current_period_end: string;
  }) => {
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', row.stripe_subscription_id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          user_id: row.user_id,
          stripe_customer_id: row.stripe_customer_id,
          status: row.status,
          current_period_end: row.current_period_end,
        })
        .eq('stripe_subscription_id', row.stripe_subscription_id);
      if (error) throw new Error(`supabase update: ${error.message}`);
      log('updated row for sub:', row.stripe_subscription_id);
    } else {
      const { error } = await supabase.from('subscriptions').insert(row);
      if (error) throw new Error(`supabase insert: ${error.message}`);
      log('inserted row for sub:', row.stripe_subscription_id, 'user:', row.user_id);
    }
  };

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') {
          log('skip: session.mode is not subscription');
          break;
        }
        const subscriptionId = session.subscription as string | null;
        const customerId = session.customer as string | null;
        const userId = session.metadata?.userId;
        log('checkout.session.completed:', { subscriptionId, customerId, userId });

        if (!subscriptionId || !customerId) {
          errLog('missing subscription/customer on session');
          break;
        }
        const resolvedUserId = userId ?? (await resolveUserIdFromCustomer(customerId));
        if (!resolvedUserId) {
          errLog('cannot resolve userId for session', session.id);
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await writeSubscriptionRow({
          user_id: resolvedUserId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: subscription.status,
          current_period_end: toIso(getPeriodEndSec(subscription)),
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        log(event.type, ':', {
          id: subscription.id,
          customer: customerId,
          status: subscription.status,
        });

        const userId =
          subscription.metadata?.userId ??
          (await resolveUserIdFromCustomer(customerId));
        if (!userId) {
          errLog('cannot resolve userId for subscription', subscription.id);
          break;
        }

        await writeSubscriptionRow({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_end: toIso(getPeriodEndSec(subscription)),
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | null;
        };
        const subscriptionId =
          (typeof invoice.subscription === 'string' && invoice.subscription) ||
          (invoice.lines?.data?.find((l) => l.subscription)?.subscription as
            | string
            | undefined);
        if (!subscriptionId) {
          log('skip invoice: not associated with a subscription');
          break;
        }
        const customerId = invoice.customer as string;
        log('invoice.payment_succeeded:', { invoice: invoice.id, subscriptionId, customerId });

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId =
          subscription.metadata?.userId ??
          (await resolveUserIdFromCustomer(customerId));

        if (!userId) {
          errLog('cannot resolve userId for invoice', invoice.id);
          break;
        }

        await writeSubscriptionRow({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: subscription.status,
          current_period_end: toIso(getPeriodEndSec(subscription)),
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);
        if (error) {
          errLog('supabase update (deleted) err:', error);
          throw new Error(error.message);
        }
        log('subscription canceled:', subscription.id);
        break;
      }

      default:
        log('unhandled event:', event.type);
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (error: unknown) {
    const err = error as { message?: string };
    errLog('handler error:', err);
    return NextResponse.json(
      { error: err?.message ?? String(error) },
      { status: 500 }
    );
  }
}
