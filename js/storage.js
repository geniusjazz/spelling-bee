import { currentLevel } from './levelSelector.js';
import { initializeLevelState, updateLevelSelect } from './levelSelector.js';
import { showWord } from './main.js';
import { updatePronounceButton, setFullPronounceEnabled, fullPronounceEnabled } from './pronunciation.js'; // Added fullPronounceEnabled

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
  localStorage.setItem('fullPronounceEnabled', fullPronounceEnabled);
  console.log("Game state saved:", currentState);
}

export function loadGameState() {
  console.log("Loading game state...");
  const savedLevel = parseInt(localStorage.getItem('currentLevel')) || 0;
  levelStates = JSON.parse(localStorage.getItem('levelStates')) || {};
  levelCompletions = JSON.parse(localStorage.getItem('levelCompletions')) || {};
  const savedPronounce = localStorage.getItem('fullPronounceEnabled');
  if (savedPronounce !== null) setFullPronounceEnabled(savedPronounce !== 'false');
  document.getElementById("levelSelect").value = savedLevel;
  updatePronounceButton();
  updateLevelSelect();
  if (!levelStates[currentLevel]) {
    initializeLevelState(currentLevel);
  }
  console.log("Loaded state:", { currentLevel, levelStates, wordsLength: words ? words.length : "undefined" });
}

export function resetProgress() {
  levelStates = {};
  levelCompletions = {};
  document.getElementById("levelSelect").value = 0;
  initializeLevelState(0);
  updateLevelSelect();
  showWord();
  saveGameState();
  document.getElementById("resetConfirmPopup").style.display = "none";
}
