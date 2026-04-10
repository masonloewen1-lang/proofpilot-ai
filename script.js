const compareBtn = document.getElementById('compareBtn');
const loadDemoBtn = document.getElementById('loadDemoBtn');
const inputA = document.getElementById('inputA');
const inputB = document.getElementById('inputB');
const outputSection = document.getElementById('outputSection');

const overlapList = document.getElementById('overlapList');
const uniqueAList = document.getElementById('uniqueAList');
const uniqueBList = document.getElementById('uniqueBList');
const differencesList = document.getElementById('differencesList');

const overlapScore = document.getElementById('overlapScore');
const coverageBalance = document.getElementById('coverageBalance');
const priorityGaps = document.getElementById('priorityGaps');

const overlapStatus = document.getElementById('overlapStatus');
const coverageStatus = document.getElementById('coverageStatus');
const gapsStatus = document.getElementById('gapsStatus');

const overlapBar = document.getElementById('overlapBar');
const coverageBar = document.getElementById('coverageBar');
const gapsBar = document.getElementById('gapsBar');

const overlapInterpretation = document.getElementById('overlapInterpretation');
const coverageInterpretation = document.getElementById('coverageInterpretation');
const gapsInterpretation = document.getElementById('gapsInterpretation');

const topAlignment = document.getElementById('topAlignment');
const topGap = document.getElementById('topGap');
const topAction = document.getElementById('topAction');
const topAlignmentText = document.getElementById('topAlignmentText');
const topGapText = document.getElementById('topGapText');
const topActionText = document.getElementById('topActionText');
const priorityGapHeadline = document.getElementById('priorityGapHeadline');
const priorityGapDetail = document.getElementById('priorityGapDetail');
const priorityGapImpact = document.getElementById('priorityGapImpact');
const priorityGapTime = document.getElementById('priorityGapTime');

const strongList = document.getElementById('strongList');
const missingList = document.getElementById('missingList');
const topActionsList = document.getElementById('topActionsList');

const evidenceSection = document.getElementById('evidenceSection');
const evidenceToggle = document.getElementById('evidenceToggle');
const evidenceList = document.getElementById('evidenceList');
const evidenceFocus = document.getElementById('evidenceFocus');
const confidenceChip = document.getElementById('confidenceChip');
const evidenceFocusText = document.getElementById('evidenceFocusText');

const guidePanel = document.getElementById('guidePanel');
const guideTitle = document.getElementById('guideTitle');
const guideMessage = document.getElementById('guideMessage');
const guideDots = document.getElementById('guideDots');
const nextStepBtn = document.getElementById('nextStepBtn');

const sectionMap = {
  input: document.getElementById('inputSection'),
  value: document.getElementById('valueSnapshot'),
  output: document.getElementById('outputSection'),
  scorecard: document.getElementById('scorecardSection'),
  evidence: document.getElementById('evidenceSection')
};

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'with'
]);

const demoSample = {
  label: 'Product Marketing Manager vs Interview Rubric',
  inputA: `Drive product launches across sales, lifecycle, and customer success teams.
Candidate demonstrates GTM planning with clear launch milestones.
Shows evidence of translating customer research into actionable positioning.
Can align Product, Sales, and Success on messaging and enablement.
Uses KPI frameworks to evaluate funnel performance.
Led two launches with +19% activation and +12% expansion revenue.
Built weekly enablement sessions for account executives and CSMs.`,
  inputB: `Candidate demonstrates GTM planning with clear launch milestones.
Shows evidence of translating customer research into actionable positioning.
Can align Product, Sales, and Success on messaging and enablement.
Uses KPI frameworks to evaluate funnel performance.
Identifies launch risks early and proposes mitigation actions.
Includes a repeatable experiment plan for underperforming lifecycle stages.`
};

const guideSteps = [
  {
    key: 'input',
    title: 'Step 1: Start with your draft and target rubric side by side.',
    message: 'Paste both inputs to evaluate fit, quality, and differentiation before submitting.'
  },
  {
    key: 'value',
    title: 'Step 2: Executive insights surface your fastest path to improvement.',
    message: 'Overall alignment, biggest gap, and next action are designed for immediate decision support.'
  },
  {
    key: 'scorecard',
    title: 'Step 3: Scorecards translate complexity into a clear readiness signal.',
    message: 'Use status indicators and interpretation notes to prioritize what to fix first.'
  },
  {
    key: 'evidence',
    title: 'Step 4: Evidence mode keeps every recommendation explainable.',
    message: 'Use Why? to inspect the exact lines used in each match and build stakeholder trust.'
  }
];

let currentStep = 0;
let evidenceVisible = false;
let latestEvidence = [];

function cleanLine(line) {
  return line.replace(/\s+/g, ' ').trim();
}

function extractLines(text) {
  return text
    .split('\n')
    .map((line) => cleanLine(line))
    .filter(Boolean);
}

function lineKey(line) {
  return line.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function extractKeywords(lines) {
  return new Set(
    lines
      .join(' ')
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
  );
}

function renderList(element, items, emptyMessage, ordered = false) {
  element.innerHTML = '';

  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = emptyMessage;
    element.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    if (ordered) {
      li.setAttribute('data-ordered', 'true');
    }
    element.appendChild(li);
  });
}

function renderOverlapList(overlap) {
  overlapList.innerHTML = '';

  if (!overlap.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No direct overlap detected yet.';
    overlapList.appendChild(li);
    return;
  }

  overlap.forEach((item) => {
    const li = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = item;

    const whyBtn = document.createElement('button');
    whyBtn.type = 'button';
    whyBtn.className = 'why-btn';
    whyBtn.textContent = 'Why?';
    whyBtn.setAttribute('data-evidence-key', lineKey(item));

    li.appendChild(text);
    li.appendChild(whyBtn);
    overlapList.appendChild(li);
  });
}

function statusFromScore(value, invert = false) {
  if (invert) {
    if (value <= 2) {
      return { label: 'On Track', tone: 'good' };
    }
    if (value <= 4) {
      return { label: 'Needs Focus', tone: 'warn' };
    }
    return { label: 'At Risk', tone: 'risk' };
  }

  if (value >= 75) {
    return { label: 'Ready', tone: 'good' };
  }
  if (value >= 45) {
    return { label: 'Needs Focus', tone: 'warn' };
  }
  return { label: 'At Risk', tone: 'risk' };
}

function applyStatus(el, status) {
  el.textContent = status.label;
  el.className = `status-pill ${status.tone}`;
}

function updateTopInsights(overlapPct, uniqueA, uniqueB, overlap) {
  topAlignment.textContent = `${overlapPct}% ready`;
  const readinessStatus = statusFromScore(overlapPct);
  const readinessMessage =
    overlapPct >= 75
      ? 'Your draft is strongly aligned to current criteria.'
      : 'Alignment is improving, but top criteria still need sharper coverage.';
  topAlignmentText.innerHTML = `<span class="readiness-emphasis ${readinessStatus.tone}">${readinessStatus.label}</span>${readinessMessage}`;

  if (!uniqueA.length && !uniqueB.length) {
    topGap.textContent = 'No major gaps';
    topGapText.textContent = 'Both sides are tightly matched across current priorities.';
  } else if (uniqueB.length >= uniqueA.length) {
    topGap.textContent = `Missing ${uniqueB.length} target item(s)`;
    topGapText.textContent = 'Criteria-side requirements are underrepresented in the draft.';
  } else {
    topGap.textContent = `${uniqueA.length} unmatched draft item(s)`;
    topGapText.textContent = 'Some draft content may be lower value relative to target criteria.';
  }

  const nextAction = uniqueB[0] || uniqueA[0] || overlap[0] || 'Add target evidence and measurable impact statements.';
  topAction.textContent = nextAction.slice(0, 62) + (nextAction.length > 62 ? '…' : '');
  topActionText.textContent = uniqueB.length
    ? 'Address this target-side requirement first for highest readiness lift.'
    : 'Refine this area with stronger proof points to maximize differentiation.';

  if (uniqueB.length) {
    priorityGapHeadline.textContent = uniqueB[0];
    priorityGapDetail.textContent =
      'This criterion is missing from your draft and has the highest impact on evaluator confidence. Add direct evidence here first.';
  } else if (uniqueA.length) {
    priorityGapHeadline.textContent = `Refocus lower-value content: ${uniqueA[0]}`;
    priorityGapDetail.textContent =
      'Your draft contains content that may not move scoring. Reframe it to mirror rubric language and measurable outcomes.';
  } else {
    priorityGapHeadline.textContent = 'No critical gaps detected.';
    priorityGapDetail.textContent =
      'Your draft is tightly aligned. Focus next on tightening proof points and executive clarity.';
  }

  const gapWeight = uniqueB.length ? uniqueB.length : uniqueA.length ? 1 : 0;
  const impactLift = gapWeight ? Math.max(4, Math.min(18, gapWeight * 4 + (overlapPct < 60 ? 4 : 0))) : 2;
  const timeEstimate = gapWeight ? `${Math.max(25, gapWeight * 20)}–${Math.max(45, gapWeight * 30)} min` : '10–20 min';

  priorityGapImpact.textContent = `Estimated impact: +${impactLift} readiness points after fixing this area.`;
  priorityGapTime.textContent = `Estimated time to improve: ${timeEstimate}.`;
}

function updateWhatGreatLooksLike(overlap, uniqueA, uniqueB) {
  const strengths = overlap.slice(0, 4);
  const missing = uniqueB.slice(0, 4);
  const actions = [
    uniqueB[0]
      ? `Add explicit proof for: ${uniqueB[0]}`
      : 'Strengthen quantified outcomes for your strongest aligned theme.',
    uniqueB[1]
      ? `Mirror evaluator language around: ${uniqueB[1]}`
      : 'Improve clarity by using criteria-native phrasing in key sections.',
    uniqueA[0]
      ? `Reframe lower-priority content to support: ${uniqueA[0]}`
      : 'Use concise, evidence-rich bullets to maintain reviewer confidence.'
  ];

  renderList(
    strongList,
    strengths.length ? strengths : ['Clear criterion mapping', 'Specific evidence statements', 'Consistent strategic language'],
    'Run analysis to see strengths.'
  );
  renderList(
    missingList,
    missing.length ? missing : ['No critical missing criteria detected.'],
    'Run analysis to see missing pieces.'
  );
  renderList(topActionsList, actions, 'Run analysis to generate actions.', true);
}

function updateScorecard(overlapCount, uniqueACount, uniqueBCount) {
  const total = overlapCount + uniqueACount + uniqueBCount;
  const overlapPct = total ? Math.round((overlapCount / total) * 100) : 0;
  const balancePct =
    uniqueACount + uniqueBCount
      ? Math.round((Math.min(uniqueACount, uniqueBCount) / Math.max(uniqueACount, uniqueBCount)) * 100)
      : 100;
  const gapCount = uniqueACount + uniqueBCount;

  overlapScore.textContent = `${overlapPct}%`;
  coverageBalance.textContent = `${balancePct}%`;
  priorityGaps.textContent = `${gapCount}`;

  overlapBar.style.width = `${overlapPct}%`;
  coverageBar.style.width = `${balancePct}%`;
  gapsBar.style.width = `${Math.min(gapCount * 12, 100)}%`;

  applyStatus(overlapStatus, statusFromScore(overlapPct));
  applyStatus(coverageStatus, statusFromScore(balancePct));
  applyStatus(gapsStatus, statusFromScore(gapCount, true));

  overlapInterpretation.textContent =
    overlapPct >= 75
      ? 'Strong strategic fit. Focus on sharpening proof and differentiation.'
      : 'Moderate-to-low overlap. Prioritize mapping draft claims to rubric language.';

  coverageInterpretation.textContent =
    balancePct >= 70
      ? 'Scope is balanced across both texts.'
      : 'Scope imbalance detected. One side is significantly broader than the other.';

  gapsInterpretation.textContent =
    gapCount <= 2
      ? 'Only a few key requirements remain unmatched.'
      : 'Multiple criteria gaps detected. Prioritize top three immediately.';

  return { overlapPct, balancePct, gapCount };
}

function renderEvidence(evidence) {
  evidenceList.innerHTML = '';

  if (!evidence.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No evidence yet. Run a comparison to generate traceable matches.';
    evidenceList.appendChild(li);
    return;
  }

  evidence.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>Matched concept:</strong> ${item.key}<br><span>Submission draft:</span> ${item.a}<br><span>Target criteria:</span> ${item.b}`;
    evidenceList.appendChild(li);
  });
}

function showEvidenceFor(key) {
  const selected = latestEvidence.find((item) => item.key === key);
  if (!selected) {
    return;
  }

  evidenceVisible = true;
  evidenceList.classList.remove('hidden');
  evidenceFocus.classList.remove('hidden');
  evidenceSection.classList.add('cue-soft');
  evidenceToggle.textContent = 'Hide explainability';

  const confidenceLevel = key.length > 20 ? 'High confidence match' : 'Moderate confidence match';
  confidenceChip.textContent = confidenceLevel;
  evidenceFocusText.textContent = `“${selected.a}” aligns with “${selected.b}” through shared intent and keyword overlap.`;
}

function setActiveStep(index, shouldScroll = true) {
  currentStep = index;
  const step = guideSteps[currentStep];

  guideTitle.textContent = step.title;
  guideMessage.textContent = step.message;

  guideDots.innerHTML = guideSteps
    .map((_, stepIndex) => `<span class="dot ${stepIndex === currentStep ? 'active' : ''}"></span>`)
    .join('');

  Object.entries(sectionMap).forEach(([key, section]) => {
    section.classList.toggle('cue-active', key === step.key);
  });

  nextStepBtn.textContent = currentStep === guideSteps.length - 1 ? 'Restart tour' : 'Next step';

  if (shouldScroll) {
    sectionMap[step.key].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function moveToNextStep() {
  const nextStep = currentStep === guideSteps.length - 1 ? 0 : currentStep + 1;
  setActiveStep(nextStep);
}

function runComparison() {
  const linesA = extractLines(inputA.value);
  const linesB = extractLines(inputB.value);

  const keyedA = new Map(linesA.map((line) => [lineKey(line), line]));
  const keyedB = new Map(linesB.map((line) => [lineKey(line), line]));

  const overlap = [];
  const uniqueA = [];
  const uniqueB = [];
  const evidence = [];

  keyedA.forEach((value, key) => {
    if (keyedB.has(key)) {
      overlap.push(value);
      evidence.push({ key, a: value, b: keyedB.get(key) });
    } else {
      uniqueA.push(value);
    }
  });

  keyedB.forEach((value, key) => {
    if (!keyedA.has(key)) {
      uniqueB.push(value);
    }
  });

  const keywordsA = extractKeywords(uniqueA);
  const keywordsB = extractKeywords(uniqueB);
  const sharedDifferenceKeywords = [...keywordsA].filter((word) => keywordsB.has(word));

  const differences = [];
  if (uniqueA.length) {
    differences.push(`Submission draft has ${uniqueA.length} unique requirement(s).`);
  }
  if (uniqueB.length) {
    differences.push(`Target criteria has ${uniqueB.length} unique requirement(s).`);
  }
  if (sharedDifferenceKeywords.length) {
    differences.push(
      `Both reference related concepts with distinct phrasing around: ${sharedDifferenceKeywords.slice(0, 8).join(', ')}.`
    );
  }

  renderOverlapList(overlap);
  renderList(uniqueAList, uniqueA, 'No extra draft-only requirements found.');
  renderList(uniqueBList, uniqueB, 'No uncovered target criteria found.');
  renderList(differencesList, differences, 'No key differences found.');

  latestEvidence = evidence;
  renderEvidence(latestEvidence);

  const { overlapPct } = updateScorecard(overlap.length, uniqueA.length, uniqueB.length);
  updateTopInsights(overlapPct, uniqueA, uniqueB, overlap);
  updateWhatGreatLooksLike(overlap, uniqueA, uniqueB);

  outputSection.classList.remove('hidden');
}

function toggleEvidence() {
  evidenceVisible = !evidenceVisible;
  evidenceList.classList.toggle('hidden', !evidenceVisible);
  evidenceFocus.classList.toggle('hidden', !evidenceVisible);
  evidenceSection.classList.toggle('cue-soft', evidenceVisible);
  evidenceToggle.textContent = evidenceVisible ? 'Hide explainability' : 'Show explainability';
}

function loadDemoScenario() {
  inputA.value = demoSample.inputA;
  inputB.value = demoSample.inputB;
  runComparison();
}

function setupGuideInteractions() {
  Object.entries(sectionMap).forEach(([key, section]) => {
    section.addEventListener('mouseenter', () => {
      section.classList.add('cue-soft');
    });

    section.addEventListener('mouseleave', () => {
      section.classList.remove('cue-soft');
    });

    section.addEventListener('focusin', () => {
      section.classList.add('cue-soft');
      const stepIndex = guideSteps.findIndex((step) => step.key === key);
      if (stepIndex > currentStep) {
        setActiveStep(stepIndex, false);
      }
    });
  });
}

function bootGuidedExperience() {
  loadDemoScenario();
  guidePanel.classList.add('guide-pop');
  setActiveStep(0, false);
}

overlapList.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const key = target.getAttribute('data-evidence-key');
  if (!key) {
    return;
  }

  showEvidenceFor(key);
});

compareBtn.addEventListener('click', runComparison);
loadDemoBtn.addEventListener('click', loadDemoScenario);
evidenceToggle.addEventListener('click', toggleEvidence);
nextStepBtn.addEventListener('click', moveToNextStep);

setupGuideInteractions();
bootGuidedExperience();
