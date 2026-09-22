// The editor's Vale and the battery's Vale read one list. The editor hands Vale
// an absolute path, and the battery a relative one, so a section of the config
// matches both, and the panel shows what the check sees.
// [[spec/design_output/lsp#the-panel-reads-the-battery]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { vale } from "../../src/doors/vale.js";
import { readTools, whereIs } from "../../src/engine/tools.js";
import { assemble } from "../../src/scripts/styles.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const bin = whereIs(files, root, "vale", readTools(files, root));
const ifVale = files.exists(bin) ? test : skip;
const RATIONALE = "spec/rationales/arguing.md";
const DESIGN = "spec/design_output/level0.md";
// A script rule under the battery's load trips Vale's own timeout, which its line names E201, so the run goes again up to this many times. [[spec/tickets/the-battery-flickers-under-load]]
const TIMED_OUT = /E201/;
const RUNS = 3;

// A miss says what vale wrote, on both streams, because a red under load names its cause there. [[spec/design_output/lsp#the-panel-reads-the-battery]]
const saidOf = (argv, stdin = "") => {
  let ran = null;
  for (let at = 0; at < RUNS; at++) {
    ran = outside.run([bin, "--output=line", "--no-exit", ...argv], {
      cwd: root,
      stdin,
    });
    if (!TIMED_OUT.test(String(ran.stdout ?? ""))) break;
  }
  const lines = String(ran.stdout ?? "")
    .split("\n")
    .filter(Boolean);
  const why = [
    `exit ${ran.exitCode ?? "none"}${ran.error ? `, ${ran.error?.message ?? ran.error}` : ""}`,
    lines.join("\n"),
    String(ran.stderr ?? ""),
  ]
    .filter((one) => one.trim())
    .join("\n");
  // A vale that ran not answers no line, and that reads as no finding unless the exit says otherwise here. [[spec/guidance/retro/effect]]
  assert.equal(ran.exitCode, 0, `vale ran not: ${why}`);
  return { lines, why };
};
// The two shapes read one list, and a miss says what each run wrote. [[spec/design_output/lsp#the-panel-reads-the-battery]]
const sameLines = (one, other) => {
  const a = saidOf(one);
  const b = saidOf(other);
  assert.equal(
    a.lines.length,
    b.lines.length,
    `absolute:\n${a.why}\nrelative:\n${b.why}`,
  );
};

test("every section of the config naming a folder opens on a double star", () => {
  const heads = files
    .read(join(root, ".vale.ini"))
    .split("\n")
    .filter((line) => line.startsWith("["))
    .map((line) => line.slice(1, line.indexOf("]")));
  const bare = heads.filter(
    (one) => one.includes("/") && !one.startsWith("**/") && !one.startsWith("{"),
  );
  assert.deepEqual(bare, [], "a section an absolute path misses");
});

ifVale("a rationale reads the same by its absolute path as by its relative one", () => {
  sameLines([join(root, RATIONALE), join(root, DESIGN)], [RATIONALE, DESIGN]);
});

const STYLES = "spec/config/styles";
const INI = [
  "StylesPath = spec/config/styles",
  "MinAlertLevel = suggestion",
  "",
  "[*.{md,markdown,txt}]",
  "BasedOnStyles = Ours",
  "",
].join("\n");

const ruleOf = (word) =>
  [
    "extends: existence",
    `message: "${word} stands refused here"`,
    "level: error",
    "tokens:",
    `  - ${word}`,
    "",
  ].join("\n");

const wrote = (at, text) => {
  files.makeDir(dirname(at));
  files.write(at, text);
};

const rooted = (where, rel) => join(where, ...rel.split("/"));

// A project writes a rule of its own, and the method's rules keep standing over it. [[spec/design_output/vehicle#the-styles-assemble-once]]
ifVale(
  "a rule the work root alone holds refuses a write there, and none in the method",
  async () => {
    const where = files.tempDir("two-roots-");
    const method = join(where, "tools");
    const work = join(where, "project");
    wrote(
      rooted(method, ".se/.runtime/tools.json"),
      JSON.stringify({ vale: { path: bin } }),
    );
    wrote(rooted(method, ".vale.ini"), INI);
    wrote(rooted(method, `${STYLES}/Ours/Method.yml`), ruleOf("flibbertigibbet"));
    wrote(rooted(work, `${STYLES}/Ours/Project.yml`), ruleOf("duckweed"));

    const said = assemble(files, { method, work, itself: false });
    assert.equal(
      said.config,
      ".se/vale/.vale.ini",
      "the door reads the config the assembly writes",
    );

    const door = vale(files, outside, method, work);
    const inProject = await door.lint("The duckweed stands here.\n", "notes.md");
    assert.ok(inProject.ran, `vale ran: ${inProject.why}`);
    assert.deepEqual(
      inProject.found.map((one) => one.rule),
      ["Ours.Project"],
      "the project's own rule refuses the write",
    );

    const both = await door.lint("The flibbertigibbet stands here.\n", "notes.md");
    assert.deepEqual(
      both.found.map((one) => one.rule),
      ["Ours.Method"],
      "the method's rule keeps standing over the project",
    );

    const alone = vale(files, outside, method, method);
    const inMethod = await alone.lint("The duckweed stands here.\n", "notes.md");
    assert.deepEqual(
      inMethod.found,
      [],
      "the project's rule refuses nothing in the method",
    );
  },
);

// A line carrying a finding by construction, because a tracked note standing at warning reaches no push. [[spec/design_output/lsp#the-panel-reads-the-battery]]
const FLAGGED =
  "The reader wrote this line in the past tense, and it names 3 things in prose.\n";

ifVale("the config the workspace hands the Vale extension draws nothing", () => {
  const settings = JSON.parse(files.read(join(root, ".vscode/settings.json")));
  const config = settings["vale.valeCLI.config"];
  const raw = saidOf(["--ext=.md"], FLAGGED);
  assert.ok(
    raw.lines.length > 0,
    `the line carries a raw finding to hide; vale said:\n${raw.why}`,
  );
  const hidden = saidOf([`--config=${join(root, config)}`, "--ext=.md"], FLAGGED);
  assert.equal(
    hidden.lines.length,
    0,
    `the editor config still draws; vale said:\n${hidden.why}`,
  );
});
