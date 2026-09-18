// The editor door: the marks, the commands, the status bar and the webview.
// The server behind the hook button stands in editor-process.js, and the files
// in editor-files.js. Every other file in this folder answers a test with no
// editor running, because the three of these hold every call into vscode.
// [[spec/design_output/extension#the-editor-is-a-door]]

const vscode = require("vscode");

const { processDoor } = require("./editor-process.js");
const { fileDoor } = require("./editor-files.js");

const NAME = "quackitect";
const FAR_LEFT = Number.MAX_SAFE_INTEGER;
const PUT_BACK = "Put it back";
const QUIET = [
  ["requireConfiguration", true],
  ["suggestInstallingGlobally", false],
];

// [[spec/design_output/extension#the-editor-is-a-door]]
function editorDoor(context) {
  const folder = vscode.workspace.workspaceFolders?.[0];
  let page = null;
  const bars = new Map();

  const uriOf = (path) => vscode.Uri.joinPath(folder.uri, ...String(path).split("/"));

  return {
    ...processDoor(context, folder),
    ...fileDoor(context, folder, uriOf),

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
          item = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            FAR_LEFT - at,
          );
          context.subscriptions.push(item);
          bars.set(one.key, item);
        }
        item.text = one.text;
        item.tooltip = one.tip;
        item.backgroundColor = new vscode.ThemeColor(
          `statusBarItem.${one.tone}Background`,
        );
        item.command = { command, title: one.tip, arguments: [one.key, one.rest] };
        item.show();
      });
    },

    toasts(one, command) {
      Promise.resolve(vscode.window.showWarningMessage(one.toast, PUT_BACK)).then(
        (picked) => {
          if (picked === PUT_BACK)
            vscode.commands.executeCommand(command, one.key, one.rest);
        },
      );
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
        Promise.resolve(
          biome.update(key, value, vscode.ConfigurationTarget.Global),
        ).catch(() => {});
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
