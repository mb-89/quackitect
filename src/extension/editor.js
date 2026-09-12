// The one module reaching the editor. Every call into vscode stands here, so
// every other file in this folder answers a test with no editor running and
// the extension holds no door of its own.
// [[spec/design_output/extension#the-editor-is-a-door]]

const vscode = require("vscode");

const NAME = "quackitect";
const FAR_LEFT = Number.MAX_SAFE_INTEGER;
const PUT_BACK = "Put it back";
const QUIET = [
  ["requireConfiguration", true],
  ["suggestInstallingGlobally", false],
];

function editorDoor(context) {
  const folder = vscode.workspace.workspaceFolders?.[0];
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let page = null;
  const bars = new Map();

  const uriOf = (path) => vscode.Uri.joinPath(folder.uri, ...String(path).split("/"));
  let console_ = null;

  return {
    holds: () => Boolean(folder),
    root: () => folder?.uri?.fsPath ?? "",

    // [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
    startsServer(ask) {
      let node;
      try {
        node = require("vscode-languageclient/node");
      } catch {
        return "";
      }
      const client = new node.LanguageClient(ask.id, ask.name, ask.server, ask.client);
      context.subscriptions.push(client);
      client.start();
      return ask.server.command;
    },

    takes: (one) => {
      page = one;
    },
    pid: () => process.ppid,
    now: () => Date.now(),

    // [[spec/design_output/extension#it-starts-silent]]
    marks(name, on) {
      vscode.commands.executeCommand("setContext", name, on);
    },

    registers(name, run) {
      context.subscriptions.push(vscode.commands.registerCommand(name, run));
    },

    // [[spec/design_output/extension#the-status-bar-says-it]]
    shows(states, command) {
      const keys = new Set(states.map((one) => one.key));
      for (const [key, item] of bars) {
        if (!keys.has(key)) item.hide();
      }
      states.forEach((one, at) => {
        let item = bars.get(one.key);
        if (!item) {
          item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, FAR_LEFT - at);
          context.subscriptions.push(item);
          bars.set(one.key, item);
        }
        item.text = one.text;
        item.tooltip = one.tip;
        item.backgroundColor = new vscode.ThemeColor(`statusBarItem.${one.tone}Background`);
        item.command = { command, title: one.tip, arguments: [one.key, one.rest] };
        item.show();
      });
    },

    toasts(one, command) {
      Promise.resolve(vscode.window.showWarningMessage(one.toast, PUT_BACK)).then((picked) => {
        if (picked === PUT_BACK) vscode.commands.executeCommand(command, one.key, one.rest);
      });
    },

    // [[spec/design_output/extension#runme-opens-the-panel]]
    reveals() {
      vscode.commands.executeCommand(`workbench.view.extension.${NAME}`);
    },

    // [[spec/design_output/extension#an-empty-folder-stays-quiet]]
    quiets() {
      const biome = vscode.workspace.getConfiguration("biome");
      for (const [key, value] of QUIET) {
        if (biome.inspect(key)?.globalValue !== undefined) continue;
        Promise.resolve(biome.update(key, value, vscode.ConfigurationTarget.Global)).catch(() => {});
      }
    },
    nonce: () => globalThis.crypto.randomUUID().split("-").join(""),
    source: () => page?.webview?.cspSource ?? "",

    scriptUri: () =>
      String(
        page?.webview?.asWebviewUri(
          vscode.Uri.joinPath(context.extensionUri, "webview", "clicks.js"),
        ) ?? "",
      ),

    async read(path) {
      try {
        return decoder.decode(await vscode.workspace.fs.readFile(uriOf(path)));
      } catch {
        return "";
      }
    },

    async list(path) {
      try {
        return (await vscode.workspace.fs.readDirectory(uriOf(path))).map(([name]) => name);
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

    // [[spec/design_output/extension#the-log-opens-a-terminal]]
    runs(line) {
      if (!line) return;
      // [[spec/design_output/extension#a-terminal-opens-on-windows]]
      const said =
        process.platform === "win32" ? line.replace(/^\.\/RUNME\.sh/, ".\\RUNME.ps1") : line;
      const shell = vscode.window.createTerminal({
        name: NAME,
        cwd: folder.uri.fsPath,
      });
      shell.show();
      shell.sendText(said);
    },

    registerView(id, resolve) {
      context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
          id,
          {
            resolveWebviewView: (view) => {
              view.webview.options = {
                enableScripts: true,
                localResourceRoots: [context.extensionUri],
              };
              return resolve(pageOf(view));
            },
          },
          { webviewOptions: { retainContextWhenHidden: true } },
        ),
      );
    },
  };
}

function pageOf(view) {
  return {
    webview: view.webview,
    set: (html) => {
      view.webview.html = html;
    },
    onMessage: (said) => view.webview.onDidReceiveMessage(said),
  };
}

module.exports = { NAME, editorDoor };
