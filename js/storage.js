// js/storage.js
import { currentLevel as importedCurrentLevel, levelStates as importedLevelStates, levelCompletions as importedLevelCompletions, initializeLevelState, changeLevel, updateLevelSelect } from './levelSelector.js';
import { showWord } from './main.js';
import { updatePronounceButton, setFullPronounceEnabled, fullPronounceEnabled } from './pronunciation.js';

// Use imported variables directly
export let levelStates = importedLevelStates;
export let levelCompletions = importedLevelCompletions;

export function saveGameState() {
  const currentState = {
    failCount: levelStates[importedCurrentLevel]?.failCount || 0,
    wordsCompleted: levelStates[importedCurrentLevel]?.wordsCompleted || 0,
    wordIndices: levelStates[importedCurrentLevel]?.wordIndices || [],
    indexPointer: levelStates[importedCurrentLevel]?.indexPointer || 0,
    isReviewMode: levelStates[importedCurrentLevel]?.isReviewMode || false,
    missedWords: levelStates[importedCurrentLevel]?.missedWords || [],
    currentIndex: levelStates[importedCurrentLevel]?.currentIndex || 0,
    currentWord: levelStates[importedCurrentLevel]?.currentWord || ""
  };
  levelStates[importedCurrentLevel] = currentState;
  localStorage.setItem('currentLevel', importedCurrentLevel);
  localStorage.setItem('levelStates', JSON.stringify(levelStates));
  localStorage.setItem('levelCompletions', JSON.stringify(levelCompletions));
  localStorage.setItem('fullPronounceEnabled', fullPronounceEnabled);
  console.log("Game state saved:", currentState);
}

export function loadGameState() {
  console.log("Loading game state...");
  const savedLevel = parseInt(localStorage.getItem('currentLevel')) || 0;
  // Update currentLevel using the setter to ensure consistency
  changeLevel(savedLevel);
  levelStates = JSON.parse(localStorage.getItem('levelStates')) || {};
  levelCompletions = JSON.parse(localStorage.getItem('levelCompletions')) || {};
  const savedPronounce = localStorage.getItem('fullPronounceEnabled');
  if (savedPronounce !== null) setFullPronounceEnabled(savedPronounce !== 'false');
  updateLevelSelect(); // Sync the dropdown with the loaded level
  updatePronounceButton();
  if (!levelStates[importedCurrentLevel]) {
    initializeLevelState(importedCurrentLevel);
  }
  showWord(); // Ensure a word is displayed after loading state
  console.log("Loaded state:", { currentLevel: importedCurrentLevel, levelStates, wordsLength: window.words ? window.words.length : "undefined" });
}

export function resetProgress() {
  // Reset all game state
  levelStates = {};
  levelCompletions = {};
  localStorage.clear();

  // Reset currentLevel to 0 using the setter
  changeLevel(0);

  // Sync the dropdown with the new level
  updateLevelSelect();

  // Ensure the state is initialized for the new level
  initializeLevelState(importedCurrentLevel);

  // Verify that the state is initialized
  if (!levelStates[importedCurrentLevel]) {
    console.error("Failed to initialize level state for level", importedCurrentLevel);
    return;
  }

  // Hide the reset confirmation popup
  document.getElementById("resetConfirmPopup").style.display = "none";

  // Show the first word of the new level
  showWord();

  // Save the new state
  saveGameState();

  console.log("Progress reset, starting at level 0");
}
