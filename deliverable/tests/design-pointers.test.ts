// EVERY POINTER RESOLVES — see software.md#comments-and-provenance.
//
// The rule asks code to point at its design document instead of restating it.
// A pointer nobody checks is the stale comment wearing a better hat: it reads
// as a citation, and the reader who follows it lands nowhere.
//
// So the pointer is only worth writing if it is verified. This walks every
// `see <doc>.md#<section>` in the deliverable and resolves it against the real
// headings, which is what makes the reference a trace rather than a hope.
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { craftDocs } from "./helpers.ts";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

/** The anchor a markdown heading gets, the way every renderer derives it. */
function slug(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Where a pointer may aim: the design specs, and the craft standards as
 *  helpers derives them — this test may not name that folder itself. */
function pointable(): string[] {
  const specs = readdirSync(join(REPO_ROOT, "spec", "trace", "design-spec"))
    .filter((e) => e.endsWith(".md"))
    .map((e) => join("spec", "trace", "design-spec", e));
  return [...specs, ...craftDocs()];
}

function headings(): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const rel of pointable()) {
    const set = new Set<string>();
    for (const l of readFileSync(join(REPO_ROOT, rel), "utf8").split("\n")) {
      // EVERY HEADING LEVEL IS A SECTION. This collected `## ` only, so a
      // pointer naming a real `### ` section was reported as a citation to
      // nowhere — the pointer was right and the reader was not looking.
      const h = /^(#{2,6}) /.exec(l);
      if (h !== null) set.add(slug(l.slice(h[1].length + 1)));
    }
    out.set(rel.split(/[/\\]/).pop() as string, set);
  }
  return out;
}

function tsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "node_modules") out.push(...tsFiles(p));
    } else if (e.name.endsWith(".ts")) out.push(p);
  }
  return out;
}

test("every `see <doc>.md#<section>` pointer resolves to a real section", () => {
  const anchors = headings();
  const broken: string[] = [];
  let resolved = 0;
  for (const f of tsFiles(join(REPO_ROOT, "deliverable"))) {
    const rel = f.slice(REPO_ROOT.length + 1);
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/see ([a-z0-9-]+\.md)#([a-z0-9-]+)/g)) {
      const [, doc, anchor] = m;
      const set = anchors.get(doc);
      if (set === undefined) {
        broken.push(`${rel}: points at ${doc}, which is not a design spec or a craft standard`);
      } else if (!set.has(anchor)) {
        broken.push(`${rel}: ${doc} has no section "#${anchor}"`);
      } else {
        resolved++;
      }
    }
  }
  assert.deepEqual(
    broken,
    [],
    "a pointer that does not resolve is a citation to nowhere — rename the section back, or move the pointer with it",
  );
  // A GUARD THAT MATCHES NOTHING PASSES FOREVER. If the pattern stops finding
  // pointers, this test is green and asleep.
  assert.ok(resolved > 50, `only ${resolved} pointers found — the pattern has stopped matching what the code writes`);
});
