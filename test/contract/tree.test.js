// The rules over two files, and the tracked files they read. Each case breaks
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
import {
  EDITOR_EXTENSIONS,
  EDITOR_SETTINGS,
} from "../../.claude/skills/level0/lib/servers.js";
import { TOOLS } from "../../.claude/skills/level0/lib/tools.js";
import {
  biomeOnWindows,
  editorDrawsWriteRules,
  extensionsOnOffer,
  INSTALL,
  lnavReadsTheLog,
  LNAV,
  nameHoldsTheWords,
  noLogDeleted,
  settingsNameBinaries,
  stopFolderIsData,
  surveyFindsNode,
  surveyNamesInstalls,
  treeFaults,
  treeOf,
  VALE_INI,
} from "../../.claude/skills/level0/lib/tree.js";
import { disk } from "../../src/doors/disk.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { git } from "../../src/doors/git.js";
import { proc } from "../../src/doors/proc.js";

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
const here = treeOf({
  disk: files,
  git: git(outside, root),
  root,
  words,
  node: NODE,
});

const fakeTree = (seed, paths = [], node = NODE) =>
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
  });

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
      [VALE_INI]: text(VALE_INI),
    }),
  );

  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "EditorDrawsWriteRules");
  assert.match(found[0].message, /inherited/);
  assert.deepEqual(editorDrawsWriteRules(here), []);
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
        said["biome.lsp.bin"]["win32-x64"] = ".se/bin/biome";
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

test("an lnav format reading another field is refused", () => {
  const found = lnavReadsTheLog(
    fakeTree({
      [LNAV]: edited(LNAV, (said) => {
        said.quackitect_log["body-field"] = "message";
      }),
    }),
  );

  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "LnavReadsTheLog");
  assert.match(found[0].message, /body-field/);
  assert.deepEqual(lnavReadsTheLog(here), []);
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

// [[spec/design_output/level0#a-name-holds-five-words]]
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
  short.delete("judge.maxSpans");
  assert.deepEqual(faultsIn(read(SCHEMA), short), ["judge.maxSpans is missing"]);
});

// [[spec/design_output/config#a-variable-names-a-key]]
test("every key this tree ships names one variable, and it names the key back", () => {
  const keys = [...flatten(read(TRACKED)).keys()];
  assert.ok(keys.length, "the tracked file carries a key");

  for (const key of keys) {
    assert.equal(keyOf(varOf(key)), key, `${varOf(key)} names ${key}`);
  }
});
