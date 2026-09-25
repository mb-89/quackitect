// The marks over the fields a ticket still wants: the underline and the hover.
// lib/fields.js holds every choice, and this holds the calls into vscode.
// [[spec/design_output/extension#a-take-marks-the-fields]]

const vscode = require("vscode");

const LOOK = { textDecoration: "underline wavy var(--vscode-editorInfo-foreground)" };
const MARKDOWN = { scheme: "file", language: "markdown" };

// A decoration and a hover, and no diagnostic, so the Problems panel lists none. [[spec/design_output/extension#a-take-marks-the-fields]]
function fieldDoor(context) {
  const shown = new Map();
  let look = null;
  const pathOf = (uri) =>
    vscode.workspace.asRelativePath(uri, false).replace(/\\/g, "/");

  const markAt = (document, position) =>
    (shown.get(pathOf(document.uri)) ?? []).find(
      (one) => one.line - 1 === position.line,
    );

  const starts = () => {
    look = vscode.window.createTextEditorDecorationType(LOOK);
    context.subscriptions.push(
      look,
      vscode.languages.registerHoverProvider(MARKDOWN, {
        provideHover(document, position) {
          const mark = markAt(document, position);
          if (!mark) return undefined;
          return new vscode.Hover(
            new vscode.MarkdownString(mark.hover),
            document.lineAt(position.line).range,
          );
        },
      }),
    );
  };

  return {
    marksFields(path, marks) {
      if (!look) starts();
      shown.set(path, marks);
      for (const editor of vscode.window.visibleTextEditors) {
        if (pathOf(editor.document.uri) !== path) continue;
        const lines = marks
          .map((one) => one.line - 1)
          .filter((one) => one < editor.document.lineCount);
        editor.setDecorations(
          look,
          lines.map((one) => editor.document.lineAt(one).range),
        );
      }
    },
  };
}

module.exports = { fieldDoor };
