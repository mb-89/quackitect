// The test-first rule: the files a staged delta changes with
// no test beside them, and the modules of the server no test imports.
// [[spec/design_output/tree#the-rules-over-two-files]]

// The lines `git diff` opens a file, a deleted file and a hunk with. [[spec/design_output/tree#the-rules-over-two-files]]
const GIT_FILE = /^diff --git a\/.* b\/(.+)$/;
const GONE = "deleted file mode";
const HUNK = "@@";
// The code the door reads: the server, its Go past the tests, and the level0 lib and hooks. [[spec/design_output/tree#the-rules-over-two-files]]
const SOURCE = [
  /^src\/.*\.js$/,
  /^src\/(?:.*\/)?(?!.*_test\.go$)[^/]+\.go$/,
  /^\.claude\/skills\/level0\/(lib|hooks)\/[^/]+\.js$/,
];
// A fake, the stub's template and the editor files each take no case of their own. [[spec/design_output/tree#the-rules-over-two-files]]
const COPIED = [/^src\/doors\/fake\//, /^src\/stub\//, /^src\/extension\/editor/];
const TEST = /^test\/.*\.js$/;
const GO_TEST = /^src\/.*_test\.go$/;
// A path a command line names, cut at a space or a quote. [[spec/design_output/tree#the-rules-over-two-files]]
const WORD = /[^\s"'`]+/g;
// A command field holds one line indented four spaces. [[spec/design_output/pull#the-fields-hold-their-forms]]
const COMMAND_LINE = /^ {4}\S/;
const SERVER = /^src\/bridge\/[^/]+\.js$/;
// A line that is a comment or blank, so a hunk adding these alone changes no code. [[spec/design_output/tree#the-rules-over-two-files]]
const COMMENT = /^\s*(\/\/|\/\*|\*|$)/;

// Each file answers off its own hunk, so one file's line reads for no other. A `diff --git` line opens a file, a deleted file opens none, and a line counts past an `@@` alone, so no header reads as content. [[spec/design_output/tree#the-rules-over-two-files]]
export function hunksIn(delta) {
  const out = new Map();
  let file = "";
  let inHunk = false;
  for (const line of String(delta ?? "").split(/\r?\n/)) {
    const opened = GIT_FILE.exec(line);
    if (opened) {
      file = opened[1];
      inHunk = false;
      if (!out.has(file)) out.set(file, { added: [], removed: [] });
      continue;
    }
    if (!file) continue;
    if (line.startsWith(GONE)) {
      out.delete(file);
      file = "";
      continue;
    }
    if (line.startsWith(HUNK)) {
      inHunk = true;
      continue;
    }
    if (!inHunk) continue;
    if (line.startsWith("+")) out.get(file).added.push(line.slice(1));
    else if (line.startsWith("-")) out.get(file).removed.push(line.slice(1));
  }
  return out;
}

// A test of its own for each file, so one stray case carries no other. A merge carries other commits' code, and each met this door with its own test, so it passes whole. [[spec/design_output/tree#the-rules-over-two-files]]
// The tests the held ticket carries answer beside the staged ones, because the tests-red leaf landed them. [[spec/design_output/tree#the-rules-over-two-files]]
export function untestedIn(delta, read, merging = false, carried = []) {
  if (merging) return [];
  const hunks = hunksIn(delta);
  const files = [...hunks.keys()];
  const tests = [...new Set([...files.filter(isTest), ...carried.filter(isTest)])];
  return files
    .filter((one) => SOURCE.some((said) => said.test(one)) && !COPIED.some((said) => said.test(one)))
    .filter((one) => codeIn(hunks.get(one)))
    .filter(
      (one) => !tests.some((test) => names(test, one, hunks.get(test)?.added ?? [], read)),
    );
}

// The test paths a ticket's command lines name: a path under `test/`, or a Go test. [[spec/design_output/tree#the-rules-over-two-files]]
export function carriedIn(text) {
  const out = [];
  for (const line of String(text ?? "").split(/\r?\n/)) {
    if (!COMMAND_LINE.test(line)) continue;
    for (const word of line.match(WORD) ?? []) {
      if (isTest(word) && !out.includes(word)) out.push(word);
    }
  }
  return out;
}

function isTest(path) {
  return TEST.test(path) || GO_TEST.test(path);
}

// A hunk whose lines either side are comments changes no code, so it asks for no test. A line of code added or taken away asks, and so does a hunk taking lines away and adding none. [[spec/design_output/tree#the-rules-over-two-files]]
function codeIn(hunk) {
  const added = hunk?.added ?? [];
  const removed = hunk?.removed ?? [];
  if (!added.length && removed.length) return true;
  return [...added, ...removed].some((line) => !COMMENT.test(line));
}

// A test names the file it drives by its import, or by the name it carries. [[spec/design_output/tree#the-rules-over-two-files]]
function names(test, path, added, read) {
  // A Go test reaches every file of its own package, which is its folder. [[spec/design_output/tree#the-rules-over-two-files]]
  if (GO_TEST.test(test)) return path.endsWith(".go") && folderOf(test) === folderOf(path);
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

function folderOf(path) {
  return path.slice(0, path.lastIndexOf("/"));
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
