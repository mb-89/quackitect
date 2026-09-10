// The tracked files of this tree, read from the real disk. A fake seeded with
// what a test wants to find proves nothing about the tree, so these cases take
// the disk door and stand here.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
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
