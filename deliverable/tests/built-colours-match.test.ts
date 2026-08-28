// see ux.md#fix-the-whole-wire
//
// A COLOUR CHANGE IS TWO LEGS AND THE SECOND ONE IS THE ONE THAT GETS MISSED.
// The extension's source is edited; the extension's BUNDLE is what the editor
// loads. Nothing in the write path asks whether the bundle was rebuilt, so a
// change can be correct in the source, reported as done, and invisible on
// screen.
//
// MEASURED ON i63: KIND_COLOUR gained a `work` entry in the source and the
// bundle went on carrying the old four, so work rows stayed grey and the owner
// found it rather than a test.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const SOURCE = fileURLToPath(new URL("../vscode/src/extension.ts", import.meta.url));
const BUNDLE = fileURLToPath(new URL("../vscode/extension.js", import.meta.url));

/** The one table, read out of whichever file carries it. Both spellings of the
 *  declaration are accepted because the bundler rewrites `const` to `var`. */
function colours(path: string): Record<string, string> {
  const src = readFileSync(path, "utf8");
  const block = /KIND_COLOUR\s*=\s*\{([^}]*)\}/.exec(src);
  assert.notEqual(block, null, `${path} carries no KIND_COLOUR table`);
  const out: Record<string, string> = {};
  for (const pair of (block as RegExpExecArray)[1].split(",")) {
    const kv = /^\s*([A-Za-z_$][\w$]*)\s*:\s*"([^"]*)"\s*$/.exec(pair);
    if (kv !== null) out[kv[1]] = kv[2];
  }
  return out;
}

describe("the built extension carries the colours the source declares", { concurrency: true }, () => {
  test("work rows are painted, and in the update colour", () => {
    const src = colours(SOURCE);
    assert.notEqual(src.work, undefined, "a work row with no entry prints grey, which is the defect");
    assert.equal(src.work, src.update, "the owner's ruling: work wears what the narration wears");
  });

  test("the bundle names every kind the source names", () => {
    const src = colours(SOURCE);
    const built = colours(BUNDLE);
    const missing = Object.keys(src).filter((k) => built[k] === undefined);
    assert.deepEqual(missing, [], "these kinds are coloured in the source and grey on screen — rebuild the extension");
  });

  test("the bundle paints each kind the colour the source gives it", () => {
    const src = colours(SOURCE);
    const built = colours(BUNDLE);
    const differ = Object.keys(src).filter((k) => built[k] !== undefined && built[k] !== src[k]);
    assert.deepEqual(differ, [], "the bundle is behind the source — rebuild the extension");
  });
});
