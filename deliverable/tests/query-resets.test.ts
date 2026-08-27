// A HAND-EDITED QUERY IS UNDOABLE (owner).
//
// The query panel applies nothing until Save, so until then the edit can be
// taken back. Reset puts the box back to what is saved.
//
// NOTHING IS STORED TWICE TO OFFER IT. The served text is the textarea's own
// default value, which the browser keeps for exactly this.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { basesCard } from "../engine/baseui.ts";
import { warmVault } from "../engine/vault.ts";
import { freshRoot } from "./helpers.ts";

const ROOT = freshRoot();
await warmVault(ROOT);
const CARD = basesCard(ROOT, "");

const client = readFileSync(fileURLToPath(new URL("../engine/basesclient.ts", import.meta.url)), "utf8");

describe("the query panel can be put back", { concurrency: true }, () => {
  test("reset sits beside save, in the query panel's own head", () => {
    assert.match(CARD, /class="bs-tool bs-code-reset"/, "the button is drawn");
    assert.match(CARD, /bs-code-reset[\s\S]{0,200}bs-code-save/, "and it sits before Save rather than somewhere else");
  });

  test("it says what it does, because a bare word would not", () => {
    assert.match(CARD, /title="put the query back the way it was saved"/);
  });

  // THE EDITOR DRAWS TWO OF THESE SIDE BY SIDE. Resetting the other pane's
  // query would be worse than having no button at all.
  test("the handler resets its own block's box, never the first one on the page", () => {
    const at = client.indexOf('bs-code-reset"');
    const block = client.slice(at, at + 400);

    assert.ok(at > 0, "the handler is there");
    assert.match(block, /closest\("\.bs-block"\)/, "it finds its own block first");
    assert.match(block, /\.defaultValue/, "and restores the served text rather than a stored copy");
  });

  // SAVE STILL SENDS WHAT IS TYPED. A reset that broke saving would trade one
  // complaint for a worse one.
  test("save still posts the box's current text", () => {
    const at = client.indexOf('bs-code-save"');
    const block = client.slice(at, at + 300);

    assert.match(block, /setSource/, "the save path is untouched");
  });
});
