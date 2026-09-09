// The tracked files of this tree, read from the real disk. A fake seeded with
// what a test wants to find proves nothing about the tree, so these cases take
// the disk door and stand here.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { actionables, envOf } from "../../.claude/skills/level0/lib/guidance.js";
import { nameOf, rowOf } from "../../.claude/skills/level0/lib/log.js";
import { overLong, WORDS } from "../../.claude/skills/level0/lib/names.js";
import { readRule } from "../../.claude/skills/level0/lib/rulefile.js";
import { pathInScript, SCRIPT } from "../../.claude/skills/level0/lib/scripts.js";
import {
  EDITOR_EXTENSIONS,
  EDITOR_SETTINGS,
  EXTENSIONS,
  namesTheBinaries,
} from "../../.claude/skills/level0/lib/servers.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();

const GUIDANCE = join(root, "spec", "guidance");
const JUDGED = join(root, "spec", "config", "styles", "VoiceJudged");
const SCRIPTS = join(root, "src", "scripts");

const read = (where) => JSON.parse(files.read(join(root, where)));
const namesIn = (at, end) =>
  files
    .list(at)
    .filter((one) => one.kind === "file" && one.name.endsWith(end))
    .map((one) => one.name);

test("every guidance note in this tree carries actionables", () => {
  const notes = namesIn(GUIDANCE, ".md");
  assert.ok(notes.length, "there is at least one guidance note");
  for (const name of notes) {
    const rules = actionables(files.read(join(GUIDANCE, name)));
    assert.ok(rules.length, `${name} carries an Actionables chapter`);
    assert.ok(
      rules.length <= 10,
      `${name} holds ten rules or fewer, and holds ${rules.length}`,
    );
  }
});

test("every guidance note in this tree names variables that exist or none", () => {
  for (const name of namesIn(GUIDANCE, ".md")) {
    for (const one of envOf(files.read(join(GUIDANCE, name)))) {
      assert.match(one, /^[A-Z][A-Z0-9_]*$/, `${name} names ${one} as a variable`);
    }
  }
});

test("every script in this tree passes the rule", () => {
  const scripts = namesIn(SCRIPTS, "").filter((n) => SCRIPT.test(n));
  assert.ok(scripts.length, "there is at least one script");
  for (const name of scripts) {
    const text = files.read(join(SCRIPTS, name));
    assert.deepEqual(pathInScript(text, name), [], `${name} interpolates no path`);
  }
});

test("every judged rule in this tree carries what the judge needs", () => {
  const rules = namesIn(JUDGED, ".yml").map((name) => ({
    ...readRule(files.read(join(JUDGED, name))),
    name: name.replace(/\.yml$/, ""),
  }));
  assert.ok(rules.length, "VoiceJudged holds at least one rule");
  for (const rule of rules) {
    assert.ok(rule.ask, `${rule.name} asks a question`);
    assert.ok(
      Array.isArray(rule.labels) && rule.labels.length >= 2,
      `${rule.name} offers labels`,
    );
    assert.ok(
      rule.labels.includes(rule.refuses),
      `${rule.name} refuses one of its own labels`,
    );
    assert.ok(rule.message, `${rule.name} says what to write instead`);
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
  const settings = read(EDITOR_SETTINGS);
  assert.equal(settings["vale.enableSpellcheck"], false);
  assert.equal(settings["vale.valeCLI.minAlertLevel"], "inherited");
  assert.equal(settings["vale.valeCLI.lintOnChange"], true);
});

test("Windows takes the biome extension, and every other platform the plain name", () => {
  const paths = read(EDITOR_SETTINGS)["biome.lsp.bin"];
  for (const [platform, path] of Object.entries(paths)) {
    const wants = platform.startsWith("win32") ? ".se/bin/biome.exe" : ".se/bin/biome";
    assert.equal(path, wants, platform);
  }
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

test("the judge settings this tree ships carry every field the judge reads", () => {
  const said = read("spec/config/level0.json").judge;
  assert.equal(typeof said.enabled, "boolean");
  assert.equal(typeof said.model, "string");
  for (const field of ["maxSpans", "warmupWrites", "thenEveryNth"]) {
    assert.equal(typeof said[field], "number", `judge.${field} is a number`);
  }
});

// [[spec/design_output/level0#a-name-holds-five-words]]
test("every tracked name in this tree holds five words", () => {
  const said = proc().run(["git", "ls-files"], { cwd: root });
  assert.equal(said.exitCode, 0, "git lists what it tracks");

  const long = said.stdout
    .split(/\r?\n/)
    .map((one) => one.trim())
    .filter(Boolean)
    .map((path) => [path, overLong(path)])
    .filter(([, part]) => part);

  assert.deepEqual(long, [], `a name holds ${WORDS} words: ${JSON.stringify(long)}`);
});
