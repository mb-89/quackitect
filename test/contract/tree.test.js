// The rules over the files, and the tracked files they read. Each case breaks
// one rule on a fake tree and asserts the finding, then hands the rule this
// tree and asserts none. A rule reaching lint reaches the problems panel.
// [[spec/design_output/tree#what-a-rule-answers]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { VERBS } from "../../.claude/skills/level0/lib/bash.js";
import {
  configOf,
  faultsIn,
  flatten,
  keyOf,
  SCHEMA,
  TRACKED,
  varOf,
} from "../../.claude/skills/level0/lib/config.js";
import { boxOf } from "../../.claude/skills/level0/lib/private.js";
import {
  EDITOR_EXTENSIONS,
  EDITOR_SETTINGS,
  EDITOR_VALE_INI,
} from "../../.claude/skills/level0/lib/servers.js";
import { pool } from "../../.claude/skills/level0/lib/stop.js";
import { TOOLS } from "../../.claude/skills/level0/lib/tools.js";
import {
  biomeOnWindows,
  editorDrawsWriteRules,
  extensionsOnOffer,
  INSTALL,
  nameHoldsTheWords,
  noLogDeleted,
  nothingPrivateTravels,
  privateFolderOwned,
  settingsNameBinaries,
  stopFolderIsData,
  surveyFindsNode,
  surveyNamesInstalls,
  treeFaults,
  treeOf,
} from "../../.claude/skills/level0/lib/tree.js";
import { disk } from "../../src/doors/disk.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { git } from "../../src/doors/git.js";
import { proc } from "../../src/doors/proc.js";
import { faultsIn as gridFaults } from "../../src/extension/lib/grid.js";
import { commandsOf } from "../../src/extension/lib/panel.js";
import { drawnIn, entriesIn } from "../../src/extension/lib/widgets.js";
import { SESSION } from "../../src/scripts/pull-hand-of.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();

const SCRIPTS = join(root, "src", "scripts");
const STOP = "spec/config/stop";
const NODE = process.version.replace(/^v/, "");
const FAKE = "/tree";

const read = (where) => JSON.parse(files.read(join(root, where)));
const text = (where) => files.read(join(root, where));
const settings = configOf({
  read: async (where) => files.read(join(root, where)),
  readEnv: async () => ({}),
});
const words = await settings.ask("names.words");
const gitHere = git(outside, root);
const here = treeOf({
  disk: files,
  git: gitHere,
  root,
  words,
  node: NODE,
  box: boxOf(process.env, gitHere),
});

const fakeTree = (seed, paths = [], node = NODE, box = {}) =>
  treeOf({
    disk: fakeDisk(
      Object.fromEntries(
        Object.entries(seed).map(([at, said]) => [`${FAKE}/${at}`, said]),
      ),
    ),
    git: fakeGit({ "git ls-files": { stdout: paths.join("\n") } }, FAKE),
    root: FAKE,
    words,
    node,
    box,
  });

const namesIn = (at, end) =>
  files
    .list(at)
    .filter((one) => one.kind === "file" && one.name.endsWith(end))
    .map((one) => one.name);

const edited = (where, change) => {
  const said = read(where);
  change(said);
  return JSON.stringify(said, null, 2);
};

// [[spec/design_output/bash#the-description-names-verbs]]
test("every verb the Bash description names stands in the command line", () => {
  const said = files.read(join(SCRIPTS, "cli.js"));
  assert.ok(VERBS.length, "the description names at least one verb");
  for (const verb of VERBS) {
    assert.match(said, new RegExp(`\\n  ${verb}: \\{`), `./RUNME.sh ${verb} stands`);
  }
});

// [[spec/design_output/tree#the-rules-over-two-files]]
test("this tree breaks none of the rules over two files", () => {
  assert.deepEqual(treeFaults(here), []);
});

// [[spec/design_output/private#a-fixture-carries-no-shape]]
const FNORDWICK_HOME = ["C:/Users", "fnordwick"].join("/");

// [[spec/design_output/private#the-box-names-the-owner]]
test("a tracked file carrying a name off this box is refused", () => {
  const seed = {
    "test/level0/paths.test.js": `const ROOT = "${FNORDWICK_HOME}/ai";\n`,
    "spec/guidance/one.md": "The maintainer reaches nobody at all here.\n",
  };
  const paths = ["test/level0/paths.test.js", "spec/guidance/one.md"];
  const found = nothingPrivateTravels(
    fakeTree(seed, paths, NODE, {
      user: "fnordwick",
      home: FNORDWICK_HOME,
      name: "Fnordwick",
      email: "fnordwick@example.com",
    }),
  );

  assert.equal(found.length, 2, "the user and the home folder both stand in that line");
  assert.equal(found[0].rule, "NothingPrivateTravels");
  assert.equal(found[0].file, "test/level0/paths.test.js");
  assert.equal(found[0].line, 1);
  assert.match(found[0].message, /the user this box runs as/);
  assert.match(found[1].message, /the home folder on this box/);
});

test("a git name and a git address off this box are refused too", () => {
  const seed = { "spec/funnel/one.md": "Ask Fnordwick, or fnordwick@example.com.\n" };
  const found = nothingPrivateTravels(
    fakeTree(seed, ["spec/funnel/one.md"], NODE, {
      user: "",
      home: "/home/user",
      name: "Fnordwick",
      email: "fnordwick@example.com",
    }),
  );

  assert.deepEqual(
    found.map((one) => one.message.replace(/, and git.*/, "")),
    [
      "This line carries the git name on this box",
      "This line carries the git address on this box",
    ],
  );
});

test("a box naming nobody reads clean, and so does this tree", () => {
  const seed = {
    "spec/funnel/one.md": "A cloud box writes under /home/user, as root.\n",
  };
  const box = { user: "root", home: "/home/user", name: "Claude", email: "" };
  assert.deepEqual(
    nothingPrivateTravels(fakeTree(seed, ["spec/funnel/one.md"], NODE, box)),
    [],
  );
  assert.deepEqual(nothingPrivateTravels(here), []);
});

// [[spec/design_output/private#a-fixture-carries-no-shape]]
test("a name standing inside a longer word carries no person", () => {
  const seed = { "spec/funnel/one.md": "The oxygen in the galaxy holds.\n" };
  const box = { user: "xy", home: ["/home", "xy"].join("/"), name: "", email: "" };
  assert.deepEqual(
    nothingPrivateTravels(fakeTree(seed, ["spec/funnel/one.md"], NODE, box)),
    [],
  );
});

test("a settings file naming another binary is refused", () => {
  const found = settingsNameBinaries(
    fakeTree({
      [EDITOR_SETTINGS]: edited(EDITOR_SETTINGS, (said) => {
        said["vale.valeCLI.path"] = "vale";
      }),
      [INSTALL]: text(INSTALL),
    }),
  );

  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "SettingsNameBinaries");
  assert.equal(found[0].file, EDITOR_SETTINGS);
  assert.match(found[0].message, /vale\.valeCLI\.path/);
  assert.ok(found[0].line > 1, "it points at the line naming the binary");
  assert.deepEqual(settingsNameBinaries(here), []);
});

test("an install script installing no vale is refused", () => {
  const found = settingsNameBinaries(
    fakeTree({
      [EDITOR_SETTINGS]: text(EDITOR_SETTINGS),
      [INSTALL]: text(INSTALL).replace(/^\s*vale\)\s*\[ -x.*$/m, "    vale) true ;;"),
    }),
  );

  assert.equal(found.length, 1);
  assert.equal(found[0].file, INSTALL);
  assert.match(found[0].message, /installs no vale/);
});

test("a settings file drawing at its own level is refused", () => {
  const found = editorDrawsWriteRules(
    fakeTree({
      [EDITOR_SETTINGS]: edited(EDITOR_SETTINGS, (said) => {
        said["vale.valeCLI.minAlertLevel"] = "warning";
      }),
      [EDITOR_VALE_INI]: text(EDITOR_VALE_INI),
    }),
  );

  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "EditorDrawsWriteRules");
  assert.match(found[0].message, /inherited/);
  assert.deepEqual(editorDrawsWriteRules(here), []);
});

// [[spec/design_output/lsp#the-panel-reads-the-battery]]
test("an editor config turning on a style is refused, because the panel reads the battery", () => {
  const found = editorDrawsWriteRules(
    fakeTree({
      [EDITOR_SETTINGS]: text(EDITOR_SETTINGS),
      [EDITOR_VALE_INI]: `${text(EDITOR_VALE_INI)}[*.md]\nBasedOnStyles = VoiceParagraph\n`,
    }),
  );

  assert.equal(found.length, 1);
  assert.match(found[0].message, /turns on a style/);
});

test("a settings file naming a config nobody wrote is refused", () => {
  const found = editorDrawsWriteRules(
    fakeTree({ [EDITOR_SETTINGS]: text(EDITOR_SETTINGS) }),
  );

  assert.equal(found.length, 1);
  assert.match(found[0].message, /vale\.valeCLI\.config/);
});

test("a plain biome path on Windows is refused", () => {
  const found = biomeOnWindows(
    fakeTree({
      [EDITOR_SETTINGS]: edited(EDITOR_SETTINGS, (said) => {
        said["biome.lsp.bin"]["win32-x64"] = ".se/.runtime/bin/biome";
      }),
    }),
  );

  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "BiomeOnWindows");
  assert.match(found[0].message, /win32-x64/);
  assert.deepEqual(biomeOnWindows(here), []);
});

test("a clone opening without both extensions is refused", () => {
  const dropped = extensionsOnOffer(
    fakeTree({
      [EDITOR_EXTENSIONS]: edited(EDITOR_EXTENSIONS, (said) => {
        said.recommendations = said.recommendations.filter(
          (one) => !one.includes("biome"),
        );
      }),
    }),
  );

  assert.equal(dropped.length, 1);
  assert.equal(dropped[0].rule, "ExtensionsOnOffer");
  assert.match(dropped[0].message, /biomejs\.biome/);

  const stranger = extensionsOnOffer(
    fakeTree({
      [EDITOR_EXTENSIONS]: text(EDITOR_EXTENSIONS),
      [EDITOR_SETTINGS]: edited(EDITOR_SETTINGS, (said) => {
        said["[json]"] = { "editor.defaultFormatter": "somebody.else" };
      }),
    }),
  );

  assert.equal(stranger.length, 1);
  assert.equal(stranger[0].file, EDITOR_SETTINGS);
  assert.match(stranger[0].message, /somebody\.else/);
  assert.deepEqual(extensionsOnOffer(here), []);
});

// [[spec/design_output/stop#where-the-rules-live]]
test("a stop file short of a field is refused", () => {
  const found = stopFolderIsData(
    fakeTree({ [`${STOP}/level0.yml`]: "- id: only-an-id\n" }),
  );

  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "StopFolderIsData");
  assert.equal(found[0].file, `${STOP}/level0.yml`);
  assert.deepEqual(stopFolderIsData(here), []);
});

test("a line deleting a log file is refused", () => {
  const found = noLogDeleted(
    fakeTree(
      {
        "src/doors/log.js": "export function log() {\n  files.remove(logFolder);\n}\n",
      },
      ["src/doors/log.js"],
    ),
  );

  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "NoLogDeleted");
  assert.equal(found[0].line, 2);
  assert.deepEqual(noLogDeleted(here), []);
});

// [[spec/design_input/the-runtime-files-stand-apart]]
test("a file spelling the runtime folder without naming its owner is refused", () => {
  const found = privateFolderOwned(
    fakeTree(
      {
        "src/scripts/stray.js": 'const at = "x";\nconst hold = ".se/.runtime/hold";\n',
        "src/index/split.go": 'const at = ".se", ".runtime"\n',
      },
      ["src/scripts/stray.js", "src/index/split.go"],
    ),
  );

  assert.deepEqual(
    found.map((one) => [one.rule, one.file, one.line]),
    [
      ["PrivateFolderOwned", "src/scripts/stray.js", 2],
      ["PrivateFolderOwned", "src/index/split.go", 1],
    ],
  );
});

// A reader the move left behind spells the old place, and that is the drift. [[spec/design_input/the-runtime-files-stand-apart]]
test("a spelling of a name the runtime half took is refused where the old place stands", () => {
  const stale = {
    "src/bridge/left.js": 'const at = join(work, ".se", "hold");\n',
    "src/scripts/old.js": 'const bin = ".se/bin";\nconst log = ".se/.log";\n',
  };
  assert.deepEqual(
    privateFolderOwned(fakeTree(stale, Object.keys(stale))).map((one) => [
      one.file,
      one.line,
    ]),
    [
      ["src/bridge/left.js", 1],
      ["src/scripts/old.js", 1],
    ],
  );

  const kept = { "src/scripts/rest.js": 'const notes = ".se/notes";\n' };
  assert.deepEqual(privateFolderOwned(fakeTree(kept, Object.keys(kept))), []);
});

// A plugin imports nothing past its own folder, so the plugin spells the session file the hand writes once in its library, and the pull hook imports it from there. [[spec/design_input/the-runtime-files-stand-apart]]
test("every forced copy of the session file says what the hand module says", () => {
  for (const path of [
    ".claude/skills/level0/hooks/level0.js",
    ".claude/skills/level0/lib/pull.js",
  ]) {
    assert.match(here.read(path), new RegExp(`"${SESSION}"`), path);
  }
  assert.doesNotMatch(
    here.read(".claude/skills/level0/hooks/pull-tool.js"),
    new RegExp(`"${SESSION}"`),
    "the hook imports the path from the library beside it",
  );
});

// [[spec/design_output/level0#a-name-meets-the-cap]]
test("a tracked name past the cap is refused", () => {
  const long = Array.from({ length: words + 1 }, (_, i) => `word${i}`).join("-");
  const found = nameHoldsTheWords(fakeTree({}, [`src/${long}.js`]));

  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "NameHoldsTheWords");
  assert.match(found[0].message, new RegExp(String(words)));
  assert.deepEqual(nameHoldsTheWords(here), []);
});

// [[spec/design_output/tools#what-the-survey-names]]
test("an install of a tool the survey misses is refused", () => {
  const found = surveyNamesInstalls(
    fakeTree({
      [INSTALL]: `${text(INSTALL)}\nhere() {\n  case $1 in\n    zig) [ -x "$bin/zig" ] ;;\n  esac\n}\n`,
    }),
  );

  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "SurveyNamesInstalls");
  assert.match(found[0].message, /zig/);
  assert.deepEqual(surveyNamesInstalls(here), []);
});

// [[spec/design_output/tools#what-the-survey-writes]]
test("a survey naming another node is refused", () => {
  const stale = surveyFindsNode(
    fakeTree({ [TOOLS]: JSON.stringify({ node: { version: "18.0.0" } }, null, 2) }),
  );

  assert.equal(stale.length, 1);
  assert.equal(stale[0].rule, "SurveyFindsNode");
  assert.match(stale[0].message, /18\.0\.0/);

  const absent = surveyFindsNode(fakeTree({}));
  assert.equal(absent.length, 1);
  assert.equal(absent[0].file, INSTALL);
  assert.deepEqual(surveyFindsNode(here), []);
});

// [[spec/design_output/config#the-editor-draws-the-schema]]
test("the editor draws the schema over the config, with no extension", () => {
  const drawn = read(EDITOR_SETTINGS)["json.schemas"] ?? [];
  const one = drawn.find((said) => said.fileMatch?.includes(`/${TRACKED}`));

  assert.ok(one, `a schema stands over ${TRACKED}`);
  assert.equal(one.url, `./${SCHEMA}`);
  assert.equal(files.exists(join(root, SCHEMA)), true, "the schema stands there");
});

// [[spec/design_output/config#the-schema-says-the-type]]
test("the schema passes the config this tree ships, and refuses one short a field", async () => {
  assert.deepEqual(await settings.faults(), []);

  const short = flatten(read(TRACKED));
  short.delete("stop.mostInARow");
  assert.deepEqual(faultsIn(read(SCHEMA), short), ["stop.mostInARow is missing"]);
});

// [[spec/design_output/extension#the-grid-check]]
test("the schema this tree ships places every widget in a cell of its own", () => {
  assert.deepEqual(gridFaults(read(SCHEMA)), []);
});

// [[spec/design_output/extension#one-declaration-draws-it]]
test("seven controls draw, and the work buttons stand declared and undrawn", () => {
  const schema = read(SCHEMA);
  assert.deepEqual(
    drawnIn(schema).map((one) => one.key),
    [
      "stop.hold",
      "ask.wanted",
      "bridge.hook",
      "log.open",
      "engine.vehicle",
      "engine.stub",
      "engine.binding",
    ],
  );

  const waiting = entriesIn(schema).filter((one) => one.widget && !one.group);
  assert.deepEqual(
    waiting.map((one) => one.key),
    ["work.editor", "work.pull", "work.new"],
  );
  for (const one of waiting) {
    assert.ok(one.help, `${one.key} says what it is`);
  }
});

// [[spec/design_output/extension#a-click-writes-the-file]]
test("every widget writing a key names one the declaration carries", () => {
  const said = flatten(read(TRACKED));
  for (const one of drawnIn(read(SCHEMA))) {
    if (one.widget === "action" || one.widget === "process") continue;
    assert.ok(said.has(one.key), `${one.key} stands in ${TRACKED}`);
    assert.ok(one.options.includes(said.get(one.key)), `${one.key} rests on an option`);
  }
});

// [[spec/design_output/extension#a-button-names-its-commands]]
test("every slash command a button's hover names stands in .claude/commands", () => {
  const standing = new Set(
    files.list(join(root, ".claude", "commands")).map((one) => one.name),
  );
  const named = drawnIn(read(SCHEMA)).flatMap((one) => commandsOf(one));
  assert.ok(
    named.includes("/se-agent-control-hold-stop"),
    "the hold button names its far end",
  );
  for (const one of named) {
    assert.ok(standing.has(`${one.slice(1)}.md`), `${one} stands as a command`);
  }
  assert.equal(commandsOf({ key: "log.open", widget: "action" }).length, 0);
});

// [[spec/design_output/extension#the-sidebar-draws-the-tree]]
test("npm reaches the extension and the tense reader, and nothing else at the root", () => {
  const said = proc().run(["git", "ls-files", "*package.json"], { cwd: root });
  const paths = said.stdout.split(/\r?\n/).filter(Boolean);

  assert.ok(paths.includes("package.json"), "the root names one");
  // A trial's manifest names no dependency, so npm reaches nothing through it. [[spec/design_output/work#an-experiment-decides]]
  for (const path of paths) {
    if (path === "package.json" || /^src\/extension\//.test(path)) continue;
    assert.match(path, /^\.claude\/skills\/[^/]+\/package\.json$/, `${path} stands under the extension or a trial`);
    assert.deepEqual(read(path).dependencies ?? {}, {}, `${path} names no dependency`);
  }

  const bare = read("package.json");
  assert.deepEqual(Object.keys(bare.dependencies ?? {}).sort(), [
    "wink-eng-lite-web-model",
    "wink-nlp",
  ]);
  assert.equal(bare.devDependencies, undefined);
});

// [[spec/design_output/extension#the-editor-is-a-door]]
test("the extension imports the editor, its own folder, and what it declares", () => {
  const found = proc().run(["git", "ls-files", "src/extension/**.js"], { cwd: root });
  const paths = found.stdout.split(/\r?\n/).filter(Boolean);
  assert.ok(paths.length > 5, "the extension carries its modules");

  const declared = Object.keys(read("src/extension/package.json").dependencies ?? {});
  const named = (said) =>
    declared.some((one) => said === one || said.startsWith(`${one}/`));

  for (const path of paths) {
    const text = files.read(join(root, path));
    for (const hit of text.matchAll(/(?:from|require\()\s*["']([^"']+)["']/g)) {
      const said = hit[1];
      if (said === "vscode" || said.startsWith("node:") || named(said)) continue;
      assert.match(said, /^\.\.?\//, `${path} imports ${said} as a path of its own`);
      assert.ok(!said.includes("../../"), `${path} stays inside src/extension`);
    }
  }
});

// [[spec/design_output/lsp#one-checker-every-front-asks]]
test("every package the extension declares carries an exact version", () => {
  const declared = read("src/extension/package.json").dependencies ?? {};
  for (const [name, said] of Object.entries(declared)) {
    assert.match(said, /^\d+\.\d+\.\d+$/, `${name} names one version and no range`);
  }
});

// The brand folder and the stub's template carry no version, so no second copy drifts from package.json. [[spec/design_output/vehicle#one-file-holds-the-version]]
test("no manifest source git holds names a version of its own", () => {
  for (const one of [
    "spec/config/brand/plugin.json",
    "spec/config/brand/marketplace.json",
    "src/stub/.claude/skills/level0/.claude-plugin/plugin.json",
  ]) {
    assert.equal(read(one).version, undefined, one);
  }
});

// [[spec/design_output/stop#the-mechanical-checks]]
test("every mechanical check the stop table names stands in the stop door", () => {
  const hook = files.read(join(root, "src", "bridge", "stop.js"));
  const at = join(root, STOP);
  const named = pool(
    namesIn(at, ".yml").map((name) => ({ name, text: files.read(join(at, name)) })),
  ).rules.filter((one) => one.decides === "mechanical");

  assert.ok(named.length, "the table names a mechanical rule");
  for (const one of named) {
    assert.match(hook, new RegExp(`"${one.runs}"`), `the hook answers ${one.runs}`);
  }
});

// [[spec/design_output/config#a-variable-names-a-key]]
test("every key this tree ships names one variable, and it names the key back", () => {
  const keys = [...flatten(read(TRACKED)).keys()];
  assert.ok(keys.length, "the tracked file carries a key");

  for (const key of keys) {
    assert.equal(keyOf(varOf(key)), key, `${varOf(key)} names ${key}`);
  }
});
