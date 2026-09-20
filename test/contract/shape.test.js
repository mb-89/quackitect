// The shape rules, through the real Vale. Each one draws in the editor, so a
// case here feeds Vale a bad file and asserts the rule refuses it, off the one
// run the helper makes for this file.
// [[spec/design_output/level0#where-a-rule-lives]]

import assert from "node:assert/strict";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { at, rulesIn } from "./ruled.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const { ifVale, proves } = rulesIn(root);

const NOTE = "spec/guidance/probe.md";
const STOP = "spec/config/stop/probe.yml";
const SHELL = "src/scripts/probe.sh";
const POWERSHELL = "src/scripts/probe.ps1";

const note = (text) => at(text, NOTE);
const stop = (text) => at(text, STOP);
const shell = (text) => at(text, SHELL);

const front = (rows) => `---\nkind: [[guidance]]\n${rows}---\n\n`;
const chapter = (n) =>
  `# Actionables\n\n${Array.from({ length: n }, (_, i) => `${i + 1}. Do the thing. *`).join("\n")}\n`;

const refuses = (said, rule, key) =>
  assert.ok(said.rules(key).includes(rule), `${rule} fires on ${key}`);
const passes = (said, rule, key) =>
  assert.ok(!said.rules(key).includes(rule), `${rule} stays quiet on ${key}`);

ifVale(
  "a guidance note with no Actionables chapter is refused",
  proves(
    {
      bad: note(`${front("")}# Nothing here\n\nA note carrying no chapter.\n`),
      good: note(front("") + chapter(2)),
    },
    (said) => {
      refuses(said, "VoiceShape.GuidanceChapter", "bad");
      passes(said, "VoiceShape.GuidanceChapter", "good");
    },
  ),
);

ifVale(
  "a guidance note past the rule cap is refused",
  proves(
    { over: note(front("") + chapter(16)), under: note(front("") + chapter(15)) },
    (said) => {
      refuses(said, "VoiceShape.GuidanceCap", "over");
      passes(said, "VoiceShape.GuidanceCap", "under");
    },
  ),
);

ifVale(
  "a variable named in lower case is refused",
  proves(
    {
      lower: note(front("env:\n  - lower_name\n") + chapter(1)),
      upper: note(front("env:\n  - SE_CLOUD\n") + chapter(1)),
    },
    (said) => {
      refuses(said, "VoiceShape.GuidanceEnv", "lower");
      passes(said, "VoiceShape.GuidanceEnv", "upper");
    },
  ),
);

ifVale(
  "a stop rule missing a field, or naming no side, is refused",
  proves(
    {
      short: stop("- id: a-rule\n  side: stop\n  priority: 5\n"),
      sideways: stop(
        "- id: a-rule\n  side: sideways\n  priority: 5\n  decides: claimed\n  says: A thing.\n",
      ),
      good: stop(
        "- id: a-rule\n  side: stop\n  priority: 5\n  decides: claimed\n  says: A thing.\n",
      ),
    },
    (said) => {
      refuses(said, "VoiceShape.StopRule", "short");
      refuses(said, "VoiceShape.StopRule", "sideways");
      passes(said, "VoiceShape.StopRule", "good");
    },
  ),
);

// [[spec/design_output/level0#the-rules-past-one-buffer]]
const PATH_RULE = "VoiceScript.NoPathInScript";

ifVale(
  "an interpolated path in a shell script is refused",
  proves(
    {
      bad: shell("#!/usr/bin/env sh\nnode -e \"require('$root/lib.js')\"\n"),
      good: shell('#!/usr/bin/env sh\ncd "$root" && node -e "require(\'./lib.js\')"\n'),
    },
    (said) => {
      refuses(said, PATH_RULE, "bad");
      passes(said, PATH_RULE, "good");
    },
  ),
);

ifVale(
  "an interpolated path in a PowerShell script is refused",
  proves(
    {
      bad: at("node --input-type=module -e \"import '$root/lib.js'\"\n", POWERSHELL),
      good: at("node --input-type=module -e \"import './lib.js'\"\n", POWERSHELL),
    },
    (said) => {
      refuses(said, PATH_RULE, "bad");
      passes(said, PATH_RULE, "good");
    },
  ),
);

ifVale(
  "a commented path, and a plain copy, pass the script rule",
  proves(
    {
      commented: shell("# node -e \"require('$root/lib.js')\"\n"),
      copied: shell('cp "$tmp/$name" "$bin/$name"\n'),
    },
    (said) => {
      passes(said, PATH_RULE, "commented");
      passes(said, PATH_RULE, "copied");
    },
  ),
);

ifVale(
  "no prose rule reaches a shell script",
  proves(
    { past: shell("#!/usr/bin/env sh\n# The tree was installed here.\n") },
    (said) => {
      assert.deepEqual(
        said.rules("past").filter((one) => one.startsWith("VoiceVale.")),
        [],
      );
    },
  ),
);
