// A TEST DEPENDS ON BEHAVIOUR, NOT ON THE RECORD.
//
// A check read a closed token for a list of ids. The tokens were rewritten to
// a smaller shape, the list went, and the check could no longer pass however
// right the program was. Tracing a token to its evidence is the trace's work.
// The battery's work is the program.
//
// SO NO TEST NAMES A MINTED TOKEN AT ALL, IN CODE OR IN A COMMENT. Provenance
// in a test is the owner's ruling and it is nonsense: a test says what the
// program must do, and where the case came from belongs in the record that
// holds cases. A comment carrying an id is a second copy of the record that
// nothing keeps in step.
//
// AN INVENTED ID IS ONE CHARACTER REPEATED. wk-1111111111 and wk-aaaaaaaaaa
// are fixtures and read as fixtures. No minted id looks like that, so the two
// need no list to tell apart.
//
// GUIDANCE IS THE SAME CASE. A criterion over prose used to name this check to
// decide that no chapter carries an id, and this check never opened a chapter.
// It answered 0 failed however many ids the prose held, so the criterion read
// as decided and was not. Guidance outlives the token that prompted it, which
// is the same reason a test may not name one.
//
// EVERY ROOT IT READS, named here so a criterion can trust it: src/engine,
// src/mcp and src/viewer for *_test.go, each one folder deep; and doc/guidance
// for *.md, walked to the bottom.
//
//   node util/checks/tests-name-no-token.mjs <root>
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.argv[2] ?? ".";

const minted = /wk-[0-9a-f]{10}/g;
const invented = (id) => new Set(id.slice(3)).size === 1;

let failed = 0;
let read = 0;

// The roots, each with what it holds and how deep it goes. A root that is not
// there is a failure, not a skip: a check guarding nothing says so.
const roots = [
  { dir: join("src", "engine"), ends: "_test.go", deep: false },
  { dir: join("src", "mcp"), ends: "_test.go", deep: false },
  { dir: join("src", "viewer"), ends: "_test.go", deep: false },
  { dir: join("doc", "guidance"), ends: ".md", deep: true },
];

function filesUnder(dir, ends, deep) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (deep) out.push(...filesUnder(full, ends, deep));
      continue;
    }
    if (name.endsWith(ends)) out.push(full);
  }
  return out;
}

for (const { dir, ends, deep } of roots) {
  const here = join(root, dir);
  if (!existsSync(here)) {
    console.log(`FAIL ${dir.replace(/\\/g, "/")} is not there, so this guards nothing`);
    failed++;
    continue;
  }
  for (const file of filesUnder(here, ends, deep)) {
    read++;
    const shown = relative(root, file).replace(/\\/g, "/");
    const lines = readFileSync(file, "utf8").split("\n");
    // COMMENTS ARE READ TOO, so there is no state machine here and nothing to
    // get wrong. An earlier version stripped them, which let provenance lines
    // through, and provenance is the thing the owner refused.
    lines.forEach((line, i) => {
      for (const hit of line.match(minted) ?? []) {
        if (invented(hit)) continue;
        console.log(
          `FAIL ${shown}:${i + 1} names ${hit}, which is a token in the record`,
        );
        failed++;
      }
    });
  }
}

console.log(`${read} file(s) read. ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
