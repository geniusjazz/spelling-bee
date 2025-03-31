import { currentLevel, setupLevelSelector, changeLevel, initializeLevelState } from './levelSelector.js';
import { setupPronunciation, pronounceWord, isSpeaking } from './pronunciation.js';
import { setupKeyboard, clearWord } from './keyboard.js'; // Import clearWord
import { showFeedback, showCelebration, showLevelComplete, updateProgress, enableButtons, disableButtons, updateDisplay } from './ui.js';
import { saveGameState, loadGameState, levelStates, levelCompletions, resetProgress } from './storage.js';

export function startGame() {
  console.log("Starting game...");
  console.log("mainContent:", document.getElementById("mainContent"));
  console.log("pronounce:", document.getElementById("pronounce"));
  console.log("part:", document.getElementById("part"));
  const status = document.createElement("div");
  status.id = "status";
  status.innerText = "Loading game...";
  document.getElementById("mainContent").appendChild(status);
  console.log("After status append:", document.getElementById("mainContent"));
  console.log("Calling setupKeyboard...");
  setupKeyboard();
  console.log("After setupKeyboard:", document.getElementById("pronounce"), document.getElementById("part"));
  console.log("Calling setupPronunciation...");
  setupPronunciation(document.getElementById("pronounce"));
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
  document.getElementById("status").innerText = "Game Loaded!";
  document.getElementById("mainContent").removeChild(status);
}

function setupButtons() {
  const checkAnswerBtn = document.getElementById("checkAnswer");
  const showAnswerBtn = document.getElementById("showAnswer");
  const wordListBtn = document.getElementById("wordListButton");
  const resetBtn = document.getElementById("resetButton");
  const confirmYes = document.getElementById("confirmYes");
  const confirmNo = document.getElementById("confirmNo");
  const resetYes = document.getElementById("resetYes");
  const resetNo = document.getElementById("resetNo");

  if (!checkAnswerBtn) console.error("Element with ID 'checkAnswer' not found!");
  if (!showAnswerBtn) console.error("Element with ID 'showAnswer' not found!");
  if (!wordListBtn) console.error("Element with ID 'wordListButton' not found!");
  if (!resetBtn) console.error("Element with ID 'resetButton' not found!");
  if (!confirmYes) console.error("Element with ID 'confirmYes' not found!");
  if (!confirmNo) console.error("Element with ID 'confirmNo' not found!");
  if (!resetYes) console.error("Element with ID 'resetYes' not found!");
  if (!resetNo) console.error("Element with ID 'resetNo' not found!");

  if (checkAnswerBtn) checkAnswerBtn.onclick = checkSpelling;
  if (showAnswerBtn) showAnswerBtn.onclick = showAnswer;
  if (wordListBtn) wordListBtn.onclick = showConfirmPopup;
  if (resetBtn) resetBtn.onclick = showResetConfirmPopup;
  if (confirmYes) confirmYes.onclick = goToWordList;
  if (confirmNo) confirmNo.onclick = hideConfirmPopup;
  if (resetYes) resetYes.onclick = resetProgress;
  if (resetNo) resetNo.onclick = hideResetConfirmPopup;
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    if (isSpeaking) return;
    const key = event.key.toLowerCase();

    // Ctrl-Shift-Z hack to auto-answer
    if (event.ctrlKey && event.shiftKey && key === 'z') {
      event.preventDefault(); // Prevent 'z' from being appended
      const state = levelStates[currentLevel];
      const levelWords = getLevelWords();
      const w = levelWords[state.currentIndex];
      document.getElementById("wordDisplay").innerText = w.word;
      checkSpelling();
      return;
    }

    if (key === "enter") {
      checkSpelling();
    } else if (key === "backspace") {
      removeLetter();
    } else if (key === "escape") {
      clearWord();
    } else if (/^[a-z]$/.test(key)) {
      appendLetter(key);
    }
  });
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
  // If wordIndices is empty, re-initialize the state
  if (!state.wordIndices.length || state.indexPointer >= state.wordIndices.length) {
    console.log("Re-initializing level state for level", currentLevel);
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
  const wordDisplay = document.getElementById("wordDisplay");
  if (!partEl) console.error("Element with ID 'part' not found!");
  if (!defEl) console.error("Element with ID 'definition' not found!");
  if (!indexEl) console.error("Element with ID 'wordIndex' not found!");
  if (!showAnswerBtn) console.error("Element with ID 'showAnswer' not found!");
  if (!wordDisplay) console.error("Element with ID 'wordDisplay' not found!");
  if (partEl) partEl.innerText = "Part of Speech: " + w.part;
  if (defEl) defEl.innerText = "Definition: " + w.definition;
  if (indexEl) indexEl.innerText = "Word #" + w.no;
  if (wordDisplay) wordDisplay.innerText = ""; // Clear previous content
  updateDisplay();
  if (showAnswerBtn) showAnswerBtn.style.display = state.failCount >= 3 ? "block" : "none";
  document.getElementById("mainContent").style.display = "block";
  document.getElementById("mascot").className = "";
  updateProgress();
  enableButtons();
}

function checkSpelling() {
  const state = levelStates[currentLevel];
  const levelWords = getLevelWords();
  const w = levelWords[state.currentIndex];
  const userInput = document.getElementById("wordDisplay").innerText.trim().toLowerCase();
  console.log("Checking spelling: userInput =", userInput, "correct answer =", w.word.toLowerCase()); // Debug log
  if (userInput === w.word.toLowerCase()) {
    showFeedback("Correct!", "correct");
    state.wordsCompleted++;
    state.indexPointer++;
    state.failCount = 0;
    document.getElementById("mascot").className = "happy";
    showCelebration();
    if (state.indexPointer >= state.wordIndices.length) {
      if (state.missedWords.length > 0) {
        state.isReviewMode = true;
        state.wordIndices = state.missedWords.map((_, i) => i);
        state.indexPointer = 0;
      } else {
        showLevelComplete();
        levelCompletions[currentLevel] = true;
        currentLevel++;
        if (currentLevel >= 19) {
          currentLevel = 0; // Reset to first level if all levels completed
        }
        initializeLevelState(currentLevel);
      }
    }
    setTimeout(() => {
      clearWord(); // Clear state.currentWord and update display
      showWord();
    }, 1000);
  } else {
    showFeedback("Try Again!", "wrong");
    state.failCount++;
    if (!state.missedWords.some(mw => mw.word === w.word)) {
      state.missedWords.push(w);
    }
    document.getElementById("mascot").className = "sad";
  }
  saveGameState();
  updateProgress();
}

function showAnswer() {
  const state = levelStates[currentLevel];
  const levelWords = getLevelWords();
  const w = levelWords[state.currentIndex];
  document.getElementById("wordDisplay").innerText = w.word;
  state.failCount = 0;
  state.indexPointer++;
  if (state.indexPointer >= state.wordIndices.length) {
    if (state.missedWords.length > 0) {
      state.isReviewMode = true;
      state.wordIndices = state.missedWords.map((_, i) => i);
      state.indexPointer = 0;
    } else {
      showLevelComplete();
      levelCompletions[currentLevel] = true;
      currentLevel++;
      if (currentLevel >= 19) {
        currentLevel = 0;
      }
      initializeLevelState(currentLevel);
    }
  }
  setTimeout(showWord, 1000);
  saveGameState();
}

function showConfirmPopup() {
  const popup = document.getElementById("confirmPopup");
  if (popup) {
    popup.style.display = "block";
  }
}

function hideConfirmPopup() {
  const popup = document.getElementById("confirmPopup");
  if (popup) {
    popup.style.display = "none";
  }
}

function goToWordList() {
  console.log("Going to word list for level", currentLevel);
  const state = levelStates[currentLevel];
  if (state && state.missedWords && state.missedWords.length > 0) {
    console.log("Missed words:", state.missedWords);
    alert("Missed words: " + state.missedWords.map(w => w.word).join(", "));
  } else {
    alert("No missed words yet!");
  }
  hideConfirmPopup();
}

function showResetConfirmPopup() {
  const popup = document.getElementById("resetConfirmPopup");
  if (popup) {
    popup.style.display = "block";
  }
}

function hideResetConfirmPopup() {
  const popup = document.getElementById("resetConfirmPopup");
  if (popup) {
    popup.style.display = "none";
  }
}

function appendLetter(letter) {
  const wordDisplay = document.getElementById("wordDisplay");
  if (wordDisplay) {
    wordDisplay.innerText += letter;
  }
}

function removeLetter() {
  const wordDisplay = document.getElementById("wordDisplay");
  if (wordDisplay) {
    wordDisplay.innerText = wordDisplay.innerText.slice(0, -1);
  }
}
