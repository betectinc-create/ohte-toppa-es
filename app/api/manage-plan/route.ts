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

    const candidates: string[] = [];
    const seen = new Set<string>();
    const push = (id?: string | null) => {
      if (id && !seen.has(id)) {
        seen.add(id);
        candidates.push(id);
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
    if (subErr) console.error('manage-plan supabase err:', subErr);
    push(sub?.stripe_customer_id ?? null);

    let email: string | undefined;
    try {
      const cc = await clerkClient();
      const u = await cc.users.getUser(userId);
      email =
        u.primaryEmailAddress?.emailAddress ??
        u.emailAddresses?.[0]?.emailAddress;
    } catch (e) {
      console.error('manage-plan clerk lookup err:', e);
    }

    if (email) {
      try {
        const list = await stripe.customers.list({ email, limit: 10 });
        const sorted = [...list.data].sort((a, b) => b.created - a.created);
        for (const c of sorted) push(c.id);
      } catch (e) {
        console.error('manage-plan stripe email lookup err:', e);
      }
    }

    if (candidates.length === 0) {
      try {
        const list = await stripe.customers.list({ limit: 100 });
        const matched = list.data.find(
          (c) => c.metadata?.userId === userId || c.metadata?.user_id === userId
        );
        push(matched?.id ?? null);
      } catch (e) {
        console.error('manage-plan stripe metadata lookup err:', e);
      }
    }

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
        const portalSession = await tryCreate(customerId);
        usedCustomerId = customerId;
        portalUrl = portalSession.url;
        break;
      } catch (e: unknown) {
        const err = e as Stripe.errors.StripeError;
        lastErr = e;
        if (err?.code === 'resource_missing') {
          console.warn(
            `manage-plan: stale customer ${customerId} (resource_missing), trying next`
          );
          continue;
        }
        throw e;
      }
    }

    if (!portalUrl || !usedCustomerId) {
      throw lastErr ?? new Error('No usable Stripe customer for this user');
    }

    if (sub?.stripe_customer_id && sub.stripe_customer_id !== usedCustomerId) {
      const { error: updErr } = await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: usedCustomerId })
        .eq('user_id', userId)
        .eq('stripe_customer_id', sub.stripe_customer_id);
      if (updErr) {
        console.error('manage-plan supabase update err:', updErr);
      }
    }

    return NextResponse.json({ url: portalUrl });
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      code?: string;
      type?: string;
    };
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
