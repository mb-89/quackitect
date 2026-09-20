// The test-first rule, in two readings: the files a staged delta changes with
// no test beside them, and the modules of the server no test imports.
// [[spec/design_output/tree#the-rules-over-two-files]]

const AT = "+++ b/";
const SOURCE = /^src\/.*\.js$/;
// A fake, the stub's template and the editor files each take no case of their own. [[spec/design_output/tree#the-rules-over-two-files]]
const COPIED = [/^src\/doors\/fake\//, /^src\/stub\//, /^src\/extension\/editor/];
const TEST = /^test\/.*\.js$/;
const SERVER = /^src\/bridge\/[^/]+\.js$/;
// A line that is a comment or blank, so a hunk adding these alone changes no code. [[spec/design_output/tree#the-rules-over-two-files]]
const COMMENT = /^\s*(\/\/|\/\*|\*|$)/;

// Each file answers off its own hunk, so one file's line reads for no other. [[spec/design_output/tree#the-rules-over-two-files]]
export function hunksIn(delta) {
  const out = new Map();
  let file = "";
  for (const line of String(delta ?? "").split(/\r?\n/)) {
    if (line.startsWith(AT)) {
      file = line.slice(AT.length).trim();
      if (file && file !== "/dev/null" && !out.has(file)) out.set(file, []);
      continue;
    }
    if (!file || !line.startsWith("+") || line.startsWith("+++")) continue;
    out.get(file)?.push(line.slice(1));
  }
  return out;
}

// A test of its own for each file, so one stray case carries no other. A merge carries other commits' code, and each met this door with its own test, so it passes whole. [[spec/design_output/tree#the-rules-over-two-files]]
export function untestedIn(delta, read, merging = false) {
  if (merging) return [];
  const hunks = hunksIn(delta);
  const files = [...hunks.keys()];
  const tests = files.filter((one) => TEST.test(one));
  return files
    .filter((one) => SOURCE.test(one) && !COPIED.some((said) => said.test(one)))
    .filter((one) => codeIn(hunks.get(one) ?? []))
    .filter(
      (one) => !tests.some((test) => names(test, one, hunks.get(test) ?? [], read)),
    );
}

// A hunk adding comment lines alone changes no code, so it asks for no test. A hunk adding nothing took code away, and that still asks. [[spec/design_output/tree#the-rules-over-two-files]]
function codeIn(added) {
  return added.length === 0 || added.some((line) => !COMMENT.test(line));
}

// A test names the file it drives by its import, or by the name it carries. [[spec/design_output/tree#the-rules-over-two-files]]
function names(test, path, added, read) {
  const one = path.split("/").pop().replace(/\.js$/, "");
  const said = test
    .split("/")
    .pop()
    .replace(/\.test\.js$/, "");
  if (said === one || said.startsWith(`${one}-`)) return true;
  if (importsIt(added.join("\n"), path)) return true;
  // A test standing already imports the module above the hunk, so the reading asks the file. [[spec/design_output/tree#the-rules-over-two-files]]
  return importsIt(String(read?.(test) ?? ""), path);
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
