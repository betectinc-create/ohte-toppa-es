import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    // デバッグ
    console.log('=== API Route Called ===');
    console.log('ENV:', process.env.ANTHROPIC_API_KEY ? 'EXISTS' : 'MISSING');
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('API Key is missing!');
      return NextResponse.json(
        { error: 'APIキーが設定されていません', success: false },
        { status: 500 }
      );
    }
    
    console.log('API Key found:', apiKey.substring(0, 10) + '...');

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const body = await request.json();
    const { company, values, question, episode, wordCount, selectionType } = body;

    const valuesText = values && values.length > 0 
      ? `\n\n${company}が特に求める人物像:\n${values.map((v: string) => `- ${v}`).join('\n')}\n\nこれらの価値観を意識してESを作成してください。`
      : '';

    const prompt = `あなたは就活生のES（エントリーシート）作成を支援するプロのキャリアアドバイザーです。

【企業情報】
企業名: ${company}
選考タイプ: ${selectionType === 'job' ? '本選考' : 'インターンシップ'}${valuesText}

【設問】
${question}

【学生のエピソード】
${episode}

【指示】
- 指定文字数: ${wordCount}字（厳守）
- ${company}の企業文化や価値観に合わせた内容にする
- 具体的で説得力のある文章にする
- 「です・ます調」で書く
- エピソードを効果的に活用する
- 結論→理由→具体例→結論の構成で書く

上記の条件で、${wordCount}字ぴったりのESを作成してください。文字数は必ず守ってください。`;

    console.log('Calling Claude API...');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const generatedText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    console.log('Success! Generated:', generatedText.substring(0, 50) + '...');

    return NextResponse.json({ 
      text: generatedText,
      success: true 
    });

  } catch (error) {
    console.error('Claude API Error:', error);
    return NextResponse.json(
      { 
        error: 'ES生成に失敗しました',
        success: false 
      },
      { status: 500 }
    );
  }
}