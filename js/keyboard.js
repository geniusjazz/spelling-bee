export function setupKeyboard() {
  console.log("Setting up keyboard...");
  const keyboard = document.getElementById("keyboard");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  letters.forEach(letter => {
    const btn = document.createElement("button");
    btn.className = "key";
    btn.innerText = letter;
    btn.onclick = () => appendLetter(letter.toLowerCase());
    keyboard.appendChild(btn);
  });
  const backspace = document.createElement("button");
  backspace.id = "backspace";
  backspace.className = "key";
  backspace.innerText = "Back";
  backspace.onclick = removeLetter;
  keyboard.appendChild(backspace);
  const clear = document.createElement("button");
  clear.id = "clear";
  clear.className = "key";
  clear.innerText = "Clear";
  clear.onclick = clearWord;
  keyboard.appendChild(clear);
  console.log("Keyboard setup complete.");
}

function appendLetter(letter) {
  const state = levelStates[currentLevel]; // From storage.js
  state.currentWord += letter;
  updateDisplay(); // From ui.js
  saveGameState(); // From storage.js
}

function removeLetter() {
  const state = levelStates[currentLevel];
  state.currentWord = state.currentWord.slice(0, -1);
  updateDisplay();
  saveGameState();
}

function clearWord() {
  const state = levelStates[currentLevel];
  state.currentWord = "";
  updateDisplay();
  saveGameState();
}
