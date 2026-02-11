require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public', { index: false }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admission-atlas.html'));
});

app.get('/neural-engine', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admission-atlas', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admission-atlas.html'));
});

app.get('/admission-atlas/team', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admission-atlas-team.html'));
});

app.get('/admission-atlas/results', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admission-atlas-results.html'));
});

app.get('/admission-atlas/contact', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admission-atlas-contact.html'));
});

const clampPercent = (value, fallback = 0) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return fallback;
    return Math.max(0, Math.min(100, Math.round(parsed)));
};

const ensureStringArray = (value, fallback) => {
    if (!Array.isArray(value) || value.length === 0) return fallback;
    return value
        .map((item) => String(item || '').trim())
        .filter(Boolean)
        .slice(0, 6);
};

const buildMockResponse = (payload) => {
    const gpa = Number(payload.gpa || 0);
    const majorBoost = /computer|engineering|data|science/i.test(payload.major || '') ? 3 : 0;
    const hasGlobalExamSignals = Boolean(payload.internationalExams || payload.otherExams);
    const base = gpa >= 3.8 ? 83 : gpa >= 3.5 ? 76 : hasGlobalExamSignals ? 74 : 68;
    const variance = Math.floor(Math.random() * 10);
    const targetMatchPercent = clampPercent(base + majorBoost + variance, 74);

    const alternatives = [
        { name: 'University of Toronto', country: 'Canada', matchPercent: clampPercent(targetMatchPercent + 5), why: 'Strong computing research, global employer pipeline, and broad program flexibility.' },
        { name: 'University College London', country: 'United Kingdom', matchPercent: clampPercent(targetMatchPercent + 4), why: 'High academic rigor and strong outcomes in technology and quantitative disciplines.' },
        { name: 'National University of Singapore', country: 'Singapore', matchPercent: clampPercent(targetMatchPercent + 3), why: 'Top-tier engineering and computing ecosystem with strong regional industry access.' },
        { name: 'University of Melbourne', country: 'Australia', matchPercent: clampPercent(targetMatchPercent + 2), why: 'Well-rounded global degree structure with strong postgraduate pathways.' },
        { name: 'Delft University of Technology', country: 'Netherlands', matchPercent: clampPercent(targetMatchPercent + 4), why: 'Applied STEM focus with excellent technical depth and international student support.' }
    ];

    return {
        institution: payload.university,
        targetMatchPercent,
        summary: `${payload.name} has a competitive profile for ${payload.major} with strongest leverage in academics and technical impact.`,
        strengths: [
            'High-rigor coursework aligns with admissions expectations for competitive majors.',
            'Activities demonstrate leadership plus execution, not just participation.',
            'Narrative responses show clear career direction and outcome focus.'
        ],
        concerns: [
            'Target institution remains highly selective even for strong applicants.',
            'Application essays should connect accomplishments to specific campus resources and budget fit.'
        ],
        nextSteps: [
            'Finalize a balanced school list including reach, target, and likely options.',
            'Tailor essays to program-specific labs, tracks, or faculty interests.',
            'Quantify project outcomes in activities section with concrete metrics.',
            'Prioritize scholarships and lower-cost pathways that align with budget targets.'
        ],
        categoryScores: [
            { label: 'Academics', score: clampPercent(targetMatchPercent + 2) },
            { label: 'Activities', score: clampPercent(targetMatchPercent - 4) },
            { label: 'Major Fit', score: clampPercent(targetMatchPercent + 3) },
            { label: 'Campus Fit', score: clampPercent(targetMatchPercent - 2) },
            { label: 'Affordability', score: clampPercent(targetMatchPercent - 6) }
        ],
        alternatives,
        logs: [
            'Ingesting full applicant profile and narrative responses...',
            'Scoring academic rigor against target-major expectations...',
            'Converting SAT/ACT, A Levels, IB, and other exam formats into a normalized profile...',
            'Applying annual budget and aid constraints to shortlist filtering...',
            'Estimating admit competitiveness versus school selectivity...',
            'Comparing preference signals with campus and region characteristics...',
            'Building ranked worldwide university shortlist...'
        ]
    };
};

const normalizeResult = (raw, payload) => {
    const categoryScores = Array.isArray(raw.categoryScores) ? raw.categoryScores : [];
    const normalizedCategories = categoryScores
        .map((item) => ({
            label: String(item?.label || '').trim(),
            score: clampPercent(item?.score, 70)
        }))
        .filter((item) => item.label)
        .slice(0, 6);

    const alternatives = Array.isArray(raw.alternatives)
        ? raw.alternatives
            .map((item) => ({
                name: String(item?.name || '').trim(),
                country: String(item?.country || '').trim(),
                matchPercent: clampPercent(item?.matchPercent, 70),
                why: String(item?.why || '').trim()
            }))
            .filter((item) => item.name)
            .slice(0, 6)
        : [];

    return {
        institution: String(raw.institution || payload.university),
        userTyped: String(raw.userTyped || payload.university),
        targetMatchPercent: clampPercent(raw.targetMatchPercent ?? raw.compatibilityScore, 70),
        summary: String(raw.summary || `${payload.name}'s profile has a moderate-to-strong fit for ${payload.university}.`),
        strengths: ensureStringArray(raw.strengths, ['Competitive academics for the target major.']),
        concerns: ensureStringArray(raw.concerns, ['Selective admissions uncertainty remains high.']),
        nextSteps: ensureStringArray(raw.nextSteps, ['Strengthen application narrative with school-specific fit.']),
        categoryScores: normalizedCategories.length ? normalizedCategories : [
            { label: 'Academics', score: 78 },
            { label: 'Activities', score: 74 },
            { label: 'Major Fit', score: 77 },
            { label: 'Campus Fit', score: 72 },
            { label: 'Affordability', score: 69 }
        ],
        alternatives,
        logs: ensureStringArray(raw.logs, ['Generating admissions analysis...'])
    };
};

app.post('/api/analyze', async (req, res) => {
    try {
        const payload = {
            name: req.body.name,
            residency: req.body.residency,
            gpa: req.body.gpa,
            sat: req.body.sat,
            internationalExams: req.body.internationalExams,
            otherExams: req.body.otherExams,
            coursework: req.body.coursework,
            activities: req.body.activities,
            awards: req.body.awards,
            university: req.body.university,
            major: req.body.major,
            preferredRegions: req.body.preferredRegions,
            question1: req.body.question1,
            question2: req.body.question2,
            question3: req.body.question3,
            question4: req.body.question4,
            question5: req.body.question5,
            question6: req.body.question6,
            question7: req.body.question7,
            question8: req.body.question8,
            question9: req.body.question9
        };

        const hasAcademicMetric = Boolean(
            String(payload.gpa || '').trim() ||
            String(payload.sat || '').trim() ||
            String(payload.internationalExams || '').trim() ||
            String(payload.otherExams || '').trim()
        );

        if (!payload.name || !payload.university || !payload.major || !hasAcademicMetric || !String(payload.question6 || '').trim()) {
            return res.status(400).json({ error: 'Name, target university, major, budget range, and at least one exam/grade metric are required.' });
        }

        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
            return res.json(buildMockResponse(payload));
        }

        const prompt = `
You are an expert university admissions strategy analyst with deep knowledge of universities worldwide.

CRITICAL INSTRUCTIONS:
1. FUZZY NAME RESOLUTION: The user may misspell or abbreviate the target university. You MUST infer the correct, official institution name. Examples:
   - "stanfort" or "standford" → "Stanford University"
   - "MIT" → "Massachusetts Institute of Technology"
   - "UCL" → "University College London"
   - "UofM" or "umich" → "University of Michigan"
   - "oxbridge" → treat as ambiguous, pick the closer match based on context
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
   - Show progressive analysis steps (ingesting data → normalizing scores → evaluating fit → comparing alternatives)
   - Feel technical and specific, like real system output
   - Example: "Parsing ${payload.name}'s academic profile: GPA ${payload.gpa || 'not reported'}, standardized tests detected..."

6. ANALYSIS QUALITY:
   - Be brutally honest. A student with a 3.2 GPA targeting Stanford should get a low match score.
   - Consider the ACTUAL selectivity, acceptance rates, and academic standards of the target university.
   - Budget constraints should meaningfully affect Affordability scores and alternative selection.
   - If the student's profile has gaps (missing test scores, few activities), note this honestly.

Applicant profile:
- Name: ${payload.name}
- Residency: ${payload.residency}
- GPA (4.0 scale): ${payload.gpa || 'Not provided'}
- SAT/ACT/standardized tests: ${payload.sat || 'Not provided'}
- A Levels/IB/AP/national qualifications: ${payload.internationalExams || 'Not provided'}
- Other exam systems: ${payload.otherExams || 'None'}
- Advanced coursework: ${payload.coursework || 'Not provided'}
- Activities & leadership: ${payload.activities || 'Not provided'}
- Awards & honors: ${payload.awards || 'None'}
- Target university (user-typed, may contain typos): ${payload.university}
- Intended major: ${payload.major}
- Preferred countries/regions: ${payload.preferredRegions || 'No preference (global)'}

Counseling responses:
1) Learning environment: ${payload.question1 || 'Not answered'}
2) Best project/achievement: ${payload.question2 || 'Not answered'}
3) Campus/location preference: ${payload.question3 || 'Not answered'}
4) Affordability vs prestige: ${payload.question4 || 'Not answered'}
5) Career goals: ${payload.question5 || 'Not answered'}
6) Annual budget (tuition + living): ${payload.question6}
7) Scholarship/aid needs: ${payload.question7 || 'Not answered'}
8) Support priorities: ${payload.question8 || 'Not answered'}
9) Extracurricular preferences: ${payload.question9 || 'Not answered'}
`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: 'You are a precise JSON generator for a university admissions analysis engine. You have expert-level knowledge of global universities, their acceptance rates, costs, program strengths, and admissions requirements. Always resolve university names to their official form, even if the user makes typos or uses abbreviations. Return only valid JSON with no markdown formatting.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        const raw = JSON.parse(completion.choices[0].message.content);
        const normalized = normalizeResult(raw, payload);

        if (!normalized.alternatives.length) {
            normalized.alternatives = buildMockResponse(payload).alternatives;
        }

        res.json(normalized);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Analysis failed. Please try again.' });
    }
});

app.listen(port, () => {
    console.log(`Admission Atlas running at http://localhost:${port} (root landing + /neural-engine + /admission-atlas/team + /admission-atlas/results + /admission-atlas/contact)`);
});
