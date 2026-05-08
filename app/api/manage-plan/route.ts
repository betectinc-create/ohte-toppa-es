import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { auth, clerkClient } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as { userId?: string }));
    const { userId: authedUserId } = await auth();
    const userId = authedUserId ?? body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-01-28.clover',
    });
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let customerId: string | undefined;

    const { data: sub, error: subErr } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .order('current_period_end', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (subErr) console.error('manage-plan supabase err:', subErr);
    customerId = sub?.stripe_customer_id ?? undefined;

    if (!customerId) {
      try {
        const cc = await clerkClient();
        const u = await cc.users.getUser(userId);
        const email =
          u.primaryEmailAddress?.emailAddress ??
          u.emailAddresses?.[0]?.emailAddress;
        if (email) {
          const list = await stripe.customers.list({ email, limit: 10 });
          if (list.data.length > 0) {
            const sorted = [...list.data].sort((a, b) => b.created - a.created);
            customerId = sorted[0].id;
          }
        }
      } catch (e) {
        console.error('manage-plan clerk/email lookup err:', e);
      }
    }

    if (!customerId) {
      const list = await stripe.customers.list({ limit: 100 });
      const matched = list.data.find(
        (c) => c.metadata?.userId === userId || c.metadata?.user_id === userId
      );
      customerId = matched?.id;
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer not found', userId },
        { status: 404 }
      );
    }

    const origin =
      req.headers.get('origin') ?? 'https://www.ohte-toppa-es.com';

    const createPortalSession = (configuration?: string) =>
      stripe.billingPortal.sessions.create({
        customer: customerId!,
        return_url: origin,
        ...(configuration ? { configuration } : {}),
      });

    try {
      const portalSession = await createPortalSession();
      return NextResponse.json({ url: portalSession.url });
    } catch (e: unknown) {
      const err = e as Stripe.errors.StripeError;
      const noConfig =
        err?.code === 'billing_portal_configuration_invalid' ||
        /default configuration has not been created|No configuration provided/i.test(
          err?.message ?? ''
        );
      if (!noConfig) throw e;

      const config = await stripe.billingPortal.configurations.create({
        business_profile: {
          headline: 'プラン管理・解約',
        },
        features: {
          customer_update: {
            enabled: true,
            allowed_updates: ['email', 'name'],
          },
          invoice_history: { enabled: true },
          payment_method_update: { enabled: true },
          subscription_cancel: {
            enabled: true,
            mode: 'at_period_end',
            cancellation_reason: {
              enabled: true,
              options: [
                'too_expensive',
                'missing_features',
                'switched_service',
                'unused',
                'other',
              ],
            },
          },
        },
        default_return_url: origin,
      });
      const portalSession = await createPortalSession(config.id);
      return NextResponse.json({ url: portalSession.url });
    }
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; type?: string; raw?: { message?: string } };
    console.error('manage-plan error:', err);
    return NextResponse.json(
      {
        error: 'Failed to create portal session',
        message: err?.message ?? String(error),
        code: err?.code,
        type: err?.type,
      },
      { status: 500 }
    );
  }
}
