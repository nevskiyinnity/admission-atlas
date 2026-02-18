// Prompt builders for the college analysis endpoint.
// Ported from admission-atlas-landing/lib/prompts.js

export interface AnalysisPayload {
  name: string;
  residency?: string;
  gpa?: string;
  sat?: string;
  internationalExams?: string;
  otherExams?: string;
  coursework?: string;
  activities?: string;
  awards?: string;
  university: string;
  major: string;
  preferredRegions?: string;
  question1?: string;
  question2?: string;
  question3?: string;
  question4?: string;
  question5?: string;
  question6?: string;
  question7?: string;
  question8?: string;
  question9?: string;
}

/**
 * Sanitize a user-supplied string for safe embedding into an LLM prompt.
 * Truncates to maxLength, then JSON-escapes special characters (newlines,
 * quotes, backslashes) to prevent prompt injection.
 */
export function sanitizeField(value: unknown, maxLength = 500): string {
  if (!value || typeof value !== 'string') return 'Not provided';
  const truncated = value.slice(0, maxLength);
  // JSON.stringify escapes newlines, quotes, backslashes — prevents prompt injection
  return JSON.stringify(truncated).slice(1, -1); // Remove outer quotes
}

export const SYSTEM_MESSAGE =
  'You are a precise JSON generator for a university admissions analysis engine. ' +
  'You have expert-level knowledge of global universities, their acceptance rates, costs, program strengths, and admissions requirements. ' +
  'Always resolve university names to their official form, even if the user makes typos or uses abbreviations. ' +
  'Return only valid JSON with no markdown formatting.';

export function buildAnalysisPrompt(payload: AnalysisPayload): string {
  return `
You are an expert university admissions strategy analyst with deep knowledge of universities worldwide.

CRITICAL INSTRUCTIONS:
1. FUZZY NAME RESOLUTION: The user may misspell or abbreviate the target university. You MUST infer the correct, official institution name. Examples:
   - "stanfort" or "standford" -> "Stanford University"
   - "MIT" -> "Massachusetts Institute of Technology"
   - "UCL" -> "University College London"
   - "UofM" or "umich" -> "University of Michigan"
   - "oxbridge" -> treat as ambiguous, pick the closer match based on context
   If you cannot confidently resolve the name, use the closest reasonable match and note the ambiguity in your summary.

2. Return a single valid JSON object (no markdown, no code fences) using this exact shape:
{
  "institution": string,          // The OFFICIAL, corrected full name of the target university
  "userTyped": string,            // Exactly what the user typed (preserve original input)
  "targetMatchPercent": integer 0-100,
  "summary": string,              // 2-3 sentences. Reference the student by name. Be specific about WHY they are or aren't a strong fit.
  "strengths": string[],          // 3-5 items. Each must reference specific details from the student's profile.
  "concerns": string[],           // 2-4 items. Be honest and specific. Reference actual gaps or risks.
  "nextSteps": string[],          // 3-5 items. Concrete, actionable advice tied to this student's situation.
  "categoryScores": [{"label": string, "score": integer 0-100}],
  "alternatives": [{"name": string, "country": string, "matchPercent": integer 0-100, "why": string}],
  "logs": string[]                // 8-12 detailed processing log entries (see below)
}

3. CATEGORY SCORES: Use these exact labels: Academics, Activities, Major Fit, Campus Fit, Affordability.
   - Scores MUST be meaningfully differentiated (not all clustered around 75). A weak area should score below 60; a strong area can score above 90.
   - Affordability must be grounded in the student's stated budget vs. the university's actual cost of attendance.

4. ALTERNATIVES: Include 5-6 alternatives. They must NOT include the target institution.
   - If preferredRegions is specified, weight alternatives toward those regions but include 1-2 outside.
   - If no preferredRegions, return globally diverse alternatives from at least 3 different countries.
   - Each alternative's "why" must explain the specific fit for THIS student (major, budget, campus preferences).
   - matchPercent should be realistic and varied (not all within 5 points of each other).

5. LOG ENTRIES: Generate 8-12 log entries that simulate a real analytical engine processing the profile. They should:
   - Reference the student's actual name, scores, target school, and major
   - Show progressive analysis steps (ingesting data -> normalizing scores -> evaluating fit -> comparing alternatives)
   - Feel technical and specific, like real system output
   - Example: "Parsing ${sanitizeField(payload.name)}'s academic profile: GPA ${sanitizeField(payload.gpa)}, standardized tests detected..."

6. ANALYSIS QUALITY:
   - Be brutally honest. A student with a 3.2 GPA targeting Stanford should get a low match score.
   - Consider the ACTUAL selectivity, acceptance rates, and academic standards of the target university.
   - Budget constraints should meaningfully affect Affordability scores and alternative selection.
   - If the student's profile has gaps (missing test scores, few activities), note this honestly.

Applicant profile:
- Name: ${sanitizeField(payload.name)}
- Residency: ${sanitizeField(payload.residency)}
- GPA (4.0 scale): ${sanitizeField(payload.gpa)}
- SAT/ACT/standardized tests: ${sanitizeField(payload.sat)}
- A Levels/IB/AP/national qualifications: ${sanitizeField(payload.internationalExams)}
- Other exam systems: ${sanitizeField(payload.otherExams)}
- Advanced coursework: ${sanitizeField(payload.coursework)}
- Activities & leadership: ${sanitizeField(payload.activities)}
- Awards & honors: ${sanitizeField(payload.awards)}
- Target university (user-typed, may contain typos): ${sanitizeField(payload.university)}
- Intended major: ${sanitizeField(payload.major)}
- Preferred countries/regions: ${sanitizeField(payload.preferredRegions)}

Counseling responses:
1) Learning environment: ${sanitizeField(payload.question1)}
2) Best project/achievement: ${sanitizeField(payload.question2)}
3) Campus/location preference: ${sanitizeField(payload.question3)}
4) Affordability vs prestige: ${sanitizeField(payload.question4)}
5) Career goals: ${sanitizeField(payload.question5)}
6) Annual budget (tuition + living): ${sanitizeField(payload.question6)}
7) Scholarship/aid needs: ${sanitizeField(payload.question7)}
8) Support priorities: ${sanitizeField(payload.question8)}
9) Extracurricular preferences: ${sanitizeField(payload.question9)}
`;
}
