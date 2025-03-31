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
  if (select) {
    select.innerHTML = ""; // Clear existing options
    levelNames.forEach((name, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = name;
      if (index === currentLevel) option.selected = true;
      select.appendChild(option);
    });
    select.onchange = () => changeLevel();
  }
}

export function changeLevel() {
  const select = document.getElementById("levelSelect");
  if (select) {
    const newLevel = parseInt(select.value);
    if (newLevel !== currentLevel) {
      currentLevel = newLevel;
      initializeLevelState(currentLevel);
      showWord(); // Assuming showWord is imported or defined elsewhere
    }
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
  // Populate wordIndices with 10 random indices for the level
  const levelWords = getLevelWords(); // Assuming getLevelWords is available
  levelStates[level].wordIndices = Array.from({ length: 10 }, () => Math.floor(Math.random() * levelWords.length));
  console.log("Initialized state for level", level, levelStates[level]);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
