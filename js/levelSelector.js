// js/levelSelector.js
export let currentLevel = 0;
export let levelStates = {};
export let levelCompletions = {};

const levelNames = [
  "Level 1-a", "Level 1-b", "Level 1-c", "Level 1-d", "Level 1-e",
  "Level 2-a", "Level 2-b", "Level 2-c", "Level 2-d", "Level 2-e",
  "Level 3-a", "Level 3-b", "Level 3-c", "Level 3-d", "Level 3-e",
  "Level 4", "Level 5", "Level 6", "Level 7"
];

export function setupLevelSelector() {
  const select = document.getElementById("levelSelect");
  if (!select) {
    console.error("Level selector element not found!");
    return;
  }
  select.innerHTML = ""; // Clear existing options
  levelNames.forEach((name, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = name;
    if (index === currentLevel) option.selected = true;
    select.appendChild(option);
  });
  select.onchange = () => {
    const newLevel = parseInt(select.value);
    if (newLevel !== currentLevel) {
      changeLevel(newLevel);
    }
  };
  console.log("Level selector set up with", levelNames.length, "levels");
}

export function updateLevelSelect() {
  const select = document.getElementById("levelSelect");
  if (!select) {
    console.error("Level selector element not found!");
    return;
  }
  // Ensure the currentLevel is reflected in the dropdown
  const options = select.options;
  for (let i = 0; i < options.length; i++) {
    options[i].selected = (parseInt(options[i].value) === currentLevel);
  }
  console.log("Level selector updated to", levelNames[currentLevel]);
}

export function changeLevel(newLevel) {
  if (newLevel < 0 || newLevel >= levelNames.length) {
    console.error("Invalid level index:", newLevel);
    return;
  }
  if (newLevel !== currentLevel) {
    currentLevel = newLevel;
    initializeLevelState(currentLevel);
    // Ensure the game updates to the new level
    const mainModule = window.mainModule || {};
    if (typeof mainModule.showWord === "function") {
      mainModule.showWord();
    } else {
      console.error("showWord function not available in main module");
    }
    saveGameState(); // Save the new level state
    updateLevelSelect(); // Sync the dropdown
    console.log("Changed to level:", levelNames[currentLevel]);
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
    };
  }
  // Populate wordIndices with unique random indices for the level
  const levelWords = getLevelWords(level);
  if (levelWords && levelWords.length > 0) {
    const wordCount = Math.min(10, levelWords.length);
    const indices = [];
    while (indices.length < wordCount) {
      const randomIndex = Math.floor(Math.random() * levelWords.length);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    levelStates[level].wordIndices = indices;
  } else {
    console.error("No words available for level:", level);
    levelStates[level].wordIndices = [];
  }
  levelStates[level].indexPointer = 0;
  console.log("Initialized state for level", level, levelStates[level]);
}

function getLevelWords(level) {
  let start;
  if (level < 5) start = level * 10;
  else if (level < 10) start = 50 + (level - 5) * 10;
  else if (level < 15) start = 100 + (level - 10) * 10;
  else start = 150 + (level - 15) * 50;
  const count = level < 15 ? 10 : 50;
  return window.words ? window.words.slice(start, start + count) : [];
}

// Expose getLevelWords for use in other modules
export { getLevelWords };
