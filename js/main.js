import { currentLevel, setupLevelSelector, changeLevel, initializeLevelState } from './levelSelector.js';
import { setupPronunciation, pronounceWord, isSpeaking } from './pronunciation.js';
import { setupKeyboard } from './keyboard.js';
import { showFeedback, showCelebration, showLevelComplete, updateProgress, enableButtons, disableButtons, updateDisplay } from './ui.js';
import { saveGameState, loadGameState, levelStates, levelCompletions, resetProgress } from './storage.js';

export function startGame() {
  console.log("Starting game...");
  console.log("mainContent:", document.getElementById("mainContent"));
  console.log("pronounce:", document.getElementById("pronounce"));
  console.log("part:", document.getElementById("part"));
  document.getElementById("mainContent").innerText = "Loading game...";
  console.log("After mainContent update:", document.getElementById("mainContent"));
  console.log("Calling setupKeyboard...");
  setupKeyboard();
  console.log("After setupKeyboard:", document.getElementById("pronounce"), document.getElementById("part"));
  console.log("Calling setupPronunciation...");
  setupPronunciation();
  console.log("After setupPronunciation:", document.getElementById("pronounce"), document.getElementById("part"));
  console.log("Calling setupLevelSelector...");
  setupLevelSelector();
  console.log("Calling setupButtons...");
  setupButtons();
  console.log("Calling setupKeyboardShortcuts...");
  setupKeyboardShortcuts();
  console.log("Calling loadGameState...");
  loadGameState();
  console.log("Checking level state...");
  if (!levelStates[currentLevel] || levelStates[currentLevel].wordIndices.length === 0) {
    initializeLevelState(currentLevel);
  }
  console.log("Calling showWord...");
  showWord();
  console.log("Game started.");
  document.getElementById("mainContent").innerText = "Game Loaded!";
}

function setupButtons() {
  const checkAnswerBtn = document.getElementById("checkAnswer");
  const showAnswerBtn = document.getElementById("showAnswer");
  const wordListBtn = document.getElementById("wordListButton");
  const resetBtn = document.getElementById("resetButton");
  if (!checkAnswerBtn) console.error("Element with ID 'checkAnswer' not found!");
  if (!showAnswerBtn) console.error("Element with ID 'showAnswer' not found!");
  if (!wordListBtn) console.error("Element with ID 'wordListButton' not found!");
  if (!resetBtn) console.error("Element with ID 'resetButton' not found!");
  if (checkAnswerBtn) checkAnswerBtn.onclick = checkSpelling;
  if (showAnswerBtn) showAnswerBtn.onclick = showAnswer;
  if (wordListBtn) wordListBtn.onclick = showConfirmPopup;
  if (resetBtn) resetBtn.onclick = showResetConfirmPopup;
}

export function getLevelWords() {
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
  console.log("showWord: state =", state);
  const levelWords = getLevelWords();
  console.log("showWord: levelWords length =", levelWords.length, "words defined =", typeof words !== 'undefined');
  if (!words || levelWords.length === 0) {
    console.error("No words available for this level!");
    return;
  }
  if (!state.wordIndices.length || state.indexPointer >= state.wordIndices.length) {
    console.log("Initializing level state for level", currentLevel);
    initializeLevelState(currentLevel);
  }
  state.currentIndex = state.wordIndices[state.indexPointer];
  const w = levelWords[state.currentIndex];
  console.log("showWord: current word =", w);
  console.log("Before updating DOM:", document.getElementById("part"), document.getElementById("pronounce"));
  const partEl = document.getElementById("part");
  const defEl = document.getElementById("definition");
  const indexEl = document.getElementById("wordIndex");
  const showAnswerBtn = document.getElementById("showAnswer");
  if (!partEl) console.error("Element with ID 'part' not found!");
  if (!defEl) console.error("Element with ID 'definition' not found!");
  if (!indexEl) console.error("Element with ID 'wordIndex' not found!");
  if (!showAnswerBtn) console.error("Element with ID 'showAnswer' not found!");
  if (partEl) partEl.innerText = "Part of Speech: " + w.part;
  if (defEl) defEl.innerText = "Definition: " + w.definition;
  if (indexEl) indexEl.innerText = "Word #" + w.no;
  updateDisplay();
  if (showAnswerBtn) showAnswerBtn.style.display = state.failCount >= 3 ? "block" : "none";
  document.getElementById("mainContent").style.display = "block";
  document.getElementById("mascot").className = "";
  updateProgress();
  enableButtons();
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

export { nextWord }; // Removed getLevelWords from here
