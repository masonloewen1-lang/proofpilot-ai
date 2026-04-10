const compareBtn = document.getElementById('compareBtn');
const inputA = document.getElementById('inputA');
const inputB = document.getElementById('inputB');
const results = document.getElementById('results');

const overlapList = document.getElementById('overlapList');
const uniqueAList = document.getElementById('uniqueAList');
const uniqueBList = document.getElementById('uniqueBList');
const differencesList = document.getElementById('differencesList');

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

compareBtn.addEventListener('click', () => {
  const linesA = extractLines(inputA.value);
  const linesB = extractLines(inputB.value);

  const keyedA = new Map(linesA.map((line) => [lineKey(line), line]));
  const keyedB = new Map(linesB.map((line) => [lineKey(line), line]));

  const overlap = [];
  const uniqueA = [];
  const uniqueB = [];

  keyedA.forEach((value, key) => {
    if (keyedB.has(key)) {
      overlap.push(value);
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
      `Both mention distinct phrasing around: ${sharedDifferenceKeywords
        .slice(0, 8)
        .join(', ')}.`
    );
  }

  renderList(overlapList, overlap, 'No direct overlap detected yet.');
  renderList(uniqueAList, uniqueA, 'No unique requirements in Input A.');
  renderList(uniqueBList, uniqueB, 'No unique requirements in Input B.');
  renderList(differencesList, differences, 'No key differences found.');

  results.classList.remove('hidden');
});
