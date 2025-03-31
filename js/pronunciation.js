import { levelStates } from './storage.js';
import { currentLevel } from './levelSelector.js';
import { getLevelWords } from './main.js';
import { disableButtons, enableButtons } from './ui.js';
import { saveGameState } from './storage.js';

export let isSpeaking = false;
export let lastPronouncedIndex = -1;
export let fullPronounceEnabled = true;

export function setupPronunciation() {
  console.log("Setting up pronunciation...");
  const pronounceBtn = document.getElementById("pronounce");
  const fullPronounceBtn = document.getElementById("fullPronounce");
  if (!pronounceBtn) console.error("Element with ID 'pronounce' not found!");
  if (!fullPronounceBtn) console.error("Element with ID 'fullPronounce' not found!");
  if (pronounceBtn) pronounceBtn.onclick = pronounceWord;
  if (fullPronounceBtn) fullPronounceBtn.onclick = togglePronounce;
  updatePronounceButton();
}

export function pronounceWord() {
  if (isSpeaking) return;
  isSpeaking = true;
  disableButtons();
  const state = levelStates[currentLevel];
  const w = getLevelWords()[state.currentIndex];
  const word = w.word.toLowerCase();

  const sequence = fullPronounceEnabled && state.currentIndex !== lastPronouncedIndex
    ? [word, 2000, playHowjsayAudio(word), 1000, `Part of speech: ${w.part}`, `Definition: ${w.definition}`, 1000, "Please spell", 1000, word]
    : [word, 2000, playHowjsayAudio(word)];

  pronounceSequence(sequence).then(() => {
    if (fullPronounceEnabled) lastPronouncedIndex = state.currentIndex;
    isSpeaking = false;
    enableButtons();
  }).catch(error => {
    console.error("Pronunciation failed:", error);
    isSpeaking = false;
    enableButtons();
  });
}

async function pronounceSequence(sequence) {
  for (const item of sequence) {
    if (typeof item === 'number') {
      await new Promise(resolve => setTimeout(resolve, item));
    } else if (typeof item === 'function') {
      await item().catch(() => speakText(sequence[0]));
    } else {
      await speakText(item);
    }
  }
}

function speakText(text) {
  return new Promise(resolve => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.7;
    utterance.pitch = 0.7;
    utterance.onend = resolve;
    speechSynthesis.speak(utterance);
  });
}

function playHowjsayAudio(word) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(`https://howjsay.com/mp3/${word}.mp3`);
    audio.volume = 0.7;
    audio.oncanplaythrough = () => audio.play().then(resolve).catch(reject);
    audio.onerror = () => reject(new Error(`Howjsay audio failed for "${word}"`));
    audio.onended = resolve;
    setTimeout(() => reject(new Error("Audio load timeout")), 3000);
  });
}

export function togglePronounce() {
  fullPronounceEnabled = !fullPronounceEnabled;
  updatePronounceButton();
  saveGameState();
}

export function updatePronounceButton() {
  const btn = document.getElementById("fullPronounce");
  if (btn) {
    btn.innerText = `Full Pronunciation: ${fullPronounceEnabled ? 'On' : 'Off'}`;
    btn.className = fullPronounceEnabled ? '' : 'off';
  }
}

export function setFullPronounceEnabled(value) {
  fullPronounceEnabled = value;
  updatePronounceButton();
}
