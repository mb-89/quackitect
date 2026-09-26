// The files the panel reads and writes, the log it prints, and the terminal it
// opens. editor.js holds every other call into the editor.
// [[spec/design_output/extension#a-click-writes-the-file]]

const vscode = require("vscode");
const { appendFile, mkdir } = require("node:fs/promises");
const { dirname } = require("node:path");

const NAME = "quackitect";

// [[spec/design_output/extension#a-click-writes-the-file]]
function fileDoor(context, folder, uriOf) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let console_ = null;

  return {
    async read(path) {
      try {
        return decoder.decode(await vscode.workspace.fs.readFile(uriOf(path)));
      } catch {
        return "";
      }
    },

    async list(path) {
      try {
        return (await vscode.workspace.fs.readDirectory(uriOf(path))).map(
          ([name]) => name,
        );
      } catch {
        return [];
      }
    },

    // [[spec/design_output/extension#the-button-prints-the-log]]
    says(lines) {
      console_ = console_ ?? vscode.window.createOutputChannel(NAME);
      console_.clear();
      for (const one of lines) console_.appendLine(String(one));
      console_.show(true);
    },

    async write(path, text) {
      await vscode.workspace.fs.writeFile(uriOf(path), encoder.encode(String(text)));
    },

    // The editor's file system offers no append, so the door takes node's, and a line lands after every line another writer holds. [[spec/design_output/log#every-writer-appends]]
    async append(path, text) {
      const at = uriOf(path).fsPath;
      await mkdir(dirname(at), { recursive: true });
      await appendFile(at, String(text), "utf8");
    },

    // The markdown editor opens the file, where the lens and the fill on save take it. [[spec/tickets/the-work-group-draws-buttons]]
    async opens(path) {
      await vscode.window.showTextDocument(uriOf(path));
    },

    // [[spec/design_output/extension#the-watcher-draws-it-again]]
    watch(paths, said) {
      for (const path of paths) {
        const one = vscode.workspace.createFileSystemWatcher(
          new vscode.RelativePattern(folder, path),
        );
        one.onDidChange(said);
        one.onDidCreate(said);
        one.onDidDelete(said);
        context.subscriptions.push(one);
      }
    },

    // Node's import takes a URL, and refuses a bare drive path on Windows. [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
    imports(path) {
      return import(uriOf(path).toString());
    },

    // [[spec/design_output/extension#the-log-opens-a-terminal]]
    runs(line) {
      if (!line) return;
      // [[spec/design_output/extension#a-terminal-opens-on-windows]]
      const said =
        process.platform === "win32"
          ? line.replace(/^\.\/RUNME\.sh/, ".\\RUNME.ps1")
          : line;
      const shell = vscode.window.createTerminal({
        name: NAME,
        cwd: folder.uri.fsPath,
      });
      shell.show();
      shell.sendText(said);
    },

    // [[spec/design_output/extension#two-buttons-make-both]]
    async asks(what) {
      const picked = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        openLabel: `this ${what}`,
        title: `Pick the ${what}`,
      });
      return picked?.[0]?.fsPath ?? "";
    },
  };
}

module.exports = { fileDoor };
