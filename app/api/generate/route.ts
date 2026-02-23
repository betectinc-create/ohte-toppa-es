import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { company, values, question, episode, wordCount, selectionType } = await req.json();

  if (!company || !question || !episode) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
  }

  const typeLabel = selectionType === 'intern' ? 'インターンシップ選考' : '本選考';
  const valuesText = values && values.length > 0
    ? `\n【企業が求める人物像】${values.join('、')}\n→ これらの要素を自然にESに織り込んでください。ただし直接的に「御社の〇〇という価値観に共感」のような安易な表現は避け、エピソードを通じて自然に伝わるようにしてください。`
    : '';

  const systemPrompt = `あなたは就活のESライティングの専門家です。大手企業の選考を通過するESを作成してください。

【重要な執筆ルール】
1. PREP法を基本とする: 結論→理由→具体例→結論の流れ
2. 冒頭の一文で読み手の心を掴む: 「私は〜」で始めず、結論や印象的なフレーズから始める
3. 具体性を重視: 数字（人数、期間、成果等）や固有名詞を必ず含める
4. 1つのエピソードに絞る: 複数のエピソードを並べず、1つを深掘りする
5. 課題→行動→結果→学びの流れを明確にする
6. 「〜と思います」「〜と感じました」等の曖昧な表現を避け、言い切る
7. 企業視点を意識: 「この人と一緒に働きたい」と思わせる内容にする
8. AI臭さを排除: テンプレート的な表現、過度に整った文章は避ける。話し言葉に近い自然な文体にする
9. 文末表現に変化をつける:「〜した」「〜できた」「〜である」等を混ぜる
10. 最後は入社後の展望や学びの活かし方で締める

【避けるべき表現】
- 「様々な」「多くの」→具体的な数字に置き換え
- 「コミュニケーション能力」→具体的にどんな場面でどう発揮したか
- 「成長できた」→何がどう変わったか具体的に
- 「チームワーク」→具体的にどう協力したか
- 「〜という経験を通して」→使いすぎ注意、別の接続に
- 「貴社」→ES では「御社」ではなく「貴社」が正しいが、多用は避ける`;

  const userPrompt = `以下の条件でESを作成してください。

【企業】${company}（${typeLabel}）
【設問】${question}
【文字数】${wordCount}字程度（±10%以内）${valuesText}

【ユーザーのエピソード素材】
${episode}

上記の素材をもとに、選考を通過できる質の高いESを${wordCount}字程度で作成してください。
素材に含まれる情報を最大限活用し、足りない部分は自然に補完してください。
ただし、事実を捏造しないでください。

※文字数は厳守してください。出力はES本文のみ（見出しや注釈は不要）。`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const text = response.choices[0]?.message?.content || '';
    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ success: false, error: 'Generation failed' }, { status: 500 });
  }
}