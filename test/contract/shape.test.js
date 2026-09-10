// The shape rules, through the real Vale. Each one draws in the editor, so a
// case here feeds Vale a bad file and asserts the rule refuses it.
// [[spec/design_output/level0#where-a-rule-lives]]

import assert from "node:assert/strict";
import { dirname } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { lintText } from "../../.claude/skills/level0/lib/vale.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { readTools, whereIs } from "../../src/scripts/tools.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const bin = whereIs(files, root, "vale", readTools(files, root));
const ifVale = files.exists(bin) ? test : skip;

const run = async (argv, init = {}) =>
  outside.run(argv, { ...init, cwd: init.cwd ?? root });

const ruled = async (text, where) => {
  const said = await lintText(text, where, { bin, run });
  assert.ok(said.ran, `vale ran: ${said.why}`);
  return said.found.map((one) => one.rule);
};

const NOTE = "spec/guidance/probe.md";
const JUDGED = "spec/config/styles/VoiceJudged/Probe.yml";
const STOP = "spec/config/stop/probe.yml";
const SHELL = "src/scripts/probe.sh";
const POWERSHELL = "src/scripts/probe.ps1";

const front = (rows) => `---\nkind: [[guidance]]\n${rows}---\n\n`;
const chapter = (n) =>
  `# Actionables\n\n${Array.from({ length: n }, (_, i) => `${i + 1}. Do the thing. *`).join("\n")}\n`;

ifVale("a guidance note with no Actionables chapter is refused", async () => {
  const bad = `${front("")}# Nothing here\n\nA note carrying no chapter.\n`;
  assert.ok((await ruled(bad, NOTE)).includes("VoiceShape.GuidanceChapter"));

  const good = front("") + chapter(2);
  assert.ok(!(await ruled(good, NOTE)).includes("VoiceShape.GuidanceChapter"));
});

ifVale("a guidance note past the rule cap is refused", async () => {
  assert.ok(
    (await ruled(front("") + chapter(16), NOTE)).includes("VoiceShape.GuidanceCap"),
  );
  assert.ok(
    !(await ruled(front("") + chapter(15), NOTE)).includes("VoiceShape.GuidanceCap"),
  );
});

ifVale("a variable named in lower case is refused", async () => {
  const bad = front("env:\n  - lower_name\n") + chapter(1);
  assert.ok((await ruled(bad, NOTE)).includes("VoiceShape.GuidanceEnv"));

  const good = front("env:\n  - SE_CLOUD\n") + chapter(1);
  assert.ok(!(await ruled(good, NOTE)).includes("VoiceShape.GuidanceEnv"));
});

ifVale("a judged rule missing what the judge reads is refused", async () => {
  const bad = 'extends: judge\nmessage: "Say it."\nlabels:\n  - one\nrefuses: two\n';
  assert.ok((await ruled(bad, JUDGED)).includes("VoiceShape.JudgedRule"));

  const good =
    'extends: judge\nmessage: "Say it."\nask: "Does it act?"\nlabels:\n  - one\n  - two\nrefuses: two\n';
  assert.ok(!(await ruled(good, JUDGED)).includes("VoiceShape.JudgedRule"));
});

ifVale("a stop rule missing a field, or naming no side, is refused", async () => {
  const short = "- id: a-rule\n  side: stop\n  priority: 5\n";
  assert.ok((await ruled(short, STOP)).includes("VoiceShape.StopRule"));

  const sideways =
    "- id: a-rule\n  side: sideways\n  priority: 5\n  decides: claimed\n  says: A thing.\n";
  assert.ok((await ruled(sideways, STOP)).includes("VoiceShape.StopRule"));

  const good =
    "- id: a-rule\n  side: stop\n  priority: 5\n  decides: claimed\n  says: A thing.\n";
  assert.ok(!(await ruled(good, STOP)).includes("VoiceShape.StopRule"));
});

// [[spec/design_output/level0#the-rules-past-one-buffer]]
const PATH_RULE = "VoiceScript.NoPathInScript";

ifVale("an interpolated path in a shell script is refused", async () => {
  const bad = '#!/usr/bin/env sh\nnode -e "require(\'$root/lib.js\')"\n';
  assert.ok((await ruled(bad, SHELL)).includes(PATH_RULE));

  const good = '#!/usr/bin/env sh\ncd "$root" && node -e "require(\'./lib.js\')"\n';
  assert.ok(!(await ruled(good, SHELL)).includes(PATH_RULE));
});

ifVale("an interpolated path in a PowerShell script is refused", async () => {
  const bad = 'node --input-type=module -e "import \'$root/lib.js\'"\n';
  assert.ok((await ruled(bad, POWERSHELL)).includes(PATH_RULE));

  const good = 'node --input-type=module -e "import \'./lib.js\'"\n';
  assert.ok(!(await ruled(good, POWERSHELL)).includes(PATH_RULE));
});

ifVale("a commented path, and a plain copy, pass the script rule", async () => {
  const commented = '# node -e "require(\'$root/lib.js\')"\n';
  assert.ok(!(await ruled(commented, SHELL)).includes(PATH_RULE));

  const copied = 'cp "$tmp/$name" "$bin/vale"\n';
  assert.ok(!(await ruled(copied, SHELL)).includes(PATH_RULE));
});

ifVale("no prose rule reaches a shell script", async () => {
  const said = await ruled('#!/usr/bin/env sh\n# The tree was installed here.\n', SHELL);
  assert.deepEqual(
    said.filter((one) => one.startsWith("VoiceVale.")),
    [],
  );
});
