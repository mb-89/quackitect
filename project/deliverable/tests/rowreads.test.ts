// A ROW MAY NOT NAME A DOCUMENT THAT CANNOT BE READ.
//
// `entry_read` and `exit_read` do not look anything up. They carry their
// strings straight through to the reader as PATHS from the project root. So a
// row naming a bare id — `meth-cockburn-use-case` instead of
// `project/deliverable/machines/methods/meth-cockburn-use-case.md` — compiles
// happily, and the walk then demands a document nobody can open.
//
// FOUND LIVE 2026-08-06, and the cost was out of all proportion to the typo.
// The state could not be entered. The refusal named the id with no path and no
// reason. Pulling served nothing, because the reading gathered a path that did
// not resolve. Reading the file by hand credited nothing, because only the
// gathered reading credits. Every remedy the machine offered was exhausted,
// and the walk had no way forward at all.
//
// The reading now says so out loud when it happens. This test is the half that
// matters more: the reference is resolved HERE, in seconds, at the desk —
// rather than hours later, inside a record, at the moment it blocks.
import { strict as assert } from "node:assert";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

const ROWS = join(import.meta.dirname, "..", "machines", "rigor_matrix", "rows");
const ROOT = join(import.meta.dirname, "..", "..", "..");

/** The list items under a frontmatter key, up to the next key or the fence. */
function listUnder(raw: string, key: string): string[] {
  const lines = raw.split("\n");
  const start = lines.findIndex((l) => l.trim() === `${key}:`);
  if (start === -1) return [];
  const out: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i] ?? "";
    if (!l.startsWith("  - ")) break;
    out.push(l.slice(4).trim());
  }
  return out;
}

/** The predicate the row check applies, extracted so it can be shown to have
 *  teeth. A guard that only ever runs against fixed data proves nothing. */
function readable(rel: string): boolean {
  return rel.startsWith("@") || (rel.includes("/") && existsSync(join(ROOT, rel)));
}

describe("the check has teeth", { concurrency: true }, () => {
  test("it rejects the exact bare id that blocked the walk on 2026-08-06", () => {
    assert.equal(readable("meth-cockburn-use-case"), false, "a bare id must not pass");
  });

  test("it rejects a well-shaped path with nothing behind it", () => {
    assert.equal(readable("project/deliverable/machines/methods/meth-does-not-exist.md"), false);
  });

  test("it accepts the document that row actually meant", () => {
    assert.equal(readable("project/deliverable/machines/methods/meth-cockburn-use-case.md"), true);
  });
});

describe("every read a row demands can actually be read", { concurrency: true }, () => {
  const files = readdirSync(ROWS).filter((f) => f.endsWith(".md"));

  test("the row folder is where it is expected", () => {
    assert.ok(files.length > 0, `no rigor rows found under ${ROWS} — the test is looking in the wrong place`);
  });

  for (const f of files) {
    const raw = readFileSync(join(ROWS, f), "utf8");
    const demands = [...listUnder(raw, "entry_read"), ...listUnder(raw, "exit_read")];
    if (demands.length === 0) continue;
    test(`${f} names only documents that exist`, () => {
      for (const rel of demands) {
        // A DECLARED ROOT is somebody else's tree and not ours to resolve.
        if (rel.startsWith("@")) continue;
        assert.ok(
          rel.includes("/"),
          `${f} demands "${rel}" — that is a bare id, and a read demand is a PATH from the project root. Nothing resolves it, so the walk blocks on a document it cannot open.`,
        );
        assert.ok(
          existsSync(join(ROOT, rel)),
          `${f} demands "${rel}" and no file stands there. Either the path is wrong or the document was never written; both block the walk with no remedy.`,
        );
      }
    });
  }
});
