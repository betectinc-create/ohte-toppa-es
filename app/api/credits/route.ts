import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  try {
    const { data: sub } = await supabase.from('subscriptions').select('status').eq('user_id', userId).eq('status', 'active').single();
    if (sub) return NextResponse.json({ credits: -1, isPremium: true });
    let { data: creditData } = await supabase.from('user_credits').select('*').eq('user_id', userId).single();
    if (!creditData) {
      const { data: newCredit } = await supabase.from('user_credits').insert({ user_id: userId, credits_remaining: 5 }).select().single();
      creditData = newCredit;
    }
    return NextResponse.json({ credits: creditData?.credits_remaining ?? 0, isPremium: false });
  } catch (error) {
    console.error('Credits GET error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  try {
    const { data: sub } = await supabase.from('subscriptions').select('status').eq('user_id', userId).eq('status', 'active').single();
    if (sub) return NextResponse.json({ credits: -1, isPremium: true, success: true });
    const { data: creditData } = await supabase.from('user_credits').select('*').eq('user_id', userId).single();
    if (!creditData || creditData.credits_remaining <= 0) return NextResponse.json({ error: 'No credits', credits: 0 }, { status: 403 });
    const newCredits = creditData.credits_remaining - 1;
    await supabase.from('user_credits').update({ credits_remaining: newCredits, updated_at: new Date().toISOString() }).eq('user_id', userId);
    return NextResponse.json({ credits: newCredits, isPremium: false, success: true });
  } catch (error) {
    console.error('Credits POST error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}