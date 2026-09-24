// The trial of spec/tickets/the-editor-takes-an-inset. It opens a ticket, draws
// a page between its lines through the proposed inset API, grows the inset to
// the page, writes what it finds to .se/probe/inset.json, and closes its window.
// [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]

const vscode = require("vscode");
const { ROUTE, linesFor, pageOf } = require("./lib.js");

const TICKET = "spec/tickets/the-editor-holds-the-drawing.md";
const FOUND = ".se/probe/inset.json";
// The first inset stands short, so the grow has something to answer.
const SHORT = 4;
const WAIT = 10000;
const CLOSE_AFTER = 3000;
// The editor's own defaults: its font size, the least height it reads as
// pixels, and the ratio it derives a line from a font size by.
const FONT_SIZE = 14;
const LEAST_PX = 8;
const LINE_RATIO = 1.35;

// The editor opens a folder in one window alone, so the probe's window holds
// none where the owner's window holds the tree. The probe finds the tree from
// its own folder, three levels down.
async function activate(context) {
  const root = vscode.Uri.joinPath(context.extensionUri, "..", "..", "..");
  const found = {
    vscode: vscode.version,
    api: typeof vscode.window.createWebviewTextEditorInset === "function",
  };
  try {
    if (found.api) await probes(root, found);
  } catch (err) {
    found.fault = String(err?.message ?? err);
  }
  await writes(root, found);
  if (!stays()) {
    setTimeout(
      () => vscode.commands.executeCommand("workbench.action.closeWindow"),
      CLOSE_AFTER,
    );
  }
}

async function probes(root, found) {
  const doc = await vscode.workspace.openTextDocument(
    vscode.Uri.joinPath(root, TICKET),
  );
  const editor = await vscode.window.showTextDocument(doc);
  const first = await drawn(editor, SHORT);
  found.drawn = first.drawn;
  found.pagePx = first.height;
  const linePx = lineHeight();
  const lines = linesFor(first.height, linePx);
  const grown = await drawn(editor, lines);
  found.grown = {
    lines,
    linePx,
    drawn: grown.drawn,
    keep: "QUACKITECT_PROBE_STAY=1 keeps it open",
  };
}

// Draws the page in an inset of so many lines, and answers what the page says.
function drawn(editor, lines) {
  const inset = vscode.window.createWebviewTextEditorInset(editor, 0, lines, {
    enableScripts: true,
  });
  return new Promise((resolve) => {
    const late = setTimeout(() => resolve({ drawn: false, height: 0 }), WAIT);
    inset.webview.onDidReceiveMessage((said) => {
      clearTimeout(late);
      if (stays()) resolve({ drawn: !!said?.drawn, height: said?.height ?? 0 });
      else {
        inset.dispose();
        resolve({ drawn: !!said?.drawn, height: said?.height ?? 0 });
      }
    });
    inset.webview.html = pageOf(ROUTE);
  });
}

// The editor's line height in pixels, where the settings name one, or the
// height the editor derives from its font size.
function lineHeight() {
  const said = vscode.workspace.getConfiguration("editor");
  const height = Number(said.get("lineHeight"));
  const size = Number(said.get("fontSize")) || FONT_SIZE;
  if (height >= LEAST_PX) return height;
  if (height > 0) return Math.round(height * size);
  return Math.round(size * LINE_RATIO);
}

// Whether the owner asks the window to stay open for a look.
function stays() {
  return !!process.env.QUACKITECT_PROBE_STAY;
}

async function writes(root, found) {
  const at = vscode.Uri.joinPath(root, FOUND);
  await vscode.workspace.fs.writeFile(
    at,
    Buffer.from(`${JSON.stringify(found, null, 2)}\n`),
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
