const ROUTE_TO_ASSET = new Map([
  ["/", "/admission-atlas.html"],
  ["/neural-engine", "/index.html"],
  ["/admission-atlas", "/admission-atlas.html"],
  ["/admission-atlas/team", "/admission-atlas-team.html"],
  ["/admission-atlas/results", "/admission-atlas-results.html"],
  ["/admission-atlas/contact", "/admission-atlas-contact.html"],
]);

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

const clampPercent = (value, fallback = 0) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(0, Math.min(100, Math.round(parsed)));
};

const ensureStringArray = (value, fallback) => {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 6);
};

const buildMockResponse = (payload) => {
  const gpa = Number(payload.gpa || 0);
  const majorBoost = /computer|engineering|data|science/i.test(payload.major || "") ? 3 : 0;
  const hasGlobalExamSignals = Boolean(payload.internationalExams || payload.otherExams);
  const base = gpa >= 3.8 ? 83 : gpa >= 3.5 ? 76 : hasGlobalExamSignals ? 74 : 68;
  const variance = Math.floor(Math.random() * 10);
  const targetMatchPercent = clampPercent(base + majorBoost + variance, 74);

  const alternatives = [
    {
      name: "University of Toronto",
      country: "Canada",
      matchPercent: clampPercent(targetMatchPercent + 5),
      why: "Strong computing research, global employer pipeline, and broad program flexibility.",
    },
    {
      name: "University College London",
      country: "United Kingdom",
      matchPercent: clampPercent(targetMatchPercent + 4),
      why: "High academic rigor and strong outcomes in technology and quantitative disciplines.",
    },
    {
      name: "National University of Singapore",
      country: "Singapore",
      matchPercent: clampPercent(targetMatchPercent + 3),
      why: "Top-tier engineering and computing ecosystem with strong regional industry access.",
    },
    {
      name: "University of Melbourne",
      country: "Australia",
      matchPercent: clampPercent(targetMatchPercent + 2),
      why: "Well-rounded global degree structure with strong postgraduate pathways.",
    },
    {
      name: "Delft University of Technology",
      country: "Netherlands",
      matchPercent: clampPercent(targetMatchPercent + 4),
      why: "Applied STEM focus with excellent technical depth and international student support.",
    },
  ];

  return {
    institution: payload.university,
    targetMatchPercent,
    summary: `${payload.name} has a competitive profile for ${payload.major} with strongest leverage in academics and technical impact.`,
    strengths: [
      "High-rigor coursework aligns with admissions expectations for competitive majors.",
      "Activities demonstrate leadership plus execution, not just participation.",
      "Narrative responses show clear career direction and outcome focus.",
    ],
    concerns: [
      "Target institution remains highly selective even for strong applicants.",
      "Application essays should connect accomplishments to specific campus resources and budget fit.",
    ],
    nextSteps: [
      "Finalize a balanced school list including reach, target, and likely options.",
      "Tailor essays to program-specific labs, tracks, or faculty interests.",
      "Quantify project outcomes in activities section with concrete metrics.",
      "Prioritize scholarships and lower-cost pathways that align with budget targets.",
    ],
    categoryScores: [
      { label: "Academics", score: clampPercent(targetMatchPercent + 2) },
      { label: "Activities", score: clampPercent(targetMatchPercent - 4) },
      { label: "Major Fit", score: clampPercent(targetMatchPercent + 3) },
      { label: "Campus Fit", score: clampPercent(targetMatchPercent - 2) },
      { label: "Affordability", score: clampPercent(targetMatchPercent - 6) },
    ],
    alternatives,
    logs: [
      "Ingesting full applicant profile and narrative responses...",
      "Scoring academic rigor against target-major expectations...",
      "Converting SAT/ACT, A Levels, IB, and other exam formats into a normalized profile...",
      "Applying annual budget and aid constraints to shortlist filtering...",
      "Estimating admit competitiveness versus school selectivity...",
      "Comparing preference signals with campus and region characteristics...",
      "Building ranked worldwide university shortlist...",
    ],
  };
};

const normalizeResult = (raw, payload) => {
  const categoryScores = Array.isArray(raw.categoryScores) ? raw.categoryScores : [];
  const normalizedCategories = categoryScores
    .map((item) => ({
      label: String(item?.label || "").trim(),
      score: clampPercent(item?.score, 70),
    }))
    .filter((item) => item.label)
    .slice(0, 6);

  const alternatives = Array.isArray(raw.alternatives)
    ? raw.alternatives
        .map((item) => ({
          name: String(item?.name || "").trim(),
          country: String(item?.country || "").trim(),
          matchPercent: clampPercent(item?.matchPercent, 70),
          why: String(item?.why || "").trim(),
        }))
        .filter((item) => item.name)
        .slice(0, 6)
    : [];

  return {
    institution: String(raw.institution || payload.university),
    targetMatchPercent: clampPercent(raw.targetMatchPercent ?? raw.compatibilityScore, 70),
    summary: String(
      raw.summary || `${payload.name}'s profile has a moderate-to-strong fit for ${payload.university}.`
    ),
    strengths: ensureStringArray(raw.strengths, ["Competitive academics for the target major."]),
    concerns: ensureStringArray(raw.concerns, ["Selective admissions uncertainty remains high."]),
    nextSteps: ensureStringArray(raw.nextSteps, [
      "Strengthen application narrative with school-specific fit.",
    ]),
    categoryScores: normalizedCategories.length
      ? normalizedCategories
      : [
          { label: "Academics", score: 78 },
          { label: "Activities", score: 74 },
          { label: "Major Fit", score: 77 },
          { label: "Campus Fit", score: 72 },
          { label: "Affordability", score: 69 },
        ],
    alternatives,
    logs: ensureStringArray(raw.logs, ["Generating admissions analysis..."]),
  };
};

const readJsonBody = async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const normalizePathname = (pathname) => {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
};

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });

const buildPrompt = (payload) => `
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

const analyze = async (request, env) => {
  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const payload = {
    name: body.name,
    residency: body.residency,
    gpa: body.gpa,
    sat: body.sat,
    internationalExams: body.internationalExams,
    otherExams: body.otherExams,
    coursework: body.coursework,
    activities: body.activities,
    awards: body.awards,
    university: body.university,
    major: body.major,
    preferredRegions: body.preferredRegions,
    question1: body.question1,
    question2: body.question2,
    question3: body.question3,
    question4: body.question4,
    question5: body.question5,
    question6: body.question6,
    question7: body.question7,
    question8: body.question8,
    question9: body.question9,
  };

  const hasAcademicMetric = Boolean(
    String(payload.gpa || "").trim() ||
      String(payload.sat || "").trim() ||
      String(payload.internationalExams || "").trim() ||
      String(payload.otherExams || "").trim()
  );

  if (
    !payload.name ||
    !payload.university ||
    !payload.major ||
    !hasAcademicMetric ||
    !String(payload.question6 || "").trim()
  ) {
    return jsonResponse(
      {
        error:
          "Name, target university, major, budget range, and at least one exam/grade metric are required.",
      },
      400
    );
  }

  if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
    return jsonResponse(buildMockResponse(payload));
  }

  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You generate precise, valid JSON for admissions matching outputs.",
        },
        {
          role: "user",
          content: buildPrompt(payload),
        },
      ],
    }),
  });

  if (!completion.ok) {
    const details = await completion.text();
    return jsonResponse(
      { error: `OpenAI request failed (${completion.status}).`, details: details.slice(0, 400) },
      502
    );
  }

  const completionJson = await completion.json();
  const content = completionJson?.choices?.[0]?.message?.content;
  if (!content) {
    return jsonResponse({ error: "OpenAI response did not include content." }, 502);
  }

  let raw;
  try {
    raw = JSON.parse(content);
  } catch {
    return jsonResponse({ error: "OpenAI response was not valid JSON." }, 502);
  }

  const normalized = normalizeResult(raw, payload);
  if (!normalized.alternatives.length) {
    normalized.alternatives = buildMockResponse(payload).alternatives;
  }
  return jsonResponse(normalized);
};

const serveAsset = (request, env) => {
  const url = new URL(request.url);
  const pathname = normalizePathname(url.pathname);
  const mappedPath = ROUTE_TO_ASSET.get(pathname);

  if (mappedPath) {
    url.pathname = mappedPath;
    return env.ASSETS.fetch(new Request(url.toString(), request));
  }

  return env.ASSETS.fetch(request);
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = normalizePathname(url.pathname);

    if (pathname === "/api/analyze" && request.method === "POST") {
      try {
        return await analyze(request, env);
      } catch (error) {
        console.error("Analysis error:", error);
        return jsonResponse({ error: "Analysis failed. Please try again." }, 500);
      }
    }

    if (pathname === "/api/analyze" && request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "POST, OPTIONS",
          "access-control-allow-headers": "content-type",
        },
      });
    }

    return serveAsset(request, env);
  },
};
