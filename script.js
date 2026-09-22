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