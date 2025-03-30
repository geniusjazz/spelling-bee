export let currentLevel = 0;

export function setupLevelSelector() {
  const select = document.getElementById("levelSelect");
  select.onchange = changeLevel;
  updateLevelSelect();
}

export function changeLevel() {
  const newLevel = parseInt(document.getElementById("levelSelect").value);
  saveGameState(); // From storage.js
  currentLevel = newLevel;
  if (!levelStates[currentLevel]) {
    initializeLevelState(currentLevel);
  }
  showWord(); // From main.js
  saveGameState();
}

export function updateLevelSelect() {
  const select = document.getElementById("levelSelect");
  const baseOptions = [
    "Level 1-a", "Level 1-b", "Level 1-c", "Level 1-d", "Level 1-e",
    "Level 2-a", "Level 2-b", "Level 2-c", "Level 2-d", "Level 2-e",
    "Level 3-a", "Level 3-b", "Level 3-c", "Level 3-d", "Level 3-e",
    "Level 4", "Level 5", "Level 6", "Level 7"
  ];
  for (let i = 0; i < select.options.length; i++) {
    const level = parseInt(select.options[i].value);
    const completions = levelCompletions[level] || 0;
    const stars = completions % 5;
    const trophies = Math.floor(completions / 5);
    let suffix = '';
    if (trophies > 0) suffix += ' 🏆'.repeat(trophies);
    if (stars > 0) suffix += ' ⭐'.repeat(stars);
    select.options[i].text = baseOptions[i] + suffix;
  }
}

export function initializeLevelState(level) {
  if (!levelStates[level]) {
    levelStates[level] = {
      failCount: 0,
      wordsCompleted: 0,
      wordIndices: [],
      indexPointer: 0,
      isReviewMode: false,
      missedWords: [],
      currentIndex: 0,
      currentWord: ""
    };
    initializeWordIndices(level);
  }
}

function initializeWordIndices(level) {
  const state = levelStates[level];
  const totalWords = level < 15 ? 10 : 50;
  state.wordIndices = Array.from({ length: totalWords }, (_, i) => i);
  shuffle(state.wordIndices);
  state.indexPointer = 0;
  updateProgress(); // From ui.js
  saveGameState();
}
