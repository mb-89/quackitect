// A REFUSED ENTRY KEEPS WHAT THE READER TYPED.
//
// The bar carries two entries: a note and a piece of work. Both can be refused
// — the wall guard on a breakless note, the four-word rule on a work title.
//
// THE FIELD USED TO CLEAR ON THE PRESS, in every client. The reader lost the
// line and got an error about text they could no longer see.
//
// THE NOTE ROUTE COULD NOT REPORT AT ALL. It redirected, so no client had a
// refusal to read, and the browser cleared unconditionally because there was
// nothing to check.
//
// see ux.md#fix-the-whole-wire
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { CallLog } from "../engine/calllog.ts";
import { seDir } from "../engine/paths.ts";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

function read(...parts: string[]): string {
  return readFileSync(join(REPO_ROOT, ...parts), "utf8");
}

/** A single paragraph long enough for the wall guard to refuse it. */
const WALL = `${"the reader typed one long unbroken thought and never pressed return ".repeat(12)}end`;

describe("the note route answers in place rather than redirecting", () => {
  test("a refused note comes back as JSON the client can read", async () => {
    const { startMirror } = await import("../engine/mirror.ts");
    const root = freshRoot();
    const server = startMirror({ session: new Session(root), root, port: 0, log: new CallLog(seDir(root)), mode: "agent" });
    await new Promise((r) => server.on("listening", r));
    const port = (server.address() as { port: number }).port;
    try {
      const r = await fetch(`http://127.0.0.1:${port}/note`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: WALL, priority: "could" }),
        redirect: "manual",
      });

      assert.equal(r.status, 200, "it answers rather than redirecting to the page");
      const d = (await r.json()) as { ok?: boolean; expected?: string };
      assert.notEqual(d.ok, true, "a wall of prose is refused");
      assert.ok(typeof d.expected === "string" && d.expected.length > 0, "and the refusal says what was wanted");
    } finally {
      server.close();
    }
  });

  test("an accepted note answers ok, so the field knows to clear", async () => {
    const { startMirror } = await import("../engine/mirror.ts");
    const root = freshRoot();
    const server = startMirror({ session: new Session(root), root, port: 0, log: new CallLog(seDir(root)), mode: "agent" });
    await new Promise((r) => server.on("listening", r));
    const port = (server.address() as { port: number }).port;
    try {
      const r = await fetch(`http://127.0.0.1:${port}/note`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "a short stray worth discussing", priority: "could" }),
        redirect: "manual",
      });

      assert.equal(r.status, 200);
      const d = (await r.json()) as { ok?: boolean };
      assert.equal(d.ok, true, "accepted, and it says so");
    } finally {
      server.close();
    }
  });
});

describe("no client clears a field before the engine has answered", () => {
  test("the browser client reads the note's answer before clearing", () => {
    const live = read("deliverable", "engine", "renderclient-live.ts");
    const at = live.indexOf('act.dataset.post === "/note"');
    const block = live.slice(at, at + 900);

    assert.ok(at > 0, "the note branch is there at all");
    assert.match(block, /d\.ok === true/, "it checks the answer");
    assert.match(block, /toast\(/, "and reports the refusal in place");
  });

  // THE TWO CAPTURES ARE THE WHOLE POINT. A `field.value = ""` sitting beside
  // the postMessage is the defect itself, so the check is that neither carries
  // one.
  for (const which of ["captureNote", "captureWork"]) {
    test(`${which} posts without clearing the box`, () => {
      const src = read("deliverable", "vscode", "src", "extension.ts");
      const at = src.indexOf(`function ${which}()`);
      const body = src.slice(at, src.indexOf("\n  }", at));

      assert.ok(at > 0, "the capture is there at all");
      assert.match(body, /vsapi\.postMessage/, "it sends the line");
      assert.doesNotMatch(body, /field\.value = ""/, "and leaves the field alone until the host answers");
    });
  }

  test("the work post names its field, so the answer can find it", () => {
    const src = read("deliverable", "vscode", "src", "extension.ts");

    assert.match(src, /key: "work_statement"/, "the post carries the key of the box it came from");
  });
});

describe("the host reports the answer back to the field", () => {
  // BOTH ENTRIES GO THROUGH ONE ANSWER PATH. A second one would drift, and the
  // note half is the half that had none at all.
  const CLIENTS: { what: string; at: string[] }[] = [
    { what: "the VS Code source", at: ["deliverable", "vscode", "src", "extension.ts"] },
    { what: "the built VS Code extension", at: ["deliverable", "vscode-dist", "extension.js"] },
  ];

  for (const { what, at } of CLIENTS) {
    test(`${what} answers the note entry and the work entry`, () => {
      const src = read(...at);

      assert.match(src, /entryAnswered\(view, "note_body"/, "the note's answer goes back");
      assert.match(src, /entryAnswered\(view, m\.key, answered\)/, "and so does a keyed action's");
    });

    test(`${what} clears the field only when the answer says ok`, () => {
      const src = read(...at);
      const at2 = src.indexOf('d.se === "entry"');
      const block = src.slice(at2, at2 + 400);

      assert.ok(at2 > 0, "the webview listens for the answer");
      assert.match(block, /d\.ok !== true/, "a refusal leaves the box exactly as typed");
    });
  }
});
