import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const { userId, esText, company, question, generationType } = await req.json();
  if (!userId || !esText) return NextResponse.json({ error: 'userId and esText required' }, { status: 400 });
  const { data: sub } = await supabase.from('subscriptions').select('status').eq('user_id', userId).eq('status', 'active').single();
  if (!sub) return NextResponse.json({ error: 'Premium required' }, { status: 403 });
  try {
    const typeLabel = generationType === 'es' ? 'ES' : generationType === 'motivation' ? '志望動機' : 'ガクチカ';
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: `あなたは大手企業の採用担当者として10年以上の経験を持つES添削のプロです。以下の観点で添削してください：構成力、具体性、論理性、企業適合度、表現力。出力は：総合評価(A-D)、各スコア(/10)、良い点、改善ポイント、修正案の形式で。` },
        { role: 'user', content: `【種別】${typeLabel}\n${company ? '【企業】' + company : ''}\n${question ? '【設問】' + question : ''}\n\n【添削対象】\n${esText}` }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });
    return NextResponse.json({ success: true, review: response.choices[0]?.message?.content || '' });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Review failed' }, { status: 500 });
  }
}