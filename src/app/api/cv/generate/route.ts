import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an expert CV writer and career consultant specializing in the German job market. 
Your task is to take user input (provided in Arabic) and transform it into a professional, ATS-optimized German CV (Lebenslauf).

## Guidelines:
1.  **Language:** Translate all content from Arabic to professional business German.
2.  **Script:** Ensure ALL text is in Latin script. Transliterate proper names (e.g., "محمد" -> "Mohammed") if they are not already in Latin script.
3.  **Formatting:** Ensure standard German CV formatting conventions (e.g., dates in MM/YYYY format).
4.  **Optimization:** Use strong action verbs and professional terminology suitable for ATS systems.
5.  **Structure:** Return the result as a strict JSON object.

## Output JSON Structure:
{
  "personalInfo": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "linkedIn": "string (optional)",
    "xing": "string (optional)",
    "jobTitle": "string (target job title)"
  },
  "summary": "string (professional summary in German)",
  "experience": [
    {
      "title": "string (job title)",
      "company": "string",
      "location": "string",
      "startDate": "string (MM/YYYY)",
      "endDate": "string (MM/YYYY or 'Aktuell')",
      "description": "string (bullet points or paragraph describing responsibilities)"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string (optional)"
    }
  ],
  "skills": ["string", "string"],
  "languages": [
    {
      "language": "string",
      "level": "string (e.g., Muttersprache, C1, B2)"
    }
  ]
}

Ensure the JSON is valid and contains no markdown code blocks.`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { personalInfo, experience, education, skills, languages, summary } = body;

        if (!personalInfo) {
            return NextResponse.json({ success: false, error: 'Missing personal info' }, { status: 400 });
        }

        const userContent = JSON.stringify({
            personalInfo,
            summary,
            experience,
            education,
            skills,
            languages
        });

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Please create a professional German CV from this data:\n\n${userContent}` }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content || '{}';

        // Parse JSON safely
        let cvData;
        try {
            cvData = JSON.parse(content);
        } catch (e) {
            console.error("Failed to parse OpenAI response", content);
            return NextResponse.json({ success: false, error: 'Failed to generate valid JSON' }, { status: 500 });
        }

        return NextResponse.json({ success: true, cvData });

    } catch (error) {
        console.error('CV Generation error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
