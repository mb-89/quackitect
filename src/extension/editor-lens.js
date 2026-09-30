// The buttons over a ticket: the lens provider, the box asking why a step
// fails, and the pick and the toast around the pull. editor.js holds every
// other call into the editor.
// [[spec/design_output/extension#a-ticket-carries-its-buttons]]

const vscode = require("vscode");

const TICKETS = "{spec/tickets,.se/tickets}/*.md";

// [[spec/design_output/extension#a-ticket-carries-its-buttons]]
function lensDoor(context, folder) {
  const changed = new vscode.EventEmitter();
  context.subscriptions.push(changed);
  const pathOf = (uri) =>
    vscode.workspace.asRelativePath(uri, false).replace(/\\/g, "/");

  return {
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
      for (const path of lens.watches) {
        const one = vscode.workspace.createFileSystemWatcher(
          new vscode.RelativePattern(folder, path),
        );
        for (const on of [one.onDidChange, one.onDidCreate, one.onDidDelete])
          on.call(one, () => changed.fire());
        context.subscriptions.push(one);
      }
    },

    // A save under the ticket folders hands its path and text on. [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
    onSave(run) {
      context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((doc) => {
          if (doc.uri.scheme === "file") run(pathOf(doc.uri), doc.getText());
        }),
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
