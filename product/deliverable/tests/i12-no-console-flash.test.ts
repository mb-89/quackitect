// Every subprocess this engine spawns must hide its console window.
//
// On Windows a spawn without windowsHide flashes a console that TAKES FOCUS.
// The board polls git every couple of seconds, so the flashes are constant, and
// they interrupt the owner's voice dictation mid-sentence — reported from live
// use as "happening so much that dictation doesn't work".
//
// This is a lint rather than a comment at each call site, because a comment is
// the weakest guard and the next spawn anyone adds will not read it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function sources(dir: string): string[] {
  return readdirSync(join(ROOT, dir), { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? sources(`${dir}/${e.name}`) : e.name.endsWith(".ts") ? [`${dir}/${e.name}`] : []));
}

test("no spawn in the engine or its binaries can pop a console window", () => {
  const offenders: string[] = [];
  for (const rel of [...sources("engine"), ...sources("bin")]) {
    const text = readFileSync(join(ROOT, rel), "utf8");
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      // The call and its options usually sit on one line in this codebase; where
      // they do not, the options object continues, so look ahead a little.
      if (!/\b(spawn|spawnSync|execFile|execFileSync)\s*\(/.test(line)) return;
      const window = lines.slice(i, i + 6).join(" ");
      // A spawn with no options object at all also flashes.
      if (!/windowsHide/.test(window)) offenders.push(`${rel}:${i + 1}  ${line.trim().slice(0, 90)}`);
    });
  }
  assert.deepEqual(offenders, [], `these spawns will flash a console window and steal focus:\n${offenders.join("\n")}`);
});
