// The compaction probe. It runs the client headless under one variable, and
// reads the log that run leaves for the two lines that answer the question.
// [[spec/design_output/level0#the-layer-after-a-compaction]]

import { HEARD, PROBE } from "../../.claude/skills/level0/lib/guidance.js";
import { rowsOf, SESSION } from "../../.claude/skills/level0/lib/log.js";

export const SURVIVES = "survives";
export const DROPS = "drops";
export const UNPROVEN = "no compaction";

const SAYINGS = new Set(Object.values(HEARD));
const WAIT = 900000;

// [[spec/design_output/level0#what-the-probe-reads]]
export function readsCompaction(rows) {
  const said = rows ?? [];
  const context = said.filter((one) => one.kind === "context");
  const at = said.findIndex((one) => one.kind === "compact" && one.level === "info");
  const read = { reads: context.length, answer: UNPROVEN, why: "" };

  if (at < 0) {
    return { ...read, why: "no line says a compaction runs, so the road stands unproven" };
  }
  if (!context.some((one) => one.reason === "re-read")) {
    return { ...read, answer: DROPS, why: "the compaction brings the layer back no second time" };
  }

  const heard = said.slice(at).find((one) => SAYINGS.has(one.said));
  if (!heard) {
    return { ...read, answer: DROPS, why: "no answer after the compaction carries a canary" };
  }
  if (heard.said === HEARD.same) {
    return { ...read, answer: SURVIVES, why: heard.said };
  }
  return { ...read, answer: DROPS, why: heard.said };
}

export async function probe(root, argv, it, client) {
  const said = argv[0] ?? "";
  if (said !== "compact") {
    console.error("Usage: ./RUNME.sh probe compact");
    return 2;
  }
  return compaction(root, it, client);
}

// [[spec/design_output/level0#what-the-probe-does]]
function compaction(root, it, client) {
  const cage = it.join(root, ".claude", "skills", "level0");
  let ran = null;
  try {
    ran = it.proc.run([client, "-p", PROBE.opens, "--plugin-dir", cage], {
      cwd: root,
      env: { [PROBE.variable]: "1" },
      timeoutMs: WAIT,
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    console.error("claude stands nowhere, so this box measures no compaction.");
    return 1;
  }

  const rows = logRows(it.disk, it.join(root, SESSION));
  const read = readsCompaction(rows);
  for (const one of rows) {
    if (one.kind === "context" || one.kind === "compact") {
      console.log(`  ${one.kind.padEnd(8)} ${one.reason ?? one.trigger ?? ""} ${one.said}`);
    }
  }
  console.log(`\n${read.answer}: ${read.why}`);
  console.log(`The layer reaches the session ${read.reads} time(s).`);
  if (ran.exitCode !== 0) console.error(`The client answers ${ran.exitCode}.`);
  return read.answer === SURVIVES ? 0 : 1;
}

function logRows(files, at) {
  try {
    return rowsOf(files.read(at));
  } catch {
    return [];
  }
}
