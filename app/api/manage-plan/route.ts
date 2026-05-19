import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { auth, clerkClient } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const log = (...args: unknown[]) => console.log('[manage-plan]', ...args);
const warn = (...args: unknown[]) => console.warn('[manage-plan]', ...args);
const errLog = (...args: unknown[]) => console.error('[manage-plan]', ...args);

export async function POST(req: NextRequest) {
  const triedCustomers: { id: string; result: string }[] = [];
  let candidatesDebug: string[] = [];

  try {
    log('==> request received');

    const body = await req.json().catch(() => ({} as { userId?: string }));
    const { userId: authedUserId } = await auth();
    const userId = authedUserId ?? body.userId;
    log('userId resolved:', { authed: !!authedUserId, fromBody: !!body.userId, userId });

    if (!userId) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      errLog('STRIPE_SECRET_KEY missing');
      return NextResponse.json(
        { error: 'Failed to create portal session', message: 'STRIPE_SECRET_KEY env missing' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    });
    log('stripe mode:', process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'live' : 'test');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const candidates: string[] = [];
    const seen = new Set<string>();
    const push = (id: string | null | undefined, source: string) => {
      if (id && !seen.has(id)) {
        seen.add(id);
        candidates.push(id);
        log(`candidate added from ${source}:`, id);
      }
    };

    const { data: sub, error: subErr } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .order('current_period_end', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (subErr) errLog('supabase err:', subErr);
    log('supabase sub row:', sub);
    push(sub?.stripe_customer_id ?? null, 'supabase');

    let email: string | undefined;
    try {
      const cc = await clerkClient();
      const u = await cc.users.getUser(userId);
      email =
        u.primaryEmailAddress?.emailAddress ??
        u.emailAddresses?.[0]?.emailAddress;
      log('clerk email:', email);
    } catch (e) {
      errLog('clerk lookup err:', e);
    }

    if (email) {
      try {
        const list = await stripe.customers.list({ email, limit: 10 });
        log('stripe customers by email:', list.data.map((c) => ({ id: c.id, created: c.created })));
        const sorted = [...list.data].sort((a, b) => b.created - a.created);
        for (const c of sorted) push(c.id, 'stripe-email');
      } catch (e) {
        errLog('stripe email lookup err:', e);
      }
    }

    if (candidates.length === 0) {
      try {
        const list = await stripe.customers.list({ limit: 100 });
        const matched = list.data.find(
          (c) => c.metadata?.userId === userId || c.metadata?.user_id === userId
        );
        push(matched?.id ?? null, 'stripe-metadata');
      } catch (e) {
        errLog('stripe metadata lookup err:', e);
      }
    }

    candidatesDebug = [...candidates];
    log('final candidates:', candidatesDebug);

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found', userId },
        { status: 404 }
      );
    }

    const origin =
      req.headers.get('origin') ?? 'https://www.ohte-toppa-es.com';

    let configurationId: string | undefined;
    const ensureConfig = async () => {
      if (configurationId) return configurationId;
      log('creating billing portal configuration');
      const config = await stripe.billingPortal.configurations.create({
        business_profile: { headline: 'プラン管理・解約' },
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
      configurationId = config.id;
      log('created configuration:', configurationId);
      return configurationId;
    };

    const tryCreate = async (customerId: string) => {
      try {
        return await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: origin,
          ...(configurationId ? { configuration: configurationId } : {}),
        });
      } catch (e: unknown) {
        const err = e as Stripe.errors.StripeError;
        const noConfig =
          err?.code === 'billing_portal_configuration_invalid' ||
          /default configuration has not been created|No configuration provided/i.test(
            err?.message ?? ''
          );
        if (noConfig) {
          warn('no portal config, creating one and retrying');
          const cfgId = await ensureConfig();
          return await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: origin,
            configuration: cfgId,
          });
        }
        throw e;
      }
    };

    let lastErr: unknown;
    let usedCustomerId: string | undefined;
    let portalUrl: string | undefined;
    for (const customerId of candidates) {
      try {
        log('trying customer:', customerId);
        const portalSession = await tryCreate(customerId);
        usedCustomerId = customerId;
        portalUrl = portalSession.url;
        triedCustomers.push({ id: customerId, result: 'ok' });
        log('portal session OK:', portalUrl);
        break;
      } catch (e: unknown) {
        const err = e as Stripe.errors.StripeError;
        lastErr = e;
        triedCustomers.push({
          id: customerId,
          result: `${err?.code ?? err?.type ?? 'error'}: ${err?.message ?? String(e)}`,
        });
        if (err?.code === 'resource_missing') {
          warn(`stale customer ${customerId} (resource_missing), trying next`);
          continue;
        }
        errLog(`customer ${customerId} failed (non-retryable):`, err);
        throw e;
      }
    }

    if (!portalUrl || !usedCustomerId) {
      throw lastErr ?? new Error('No usable Stripe customer for this user');
    }

    if (sub?.stripe_customer_id && sub.stripe_customer_id !== usedCustomerId) {
      log('self-heal supabase row:', sub.stripe_customer_id, '->', usedCustomerId);
      const { error: updErr } = await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: usedCustomerId })
        .eq('user_id', userId)
        .eq('stripe_customer_id', sub.stripe_customer_id);
      if (updErr) errLog('supabase update err:', updErr);
    }

    return NextResponse.json({ url: portalUrl });
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      code?: string;
      type?: string;
      raw?: { message?: string };
    };
    errLog('FAILED:', {
      message: err?.message,
      code: err?.code,
      type: err?.type,
      raw: err?.raw,
      triedCustomers,
      candidatesDebug,
    });
    return NextResponse.json(
      {
        error: 'Failed to create portal session',
        message: err?.message ?? String(error),
        code: err?.code,
        type: err?.type,
        triedCustomers,
      },
      { status: 500 }
    );
  }
}
