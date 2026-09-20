// The test-first rule, in two readings: the files a staged delta changes with
// no test beside them, and the modules of the server no test imports.
// [[spec/design_output/tree#the-rules-over-two-files]]

const AT = "+++ b/";
const SOURCE = /^src\/.*\.js$/;
const FAKE = /^src\/doors\/fake\//;
const TEST = /^test\/.*\.js$/;
const SERVER = /^src\/bridge\/[^/]+\.js$/;

// [[spec/design_output/tree#the-rules-over-two-files]]
export function filesIn(delta) {
  const out = [];
  for (const line of String(delta ?? "").split(/\r?\n/)) {
    if (!line.startsWith(AT)) continue;
    const said = line.slice(AT.length).trim();
    if (said && said !== "/dev/null" && !out.includes(said)) out.push(said);
  }
  return out;
}

// A test of its own for each file, so one stray case carries no other. [[spec/design_output/tree#the-rules-over-two-files]]
export function untestedIn(delta) {
  const files = filesIn(delta);
  const tests = files.filter((one) => TEST.test(one));
  const said = String(delta ?? "");
  return files
    .filter((one) => SOURCE.test(one) && !FAKE.test(one))
    .filter((one) => !tests.some((test) => names(test, one, said)));
}

// A test names the file it drives by its import, or by the name it carries. [[spec/design_output/tree#the-rules-over-two-files]]
function names(test, path, delta) {
  const one = path.split("/").pop().replace(/\.js$/, "");
  const said = test.split("/").pop().replace(/\.test\.js$/, "");
  return said === one || said.startsWith(`${one}-`) || importsIt(delta, path);
}

// [[spec/design_output/tree#the-rules-over-two-files]]
export function refusedTest(files) {
  const lines = ["This commit changes code, and it carries no test beside it."];
  lines.push("");
  for (const one of files) lines.push(`  ${one}`);
  lines.push("");
  lines.push(
    "Stage the test proving the change, and commit again. " +
      "Rule five of spec/guidance/code/testing.md says why.",
  );
  return lines.join("\n");
}

// A path inside a string reads as prose, so the rule asks for the import. [[spec/design_output/tree#the-rules-over-two-files]]
export function importsIt(said, path) {
  const name = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:from|import)\\s*\\(?\\s*["'][^"']*${name}["']`).test(said);
}

// [[spec/design_output/tree#the-rules-over-two-files]]
export function everyModuleTested(tree) {
  const rule = "EveryModuleTested";
  const paths = tree.paths();
  const said = paths
    .filter((one) => TEST.test(one))
    .map((one) => tree.read(one))
    .join("\n");

  const out = [];
  for (const path of paths.filter((one) => SERVER.test(one))) {
    if (importsIt(said, path)) continue;
    out.push({
      file: path,
      rule,
      line: 1,
      column: 1,
      message:
        "No test imports this module, so nothing drives it. Write the test naming it by path.",
      severity: "error",
    });
  }
  return out;
}
