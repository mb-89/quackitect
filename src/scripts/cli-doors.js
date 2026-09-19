// The doors the command line runs behind, and where each tool stands. Every
// other cli file reads this one, and this one reads none of them.
// [[spec/design_output/doors#the-doors-stand-once]]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { configOf, SCHEMA, TRACKED } from "../../.claude/skills/level0/lib/config.js";
import { FOLDER as LOG_FOLDER } from "../../.claude/skills/level0/lib/log.js";
import { clock } from "../doors/clock.js";
import { disk } from "../doors/disk.js";
import { git } from "../doors/git.js";
import { log } from "../doors/log.js";
import { proc } from "../doors/proc.js";
import { homeIn } from "./editor.js";
import { handDoors } from "./hand.js";
import { readTools, whereIs } from "./tools.js";
import { rootsHere } from "./vehicle.js";

export const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

// [[spec/design_output/vehicle#the-work-root-inherits]]
export function atRoot(path) {
  const said = String(path ?? "");
  return said.startsWith("/") || /^[A-Za-z]:/.test(said) ? said : join(root, said);
}

// [[spec/design_output/config#the-resolver-holds-the-layers]]
export function configHere(files, pair) {
  return configOf({
    tracked: pair?.itself === false ? [join(pair.method, TRACKED), TRACKED] : [TRACKED],
    schema: pair?.itself === false ? join(pair.method, SCHEMA) : SCHEMA,
    read: async (path) => files.read(atRoot(path)),
    write: async (path, text) => files.write(atRoot(path), text),
    makeDir: async (path) => files.makeDir(atRoot(path)),
    readEnv: async (names) =>
      Object.fromEntries(names.map((name) => [name, process.env[name] ?? ""])),
  });
}

// The verbs keep the files under the work root, and git runs there, because a stub is its own repository. [[spec/design_output/vehicle#the-work-root-inherits]]
export async function doorsHere() {
  const outside = proc();
  const files = disk();
  const time = clock();
  const roots = rootsHere(files, process.env, root);
  const said = configHere(files, roots);
  return {
    proc: outside,
    disk: files,
    clock: time,
    git: git(outside, roots.work),
    log: log(files, time, {
      folder: join(roots.work, LOG_FOLDER),
      level: await said.ask("log.level"),
    }),
    config: said,
    method: roots.method,
    work: roots.work,
    words: await said.ask("names.words"),
    stale: await said.ask("work.staleAfter"),
    fails: await said.ask("work.failsBeforeWait"),
    refusals: await said.ask("work.refusalsBeforeFail"),
    splits: await said.ask("work.stepsBeforeSplit"),
    // [[spec/design_output/pull#the-hand-rule]]
    personSigns: await said.ask("work.personSigns"),
    // [[spec/design_output/pull#the-queue-is-a-score]]
    weights: {
      block: await said.ask("work.blockScore"),
      day: await said.ask("work.dayScore"),
      fail: await said.ask("work.failScore"),
    },
    // A name on the pull asks for one ticket, and the queue binding refuses the ask. [[spec/design_output/pull#the-hand-out]]
    binding: await said.ask("engine.binding"),
    ...handDoors(process.env),
    node: process.execPath,
    // The retro's collect reads the transcripts and the memory under home, and the scratchpads under temp. [[spec/guidance/retro/collect]]
    home: homeIn(process.env),
    temp: process.env.TEMP || process.env.TMP || process.env.TMPDIR || "",
    join,
  };
}

export const it = await doorsHere();
export const files = it.disk;
export const outside = it.proc;

export const known = readTools(files, root);
export const bin = whereIs(files, root, "vale", known);
// [[spec/design_output/pull#the-voice-reads-the-evidence]]
it.vale = bin;
export const go = whereIs(files, root, "go", known);
export const STYLES = join(root, "spec", "config", "styles", "VoiceVale");
export const SHAPE = join(root, "spec", "config", "styles", "VoiceShape");
export const SCRIPTED = join(root, "spec", "config", "styles", "VoiceScript");
export const biome = whereIs(files, root, "biome", known);
export const lsp = whereIs(files, root, "se-lsp", known);
export const GUIDANCE = join(root, "spec", "guidance");
export const DOORS = join(root, "src", "doors");
export const PLUGIN = join(".claude", "skills", "level0");
export const LEVEL1 = join(".claude", "skills", "level1");
export const CONTRACT = join(root, "test", "contract");
export const settings = it.config;
// The glob the rules read past, owned by the findings every front reads. [[spec/design_output/lsp]]
export { OURS, PARKED } from "../bridge/findings.js";
export const TESTS = "test/level0/*.test.js";
export const CONTRACT_TESTS = "test/contract/*.test.js";
export const ROUNDS = 5;
export const COL = { verb: 8, count: 6, key: 22, value: 9, rule: 20, tool: 18 };
export const SHOWN = 3;
export const HEALTH_WAIT = 2000;

export const run = async (argv, init = {}) =>
  outside.run(argv, { ...init, cwd: init.cwd ?? root });
