import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// System prompt focused on PRECISE field detection with pre-filled field awareness
const SYSTEM_PROMPT = `You are a German form analyzer with PRECISE field position detection capabilities.

## PRIMARY TASK
Analyze German form images to:
1. Detect all fillable fields (empty OR already filled)
2. Determine EXACT positions where text should be placed
3. Identify any existing content in pre-filled fields

## CRITICAL POSITIONING RULES

The image is divided into a 100x100 grid:
- TOP-LEFT corner = (0, 0)
- BOTTOM-RIGHT corner = (100, 100)
- x increases LEFT to RIGHT
- y increases TOP to BOTTOM

### MEASURING POSITIONS ACCURATELY

**For the INPUT FIELD (not the label!):**

1. **x (left edge)**: Where does the writable area BEGIN horizontally?
   - If field starts at left margin: x ≈ 2-5
   - If field starts after a short label "Name:": x ≈ 15-25
   - If field is in right half of form: x ≈ 50-60
   - If field starts after a long label: x ≈ 30-45

2. **y (top edge)**: Where does the field START vertically from page top?
   - First row of fields after header: y ≈ 12-20
   - Each subsequent row: add 4-8 to previous y
   - Fields near middle of page: y ≈ 40-60
   - Fields near bottom: y ≈ 70-90

3. **width**: How wide is the INPUT AREA (not including label)?
   - Small fields (date, phone): width ≈ 12-20
   - Medium fields (name, city): width ≈ 25-40
   - Large fields (full address): width ≈ 50-75
   - Full-width fields: width ≈ 85-95

4. **height**: How tall is the writable line/box?
   - Single line text: height ≈ 3-5
   - Two-line area: height ≈ 6-8
   - Multi-line textarea: height ≈ 10-20

## DETECTING PRE-FILLED FIELDS

IMPORTANT: Some fields may already contain handwritten or typed text!

For each field, check:
- Is there visible text/writing inside the field area?
- Can you read the existing content?

If a field is pre-filled:
- Set "prefilled": true
- Set "existingValue": "the text you can read"
- The user may not need to fill this field again

## FIELD TYPES
- "text": Single line text input
- "textarea": Multi-line text area  
- "date": Date field (DD.MM.YYYY format)
- "checkbox": Checkable box (may be checked already)
- "number": Numeric input
- "select": Dropdown or choice field

## OUTPUT FORMAT

Return ONLY this JSON (no markdown, no extra text):
{
  "formTitle": "Title of the form",
  "formType": "Type (Anmeldung, Antrag, etc.)",
  "detectedFields": [
    {
      "id": "field_1",
      "germanLabel": "The German label/question",
      "arabicLabel": "Arabic translation",
      "fieldType": "text",
      "required": true,
      "prefilled": false,
      "existingValue": null,
      "inputPosition": {
        "x": 25,
        "y": 18,
        "width": 40,
        "height": 4
      },
      "confidence": "high"
    }
  ]
}

## CONFIDENCE LEVELS
- "high": Clear box/line visible, position is certain
- "medium": Field boundaries somewhat visible
- "low": Guessing based on form layout`;

const USER_PROMPT = `Analyze this German form image with EXTREME PRECISION.

## STEP 1: Understand the Form Layout
- Is it a single-column or multi-column form?
- Where are the labels positioned relative to input fields?
- Are there any already-filled fields?

## STEP 2: For EACH Fillable Field

1. IDENTIFY the INPUT AREA (the blank/filled space for writing, NOT the label)
2. MEASURE its position as percentages:
   - x: left edge (0=far left, 100=far right)  
   - y: top edge (0=top, 100=bottom)
   - width: horizontal size
   - height: vertical size

3. CHECK if the field is already filled:
   - Look for handwritten or typed text inside the field
   - If filled, read the existing content

## STEP 3: Quality Check
- Are your x/y positions for the INPUT AREA, not the label?
- Did you include already-filled fields with their content?
- Are your widths accurate for each field type?

⚠️ COMMON ERRORS TO AVOID:
- Placing position at the LABEL instead of the INPUT FIELD
- Making all fields the same width regardless of actual size
- Missing fields that are already filled in
- Wrong y-position (not measuring from actual input line)

Be extremely precise - these coordinates will overlay text directly on the image!`;

export async function POST(request: NextRequest) {
    try {
        const { imageBase64 } = await request.json();

        if (!imageBase64) {
            return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
        }

        // Analyze form with enhanced detection
        const analysisResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: USER_PROMPT },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageBase64,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 4000,
            temperature: 0.02,  // Very low for consistency
        });

        const content = analysisResponse.choices[0]?.message?.content || '';

        // Extract JSON from response (handle various formats)
        let jsonContent = content;

        // Remove markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            jsonContent = jsonMatch[1];
        }

        // Try to find JSON object
        const objectMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (!objectMatch) {
            console.error('No JSON found in response:', content);
            return NextResponse.json({ success: false, error: 'Failed to parse form structure' }, { status: 500 });
        }

        let parsed;
        try {
            parsed = JSON.parse(objectMatch[0]);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Content:', objectMatch[0]);
            return NextResponse.json({ success: false, error: 'Invalid response format' }, { status: 500 });
        }

        // Handle both old and new response formats
        const rawFields = parsed.detectedFields || parsed.fields || [];

        if (!Array.isArray(rawFields) || rawFields.length === 0) {
            return NextResponse.json({ success: false, error: 'No fields detected in form' }, { status: 500 });
        }

        // Process and validate each field
        const processedFields = rawFields.map((field: {
            id?: string;
            germanLabel?: string;
            germanQuestion?: string;
            arabicLabel?: string;
            arabicQuestion?: string;
            fieldType?: string;
            required?: boolean;
            prefilled?: boolean;
            existingValue?: string | null;
            inputPosition?: { x?: number; y?: number; width?: number; height?: number };
            position?: { x?: number; y?: number; width?: number; height?: number };
            confidence?: string;
        }, index: number) => {
            // Get position from either format
            const pos = field.inputPosition || field.position || {};

            // Parse and clamp position values
            let x = Number(pos.x) || 5;
            let y = Number(pos.y) || (15 + index * 7);
            let width = Number(pos.width) || 40;
            let height = Number(pos.height) || 4;

            // Clamp values to valid range
            x = Math.max(0, Math.min(95, x));
            y = Math.max(0, Math.min(95, y));
            width = Math.max(5, Math.min(95 - x, width));
            height = Math.max(2, Math.min(95 - y, Math.min(25, height)));

            // Ensure field stays within bounds
            if (x + width > 98) width = 98 - x;
            if (y + height > 98) height = 98 - y;

            return {
                id: field.id || `field_${index + 1}`,
                germanQuestion: field.germanLabel || field.germanQuestion || `Feld ${index + 1}`,
                arabicQuestion: field.arabicLabel || field.arabicQuestion || `الحقل ${index + 1}`,
                fieldType: field.fieldType || 'text',
                required: field.required !== false,
                prefilled: field.prefilled || false,
                existingValue: field.existingValue || null,
                position: { x, y, width, height },
                confidence: field.confidence || 'medium',
            };
        });

        // Log detection results for debugging
        console.log('Detected fields:', processedFields.map(f => ({
            question: f.germanQuestion,
            position: f.position,
            prefilled: f.prefilled,
            existingValue: f.existingValue
        })));

        return NextResponse.json({
            success: true,
            formTitle: parsed.formTitle || 'Deutsches Formular',
            formType: parsed.formType || 'Formular',
            fields: processedFields
        });

    } catch (error) {
        console.error('Analyze error:', error);
        return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 });
    }
}
