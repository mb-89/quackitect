// The shell door's guard over the bless: a command, and every script under .se
// it runs, reach neither the bless file nor a variable naming the hand or the box.
// [[spec/design_output/pull#the-bless]]

import { join } from "node:path";
import { CLOUD } from "../../.claude/skills/level0/lib/cloud.js";
import { fileText, scriptsIn } from "../../.claude/skills/level0/lib/scripted.js";
import { blessRefusal } from "../scripts/pull-bless.js";
import { HARNESS } from "../scripts/pull-hand-of.js";

const BLESS_NAME = /bless\.json/;
const CLEARS_ALL =
  /\benv\s+(?:-\S+\s+)*(?:-i|--ignore-environment)\b|\bdelete\s+process\.env\s*;|os\.environ\.clear\(/;

// [[spec/design_output/pull#the-bless]]
export function blessGuard(command, _e, box) {
  const it = { disk: box.disk, root: box.work, join };
  const texts = [command, ...scriptsIn(command).map((path) => fileText(it, path))];
  if (texts.some((text) => BLESS_NAME.test(text))) return blessRefusal();
  const names = [...new Set([...HARNESS.map(([name]) => name), ...CLOUD])];
  const hit = names.filter((name) => texts.some((text) => movesVariable(text, name)));
  if (!hit.length && !texts.some((text) => CLEARS_ALL.test(text))) return "";
  const named = (hit.length ? hit : names).join(", ");
  return `${named} name the hand and the box, so a command sets, exports, unsets or clears none of them. The environment decides who blesses.`;
}

function movesVariable(text, name) {
  const quoted = `["'\`]${name}["'\`]`;
  return [
    new RegExp(`(?:^|[\\s;&|("'])(?:export\\s+|declare\\s+-x\\s+)?${name}=`, "m"),
    new RegExp(`\\bunset\\b[^\\n;&|]*\\b${name}\\b`),
    new RegExp(`(?:-u|--unset)[=\\s]+${name}\\b`),
    new RegExp(`process\\.env(?:\\.${name}\\b|\\[\\s*${quoted}\\s*\\])\\s*=(?!=)`),
    new RegExp(`delete\\s+process\\.env(?:\\.${name}\\b|\\[\\s*${quoted}\\s*\\])`),
    new RegExp(`os\\.(?:environ|putenv|unsetenv)\\W*${quoted}`),
  ].some((one) => one.test(text));
}
