// js/storage.js
import { currentLevel as importedCurrentLevel, levelStates as importedLevelStates, levelCompletions as importedLevelCompletions, initializeLevelState, updateLevelSelect } from './levelSelector.js';
import { showWord } from './main.js';
import { updatePronounceButton, setFullPronounceEnabled, fullPronounceEnabled } from './pronunciation.js';

// Use imported variables to avoid conflicts
let currentLevel = importedCurrentLevel;
export let levelStates = importedLevelStates;
export let levelCompletions = importedLevelCompletions;

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
  // Update currentLevel to match the saved level
  currentLevel = savedLevel;
  levelStates = JSON.parse(localStorage.getItem('levelStates')) || {};
  levelCompletions = JSON.parse(localStorage.getItem('levelCompletions')) || {};
  const savedPronounce = localStorage.getItem('fullPronounceEnabled');
  if (savedPronounce !== null) setFullPronounceEnabled(savedPronounce !== 'false');
  updateLevelSelect(); // Sync the dropdown with the loaded level
  updatePronounceButton();
  if (!levelStates[currentLevel]) {
    initializeLevelState(currentLevel);
  }
  showWord(); // Ensure a word is displayed after loading state
  console.log("Loaded state:", { currentLevel, levelStates, wordsLength: window.words ? window.words.length : "undefined" });
}

export function resetProgress() {
  currentLevel = 0; // Explicitly reset currentLevel
  levelStates = {};
  levelCompletions = {};
  initializeLevelState(currentLevel);
  updateLevelSelect(); // Sync the dropdown
  showWord(); // Display the first word of the new level
  saveGameState();
  document.getElementById("resetConfirmPopup").style.display = "none";
  console.log("Progress reset, starting at level 0");
}
