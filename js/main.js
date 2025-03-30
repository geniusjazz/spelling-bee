import { currentLevel, setupLevelSelector, changeLevel, initializeLevelState } from './levelSelector.js';
import { setupPronunciation, pronounceWord, isSpeaking } from './pronunciation.js';
import { setupKeyboard } from './keyboard.js';
import { showFeedback, showCelebration, showLevelComplete, updateProgress, enableButtons, disableButtons, updateDisplay } from './ui.js';
import { saveGameState, loadGameState, levelStates, levelCompletions, resetProgress } from './storage.js';

export function startGame() {
  console.log("Starting game...");
  document.getElementById("mainContent").innerText = "Loading game...";
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
  console.log("Game started.");
  document.getElementById("mainContent").innerText = "Game Loaded!";
}

function setupButtons() {
  document.getElementById("checkAnswer").onclick = checkSpelling;
  document.getElementById("showAnswer").onclick = showAnswer;
  document.getElementById("wordListButton").onclick = showConfirmPopup;
  document.getElementById("resetButton").onclick = showResetConfirmPopup;
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'z') {
      if (isSpeaking) return;
      const state = levelStates[currentLevel];
      if (!state || !state.wordIndices || state.indexPointer >= state.wordIndices.length) {
        alert("Cannot use shortcut: Game state not ready or level complete.");
        return;
      }
      const levelWords = getLevelWords();
      if (!levelWords || !levelWords[state.currentIndex]) {
        alert("Cannot use shortcut: No word available.");
        return;
      }
      state.currentWord = levelWords[state.currentIndex].word;
      updateDisplay();
      checkSpelling();
    }
  });
}

function getLevelWords() {
  const state = levelStates[currentLevel];
  if (state.isReviewMode) return state.missedWords;
  let start;
  if (currentLevel < 5) start = currentLevel * 10;
  else if (currentLevel < 10) start = 50 + (currentLevel - 5) * 10;
  else if (currentLevel < 15) start = 100 + (currentLevel - 10) * 10;
  else start = 150 + (currentLevel - 15) * 50;
  const count = currentLevel < 15 ? 10 : 50;
  return words.slice(start, start + count);
}

export function showWord() {
  const state = levelStates[currentLevel];
  const levelWords = getLevelWords();
  if (!words || levelWords.length === 0) {
    console.error("No words available for this level!");
    return;
  }
  if (!state.wordIndices.length || state.indexPointer >= state.wordIndices.length) {
    initializeLevelState(currentLevel);
  }
  state.currentIndex = state.wordIndices[state.indexPointer];
  const w = levelWords[state.currentIndex];
  document.getElementById("part").innerText = "Part of Speech: " + w.part;
  document.getElementById("definition").innerText = "Definition: " + w.definition;
  document.getElementById("wordIndex").innerText = "Word #" + w.no;
  updateDisplay();
  document.getElementById("showAnswer").style.display = state.failCount >= 3 ? "block" : "none";
  document.getElementById("mainContent").style.display = "block";
  document.getElementById("mascot").className = "";
  updateProgress();
  enableButtons();
}

function nextWord() {
  const state = levelStates[currentLevel];
  state.indexPointer++;
  if (state.indexPointer >= state.wordIndices.length) {
    if (state.isReviewMode) endReviewMode();
    else showReviewMode();
    return;
  }
  state.failCount = 0;
  state.currentWord = "";
  showWord();
  saveGameState();
}

function endReviewMode() {
  levelStates[currentLevel].isReviewMode = false;
  levelCompletions[currentLevel] = (levelCompletions[currentLevel] || 0) + 1;
  saveGameState();
  showLevelComplete();
}

function showReviewMode() {
  const state = levelStates[currentLevel];
  if (state.missedWords.length === 0) {
    levelCompletions[currentLevel] = (levelCompletions[currentLevel] || 0) + 1;
    saveGameState();
    showLevelComplete();
    return;
  }
  document.getElementById("mainContent").style.display = "none";
  const reviewDiv = document.createElement("div");
  reviewDiv.id = "review-mode";
  const wordList = document.createElement("div");
  state.missedWords.forEach(w => {
    const btn = document.createElement("button");
    btn.className = "word-button";
    btn.innerText = w.word;
    wordList.appendChild(btn);
  });
  reviewDiv.appendChild(wordList);
  const redoBtn = document.createElement("button");
  redoBtn.className = "redo-button";
  redoBtn.innerText = "Redo Missed Words";
  redoBtn.onclick = redoMissedWords;
  reviewDiv.appendChild(redoBtn);
  document.body.appendChild(reviewDiv);
}

function redoMissedWords() {
  document.getElementById("review-mode").remove();
  document.getElementById("mainContent").style.display = "block";
  const state = levelStates[currentLevel];
  state.isReviewMode = true;
  state.wordsCompleted = 0;
  state.failCount = 0;
  state.currentWord = "";
  initializeLevelState(currentLevel);
  showWord();
  enableButtons();
  saveGameState();
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
    showFeedback("", true);
    showCelebration(nextWord);
  } else {
    state.failCount++;
    if (state.failCount === 1 && !state.isReviewMode) state.missedWords.push(getLevelWords()[state.currentIndex]);
    showFeedback("❌ Oops! Try Again! ❌", false);
    if (state.failCount >= 3) {
      document.getElementById("showAnswer").style.display = "block";
      document.getElementById("showAnswer").disabled = false;
    }
    state.currentWord = "";
    updateDisplay();
  }
  saveGameState();
}

function showAnswer() {
  if (isSpeaking) return;
  const state = levelStates[currentLevel];
  const w = getLevelWords()[state.currentIndex];
  showFeedback(`Answer: ${w.word}`, false);
}

function showConfirmPopup() {
  document.getElementById("confirmPopup").style.display = "block";
}

function hideConfirmPopup() {
  document.getElementById("confirmPopup").style.display = "none";
}

function goToWordList() {
  saveGameState();
  window.location.href = 'wordlist.html';
}

function showResetConfirmPopup() {
  document.getElementById("resetConfirmPopup").style.display = "block";
}

function hideResetConfirmPopup() {
  document.getElementById("resetConfirmPopup").style.display = "none";
}

export { nextWord }; // Only export nextWord, since showWord is already exported above
