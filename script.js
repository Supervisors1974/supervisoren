const output = document.getElementById("output");
const input = document.getElementById("commandInput");
const promptElement = document.getElementById("prompt");
const terminal = document.getElementById("terminal");
const ambientSound = document.getElementById("ambientSound");
let currentPath = ["C:"];

// Virtuelles Dateisystem
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
Use CD .. to return to the previous directory.
Use TYPE followed by a filename to read text records.
Use OPEN followed by a filename to open media files.
Use CLS to clear the screen.
Use HELP at any time.

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

function showBootScreen() {
  print("SUPERVISOR NETWORK TERMINAL");
  print("REV. 3.7 / 1989");
  print("");
  print("SYSTEM READY.");
  print("");
  print("TYPE HELP FOR AVAILABLE COMMANDS.");
  print("");
}

function commandHelp() {
  print("AVAILABLE COMMANDS");
  print("");
  print("DIR              Display directory contents");
  print("CD <directory>   Change directory");
  print("CD ..            Return to parent directory");
  print("TYPE <file>      Read text file");
  print("OPEN <file>      Open media file");
  print("CLS              Clear screen");
  print("HELP             Display this help");
}

function commandDir() {
  const directory = getCurrentDirectory();

  print(`DIRECTORY OF ${getPrompt().replace(">", "")}`);
  print("");

  const names = Object.keys(directory.contents);

  names.forEach(name => {
    const item = directory.contents[name];

    if (item.type === "directory") {
      print(`${name.padEnd(20)} <DIR>`);
    } else {
      print(name);
    }
  });

  print("");
  print(`${names.length} ITEM${names.length === 1 ? "" : "S"}`);
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
    commandDir();
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
  commandDir();
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

  print("");
  print(target.content);
  print("");
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
    window.open(target.src, "_blank");
    return;
  }

  print("Unable to open this file type.");
}

function executeCommand(rawCommand) {
  const trimmed = rawCommand.trim();

  if (!trimmed) {
    return;
  }

  const parts = trimmed.split(/\s+/);
  const command = parts[0].toUpperCase();
  const argument = parts.slice(1).join(" ");

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
      print(`'${trimmed}' is not recognized as a command.`);
  }
}

input.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    const command = input.value;

    print(`${getPrompt()}${command}`);

    executeCommand(command);

    input.value = "";

    updatePrompt();
    scrollToBottom();
  }
});

// Klick irgendwo ins Terminal setzt den Fokus wieder ins Eingabefeld
terminal.addEventListener("click", () => {
  input.focus();
});

showBootScreen();
updatePrompt();
input.focus();
let ambientStarted = false;

function startAmbientSound() {
  if (ambientStarted) return;

  ambientSound.volume = 0.2;

  ambientSound.play()
    .then(() => {
      ambientStarted = true;
    })
    .catch(() => {
      // Browser hat Audio noch nicht freigegeben
    });
}

document.addEventListener("keydown", startAmbientSound);
document.addEventListener("click", startAmbientSound);