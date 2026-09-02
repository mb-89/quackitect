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
//   node util/checks/tests-name-no-token.mjs <root>
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const packages = ["engine", "mcp", "viewer"];

const minted = /wk-[0-9a-f]{10}/g;
const invented = (id) => new Set(id.slice(3)).size === 1;

let failed = 0;
let read = 0;

for (const pkg of packages) {
  const dir = join(root, "src", pkg);
  if (!existsSync(dir)) {
    console.log(`FAIL src/${pkg} is not there, so this guards nothing`);
    failed++;
    continue;
  }
  for (const file of readdirSync(dir).filter((f) => f.endsWith("_test.go"))) {
    read++;
    const lines = readFileSync(join(dir, file), "utf8").split("\n");
    // COMMENTS ARE READ TOO, so there is no state machine here and nothing to
    // get wrong. An earlier version stripped them, which let provenance lines
    // through, and provenance is the thing the owner refused.
    lines.forEach((line, i) => {
      for (const hit of line.match(minted) ?? []) {
        if (invented(hit)) continue;
        console.log(
          `FAIL src/${pkg}/${file}:${i + 1} names ${hit}, which is a token in the record`,
        );
        failed++;
      }
    });
  }
}

console.log(`${read} test file(s) read. ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
