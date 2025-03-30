export let levelStates = {};
export let levelCompletions = {};

export function saveGameState() {
  const currentState = {
    failCount: levelStates[currentLevel]?.failCount || 0,
    wordsCompleted: levelStates[currentLevel]?.wordsCompleted || 0,
    wordIndices: levelStates[currentLevel]?.wordIndices || [],
    indexPointer: levelStates[currentLevel]?.indexPointer || 0,
    isReviewMode: levelStates[currentLevel]?.isReviewMode || false,
    missedWords: levelStates[currentLevel]?.missedWords || [],
    currentIndex: levelStates[currentLevel]?.currentIndex || 0,
    currentWord: levelStates[currentLevel]?.currentWord || ""
  };
  levelStates[currentLevel] = currentState;
  localStorage.setItem('currentLevel', currentLevel);
  localStorage.setItem('levelStates', JSON.stringify(levelStates));
  localStorage.setItem('levelCompletions', JSON.stringify(levelCompletions));
  localStorage.setItem('fullPronounceEnabled', fullPronounceEnabled); // From pronunciation.js
  console.log("Game state saved:", currentState);
}

export function loadGameState() {
  console.log("Loading game state...");
  currentLevel = parseInt(localStorage.getItem('currentLevel')) || 0; // From levelSelector.js
  levelStates = JSON.parse(localStorage.getItem('levelStates')) || {};
  levelCompletions = JSON.parse(localStorage.getItem('levelCompletions')) || {};
  fullPronounceEnabled = localStorage.getItem('fullPronounceEnabled') !== 'false'; // From pronunciation.js
  document.getElementById("levelSelect").value = currentLevel;
  updatePronounceButton(); // From pronunciation.js
  updateLevelSelect(); // From levelSelector.js
  if (!levelStates[currentLevel]) {
    initializeLevelState(currentLevel); // From levelSelector.js
  }
  console.log("Loaded state:", { currentLevel, levelStates, wordsLength: words ? words.length : "undefined" });
}

export function resetProgress() {
  currentLevel = 0;
  levelStates = {};
  levelCompletions = {};
  document.getElementById("levelSelect").value = 0;
  initializeLevelState(0); // From levelSelector.js
  updateLevelSelect(); // From levelSelector.js
  showWord(); // From main.js
  saveGameState();
  document.getElementById("resetConfirmPopup").style.display = "none";
}
