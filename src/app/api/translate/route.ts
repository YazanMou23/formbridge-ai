import { NextRequest, NextResponse } from 'next/server';

import openai from '@/lib/openai';


const SYSTEM_PROMPT = `You are a professional Arabic to German translator specialized in official German forms.

Your task: Translate user answers from Arabic to German accurately.

RULES:
1. Translate each Arabic answer to proper German
2. Keep names as they are (just transliterate if needed)
3. Use formal German suitable for official documents
4. For dates, use German format: DD.MM.YYYY
5. For addresses, use German format and conventions
6. Keep numbers as-is

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "translations": [
    { "fieldId": "field_1", "germanAnswer": "German translation" },
    { "fieldId": "field_2", "germanAnswer": "German translation" }
  ]
}`;

export async function POST(request: NextRequest) {
    try {
        const { answers } = await request.json();

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json({ success: false, error: 'Invalid answers' }, { status: 400 });
        }

        // Log incoming answers for debugging
        console.log('Translation request - incoming answers:', answers);

        const prompt = answers.map((a: { fieldId: string; germanQuestion: string; arabicAnswer: string }) =>
            `FieldId: "${a.fieldId}" | Question: "${a.germanQuestion}" | Arabic Answer: "${a.arabicAnswer}"`
        ).join('\n');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: `Translate these Arabic form answers to German. Return EXACTLY the same fieldId in your response:\n\n${prompt}`
                }
            ],
            max_tokens: 2000,
            temperature: 0.1,
        });

        const content = response.choices[0]?.message?.content || '';
        console.log('Translation API raw response:', content);

        // Try to extract JSON
        let jsonContent = content;
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
            jsonContent = codeBlockMatch[1];
        }

        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.error('No JSON found in translation response:', content);
            return NextResponse.json({ success: false, error: 'Translation failed' }, { status: 500 });
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Log parsed translations
        console.log('Parsed translations:', parsed.translations);

        // Ensure we have translations array
        if (!parsed.translations || !Array.isArray(parsed.translations)) {
            console.error('No translations array in response');
            return NextResponse.json({ success: false, error: 'Invalid translation format' }, { status: 500 });
        }

        return NextResponse.json({ success: true, translations: parsed.translations });

    } catch (error) {
        console.error('Translate error:', error);
        return NextResponse.json({ success: false, error: 'Translation failed' }, { status: 500 });
    }
}

