// The parts over a ticket the server holds no word for: the route flip's lens,
// the underline a held field draws, the box asking why a step fails, and the
// pick and the toast around a press. editor.js holds every other call.
// [[spec/design_output/lsp#a-ticket-carries-its-buttons]] [[spec/design_output/lsp#a-take-marks-the-fields]]

const vscode = require("vscode");

const TICKETS = "{spec/tickets,.se/tickets}/*.md";
const LOOK = { textDecoration: "underline wavy var(--vscode-editorInfo-foreground)" };

// [[spec/design_output/lsp#a-ticket-carries-its-buttons]]
function lensDoor(context, folder) {
  const changed = new vscode.EventEmitter();
  context.subscriptions.push(changed);
  const pathOf = (uri) =>
    vscode.workspace.asRelativePath(uri, false).replace(/\\/g, "/");
  const shown = new Map();
  let look = null;

  const underlines = (editor) => {
    const lines = shown.get(String(editor.document.uri));
    if (!lines) return;
    editor.setDecorations(
      look,
      lines
        .filter((one) => one < editor.document.lineCount)
        .map((one) => editor.document.lineAt(one).range),
    );
  };

  const starts = () => {
    look = vscode.window.createTextEditorDecorationType(LOOK);
    context.subscriptions.push(
      look,
      vscode.window.onDidChangeVisibleTextEditors((editors) => {
        for (const editor of editors) underlines(editor);
      }),
    );
  };

  return {
    // The lines count from nought, as the server publishes them, and an empty list clears the underline. [[spec/design_output/lsp#a-take-marks-the-fields]]
    marksFields(uri, lines) {
      if (!look) starts();
      const key = String(uri);
      shown.set(key, lines);
      for (const editor of vscode.window.visibleTextEditors) {
        if (String(editor.document.uri) === key) underlines(editor);
      }
    },

    lensChanged: () => changed.fire(),

    lenses(lens) {
      const top = new vscode.Range(0, 0, 0, 0);
      context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
          {
            scheme: "file",
            pattern: new vscode.RelativePattern(folder, TICKETS),
          },
          {
            onDidChangeCodeLenses: changed.event,
            provideCodeLenses: async (document) =>
              (await lens.lenses(pathOf(document.uri), document.getText())).map(
                (one) => new vscode.CodeLens(top, one),
              ),
          },
        ),
      );
    },

    // A closed pick answers empty. [[spec/tickets/the-host-runs-the-verbs]]
    async picks(prompt, options) {
      return (
        (await vscode.window.showQuickPick(options, { placeHolder: prompt })) ?? ""
      );
    },

    async asksLine(prompt) {
      return (await vscode.window.showInputBox({ prompt, ignoreFocusOut: true })) ?? "";
    },

    // The pull reads the evidence off the disk, so a hand-back saves first. [[spec/design_output/pull#the-checks]]
    async saves(path) {
      const one = vscode.workspace.textDocuments.find(
        (doc) => pathOf(doc.uri) === path,
      );
      if (one?.isDirty) await one.save();
    },

    tells(title, detail, refused) {
      const said = detail ? `${title}. ${detail}` : title;
      if (refused) vscode.window.showWarningMessage(said);
      else vscode.window.showInformationMessage(said);
    },
  };
}

module.exports = { lensDoor };
