// THE COMMENT RULE, MECHANISED — see software.md#comments-and-provenance.
//
// The pointer names the document and its section rather than a path, which is
// the shape the rule itself asks for. It also survives the guidance layout
// moving, which a path does not — the reason tests may not name one.
//
// The rule was prose for months and lost. 788 comment lines carry a date or
// an owner attribution, which the standard forbids outright, and every one of
// them was written after the sentence forbidding it. A rule broken 788 times
// is not a rule, it is a preference.
//
// SO IT IS A RATCHET, not a ban. A ban would refuse the tree as it stands and
// be suppressed within a day. The count may FALL freely and may never RISE:
// new code is held to the rule from today, and the standing violations come
// out as the files are touched for other reasons.
//
// This is the same shape as the direct-read ratchet in files.test.ts, and for
// the same reason: what must never happen is the number growing without
// somebody deciding it should.
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

/** A date stamped into a comment. The history is in git. */
const DATE = /\b\d{4}-\d{2}-\d{2}\b/;

/** Who ruled it. The ruling belongs in the design document it settled. */
const ATTRIBUTION = /\bowner (ruling|law|design|report|correction|verdict|discussion|sketch)\b/i;

/** TODAY'S COUNT PER TREE, and the only direction either may move is down.
 *
 *  Lowering these numbers is the point. Raising one means a comment carrying a
 *  date or an attribution was added, and the fix is to move the reasoning
 *  into the design document and leave a `see <doc>.md#<section>` pointer.
 *
 *  THE ENGINE STANDS AT ZERO. Every date and every owner attribution came out
 *  of its comments in one pass; the reasoning stayed exactly where it was and
 *  only the stamp went. The ground is banked here so it cannot be given back.
 *
 *  THE TESTS WERE NEVER WATCHED, and that is why they held 521 while the engine
 *  held none. The rule reads "every artifact" and the check read one folder, so
 *  the tests accumulated freely under a guard that looked like it covered them.
 *  A ratchet aimed at half the tree measures the half that was already clean.
 *
 *  A SEPARATE CEILING PER TREE, so the engine's zero cannot be spent on test
 *  debt. One shared number would let 204 test offenders hide a new engine one.
 *
 *  A DATE MEANS NOTHING TO A READER OF CODE, and an attribution is a claim about
 *  a person standing at an application site. Those are the two things the
 *  standard forbids, and they are the two the sweep removes. */
const CEILINGS: Record<string, number> = {
  "deliverable/engine": 0,
  "deliverable/tests": 203,
};

function tsFilesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "node_modules") out.push(...tsFilesUnder(p));
    } else if (e.name.endsWith(".ts")) out.push(p);
  }
  return out;
}

/** Every comment line in one file, with its 1-based line number. Block
 *  comments count from their opener to their closer, because a rule that saw
 *  only `//` would miss the JSDoc blocks that carry most of the prose. */
function commentLines(src: string): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = [];
  let inBlock = false;
  src.split("\n").forEach((raw, i) => {
    const t = raw.trim();
    let isComment = false;
    if (inBlock) {
      isComment = true;
      if (t.includes("*/")) inBlock = false;
    } else if (t.startsWith("//")) {
      isComment = true;
    } else if (t.startsWith("/*")) {
      isComment = true;
      if (!t.includes("*/")) inBlock = true;
    }
    if (isComment) out.push({ line: i + 1, text: raw });
  });
  return out;
}

function offenders(tree: string): string[] {
  const root = join(REPO_ROOT, ...tree.split("/"));
  const hits: string[] = [];
  for (const f of tsFilesUnder(root)) {
    const rel = f.slice(REPO_ROOT.length + 1);
    for (const { line, text } of commentLines(readFileSync(f, "utf8"))) {
      if (DATE.test(text) || ATTRIBUTION.test(text)) hits.push(`${rel}:${line}`);
    }
  }
  return hits;
}

describe("the comment rule holds mechanically", { concurrency: true }, () => {
  for (const [tree, ceiling] of Object.entries(CEILINGS)) {
    test(`no comment in ${tree} gains a date or an owner attribution`, () => {
      const hits = offenders(tree);
      assert.ok(
        hits.length <= ceiling,
        `comment lines carrying a date or an owner attribution rose to ${hits.length} in ${tree}, above the ceiling of ${ceiling}.\n` +
          "The standard forbids both at application sites. Move the reasoning into the design document and leave a pointer:\n" +
          "  // see dsp-<name>.md#<section>\n" +
          `New or moved offenders are among:\n${hits.slice(0, 20).join("\n")}`,
      );
    });

    // A CEILING NOBODY LOWERS IS A CEILING NOBODY NOTICES. When the count falls
    // well below the constant, the constant is stale and hides the next rise.
    test(`the ${tree} ceiling still tracks the tree, so a fall gets banked`, () => {
      const n = offenders(tree).length;
      assert.ok(
        n > ceiling - 50,
        `the count fell to ${n} in ${tree}, ${ceiling - n} below its ceiling of ${ceiling}. Lower it to ${n} so the ground that was won is held.`,
      );
    });
  }
});
