// The drawing's door into the editor: an inset over a ticket's first line, or
// the side panel where the editor refuses the inset, the fold of the
// frontmatter, the theme, and the events that open and redraw the drawing.
// lib/route-host.js holds every choice, and this holds the calls into vscode.
// [[spec/tickets/the-inset-folds-the-frontmatter]]

const vscode = require("vscode");

// The bundle folder of src/scripts/bundle.js, under the runtime folder .claude/skills/level0/lib/folders.js owns, spelled again here because the extension bundles alone. [[spec/design_input/the-editor-draws-the-ticket#the-owner-rules]]
const DRAWING = ".se/.runtime/drawing";
const SCRIPT = "route.js";
const STYLE = "route.css";
const PANEL = "quackitect.route";

// [[spec/tickets/the-inset-folds-the-frontmatter]]
function insetDoor(context, folder) {
  const pathOf = (uri) =>
    vscode.workspace.asRelativePath(uri, false).replace(/\\/g, "/");
  const editorOf = (path) =>
    vscode.window.visibleTextEditors.find((one) => pathOf(one.document.uri) === path);
  const roots = () => [
    context.extensionUri,
    vscode.Uri.joinPath(folder.uri, ...DRAWING.split("/")),
  ];
  const options = () => ({ enableScripts: true, localResourceRoots: roots() });
  const drawn = (webview) => {
    const at = (name) =>
      webview.asWebviewUri(vscode.Uri.joinPath(folder.uri, ...DRAWING.split("/"), name));
    return pageHtml({
      nonce: globalThis.crypto.randomUUID().split("-").join(""),
      source: webview.cspSource,
      script: String(at(SCRIPT)),
      style: String(at(STYLE)),
    });
  };

  // The fold acts on the active editor, so it reaches a ticket the person looks at. [[spec/tickets/the-inset-folds-the-frontmatter]]
  const onFirstLine = (path, command) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || pathOf(editor.document.uri) !== path) return;
    vscode.commands.executeCommand(command, { selectionLines: [0], levels: 1 });
  };

  return {
    theme() {
      const kind = vscode.window.activeColorTheme?.kind;
      const light = [vscode.ColorThemeKind.Light, vscode.ColorThemeKind.HighContrastLight];
      return light.includes(kind) ? "light" : "dark";
    },

    // A proposed API, so a release can drop it, and the side panel stands in. [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
    page(path, lines) {
      const editor = editorOf(path);
      const make = vscode.window.createWebviewTextEditorInset;
      if (!editor || typeof make !== "function") return null;
      try {
        return pageOf(() => {
          const inset = make(editor, 0, lines, options());
          return {
            webview: inset.webview,
            dispose: () => inset.dispose(),
            onDispose: (run) => inset.onDidDispose(run),
          };
        }, drawn);
      } catch {
        return null;
      }
    },

    panel(path) {
      return pageOf(() => {
        const panel = vscode.window.createWebviewPanel(
          PANEL,
          `route: ${path.split("/").pop()}`,
          { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
          options(),
        );
        return {
          webview: panel.webview,
          dispose: () => panel.dispose(),
          onDispose: (run) => panel.onDidDispose(run),
        };
      }, drawn);
    },

    // The graph counts lines from one, and the editor from nought. [[spec/tickets/the-host-runs-the-verbs]]
    async jumps(path, line) {
      const doc = await vscode.workspace.openTextDocument(
        vscode.Uri.joinPath(folder.uri, ...path.split("/")),
      );
      const at = new vscode.Position(Math.max(0, line - 1), 0);
      await vscode.window.showTextDocument(doc, { selection: new vscode.Range(at, at) });
    },

    folds: (path) => onFirstLine(path, "editor.fold"),
    unfolds: (path) => onFirstLine(path, "editor.unfold"),

    // A ticket the editor shows for the first time opens its drawing, and one it shows already keeps it. [[spec/tickets/the-inset-folds-the-frontmatter]]
    onEditors(run) {
      let seen = new Set();
      const each = () => {
        const now = new Set();
        for (const one of vscode.window.visibleTextEditors) {
          const path = pathOf(one.document.uri);
          now.add(path);
          if (!seen.has(path)) run(path, one.document.getText());
        }
        seen = now;
      };
      each();
      context.subscriptions.push(vscode.window.onDidChangeVisibleTextEditors(each));
    },

    onChange(run) {
      context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((said) =>
          run(pathOf(said.document.uri), said.document.getText()),
        ),
      );
    },

    onTheme(run) {
      context.subscriptions.push(vscode.window.onDidChangeActiveColorTheme(() => run()));
    },
  };
}

// A page the host hides and shows again: a hide closes the webview, and a show opens a new one, which posts ready. A close from outside the host reaches it as gone. [[spec/tickets/the-inset-folds-the-frontmatter#reflect]]
function pageOf(open, drawn) {
  let held = null;
  let hear = () => {};
  let gone = () => {};
  const opens = () => {
    const one = open();
    held = one;
    one.webview.html = drawn(one.webview);
    one.webview.onDidReceiveMessage((message) => hear(message));
    one.onDispose(() => {
      if (held !== one) return;
      held = null;
      gone();
    });
  };
  const closes = () => {
    const one = held;
    held = null;
    one?.dispose();
  };
  opens();
  return {
    post: (message) => held?.webview.postMessage(message),
    onMessage: (run) => {
      hear = run;
    },
    onGone: (run) => {
      gone = run;
    },
    hide: closes,
    show: () => {
      if (!held) opens();
    },
    dispose: closes,
  };
}

// The page the bundle mounts on, with a nonce and a policy naming the webview's own source. [[spec/design_output/drawing#the-page-draws-a-route]]
function pageHtml({ nonce, source, script, style }) {
  return [
    "<!doctype html>",
    '<html><head><meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${source} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${source} data:;">`,
    `<link rel="stylesheet" href="${style}">`,
    "</head><body>",
    '<div id="route"></div>',
    `<script nonce="${nonce}" src="${script}"></script>`,
    "</body></html>",
  ].join("\n");
}

module.exports = { DRAWING, insetDoor, pageHtml };
