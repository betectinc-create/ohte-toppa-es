import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId, esText, company, question, generationType } = await req.json();

  if (!userId || !esText) {
    return NextResponse.json({ error: 'userId and esText required' }, { status: 400 });
  }

  // プレミアムチェック
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (!sub) {
    return NextResponse.json({ error: 'Premium required' }, { status: 403 });
  }

  try {
    const typeLabel = generationType === 'es' ? 'ES' : generationType === 'motivation' ? '志望動機' : 'ガクチカ';

    const systemPrompt = `あなたは大手企業の採用担当者として10年以上の経験を持つES添削のプロです。
以下のESを添削してください。

【添削の観点】
1. 構成力（PREP法・結論ファーストになっているか）
2. 具体性（数字・固有名詞が使われているか）
3. 論理性（主張と根拠が一貫しているか）
4. 企業適合度（${company ? company + 'が求める人物像に合っているか' : '企業に響く内容か'}）
5. 表現力（読みやすさ、自然な日本語か、AI臭さがないか）

【出力フォーマット（必ずこの形式で）】
## 総合評価
[A/B/C/D のいずれか + 一言コメント]

## スコア
- 構成力: [1-10]/10
- 具体性: [1-10]/10
- 論理性: [1-10]/10
- 企業適合度: [1-10]/10
- 表現力: [1-10]/10

## 良い点
[箇条書きで2-3個]

## 改善ポイント
[箇条書きで3-5個、具体的に何をどう変えるべきか]

## 修正案
[改善ポイントを反映した修正版のES全文]`;

    const userPrompt = `【種別】${typeLabel}
${company ? `【企業】${company}` : ''}
${question ? `【設問】${question}` : ''}

【添削対象のES】
${esText}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const reviewText = response.choices[0]?.message?.content || '';

    return NextResponse.json({ success: true, review: reviewText });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Review failed' }, { status: 500 });
  }
}