const form = document.getElementById('assessmentForm');
const mockFillBtn = document.getElementById('mockFillBtn');
const modal = document.getElementById('processingModal');
const logContainer = document.getElementById('logContainer');
const finalScoreElement = document.getElementById('finalScore');
const resultsArea = document.getElementById('resultsSection');
const analysisSummaryElement = document.getElementById('analysisSummary');
const resultsUniversityElement = document.getElementById('resultsUniversity');
const strengthListElement = document.getElementById('strengthList');
const concernListElement = document.getElementById('concernList');
const nextStepListElement = document.getElementById('nextStepList');
const alternativesListElement = document.getElementById('alternativesList');
const submitBtn = document.getElementById('submitBtn');

let categoryChartInstance = null;
let alternativeChartInstance = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mockAnswers = {
    name: 'Jordan Lee',
    residency: 'out_of_state',
    university: 'University of Michigan',
    major: 'Computer Science',
    preferredRegions: 'USA, UK, Canada, Singapore, Netherlands',
    gpa: '3.86',
    sat: 'SAT 1490, ACT 33',
    internationalExams: 'IB 40/45 with HL Math AA 7, HL Physics 6',
    otherExams: 'No additional national board exams',
    coursework: 'AP Calculus BC, AP Physics C, AP Computer Science A, AP Statistics, Dual Enrollment Linear Algebra',
    activities: 'Founder and president of coding club; robotics software lead; intern at local startup; 180 hours of peer tutoring',
    awards: 'State robotics finalist, National Merit Commended, hackathon 1st place (regional)',
    question1: 'I do best in collaborative, project-heavy classes where I can iterate on real-world problems.',
    question2: 'I built a scheduling app for school clubs used by 25 organizations and presented the rollout plan to faculty.',
    question3: 'I prefer a mid-to-large campus in or near a city with strong internship access.',
    question4: 'I want strong outcomes and internship access, but financial fit is a major factor in my final decision.',
    question5: 'I want to start in software engineering, then grow into product leadership in education technology.',
    question6: 'USD 30,000-45,000 per year including living costs.',
    question7: 'Need merit scholarships and will apply for need-based support where available.',
    question8: 'Strong internship advising and academic mentorship are most important.',
    question9: 'I want a startup and product-building community plus research clubs.'
};

mockFillBtn.addEventListener('click', () => {
    Object.entries(mockAnswers).forEach(([key, value]) => {
        const field = document.getElementById(key);
        if (field) {
            field.value = value;
        }
    });
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    submitBtn.disabled = true;
    modal.style.display = 'grid';
    resultsArea.style.display = 'none';
    logContainer.innerHTML = '';
    addLog('Packaging applicant profile...');

    const payload = {
        name: document.getElementById('name').value.trim(),
        residency: document.getElementById('residency').value,
        university: document.getElementById('university').value.trim(),
        major: document.getElementById('major').value.trim(),
        preferredRegions: document.getElementById('preferredRegions').value.trim(),
        gpa: document.getElementById('gpa').value.trim(),
        sat: document.getElementById('sat').value.trim(),
        internationalExams: document.getElementById('internationalExams').value.trim(),
        otherExams: document.getElementById('otherExams').value.trim(),
        coursework: document.getElementById('coursework').value.trim(),
        activities: document.getElementById('activities').value.trim(),
        awards: document.getElementById('awards').value.trim(),
        question1: document.getElementById('question1').value.trim(),
        question2: document.getElementById('question2').value.trim(),
        question3: document.getElementById('question3').value.trim(),
        question4: document.getElementById('question4').value.trim(),
        question5: document.getElementById('question5').value.trim(),
        question6: document.getElementById('question6').value.trim(),
        question7: document.getElementById('question7').value.trim(),
        question8: document.getElementById('question8').value.trim(),
        question9: document.getElementById('question9').value.trim()
    };

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Unable to run analysis right now.');
        }

        for (const message of data.logs || []) {
            addLog(message);
            await sleep(220 + Math.random() * 220);
        }

        addLog('Preparing final recommendations...');
        await sleep(650);

        modal.style.display = 'none';
        showResults(data);
    } catch (error) {
        addLog(`Error: ${error.message}`);
        await sleep(900);
        modal.style.display = 'none';
        alert(error.message);
    } finally {
        submitBtn.disabled = false;
    }
});

function addLog(text) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `> ${text}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function showResults(data) {
    const targetScore = Number(data.targetMatchPercent ?? data.compatibilityScore ?? 0);
    const university = data.institution || data.university || 'Target University';

    resultsUniversityElement.textContent = university;
    analysisSummaryElement.textContent = data.summary || 'AI-based compatibility estimate using your profile and counseling responses.';

    animateScore(targetScore);
    fillList(strengthListElement, data.strengths, ['Strong academic preparation relative to target major.', 'Consistent leadership and measurable extracurricular impact.']);
    fillList(concernListElement, data.concerns, ['Admissions selectivity remains highly competitive.', 'Narrative positioning should connect achievements to program fit.']);
    fillList(nextStepListElement, data.nextSteps, ['Refine essays with major-specific faculty or program alignment.', 'Build a balanced school list with at least 2 safety and 2 target options.']);

    renderAlternativeCards(data.alternatives || []);
    renderCharts(data);

    resultsArea.style.display = 'block';
    resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function animateScore(score) {
    const cappedTarget = Math.max(0, Math.min(100, Math.round(score)));
    let current = 0;

    const timer = setInterval(() => {
        current += 1;
        finalScoreElement.textContent = `${current}%`;
        if (current >= cappedTarget) {
            clearInterval(timer);
        }
    }, 18);
}

function fillList(targetElement, items, fallback) {
    targetElement.innerHTML = '';
    const sourceItems = Array.isArray(items) && items.length ? items : fallback;

    sourceItems.slice(0, 5).forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        targetElement.appendChild(li);
    });
}

function renderAlternativeCards(alternatives) {
    alternativesListElement.innerHTML = '';

    if (!Array.isArray(alternatives) || alternatives.length === 0) {
        const fallback = document.createElement('p');
        fallback.textContent = 'No alternatives returned. Run analysis again to get school recommendations.';
        alternativesListElement.appendChild(fallback);
        return;
    }

    alternatives.slice(0, 6).forEach((alt) => {
        const wrap = document.createElement('article');
        wrap.className = 'alternative-item';

        const header = document.createElement('div');
        header.className = 'alternative-header';

        const name = document.createElement('strong');
        const schoolName = alt.name || 'Alternative School';
        name.textContent = alt.country ? `${schoolName} (${alt.country})` : schoolName;

        const score = document.createElement('span');
        score.className = 'alt-score';
        score.textContent = `${Number(alt.matchPercent || 0)}% Match`;

        header.appendChild(name);
        header.appendChild(score);

        const reason = document.createElement('p');
        reason.textContent = alt.why || 'Similar major strength and student profile fit.';

        wrap.appendChild(header);
        wrap.appendChild(reason);
        alternativesListElement.appendChild(wrap);
    });
}

function renderCharts(data) {
    const categoryCtx = document.getElementById('categoryChart')?.getContext('2d');
    const alternativeCtx = document.getElementById('alternativeChart')?.getContext('2d');

    if (categoryChartInstance) categoryChartInstance.destroy();
    if (alternativeChartInstance) alternativeChartInstance.destroy();

    const categoryScores = Array.isArray(data.categoryScores) && data.categoryScores.length
        ? data.categoryScores
        : [
            { label: 'Academics', score: 84 },
            { label: 'Activities', score: 79 },
            { label: 'Major Fit', score: 81 },
            { label: 'Campus Fit', score: 76 },
            { label: 'Affordability', score: 72 }
        ];

    if (categoryCtx) {
        categoryChartInstance = new Chart(categoryCtx, {
            type: 'bar',
            data: {
                labels: categoryScores.map((item) => item.label),
                datasets: [{
                    data: categoryScores.map((item) => Number(item.score || 0)),
                    borderRadius: 8,
                    backgroundColor: ['#0f4c81', '#145c97', '#0d9488', '#2a7ba3', '#3fa894']
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: 0, max: 100, ticks: { stepSize: 20 } }
                }
            }
        });
    }

    const alternatives = (data.alternatives || []).slice(0, 6);
    if (alternativeCtx) {
        alternativeChartInstance = new Chart(alternativeCtx, {
            type: 'bar',
            data: {
                labels: alternatives.map((alt) => {
                    const schoolName = alt.name || 'Alternative';
                    return alt.country ? `${schoolName} (${alt.country})` : schoolName;
                }),
                datasets: [{
                    data: alternatives.map((alt) => Number(alt.matchPercent || 0)),
                    borderRadius: 8,
                    backgroundColor: '#0d9488'
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: { min: 0, max: 100, ticks: { stepSize: 20 } }
                }
            }
        });
    }
}
