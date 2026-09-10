// The tracked files of this tree, read from the real disk. A fake seeded with
// what a test wants to find proves nothing about the tree, so these cases take
// the disk door and stand here.
// [[spec/guidance/testing]]

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
import { nameOf, rowOf } from "../../.claude/skills/level0/lib/log.js";
import { overLong } from "../../.claude/skills/level0/lib/names.js";
import { pathInScript, SCRIPT } from "../../.claude/skills/level0/lib/scripts.js";
import {
  EDITOR_EXTENSIONS,
  EDITOR_SETTINGS,
  EXTENSIONS,
  namesTheBinaries,
} from "../../.claude/skills/level0/lib/servers.js";
import { installedTools, WANTED } from "../../.claude/skills/level0/lib/tools.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { survey } from "../../src/scripts/tools.js";
import { decide, pool } from "../../.claude/skills/level0/lib/stop.js";
import { faultsIn as gridFaults } from "../../src/extension/lib/grid.js";
import { drawnIn, entriesIn } from "../../src/extension/lib/widgets.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();

const SCRIPTS = join(root, "src", "scripts");
const STOP = join(root, "spec", "config", "stop");

const read = (where) => JSON.parse(files.read(join(root, where)));
const settings = configOf({
  read: async (where) => files.read(join(root, where)),
  readEnv: async () => ({}),
});
const namesIn = (at, end) =>
  files
    .list(at)
    .filter((one) => one.kind === "file" && one.name.endsWith(end))
    .map((one) => one.name);

test("every script in this tree passes the rule", () => {
  const scripts = namesIn(SCRIPTS, "").filter((n) => SCRIPT.test(n));
  assert.ok(scripts.length, "there is at least one script");
  for (const name of scripts) {
    const text = files.read(join(SCRIPTS, name));
    assert.deepEqual(pathInScript(text, name), [], `${name} interpolates no path`);
  }
});

// [[spec/design_output/bash#the-description-names-verbs]]
test("every verb the Bash description names stands in the command line", () => {
  const said = files.read(join(SCRIPTS, "cli.js"));
  assert.ok(VERBS.length, "the description names at least one verb");
  for (const verb of VERBS) {
    assert.match(said, new RegExp(`\\n  ${verb}: \\{`), `./RUNME.sh ${verb} stands`);
  }
});

test("the tracked settings name the binaries this tree installs", () => {
  assert.deepEqual(namesTheBinaries(read(EDITOR_SETTINGS)), {
    vale: true,
    valeConfig: true,
    managesVale: true,
    biome: true,
    biomeConfig: true,
  });
});

test("the editor draws the rules the write door draws, and no others", () => {
  const editor = read(EDITOR_SETTINGS);
  assert.equal(editor["vale.enableSpellcheck"], false);
  assert.equal(editor["vale.valeCLI.minAlertLevel"], "inherited");
  assert.equal(editor["vale.valeCLI.lintOnChange"], true);
});

test("Windows takes the biome extension, and every other platform the plain name", () => {
  const paths = read(EDITOR_SETTINGS)["biome.lsp.bin"];
  for (const [platform, path] of Object.entries(paths)) {
    const wants = platform.startsWith("win32") ? ".se/bin/biome.exe" : ".se/bin/biome";
    assert.equal(path, wants, platform);
  }
});

// [[spec/design_output/config#the-editor-draws-the-schema]]
test("the editor draws the schema over the config, with no extension", () => {
  const drawn = read(EDITOR_SETTINGS)["json.schemas"] ?? [];
  const one = drawn.find((said) => said.fileMatch?.includes(`/${TRACKED}`));

  assert.ok(one, `a schema stands over ${TRACKED}`);
  assert.equal(one.url, `./${SCHEMA}`);
  assert.equal(files.exists(join(root, SCHEMA)), true, "the schema stands there");
});

test("a clone opens with both extensions recommended", () => {
  assert.deepEqual(read(EDITOR_EXTENSIONS).recommendations, EXTENSIONS);
});

test("the lnav format reads the file the log door writes", () => {
  const format = read("spec/config/lnav/quackitect.json").quackitect_log;
  const row = rowOf("2026-09-08T14:22:51.000Z", "warn", "write", "refused");

  assert.equal(format.json, true);
  assert.equal(format["timestamp-field"], "at");
  assert.equal(format["level-field"], "level");
  assert.equal(format["body-field"], "said");
  assert.deepEqual(
    format["line-format"].filter((one) => one.field).map((one) => one.field),
    Object.keys(row),
  );
  assert.deepEqual(Object.keys(JSON.parse(format.sample[0].line)), Object.keys(row));
  assert.deepEqual(Object.values(format.level).sort(), ["error", "info", "warn"]);
  assert.match(
    `.se/log/${nameOf(row.at, "a6f8c43b")}`,
    new RegExp(format["file-pattern"]),
  );
});

// [[spec/design_output/stop#where-the-rules-live]]
test("a second file in the folder adds a rule with no code change", () => {
  const mine = namesIn(STOP, ".yml").map((name) => ({
    name,
    text: files.read(join(STOP, name)),
  }));
  const said = pool([
    ...mine,
    {
      name: "level1.yml",
      text: "- id: a-later-level\n  side: stop\n  priority: 20\n  decides: claimed\n  asks: Later?\n  says: A later level says so.\n",
    },
  ]);
  assert.deepEqual(said.broken, []);
  assert.equal(said.rules.length, pool(mine).rules.length + 1);
  assert.equal(
    decide(said.rules, { claimed: "a-later-level", ran: () => false }).ends,
    true,
  );
});

// [[spec/design_output/log#nothing-here-deletes-a-log]]
test("no code path in this tree deletes a log file", () => {
  const said = proc().run(["git", "ls-files", "src/*.js", ".claude/*.js"], {
    cwd: root,
  });
  assert.equal(said.exitCode, 0, "git lists what it tracks");

  const found = [];
  for (const path of said.stdout.split(/\r?\n/).filter(Boolean)) {
    for (const line of files.read(join(root, path)).split(/\r?\n/)) {
      const deletes = /\bremove\(|\bunlink|\brm\b|\bprune\b/.test(line);
      if (deletes && /log/i.test(line)) found.push(`${path}: ${line.trim()}`);
    }
  }
  assert.deepEqual(found, []);
});

// [[spec/design_output/config#the-schema-says-the-type]]
test("the schema passes the config this tree ships, and refuses one short a field", async () => {
  assert.deepEqual(await settings.faults(), []);

  const short = flatten(read(TRACKED));
  short.delete("judge.maxSpans");
  assert.deepEqual(faultsIn(read(SCHEMA), short), ["judge.maxSpans is missing"]);
});

// [[spec/design_output/extension#the-grid-check]]
test("the schema this tree ships places every widget in a cell of its own", () => {
  assert.deepEqual(gridFaults(read(SCHEMA)), []);
});

// [[spec/design_output/extension#one-declaration-draws-it]]
test("three controls draw, and the level one widgets stand declared and undrawn", () => {
  const schema = read(SCHEMA);
  assert.deepEqual(
    drawnIn(schema).map((one) => one.key),
    ["stop.hold", "ask.wanted", "log.open"],
  );

  const waiting = entriesIn(schema).filter((one) => one.widget && !one.group);
  assert.deepEqual(
    waiting.map((one) => one.key),
    ["engine.state", "engine.binding", "engine.autonomy"],
  );
  for (const one of waiting) {
    assert.ok(one.help, `${one.key} says what it is`);
  }
});

// [[spec/design_output/extension#a-click-writes-the-file]]
test("every widget writing a key names one the declaration carries", () => {
  const said = flatten(read(TRACKED));
  for (const one of drawnIn(read(SCHEMA))) {
    if (one.widget === "action") continue;
    assert.ok(said.has(one.key), `${one.key} stands in ${TRACKED}`);
    assert.ok(one.options.includes(said.get(one.key)), `${one.key} rests on an option`);
  }
});

// [[spec/design_output/extension#the-sidebar-draws-the-tree]]
test("npm reaches the extension alone, and the root of the tree stays bare", () => {
  const said = proc().run(["git", "ls-files", "*package.json"], { cwd: root });
  const paths = said.stdout.split(/\r?\n/).filter(Boolean);

  assert.ok(paths.includes("package.json"), "the root names one");
  for (const path of paths) {
    if (path === "package.json") continue;
    assert.match(path, /^src\/extension\//, `${path} stands under the extension`);
  }

  const bare = read("package.json");
  assert.equal(bare.dependencies, undefined);
  assert.equal(bare.devDependencies, undefined);
});

// [[spec/design_output/extension#the-editor-is-a-door]]
test("the extension imports the editor and its own folder, and nothing else", () => {
  const found = proc().run(["git", "ls-files", "src/extension/**.js"], { cwd: root });
  const paths = found.stdout.split(/\r?\n/).filter(Boolean);
  assert.ok(paths.length > 5, "the extension carries its modules");

  for (const path of paths) {
    const text = files.read(join(root, path));
    for (const hit of text.matchAll(/(?:from|require\()\s*["']([^"']+)["']/g)) {
      const said = hit[1];
      if (said === "vscode") continue;
      assert.match(said, /^\.\.?\//, `${path} imports ${said} as a path of its own`);
      assert.ok(!said.includes("../../"), `${path} stays inside src/extension`);
    }
  }
});

// [[spec/design_output/stop#the-mechanical-checks]]
test("every mechanical check the stop table names stands in the hook", () => {
  const hook = files.read(join(root, ".claude", "skills", "level0", "hooks", "level0.js"));
  const named = pool(
    namesIn(STOP, ".yml").map((name) => ({ name, text: files.read(join(STOP, name)) })),
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

// [[spec/design_output/level0#a-name-holds-five-words]]
test("every tracked name in this tree holds the words the config says", async () => {
  const words = await settings.ask("names.words");
  assert.ok(words > 0, "the config says how many words a name holds");

  const said = proc().run(["git", "ls-files"], { cwd: root });
  assert.equal(said.exitCode, 0, "git lists what it tracks");

  const long = said.stdout
    .split(/\r?\n/)
    .map((one) => one.trim())
    .filter(Boolean)
    .map((path) => [path, overLong(path, words)])
    .filter(([, part]) => part);

  assert.deepEqual(long, [], `a name holds ${words} words: ${JSON.stringify(long)}`);
});

// [[spec/design_output/tools#what-the-survey-names]]
test("the survey names every tool the install script installs", () => {
  const installs = installedTools(files.read(join(SCRIPTS, "install.sh")));
  assert.ok(installs.length, "the install script names the tools it installs");

  const wanted = WANTED.map((one) => one.name);
  for (const name of installs) {
    assert.ok(wanted.includes(name), `the survey names ${name}`);
  }
});

test("the survey finds the node running it, and reads its version back", () => {
  const found = survey({ disk: files, proc: proc() }, root, process.env);

  assert.ok(found.node, "node stands on this box");
  assert.equal(found.node.version, process.version.replace(/^v/, ""));
});
