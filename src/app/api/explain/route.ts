import { NextRequest, NextResponse } from 'next/server';

import openai from '@/lib/openai';


const SYSTEM_PROMPT = `You are a helpful and friendly assistant who explains German official documents in simple Syrian Arabic dialect (اللهجة السورية).

Your goal is to help Syrian refugees or immigrants in Germany understand their paperwork without stress.

Guidelines:
1.  **Language**: Use natural, simple Syrian Arabic. Avoid formal Classical Arabic (MSA) unless necessary for specific terms, but explain them.
    *   Good: "هاد مكتوب من الجوب سنتر عم يطلبوا منك..."
    *   Bad: "هذه رسالة من مركز العمل يطلبون فيها..."
2.  **Structure**:
    *   **Summary (الموضوع باختصار)**: One sentence saying what this document is (e.g., "هاد قرار الموافقة عالبورغر غيلد" or "هي فاتورة كهربا").
    *   **Key Details (المهم)**: Bullet points of what they need to know (dates, money, deadlines).
    *   **Action Required (شو لازم تعمل)**: Clear instruction on what to do next (e.g., "لازم تبعت الورقة قبل يوم الخميس" or "ما عليك شي، بس احتفظ بالورقة").
3.  **Tone**: Reassuring, clear, and direct.
4.  If the document is unclear or partial, say so politely.

Analyze the provided image and generate this explanation.`;

export async function POST(request: NextRequest) {
    try {
        const { imageBase64 } = await request.json();

        if (!imageBase64) {
            return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: "Explain this document to me in Syrian Arabic." },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageBase64, // Supports data:image/png;base64,...
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000,
            temperature: 0.5,
        });

        const explanation = response.choices[0]?.message?.content || "عذراً، ما قدرت افهم المستند.";

        return NextResponse.json({ success: true, explanation });

    } catch (error) {
        console.error('Explanation error:', error);
        return NextResponse.json({ success: false, error: 'Explanation failed' }, { status: 500 });
    }
}
