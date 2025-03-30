import { currentLevel, setupLevelSelector, changeLevel } from './levelSelector.js';
import { setupPronunciation, pronounceWord, isSpeaking } from './pronunciation.js';
import { setupKeyboard } from './keyboard.js';
import { showFeedback, showCelebration, showLevelComplete, updateProgress, enableButtons, disableButtons } from './ui.js';
import { saveGameState, loadGameState, levelStates, levelCompletions } from './storage.js';

export function startGame() {
  setupKeyboard();
  setupPronunciation();
  setupLevelSelector();
  setupButtons();
  setupKeyboardShortcuts();
  loadGameState();
  if (!levelStates[currentLevel] || levelStates[currentLevel].wordIndices.length === 0) {
    initializeLevelState(currentLevel);
  }
  showWord();
}

function setupButtons() {
  document.getElementById("checkAnswer").onclick = checkSpelling;
  document.getElementById("showAnswer").onclick = showAnswer;
  document.getElementById("wordListButton").onclick = showConfirmPopup;
  document.getElementById("resetButton").onclick = showResetConfirmPopup;
}

function checkSpelling() {
  const state = levelStates[currentLevel];
  if (isSpeaking) {
    speechSynthesis.cancel();
    isSpeaking = false;
    enableButtons();
  }
  const userInput = state.currentWord.trim().toLowerCase();
  const correctWord = getLevelWords()[state.currentIndex].word;
  if (userInput === correctWord) {
    state.wordsCompleted++;
    playSound('correct');
    showFeedback("", true);
    showCelebration();
  } else {
    state.failCount++;
    if (state.failCount === 1 && !state.isReviewMode) {
      state.missedWords.push(getLevelWords()[state.currentIndex]);
    }
    playSound('wrong');
    showFeedback("❌ Oops! Try Again! ❌", false);
    if (state.failCount >= 3) document.getElementById("showAnswer").style.display = "block";
    state.currentWord = "";
    updateDisplay();
  }
  saveGameState();
}

// Other functions like showWord, nextWord, etc., remain here but use imported utilities
