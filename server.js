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
You are an admissions strategy analyst.
Return a single valid JSON object (no markdown) using this exact shape:
{
  "institution": string,
  "targetMatchPercent": integer 0-100,
  "summary": string,
  "strengths": string[],
  "concerns": string[],
  "nextSteps": string[],
  "categoryScores": [{"label": string, "score": integer 0-100}],
  "alternatives": [{"name": string, "country": string, "matchPercent": integer 0-100, "why": string}],
  "logs": string[]
}

Rules:
- Category labels should be: Academics, Activities, Major Fit, Campus Fit, Affordability.
- Include 4-6 alternatives and ensure alternatives are not the same as institution.
- Evaluate against universities worldwide across all regions and countries, not just the US.
- Respect preferredRegions if provided; otherwise return globally diverse alternatives.
- Match scores should be realistic and differentiated.
- Keep summary to 1-2 sentences.
- Keep strengths/concerns/nextSteps concise with actionable phrasing.
- Budget and aid constraints must directly influence both target assessment and alternatives.

Applicant input:
- Name: ${payload.name}
- Residency: ${payload.residency}
- GPA: ${payload.gpa}
- SAT/ACT/standardized tests: ${payload.sat}
- A Levels/IB/AP/national qualifications: ${payload.internationalExams}
- Other exam systems: ${payload.otherExams}
- Coursework: ${payload.coursework}
- Activities: ${payload.activities}
- Awards: ${payload.awards}
- Target university: ${payload.university}
- Intended major: ${payload.major}
- Preferred countries/regions: ${payload.preferredRegions}

Mock admissions question responses:
1) Learning environment preference: ${payload.question1}
2) Best project/achievement: ${payload.question2}
3) Campus/location preference: ${payload.question3}
4) Affordability vs prestige preference: ${payload.question4}
5) Career goals: ${payload.question5}
6) Annual budget range (required): ${payload.question6}
7) Scholarship/aid needs: ${payload.question7}
8) Student support priorities: ${payload.question8}
9) Preferred extracurricular/community experience: ${payload.question9}
`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: 'You generate precise, valid JSON for admissions matching outputs.'
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
