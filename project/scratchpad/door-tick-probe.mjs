// Does the door miss a same-length external rewrite in the same tick?
import { mkdtempSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { noteOf, writeNode } from "../deliverable/engine/notes.ts";

let misses = 0;
for (let i = 0; i < 20; i++) {
  const p = join(mkdtempSync(join(tmpdir(), "se-door-")), "n.md");
  writeNode(p, "---\nsigned_off: 2026-08-10T00:00:00.000Z\n---\nbody\n");
  const first = noteOf(p);
  const s1 = statSync(p);
  writeFileSync(p, "---\nsigned_off: 2026-09-01T00:00:00.000Z\n---\nbody\n", "utf8");
  const s2 = statSync(p);
  const second = noteOf(p);
  const stale = second.frontmatter.signed_off !== "2026-09-01T00:00:00.000Z";
  if (stale) {
    misses++;
    console.log(`MISS ${i}: mtime ${s1.mtimeMs} vs ${s2.mtimeMs}, ctime ${s1.ctimeMs} vs ${s2.ctimeMs}, size ${s1.size} vs ${s2.size}`);
  }
  void first;
}
console.log(`${misses} of 20 external rewrites went unseen`);
