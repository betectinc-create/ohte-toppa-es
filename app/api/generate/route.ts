import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { company, values, question, episode, wordCount, selectionType } = await req.json();
  if (!company || !question || !episode) return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
  const typeLabel = selectionType === 'intern' ? 'インターンシップ選考' : '本選考';
  const valuesText = values && values.length > 0 ? `\n企業が求める人物像：${values.join('、')}。これらを自然にESに織り込んでください。` : '';
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: `あなたは就活ESライティングの専門家です。大手企業の選考を通過するESを作成してください。\n\n【執筆ルール】\n1. PREP法（結論→理由→具体例→結論）\n2. 冒頭で心を掴む（「私は〜」で始めない）\n3. 数字・固有名詞を必ず含める\n4. 1つのエピソードに絞り深掘り\n5. 課題→行動→結果→学びの流れ\n6. 曖昧表現を避け言い切る\n7. AI臭さを排除、自然な文体\n8. 文末表現に変化をつける\n9. 最後は入社後の展望で締める\n\n【避ける表現】「様々な」「コミュニケーション能力」「成長できた」等の抽象表現` },
        { role: 'user', content: `以下の条件でESを作成してください。\n\n【企業】${company}（${typeLabel}）\n【設問】${question}\n【文字数】${wordCount}字程度（±10%）${valuesText}\n\n【エピソード素材】\n${episode}\n\n※文字数厳守。出力はES本文のみ。` }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    return NextResponse.json({ success: true, text: response.choices[0]?.message?.content || '' });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ success: false, error: 'Generation failed' }, { status: 500 });
  }
}