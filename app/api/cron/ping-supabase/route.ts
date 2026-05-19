import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { count, error } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      table: 'subscriptions',
      count,
      at: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    console.error('cron ping-supabase error:', err);
    return NextResponse.json(
      { ok: false, message: err?.message ?? String(e) },
      { status: 500 }
    );
  }
}
