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

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/** A date stamped into a comment. The history is in git. */
const DATE = /\b\d{4}-\d{2}-\d{2}\b/;

/** Who ruled it. The ruling belongs in the design document it settled. */
const ATTRIBUTION = /\bowner (ruling|law|design|report|correction|verdict|discussion|sketch)\b/i;

/** TODAY'S COUNT, and the only direction it may move is down.
 *
 *  Lowering this number is the point. Raising it means a comment carrying a
 *  date or an attribution was added, and the fix is to move the reasoning
 *  into the design document and leave a `see <doc>.md#<section>` pointer. */
const CEILING = 731;

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

function offenders(): string[] {
  const engine = join(REPO_ROOT, "project", "deliverable", "engine");
  const hits: string[] = [];
  for (const f of tsFilesUnder(engine)) {
    const rel = f.slice(REPO_ROOT.length + 1);
    for (const { line, text } of commentLines(readFileSync(f, "utf8"))) {
      if (DATE.test(text) || ATTRIBUTION.test(text)) hits.push(`${rel}:${line}`);
    }
  }
  return hits;
}

describe("the comment rule holds mechanically", { concurrency: true }, () => {
  test("no comment in the engine gains a date or an owner attribution", () => {
    const hits = offenders();
    assert.ok(
      hits.length <= CEILING,
      `comment lines carrying a date or an owner attribution rose to ${hits.length}, above the ceiling of ${CEILING}.\n` +
        "The standard forbids both at application sites. Move the reasoning into the design document and leave a pointer:\n" +
        "  // see dsp-<name>.md#<section>\n" +
        `New or moved offenders are among:\n${hits.slice(0, 20).join("\n")}`,
    );
  });

  // A CEILING NOBODY LOWERS IS A CEILING NOBODY NOTICES. When the count falls
  // well below the constant, the constant is stale and hides the next rise.
  test("the ceiling still tracks the tree, so a fall gets banked", () => {
    const n = offenders().length;
    assert.ok(
      n > CEILING - 50,
      `the count fell to ${n}, ${CEILING - n} below the ceiling of ${CEILING}. Lower CEILING to ${n} so the ground that was won is held.`,
    );
  });
});
