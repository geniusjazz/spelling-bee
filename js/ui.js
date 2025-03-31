import { currentLevel, initializeLevelState, changeLevel } from './levelSelector.js';
import { levelStates, levelCompletions } from './storage.js';
import { saveGameState } from './storage.js';
import { showWord } from './main.js';

export function updateDisplay() {
  const wordDisplay = document.getElementById("wordDisplay");
  wordDisplay.classList.add("fade");
  setTimeout(() => {
    wordDisplay.innerText = levelStates[currentLevel].currentWord;
    wordDisplay.classList.remove("fade");
    console.log("Display updated to:", levelStates[currentLevel].currentWord);
  }, 150);
}

export function updateProgress() {
  const state = levelStates[currentLevel];
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const totalWords = state.isReviewMode ? state.missedWords.length : (currentLevel < 15 ? 10 : 50);
  progressBar.style.width = `${(state.wordsCompleted / totalWords) * 100}%`;
  progressText.innerHTML = `Words Completed: ${state.wordsCompleted}/${totalWords} <div class="bee"></div>`;
}

export function showFeedback(message, isCorrect) {
  const feedback = document.getElementById("feedback");
  const mascot = document.getElementById("mascot");
  if (!feedback) {
    console.error("Feedback element not found!");
    return;
  }
  console.log("Showing feedback:", message, isCorrect);
  feedback.innerText = message;
  feedback.className = isCorrect ? "correct" : "wrong";
  feedback.style.display = "block";
  mascot.className = isCorrect ? "happy" : "sad";
  setTimeout(() => {
    feedback.style.display = "none";
    if (!isCorrect) {
      mascot.className = "";
    }
  }, 3000);
}

export function hideFeedback() {
  const feedback = document.getElementById("feedback");
  const mascot = document.getElementById("mascot");
  if (feedback) {
    feedback.style.display = "none";
  }
  if (mascot) {
    mascot.className = "";
  }
}

export function showAnswerPopup(answer) {
  const answerPopup = document.getElementById("answerPopup");
  const answerText = document.getElementById("answerText");
  if (!answerPopup || !answerText) {
    console.error("Answer popup elements not found!");
    return;
  }
  answerText.innerText = `The correct answer is: ${answer}`;
  answerPopup.style.display = "block";
  setTimeout(() => {
    answerPopup.style.display = "none";
  }, 3000);
}

export function hideAnswerPopup() {
  const answerPopup = document.getElementById("answerPopup");
  if (answerPopup) {
    answerPopup.style.display = "none";
  }
}

export function showCelebration(nextWordCallback) {
  const celebration = document.getElementById("celebration");
  document.getElementById("mainContent").style.display = "none";
  celebration.style.display = "block";
  const type = Math.floor(Math.random() * 4);
  const count = type === 2 ? 20 : type === 3 ? 30 : 10;
  const effects = [];
  
  if (Math.random() > 0.5) effects.push(0);
  if (Math.random() > 0.5) effects.push(1);
  if (Math.random() > 0.5) effects.push(2);
  if (Math.random() > 0.5) effects.push(3);
  if (effects.length === 0) effects.push(type);

  effects.forEach(effectType => {
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `${Math.random() * 100}%`;
      el.style.animationDelay = `${Math.random() * 0.5}s`;
      const color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      if (effectType === 0) el.className = "star";
      else if (effectType === 1) el.className = "balloon";
      else if (effectType === 2) el.className = "firework";
      else el.className = "confetti";
      el.style.background = color;
      celebration.appendChild(el);
    }
  });

  setTimeout(() => hideCelebration(nextWordCallback), 2000);
}

function hideCelebration(nextWordCallback) {
  const celebration = document.getElementById("celebration");
  while (celebration.firstChild && celebration.firstChild !== celebration.querySelector(".celebration-text")) {
    celebration.removeChild(celebration.firstChild);
  }
  celebration.style.display = "none";
  document.getElementById("mainContent").style.display = "block";
  if (typeof nextWordCallback === 'function') {
    nextWordCallback();
  }
}

export function showLevelComplete() {
  const levelComplete = document.getElementById("level-complete");
  const levelCompleteText = levelComplete.querySelector(".level-complete-text");
  document.getElementById("mainContent").style.display = "none";
  levelComplete.style.display = "block";
  playSound('levelComplete');
  
  const baseOptions = [
    "Level 1-a", "Level 1-b", "Level 1-c", "Level 1-d", "Level 1-e",
    "Level 2-a", "Level 2-b", "Level 2-c", "Level 2-d", "Level 2-e",
    "Level 3-a", "Level 3-b", "Level 3-c", "Level 3-d", "Level 3-e",
    "Level 4", "Level 5", "Level 6", "Level 7"
  ];
  const completions = levelCompletions[currentLevel] || 0;
  const stars = completions % 5;
  const trophies = Math.floor(completions / 5);
  const nextLevel = currentLevel < 18 ? currentLevel + 1 : 0;
  let message = `Level Complete! You now have `;
  if (trophies > 0) message += `${trophies} 🏆 `;
  if (stars > 0) message += `${stars} ⭐`;
  if (completions === 1) message = "Level Complete! You earned your first ⭐!";
  message += `<br>Next up: ${baseOptions[nextLevel]}`;
  levelCompleteText.innerHTML = `<span>🎉 Level Complete! 🎉</span><span>${message}</span>`;
  
  for (let i = 0; i < 50; i++) {
    const el = document.createElement("div");
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = `${Math.random() * 100}%`;
    el.style.animationDelay = `${Math.random() * 1.5}s`;
    const type = Math.floor(Math.random() * 4);
    const color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    if (type === 0) el.className = "star";
    else if (type === 1) el.className = "balloon";
    else if (type === 2) el.className = "firework";
    else el.className = "confetti";
    el.style.background = color;
    levelComplete.appendChild(el);
  }
  setTimeout(hideLevelComplete, 4000);
}

function hideLevelComplete() {
  const levelComplete = document.getElementById("level-complete");
  while (levelComplete.firstChild && levelComplete.firstChild !== levelComplete.querySelector(".level-complete-text")) {
    levelComplete.removeChild(levelComplete.firstChild);
  }
  levelComplete.style.display = "none";
  levelStates[currentLevel] = {
    failCount: 0,
    wordsCompleted: 0,
    wordIndices: [],
    indexPointer: 0,
    isReviewMode: false,
    missedWords: [],
    currentIndex: 0,
    currentWord: ""
  };
  const nextLevel = currentLevel < 18 ? currentLevel + 1 : 0;
  changeLevel(nextLevel);
  document.getElementById("levelSelect").value = currentLevel;
  initializeLevelState(currentLevel);
  showWord();
  saveGameState();
}

export function enableButtons() {
  const state = levelStates[currentLevel];
  document.getElementById("pronounce").disabled = false;
  document.getElementById("checkAnswer").disabled = false;
  document.getElementById("levelSelect").disabled = false;
  const showAnswerBtn = document.getElementById("showAnswer");
  if (showAnswerBtn) {
    console.log("Enabling buttons, failCount =", state.failCount);
    showAnswerBtn.style.display = state.failCount >= 3 ? "block" : "none";
  }
}

export function disableButtons() {
  document.getElementById("pronounce").disabled = true;
  document.getElementById("showAnswer").disabled = true;
  document.getElementById("levelSelect").disabled = true;
}

function playSound(type) {
  const audio = new Audio();
  if (type === 'correct') audio.src = 'https://www.soundjay.com/buttons/sounds/button-3.mp3';
  else if (type === 'wrong') audio.src = 'https://www.soundjay.com/buttons/sounds/beep-03.mp3';
  else if (type === 'levelComplete') audio.src = 'https://www.soundjay.com/human/sounds/cheering-01.mp3';
  audio.volume = 0.7;
  audio.play().catch(() => console.log(`Sound ${type} failed to play.`));
}
