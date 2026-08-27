// THE HOST WAKES ITS CARDS WHEN WORK MOVES, and for a long time it did not.
//
// THE WIRE HAS FOUR LEGS and three of them were built and proven: the write
// lands on disk, the index hears it, and the alive payload carries a work
// signal that moves on every mint, take, settle and place. The page compares
// that signal and redraws on it.
//
// THE LEG THAT WAS MISSING sat in the HOST. An embedded page never opens the
// engine's event stream — a browser allows only a handful of connections to
// one host, so the design has the extension poll over its own runtime and wake
// the cards. That poll decided whether anything had moved from the position,
// the status and the target ONLY. A token opened, taken or settled moves none
// of those, so `moved` stayed false, no wake was posted, and the work editor
// never redrew.
//
// MEASURED: reported four times in one day by the owner, and closed four times
// without being fixed.
//
// WHY THIS FILE READS TEXT RATHER THAN BEHAVIOUR. The extension is a BUNDLE
// loaded by another process; it cannot be imported and its poll cannot be
// driven from here. built-colours-match.test.ts set this precedent for exactly
// the same reason, after a colour shipped in source and not in the bundle.
//
// SO ALL THREE COPIES ARE CHECKED. The source is what an author edits. The two
// bundles are what the editor actually loads, and the extension host reads them
// ONCE at activation — a source change that never reaches them changes nothing
// a person can see.
//
// see guidance/craft/ux.md#nothing-a-person-does-needs-a-reload
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("..", import.meta.url));

/** The three copies, named by what each one is FOR. */
const COPIES: [string, string][] = [
  ["the source an author edits", "vscode/src/extension.ts"],
  ["the built bundle", "vscode/extension.js"],
  ["the installed bundle the editor loads", "vscode-dist/extension.js"],
];

function text(rel: string): string {
  return readFileSync(join(REPO, rel), "utf8");
}

describe("the host wakes its cards when work moves", { concurrency: true }, () => {
  for (const [what, rel] of COPIES) {
    test(`${what} reads the work signal into the wake comparison`, () => {
      const src = text(rel);
      assert.match(src, /const walkNow = /, `${rel} still has the comparison this rests on`);
      const line = /const walkNow = .*/.exec(src)?.[0] ?? "";
      assert.match(line, /workNow/, "the work signal is part of what counts as moved");
    });

    test(`${what} fetches the signal from the payload that carries it`, () => {
      const src = text(rel);
      // THE ALIVE PAYLOAD IS WHERE THE SIGNAL DEMONSTRABLY LIVES — mirror.ts
      // puts `work: allWorkSignal(root)` there, and it is the same value the
      // page compares. Reading it from anywhere else would be a guess about a
      // field name, and a wrong guess fails silently.
      assert.match(src, /const workNow = .*live\.work/, `${rel} takes it from the alive payload`);
    });
  }

  // A COMPARISON THAT DROPS A FIELD CANNOT BE SEEN FROM ITS OWN OUTPUT. It
  // reports "nothing happened", which is exactly what a quiet system reports.
  // So the case pins every field, not only the new one.
  test("the comparison still carries the position, the status and the target", () => {
    const line = /const walkNow = .*/.exec(text("vscode/src/extension.ts"))?.[0] ?? "";
    assert.match(line, /p\.active/, "the position");
    assert.match(line, /p\.status/, "the status");
    assert.match(line, /p\.target/, "the target");
    assert.match(line, /workNow/, "and the work");
  });
});
