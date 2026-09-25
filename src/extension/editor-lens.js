// The buttons over a ticket: the lens provider, the box asking why a step
// fails, and the child process running the pull. editor.js holds every other
// call into the editor.
// [[spec/design_output/extension#a-ticket-carries-its-buttons]]

const vscode = require("vscode");
const { spawn } = require("node:child_process");
const { realpathSync } = require("node:fs");
const { join } = require("node:path");

const { CLI, personEnv } = require("./lib/lens.js");

const TICKETS = "{spec/tickets,.se/tickets}/*.md";
const NODE = "node";

// [[spec/design_output/extension#a-ticket-carries-its-buttons]]
function lensDoor(context, folder) {
  const changed = new vscode.EventEmitter();
  context.subscriptions.push(changed);
  const root = folder?.uri?.fsPath ?? "";
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
      return (await vscode.window.showQuickPick(options, { placeHolder: prompt })) ?? "";
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

    // A verb a draw runs, so no progress toast rides it. [[spec/tickets/the-work-group-draws-buttons]]
    asksVerb(argv) {
      const home = join(realpathSync.native(context.extensionPath), "..", "..");
      return ranOf(join(home, ...CLI.split("/")), argv, root);
    },

    runsVerb(argv) {
      const home = join(realpathSync.native(context.extensionPath), "..", "..");
      return vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: argv.join(" "),
        },
        () => ranOf(join(home, ...CLI.split("/")), argv, root),
      );
    },
  };
}

// [[spec/design_output/extension#a-ticket-carries-its-buttons]]
function ranOf(cli, argv, root) {
  return new Promise((resolve) => {
    let out = "";
    let err = "";
    const child = spawn(NODE, [cli, ...argv], {
      cwd: root,
      env: personEnv(process.env, root),
      windowsHide: true,
    });
    child.stdout.on("data", (chunk) => {
      out += chunk;
    });
    child.stderr.on("data", (chunk) => {
      err += chunk;
    });
    child.on("error", (error) =>
      resolve({
        code: 1,
        out,
        err: `${err}${NODE} runs nowhere: ${error.message}`,
      }),
    );
    child.on("close", (code) => resolve({ code, out, err }));
  });
}

module.exports = { lensDoor };
