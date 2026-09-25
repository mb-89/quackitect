// One config on every road. A project's own rule refuses a write at the door,
// and this holds the answer gate, the findings road and the copilot road to the
// same config the assembly writes, through the real Vale.
// [[spec/tickets/every-road-reads-one-config]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { findingsOver } from "../../src/bridge/findings.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { vale } from "../../src/doors/vale.js";
import { readTools, whereIs } from "../../src/engine/tools.js";
import { assemble, STYLES } from "../../src/scripts/styles.js";

const method = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const bin = whereIs(files, method, "vale", readTools(files, method));
const ifVale = files.exists(bin) ? test : skip;

const RULE = "VoiceProject.Ours";
const WORD = "quackword";
const NOTE = "notes.md";
const TEXT = `The door reads ${WORD} and refuses it.\n`;

// A work root beside this tree, holding one rule of its own and a config naming it. [[spec/tickets/every-road-reads-one-config]]
function workRoot() {
  const work = files.tempDir("one-config-");
  files.makeDir(join(work, ...STYLES.split("/"), "VoiceProject"));
  files.write(
    join(work, ...STYLES.split("/"), "VoiceProject", "Ours.yml"),
    [
      "extends: existence",
      `message: "The word %s stands outside this project."`,
      "level: error",
      "tokens:",
      `  - ${WORD}`,
      "",
    ].join("\n"),
  );
  files.write(
    join(work, ".vale.ini"),
    [
      `StylesPath = ${STYLES}`,
      "MinAlertLevel = suggestion",
      "",
      "[*.md]",
      "BasedOnStyles = VoiceVale, VoiceProject",
      "",
    ].join("\n"),
  );
  files.write(join(work, NOTE), TEXT);
  return work;
}

ifVale("a rule a project alone carries refuses on every road", async () => {
  const work = workRoot();
  try {
    const door = vale(files, outside, method, work);
    const gate = await door.lint(TEXT, NOTE);
    assert.ok(gate.ran, `the answer gate ran: ${gate.why}`);
    assert.ok(gate.found.some((one) => one.rule === RULE), "the answer gate refuses the word");

    const findings = await findingsOver(
      { disk: files, proc: outside, join, root: work, method, work, vale: bin, biome: "", ceilings: { function: 150, file: 600 } },
      [NOTE],
    );
    assert.equal(findings.fault, "");
    assert.ok(findings.found.some((one) => one.rule === RULE), "the findings road refuses the word");

    const runtime = await import("../../.claude/skills/level0/lib/copilot-runtime.js");
    assert.equal(typeof runtime.check, "function", "the copilot road's check stands exported");
    const run = async (argv, init) => outside.run(argv, { ...init, cwd: work });
    const config = assemble(files, { method, work, itself: false }).config;
    const copilot = await runtime.check(TEXT, NOTE, { vale: bin, biome: "", run, config, cwd: work });
    assert.match(copilot, new RegExp(RULE), "the copilot road refuses the word");
  } finally {
    files.remove(work);
  }
});

// A second fail sends the ticket to a person, so the knob names the person. [[spec/tickets/one-review-a-ticket]]
test("the doors read work.failsBeforePerson into the fail cap, and the config names no failsBeforeWait", async () => {
  const { it } = await import("../../src/scripts/cli-doors.js");
  const config = JSON.parse(files.read(join(method, "spec", "config", "level0.json")));
  const schema = JSON.parse(files.read(join(method, "spec", "config", "level0.schema.json")));

  assert.equal(config.work.failsBeforeWait, undefined, "the old key leaves the config");
  assert.equal(schema.properties.work.properties.failsBeforeWait, undefined, "and the schema");
  assert.equal(typeof config.work.failsBeforePerson, "number", "the config names the new key");
  assert.equal(
    schema.properties.work.properties.failsBeforePerson?.type,
    "number",
    "the schema declares it",
  );
  assert.equal(it.fails, config.work.failsBeforePerson, "the doors read it into the fail cap");
});
