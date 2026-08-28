// THE ENTRY CONTROLS, ALL THE WAY THROUGH — panel, client, host, built file.
//
// WHY THIS FILE EXISTS. The work entry was built, checked at three points, and
// still failed for the reader. Every leg was green on its own: the panel
// declared the control, the engine's route minted correctly, and the browser
// client read the line beside the button. What nobody checked was the leg that
// actually runs.
//
// TWO CLIENTS DRAW THE SAME BAR, and only one of them is loaded in the editor.
// `renderclient-live.ts` serves a browser. The VS Code webview carries its own
// copy, and that copy posted an EMPTY BODY for every action — so the engine
// received work with no statement and refused it. The reader pressed a button
// on a line they had filled in and got an error for leaving it blank.
//
// AND THE ONE THAT RUNS IS A BUILD. `vscode-dist/` is produced by
// `npm run build`; editing the source reaches nobody until that runs, and
// reloading the window reloads the same stale file. Preflight catches the
// staleness. What it cannot catch is a control wired in one client and not the
// other, which is what this file is for.
//
// see ux.md#fix-the-whole-wire
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

function read(...parts: string[]): string {
  return readFileSync(join(REPO_ROOT, ...parts), "utf8");
}

/** Every client that draws the panel bar and carries its presses back.
 *
 *  THE BUILT FILE IS ON THIS LIST ON PURPOSE. It is the one the editor loads,
 *  and it is the one that was wrong. */
const CLIENTS: { what: string; at: string[] }[] = [
  { what: "the browser client", at: ["deliverable", "engine", "renderclient-live.ts"] },
  { what: "the VS Code source", at: ["deliverable", "vscode", "src", "extension.ts"] },
  { what: "the built VS Code extension", at: ["deliverable", "vscode-dist", "extension.js"] },
];

describe("a control that carries a field works in every client that draws it", () => {
  // THE PANEL IS THE ONE DECLARATION. Both clients render the same bar, so the
  // control is described once and the clients only carry the press back.
  test("the entry panel declares the work control beside the note control", () => {
    const panel = read("deliverable", "machines", "panels", "note-entry.md");

    assert.match(panel, /\| text \| work_statement \|/, "a line to name the work");
    assert.match(panel, /\| action \| \/work\/mint \|/, "and a button that files it");
    assert.match(panel, /\| text \| note_body \|/, "the note entry is still its neighbour");
  });

  // A CONTROL WITH A FIELD IS NOT A BARE ACTION. Posting `{}` for one is the
  // whole failure this file is about, and it fails the same way in each client.
  for (const { what, at } of CLIENTS) {
    test(`${what} sends the statement rather than an empty body`, () => {
      const src = read(...at);

      assert.ok(src.includes("/work/mint"), "it knows the route at all");
      assert.ok(
        src.includes("work_statement") || src.includes("work-statement"),
        "and reads the line beside the button rather than posting nothing",
      );
      assert.match(src, /place: "backlog"/, "work nobody has placed yet goes to the backlog");
    });
  }

  // THE BODY TRAVELS WITH THE POST. Without this the host posts `{}` whatever
  // the webview gathered, so no control carrying a field could ever work — and
  // a future one needs no edit here at all.
  for (const { what, at } of CLIENTS.slice(1)) {
    test(`${what} forwards a body with the post`, () => {
      const src = read(...at);

      assert.match(src, /post\(m\.path, m\.body \?\? \{\}\)/, "the body rides along");
    });
  }

  // ENTER IS THE SAME ACT AS THE BUTTON. A reader who types a line and presses
  // Enter has done what the button does; wiring only one of them works half the
  // time and reads as a control that sometimes ignores you.
  for (const { what, at } of CLIENTS.slice(1)) {
    test(`${what} files the work on Enter as well as on the press`, () => {
      const src = read(...at);

      assert.match(src, /work_statement"\]'\) !== null\) captureWork\(\)/, "Enter in the work line files it");
    });
  }
});

// THE BUILT EXTENSION IS WHAT RUNS. A source edit that never reached it is
// invisible to every other check here, and to the reader it looks like the
// feature was never built at all.
describe("the built extension carries what the source says", () => {
  test("a control added to the source reaches the file VS Code loads", () => {
    const built = read("deliverable", "vscode-dist", "extension.js");

    assert.ok(built.includes("captureWork"), "the work entry is in the built file — run npm run build in deliverable if not");
    assert.match(built, /m\.body \?\? \{\}/, "and so is the body that travels with it");
  });
});
