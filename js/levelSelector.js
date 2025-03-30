import { levelStates, levelCompletions, saveGameState } from './storage.js';
import { showWord } from './main.js';

export let currentLevel = 0;

export function setupLevelSelector() {
  const levelSelect = document.getElementById("levelSelect");
  const baseOptions = [
    "Level 1-a", "Level 1-b", "Level 1-c", "Level 1-d", "Level 1-e",
    "Level 2-a", "Level 2-b", "Level 2-c", "Level 2-d", "Level 2-e",
    "Level 3-a", "Level 3-b", "Level 3-c", "Level 3-d", "Level 3-e",
    "Level 4", "Level 5", "Level 6", "Level 7"
  ];
  levelSelect.innerHTML = ""; // Clear existing options
  baseOptions.forEach((text, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = text;
    levelSelect.appendChild(option);
  });
  levelSelect.onchange = () => changeLevel(parseInt(levelSelect.value));
  updateLevelSelect();
}

export function changeLevel(newLevel) {
  currentLevel = newLevel;
  if (!levelStates[currentLevel]) initializeLevelState(currentLevel);
  showWord();
  saveGameState();
}

export function updateLevelSelect() {
  const levelSelect = document.getElementById("levelSelect");
  for (let i = 0; i < levelSelect.options.length; i++) {
    const completions = levelCompletions[i] || 0;
    levelSelect.options[i].text = levelSelect.options[i].text.split(' ')[0] + ' ' + 
      (completions > 0 ? '★'.repeat(completions % 5) + '🏆'.repeat(Math.floor(completions / 5)) : '');
  }
}

export function initializeLevelState(level) {
  console.log("Initializing level state for", level);
  const totalWords = level < 15 ? 10 : 50;
  let indices = Array.from({ length: totalWords }, (_, i) => i);
  shuffle(indices);
  levelStates[level] = {
    failCount: 0,
    wordsCompleted: 0,
    wordIndices: indices,
    indexPointer: 0,
    isReviewMode: false,
    missedWords: [],
    currentIndex: indices[0],
    currentWord: ""
  };
  console.log("Initialized state:", levelStates[level]);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
