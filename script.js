const compareBtn = document.getElementById('compareBtn');
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

const evidenceSection = document.getElementById('evidenceSection');
const evidenceToggle = document.getElementById('evidenceToggle');
const evidenceList = document.getElementById('evidenceList');

const guidePanel = document.getElementById('guidePanel');
const guideTitle = document.getElementById('guideTitle');
const guideMessage = document.getElementById('guideMessage');
const guideDots = document.getElementById('guideDots');
const nextStepBtn = document.getElementById('nextStepBtn');

const sectionMap = {
  input: document.getElementById('inputSection'),
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
Translate market research into GTM strategy and campaign briefs.
Partner with Product to define messaging hierarchy and value propositions.
Create KPI dashboards for activation, conversion, and retention.
Own cross-functional launch retrospectives and risk mitigation plans.`,
  inputB: `Candidate demonstrates GTM planning with clear launch milestones.
Shows evidence of translating customer research into actionable positioning.
Can align Product, Sales, and Success on messaging and enablement.
Uses KPI frameworks to evaluate funnel performance.
Identifies launch risks early and proposes mitigation actions.`
};

const guideSteps = [
  {
    key: 'input',
    title: 'Step 1: Inputs are preloaded with our strongest sample demo.',
    message: 'Review how each text is structured. You can edit either side to instantly explore alternate scenarios.'
  },
  {
    key: 'output',
    title: 'Step 2: Output highlights overlap and gaps immediately.',
    message: 'Start with overlap for common ground, then scan unique items and differences for risk areas.'
  },
  {
    key: 'scorecard',
    title: 'Step 3: Scorecard gives you an executive summary.',
    message: 'Use overlap score, balance, and gap count to quickly assess quality without reading every bullet.'
  },
  {
    key: 'evidence',
    title: 'Step 4: Evidence mode proves every overlap.',
    message: 'Toggle evidence to see the matched lines from each input so stakeholders can trust the analysis.'
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

function renderList(element, items, emptyMessage) {
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
    element.appendChild(li);
  });
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
    li.innerHTML = `<strong>Matched concept:</strong> ${item.key}<br><span>Input A:</span> ${item.a}<br><span>Input B:</span> ${item.b}`;
    evidenceList.appendChild(li);
  });
}

function updateScorecard(overlapCount, uniqueACount, uniqueBCount) {
  const total = overlapCount + uniqueACount + uniqueBCount;
  const overlapPct = total ? Math.round((overlapCount / total) * 100) : 0;
  const balancePct =
    uniqueACount + uniqueBCount ? Math.round((Math.min(uniqueACount, uniqueBCount) / Math.max(uniqueACount, uniqueBCount)) * 100) : 100;

  overlapScore.textContent = `${overlapPct}%`;
  coverageBalance.textContent = `${balancePct}%`;
  priorityGaps.textContent = `${uniqueACount + uniqueBCount}`;
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
    differences.push(`Input A has ${uniqueA.length} unique requirement(s).`);
  }
  if (uniqueB.length) {
    differences.push(`Input B has ${uniqueB.length} unique requirement(s).`);
  }
  if (sharedDifferenceKeywords.length) {
    differences.push(
      `Both mention distinct phrasing around: ${sharedDifferenceKeywords.slice(0, 8).join(', ')}.`
    );
  }

  renderList(overlapList, overlap, 'No direct overlap detected yet.');
  renderList(uniqueAList, uniqueA, 'No unique requirements in Input A.');
  renderList(uniqueBList, uniqueB, 'No unique requirements in Input B.');
  renderList(differencesList, differences, 'No key differences found.');

  latestEvidence = evidence;
  renderEvidence(latestEvidence);
  updateScorecard(overlap.length, uniqueA.length, uniqueB.length);

  outputSection.classList.remove('hidden');
}

function toggleEvidence() {
  evidenceVisible = !evidenceVisible;
  evidenceList.classList.toggle('hidden', !evidenceVisible);
  evidenceSection.classList.toggle('cue-soft', evidenceVisible);
  evidenceToggle.textContent = evidenceVisible ? 'Hide evidence' : 'Show evidence';
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
  const hasVisited = localStorage.getItem('proofpilot-guided-demo-v1');
  if (!hasVisited) {
    inputA.value = demoSample.inputA;
    inputB.value = demoSample.inputB;
    runComparison();
    localStorage.setItem('proofpilot-guided-demo-v1', 'true');
    guidePanel.classList.add('guide-pop');
  }

  setActiveStep(0, false);
}

compareBtn.addEventListener('click', runComparison);
evidenceToggle.addEventListener('click', toggleEvidence);
nextStepBtn.addEventListener('click', moveToNextStep);

setupGuideInteractions();
bootGuidedExperience();
