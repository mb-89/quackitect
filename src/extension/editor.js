// The one module reaching the editor. Every call into vscode stands here, so
// every other file in this folder answers a test with no editor running and
// the extension holds no door of its own.
// [[spec/design_output/extension#the-editor-is-a-door]]

const vscode = require("vscode");

const NAME = "quackitect";

function editorDoor(context) {
  const folder = vscode.workspace.workspaceFolders?.[0];
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let page = null;

  const uriOf = (path) => vscode.Uri.joinPath(folder.uri, ...String(path).split("/"));

  return {
    holds: () => Boolean(folder),
    takes: (one) => {
      page = one;
    },
    pid: () => process.ppid,
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
        process.platform === "win32" ? line.replace(/^\.\/RUNME\.sh/, ".\\RUNME.cmd") : line;
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
