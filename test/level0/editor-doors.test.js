// The doors into the editor, run against a stand-in for vscode: the import a
// drawing takes, and the inset that says why it draws nothing.
// [[spec/tickets/the-owner-walks-the-editor]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { editorRequire } from "../../src/doors/fake/vscode.js";

const vscode = {
  Uri: { joinPath: (...parts) => parts },
  window: { visibleTextEditors: [] },
  workspace: {},
};
const require = editorRequire(vscode, import.meta.url);
const { fileDoor } = require("../../src/extension/editor-files.js");
const { insetDoor } = require("../../src/extension/editor-inset.js");

function warned(run) {
  const lines = [];
  const was = console.warn;
  console.warn = (...said) => lines.push(said.join(" "));
  try {
    return { answer: run(), lines };
  } finally {
    console.warn = was;
  }
}

// Node on Windows refuses a bare drive path, so the door hands import the URL. [[spec/tickets/the-owner-walks-the-editor]]
test("a drawing imports through the URL, and a Windows path in fsPath breaks nothing", async () => {
  const uriOf = () => ({
    fsPath: "C:\\tree\\src\\emitter.mjs",
    toString: () => "data:text/javascript,export const said = 'drawn';",
  });
  const door = fileDoor({ subscriptions: [] }, {}, uriOf);
  assert.equal((await door.imports("src/emitter.mjs")).said, "drawn");
});

// A refused inset names why, and the side panel stands in. [[spec/tickets/the-owner-walks-the-editor]]
test("an editor withholding the inset answers no page, and says why", () => {
  const path = "spec/tickets/a-ticket.md";
  vscode.workspace.asRelativePath = (uri) => uri.path;
  vscode.window.visibleTextEditors = [{ document: { uri: { path } } }];
  delete vscode.window.createWebviewTextEditorInset;
  const door = insetDoor({ subscriptions: [] }, { uri: {} });
  const { answer, lines } = warned(() => door.page(path, 4));
  assert.equal(answer, null);
  assert.match(
    lines.join("\n"),
    /no inset over spec\/tickets\/a-ticket\.md, because the editor withholds the proposed API/,
  );

  vscode.window.createWebviewTextEditorInset = () => {
    throw new Error("the inset refuses");
  };
  const thrown = warned(() => door.page(path, 4));
  assert.equal(thrown.answer, null);
  assert.match(thrown.lines.join("\n"), /because the inset refuses/);
});
