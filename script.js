const output = document.getElementById("output");
const input = document.getElementById("commandInput");
const promptElement = document.getElementById("prompt");
const terminal = document.getElementById("terminal");
const inputLine = document.querySelector(".input-line");
const ambientSound = document.getElementById("ambientSound");

let currentPath = ["C:"];

// "command" = normale Kommandozeile
// "browser" = Navigation mit Pfeiltasten
// "viewer"  = Bild-/Dateiansicht
let mode = "command";

let selectedIndex = 0;
let causalFinished = false;

const USE_IP_LOCATION = true;

// ----------------------------------------------------
// VIRTUELLES DATEISYSTEM
// ----------------------------------------------------

const fileSystem = {
  "C:": {
    type: "directory",
    contents: {

      "ARCHIVE": {
        type: "directory",
        contents: {

          "1974": {
            type: "directory",
            contents: {

              "VORONOV_1974.JPG": {
                type: "image",
                src: "media/voronov_1974.jpg"
              },

              "NOTES.TXT": {
                type: "file",
                content:
`ARCHIVE NOTE

Source: Soviet theoretical physics journal
Date: September 1974

Status: scanned
Classification: unrestricted`
              }
            }
          },

          "1985": {
            type: "directory",
            contents: {}
          }
        }
      },

      "EVENTS": {
        type: "directory",
        contents: {}
      },

      "PERSONNEL": {
        type: "directory",
        contents: {}
      },

      "THEORY": {
        type: "directory",
        contents: {}
      },

"SYSTEM": {
  type: "directory",
  contents: {}
},

"SOFTWARE": {
  type: "directory",
  contents: {
    "CAUSAL.EXE": {
      type: "program",
      program: "causal"
    }
  }
},

"README.TXT": {
  type: "file",
  content:

        
`SUPERVISOR INFORMATION SYSTEM

Navigation is command-based.

Use DIR to display files and directories.
Use CD followed by a directory name to enter it.

Inside a directory:
Use UP and DOWN to select an item.
Press ENTER to open it.
Press ESC to return to command mode.

Unauthorized access is logged.`
      },

      "NOTICE.85": {
        type: "file",
        content:
`SYSTEM NOTICE 85-04

Routine archival restructuring completed.

Certain records remain unavailable pending supervisor clearance.

Do not attempt unauthorized access.`
      }
    }
  }
};


// ----------------------------------------------------
// GRUNDFUNKTIONEN
// ----------------------------------------------------

function print(text = "") {
  output.textContent += text + "\n";
  scrollToBottom();
}

function scrollToBottom() {
  terminal.scrollTop = terminal.scrollHeight;
}

function getCurrentDirectory() {
  let node = fileSystem["C:"];

  for (let i = 1; i < currentPath.length; i++) {
    node = node.contents[currentPath[i]];
  }

  return node;
}

function getPrompt() {
  if (currentPath.length === 1) {
    return "C:\\>";
  }

  return currentPath.join("\\") + ">";
}

function updatePrompt() {
  promptElement.textContent = getPrompt();
}


// ----------------------------------------------------
// STARTBILDSCHIRM
// ----------------------------------------------------

function showBootScreen() {
  print("SUPERVISOR NETWORK TERMINAL");
  print("REV. 3.7 / 1989");
  print("");
  print("SYSTEM READY.");
  print("");
  print("TYPE HELP FOR AVAILABLE COMMANDS.");
  print("");
}


// ----------------------------------------------------
// HELP
// ----------------------------------------------------

function commandHelp() {
  print("");
  print("AVAILABLE COMMANDS");
  print("");
  print("DIR              Browse current directory");
  print("CD <directory>   Open directory");
  print("CD ..            Return to parent directory");
  print("TYPE <file>      Read text file");
  print("OPEN <file>      Open media file");
  print("CLS              Clear screen");
  print("HELP             Display this help");
  print("");
}


// ----------------------------------------------------
// BROWSERMODUS
// ----------------------------------------------------

function getBrowserItems() {
  const directory = getCurrentDirectory();
  const items = Object.keys(directory.contents);

  // Außer im Hauptverzeichnis gibt es ".."
  if (currentPath.length > 1) {
    items.unshift("..");
  }

  return items;
}

function enterBrowserMode() {
  mode = "browser";
  selectedIndex = 0;

  inputLine.style.display = "none";

  renderBrowser();
}

function renderBrowser() {
  const items = getBrowserItems();

  output.textContent = "";

  print(`DIRECTORY OF ${getPrompt().replace(">", "")}`);
  print("");

  if (items.length === 0) {
    print("[EMPTY DIRECTORY]");
  }

  items.forEach((name, index) => {

    const selector =
      index === selectedIndex
        ? ">"
        : " ";

    if (name === "..") {
      print(`${selector} [GO BACK]`);
      return;
    }

    const directory = getCurrentDirectory();
    const item = directory.contents[name];

    if (item.type === "directory") {
      print(
        `${selector} ${name.padEnd(24)} <DIR>`
      );
    } else {
      print(
        `${selector} ${name}`
      );
    }
  });

  print("");
  print("[UP/DOWN] SELECT   [ENTER] OPEN   [ESC] COMMAND");
}

function moveSelection(direction) {
  const items = getBrowserItems();

  if (items.length === 0) {
    return;
  }

  selectedIndex += direction;

  if (selectedIndex < 0) {
    selectedIndex = items.length - 1;
  }

  if (selectedIndex >= items.length) {
    selectedIndex = 0;
  }

  renderBrowser();
}


// ----------------------------------------------------
// AUSGEWÄHLTEN EINTRAG ÖFFNEN
// ----------------------------------------------------

// ----------------------------------------------------
// CAUSAL.EXE
// ----------------------------------------------------

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function appendCausalLine(text = "", className = "") {
  const line = document.createElement("div");

  line.className = `causal-line ${className}`.trim();
  line.textContent = text;

  output.appendChild(line);

  scrollToBottom();

  return line;
}


async function causalLine(text, delay = 700) {
  appendCausalLine(text);
  await sleep(delay);
}


function randomCharacter() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "0123456789" +
    "#%@!?/<>[]{}" +
    "ΔΣΩΛλμνΓ" +
    "▓▒░";

  return characters[
    Math.floor(Math.random() * characters.length)
  ];
}


function randomNoiseString(length = 46) {
  let result = "";

  for (let i = 0; i < length; i++) {
    result += randomCharacter();
  }

  return result;
}


// Kurzer Block aus flimmerndem Datenrauschen
async function noiseBurst(duration = 1200, rows = 5) {

  const lines = [];

  for (let i = 0; i < rows; i++) {
    const line = appendCausalLine(
      randomNoiseString(),
      "causal-noise"
    );

    lines.push(line);
  }

  const start = performance.now();

  while (performance.now() - start < duration) {

    lines.forEach(line => {
      line.textContent = randomNoiseString();
    });

    scrollToBottom();

    await sleep(55);
  }

  lines.forEach(line => {
    line.classList.add("fade-out");
  });

  await sleep(300);

  lines.forEach(line => {
    line.remove();
  });
}


// Zufällige Zeichen stabilisieren sich zur Zielzeile
async function scrambleLine(target, duration = 900) {

  const line = appendCausalLine("", "scramble-line");

  const start = performance.now();

  while (true) {

    const elapsed = performance.now() - start;

    const progress = Math.min(
      elapsed / duration,
      1
    );

    const lockedCharacters =
      Math.floor(progress * target.length);

    let display = "";

    for (let i = 0; i < target.length; i++) {

      const realCharacter = target[i];

      if (realCharacter === " ") {
        display += " ";
      }

      else if (i < lockedCharacters) {
        display += realCharacter;
      }

      else {
        display += randomCharacter();
      }
    }

    line.textContent = display;

    scrollToBottom();

    if (progress >= 1) {
      line.textContent = target;
      break;
    }

    await sleep(45);
  }

  await sleep(250);
}


// Formel in eigenem grünen Modul
async function showFormula(label, latex, hold = 1700) {

  const box = document.createElement("div");
  box.className = "formula-box";

  const formulaLabel = document.createElement("div");
  formulaLabel.className = "formula-label";
  formulaLabel.textContent = label;

  const formula = document.createElement("div");
  formula.className = "formula-content";

  formula.innerHTML = `\\[${latex}\\]`;

  box.appendChild(formulaLabel);
  box.appendChild(formula);

  output.appendChild(box);

  scrollToBottom();

  if (
    window.MathJax &&
    MathJax.typesetPromise
  ) {
    await MathJax.typesetPromise([box]);
  }

  await sleep(hold);
}


// Standort + Browserzeit
async function getObserverContext() {

  const browserTimeZone =
    Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone || "LOCAL";

  const result = {
    city: "UNRESOLVED",
    region: "",
    country: "UNRESOLVED",
    timezone: browserTimeZone
  };

  if (USE_IP_LOCATION) {

    try {

      const response =
        await fetch(
          "https://ipapi.co/json/"
        );

      if (response.ok) {

        const data =
          await response.json();

        if (data.city) {
          result.city = data.city;
        }

        if (data.region) {
          result.region = data.region;
        }

        if (data.country_name) {
          result.country =
            data.country_name;
        }
      }

    }

    catch (error) {

      console.log(
        "Regional node unresolved:",
        error
      );
    }
  }

  return result;
}


function getCurrentLocalTime() {

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }
  ).format(new Date());
}


// Hauptsequenz
async function runCausalEntropy() {

  mode = "program";
  causalFinished = false;

  inputLine.style.display = "none";
  output.textContent = "";

  // Standort schon parallel abfragen
  const observerPromise =
    getObserverContext();


  await scrambleLine(
    "CAUSAL.EXE / VORONOV CAUSAL ANALYSIS MODULE",
    1100
  );

  await causalLine(
    "SUPERVISOR ANALYTICAL SYSTEM",
    600
  );

  await causalLine(
    "BUILD 4.17 / TEMPORAL ANALYSIS BRANCH",
    600
  );

  await causalLine("", 300);

  await causalLine(
    "INITIALIZING...",
    700
  );


  // ------------------------------------------------
  // SYMBOLMODUL
  // ------------------------------------------------

  await noiseBurst(1200, 5);

  await scrambleLine(
    "LOADING EXTENDED SYMBOL MODULE..............OK",
    1000
  );

  await causalLine(
    "MATHEMATICAL DISPLAY LAYER..................ACTIVE",
    600
  );


  // ------------------------------------------------
  // RAUMZEIT
  // ------------------------------------------------

  await causalLine(
    "INITIALIZING LOCAL SPACETIME METRIC...",
    650
  );

  await showFormula(
    "MINKOWSKI INTERVAL",
    String.raw`
      ds^2 =
      c^2dt^2 -
      dx^2 -
      dy^2 -
      dz^2
    `,
    1700
  );

  await showFormula(
    "EINSTEIN FIELD EQUATION",
    String.raw`
      R_{\mu\nu}
      -
      \frac{1}{2}R g_{\mu\nu}
      +
      \Lambda g_{\mu\nu}
      =
      \frac{8\pi G}{c^4}
      T_{\mu\nu}
    `,
    1900
  );

  await causalLine(
    "SPACETIME GEOMETRY.........................RESOLVED",
    650
  );

  await causalLine(
    "LOCAL LIGHT CONE...........................RESOLVED",
    650
  );


  // ------------------------------------------------
  // TRAJEKTORIEN
  // ------------------------------------------------

  await noiseBurst(900, 4);

  await scrambleLine(
    "CALCULATING ACCESSIBLE WORLDLINES...",
    900
  );

  await showFormula(
    "GEODESIC PROPAGATION",
    String.raw`
      \frac{d^2x^\mu}{d\tau^2}
      +
      \Gamma^\mu_{\alpha\beta}
      \frac{dx^\alpha}{d\tau}
      \frac{dx^\beta}{d\tau}
      =
      0
    `,
    1600
  );


  for (let i = 1; i <= 8; i++) {

    const pass =
      String(i).padStart(2, "0");

    await causalLine(
      `WORLDLINE PASS ${pass} / 08`,
      430
    );
  }


  await causalLine(
    "CAUSAL ENSEMBLE............................ACQUIRED",
    600
  );


  // ------------------------------------------------
  // VORONOV-FORMALISMUS
  // ------------------------------------------------

  await noiseBurst(900, 5);

  await scrambleLine(
    "INITIALIZING VORONOV FORMALISM...",
    1000
  );

  await showFormula(
    "FINITE-TIME CAUSAL DIVERGENCE",
    String.raw`
      \lambda_i^{(T)}(x)
      =
      \frac{1}{T}
      \ln
      \left(
      \frac{
        \|\delta X_i(T)\|
      }{
        \|\delta X_i(0)\|
      }
      \right)
    `,
    1800
  );

  await showFormula(
    "VORONOV ENTROPY",
    String.raw`
      S_V(x,T)
      =
      k_V
      \sum_i
      \max
      \left(
        0,
        \lambda_i^{(T)}(x)
      \right)
    `,
    2000
  );

  await showFormula(
    "CAUSAL VORTICITY",
    String.raw`
      \boldsymbol{\omega}_C
      =
      \nabla
      \times
      \mathbf{u}_C
    `,
    1500
  );

  await showFormula(
    "VORONOV–NAVIER–STOKES PROPAGATION",
    String.raw`
      \frac{
        \partial \mathbf{u}_C
      }{
        \partial t
      }
      +
      (\mathbf{u}_C
      \cdot
      \nabla)
      \mathbf{u}_C
      =
      -
      \nabla \Pi_C
      +
      \nu_C
      \nabla^2
      \mathbf{u}_C
      +
      \mathbf{F}_C
    `,
    2100
  );


  // ------------------------------------------------
  // BERECHNUNG
  // ------------------------------------------------

  await causalLine(
    "INTEGRATING FUTURE EVENT CONE...............OK",
    650
  );

  await causalLine(
    "NORMALIZING PATH WEIGHTS....................OK",
    650
  );

  await causalLine(
    "CALCULATING RECONVERGENCE FIELD.............OK",
    650
  );

  await causalLine(
    "CALCULATING CAUSAL VORTICITY................OK",
    650
  );

  await causalLine(
    "SEARCHING FOR LOCAL SHEAR ZONES.............NONE",
    650
  );


  // ------------------------------------------------
  // BEOBACHTER
  // ------------------------------------------------

  await noiseBurst(700, 3);

  await scrambleLine(
    "IDENTIFYING LOCAL OBSERVER...",
    900
  );

  const observer =
    await observerPromise;

  await causalLine(
    "OBSERVER CLASSIFICATION: EXTERNAL",
    600
  );

  await causalLine(
    `REGIONAL NODE: ${observer.city.toUpperCase()}, ${observer.country.toUpperCase()}`,
    650
  );

  if (observer.region) {

    await causalLine(
      `REGIONAL SUBNODE: ${observer.region.toUpperCase()}`,
      550
    );
  }

  await causalLine(
    `LOCAL TIME: ${getCurrentLocalTime()}`,
    650
  );

  await causalLine(
    `TIME ZONE: ${observer.timezone.toUpperCase()}`,
    650
  );


  // ------------------------------------------------
  // INTERVENTIONSINDEX
  // ------------------------------------------------

  await showFormula(
    "LOCAL INTERVENTION INDEX",
    String.raw`
      \mathcal{I}(x)
      =
      \sqrt{
        \left|
        g^{\mu\nu}
        \nabla_\mu S_V
        \nabla_\nu S_V
        \right|
      }
    `,
    1800
  );


  await causalLine(
    "LOCAL CAUSAL DENSITY..............0.018431",
    550
  );

  await causalLine(
    "PATH DIVERGENCE...................0.002119",
    550
  );

  await causalLine(
    "CAUSAL VORTICITY..................0.000071",
    550
  );

  await causalLine(
    "RECONVERGENCE INDEX...............0.984017",
    550
  );

  await causalLine(
    "INTERVENTION INDEX................0.013842",
    650
  );


  await causalLine("", 400);

  await scrambleLine(
    "[████████████████████████████] 100%",
    900
  );

  await sleep(1200);


  // ------------------------------------------------
  // RESULTAT
  // ------------------------------------------------

  const result =
    document.createElement("div");

  result.className =
    "causal-result";

  result.innerHTML = `
    <div class="causal-result-title">
      CAUSAL ENTROPY STATUS
    </div>

    <div class="causal-low">
      LOW
    </div>

    <div>
      EVENT CONE: STABLE<br>
      RECONVERGENCE: HIGH<br>
      SUPERVISION STATUS: PASSIVE
    </div>

    <br>

    <div>
      NO INTERVENTION REQUIRED.
    </div>
  `;

  output.appendChild(result);

  scrollToBottom();

  await sleep(600);

  appendCausalLine(
    "ESC - RETURN TO DIRECTORY",
    "causal-return"
  );

  causalFinished = true;
}

function openSelectedItem() {
  const items = getBrowserItems();

  if (items.length === 0) {
    return;
  }

  const selectedName = items[selectedIndex];

  // Eine Ebene zurück
  if (selectedName === "..") {
    currentPath.pop();
    selectedIndex = 0;
    renderBrowser();
    return;
  }

  const directory = getCurrentDirectory();
  const target = directory.contents[selectedName];

  // Ordner
  if (target.type === "directory") {
    currentPath.push(selectedName);
    selectedIndex = 0;
    renderBrowser();
    return;
  }

if (
  target.type === "program" &&
  target.program === "causal"
) {
  runCausalEntropy();
  return;
}
  
  // Bild
  if (target.type === "image") {
    openImageViewer(selectedName, target);
    return;
  }

  // Textdatei
  if (target.type === "file") {
    openTextViewer(selectedName, target);
  }
}


// ----------------------------------------------------
// BILDANZEIGE
// ----------------------------------------------------

function openImageViewer(fileName, target) {
  mode = "viewer";

  output.textContent = "";

  const viewer = document.createElement("div");
  viewer.className = "media-viewer";

  const title = document.createElement("div");
  title.className = "viewer-title";
  title.textContent =
    `ARCHIVE IMAGE VIEWER 2.1\n${fileName}`;

  const image = document.createElement("img");
  image.src = target.src;
  image.className = "archive-image";

  const footer = document.createElement("div");
  footer.className = "viewer-footer";
  footer.textContent = "ESC - RETURN";

  viewer.appendChild(title);
  viewer.appendChild(image);
  viewer.appendChild(footer);

  output.appendChild(viewer);
}


// ----------------------------------------------------
// TEXTANZEIGE
// ----------------------------------------------------

function openTextViewer(fileName, target) {
  mode = "viewer";

  output.textContent = "";

  print(`FILE VIEWER`);
  print(fileName);
  print("");
  print("----------------------------------------");
  print("");
  print(target.content);
  print("");
  print("----------------------------------------");
  print("");
  print("ESC - RETURN");
}


// ----------------------------------------------------
// ZURÜCK ZUR KOMMANDOZEILE
// ----------------------------------------------------

function returnToCommandMode() {
  mode = "command";

  output.textContent = "";

  inputLine.style.display = "flex";

  updatePrompt();

  input.value = "";
  input.focus();
}


// ----------------------------------------------------
// KOMMANDOS
// ----------------------------------------------------

function commandDir() {
  enterBrowserMode();
}

function commandCd(argument) {

  if (!argument) {
    print("The syntax of the command is incorrect.");
    return;
  }

  if (argument === "..") {

    if (currentPath.length > 1) {
      currentPath.pop();
    }

    updatePrompt();
    enterBrowserMode();
    return;
  }

  const directory = getCurrentDirectory();
  const targetName = argument.toUpperCase();
  const target = directory.contents[targetName];

  if (!target || target.type !== "directory") {
    print("Directory not found.");
    return;
  }

  currentPath.push(targetName);

  updatePrompt();

  enterBrowserMode();
}

function commandType(argument) {

  if (!argument) {
    print("The syntax of the command is incorrect.");
    return;
  }

  const directory = getCurrentDirectory();
  const fileName = argument.toUpperCase();
  const target = directory.contents[fileName];

  if (!target || target.type !== "file") {
    print("File not found.");
    return;
  }

  openTextViewer(fileName, target);
}

function commandOpen(argument) {

  if (!argument) {
    print("The syntax of the command is incorrect.");
    return;
  }

  const directory = getCurrentDirectory();
  const fileName = argument.toUpperCase();
  const target = directory.contents[fileName];

  if (!target) {
    print("File not found.");
    return;
  }

  if (target.type === "image") {
    openImageViewer(fileName, target);
    return;
  }

  if (target.type === "file") {
    openTextViewer(fileName, target);
    return;
  }

  print("Unable to open this file type.");
}


// ----------------------------------------------------
// BEFEHLSVERARBEITUNG
// ----------------------------------------------------

function executeCommand(rawCommand) {

  const trimmed = rawCommand.trim();

  if (!trimmed) {
    return;
  }

  const parts = trimmed.split(/\s+/);

  const command =
    parts[0].toUpperCase();

  const argument =
    parts.slice(1).join(" ");

  switch (command) {

    case "HELP":
      commandHelp();
      break;

    case "DIR":
      commandDir();
      break;

    case "CD":
      commandCd(argument);
      break;

    case "TYPE":
      commandType(argument);
      break;

    case "OPEN":
      commandOpen(argument);
      break;

    case "CLS":
      output.textContent = "";
      break;

    default:
      print(
        `'${trimmed}' is not recognized as a command.`
      );
  }
}


// ----------------------------------------------------
// TASTATURSTEUERUNG
// ----------------------------------------------------

document.addEventListener("keydown", event => {
if (mode === "program") {

  if (
    event.key === "Escape" &&
    causalFinished
  ) {

    event.preventDefault();

    mode = "browser";

    renderBrowser();

    return;
  }

  // Während der Berechnung keine anderen
  // Tastatureingaben verarbeiten.
  return;
}
  // BROWSERMODUS
  if (mode === "browser") {

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(-1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      openSelectedItem();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      returnToCommandMode();
      return;
    }
  }


  // VIEWER
  if (mode === "viewer") {

    if (event.key === "Escape") {
      event.preventDefault();

      mode = "browser";

      renderBrowser();

      return;
    }
  }
});


// ----------------------------------------------------
// NORMALE TERMINALEINGABE
// ----------------------------------------------------

input.addEventListener("keydown", event => {

  if (mode !== "command") {
    return;
  }

  if (event.key === "Enter") {

    const command = input.value;

    print(`${getPrompt()}${command}`);

    executeCommand(command);

    input.value = "";

    updatePrompt();

    scrollToBottom();
  }
});


// ----------------------------------------------------
// TERMINAL-FOKUS
// ----------------------------------------------------

terminal.addEventListener("click", () => {

  if (mode === "command") {
    input.focus();
  }
});


// ----------------------------------------------------
// AUDIO
// ----------------------------------------------------

let ambientStarted = false;

function startAmbientSound() {

  if (ambientStarted) {
    return;
  }

  ambientSound.volume = 0.06;

  ambientSound.play()
    .then(() => {
      ambientStarted = true;
    })
    .catch(error => {
      console.log(
        "Audio could not start:",
        error
      );
    });
}

document.addEventListener(
  "keydown",
  startAmbientSound
);

document.addEventListener(
  "click",
  startAmbientSound
);


// ----------------------------------------------------
// START
// ----------------------------------------------------

showBootScreen();
updatePrompt();
input.focus();