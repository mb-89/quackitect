// The wait tool. It returns on the first signal it hears: a helper's report,
// an output's end, or a quiet set of files, and at its cap where none comes.
// [[spec/design_output/level0#the-wait-returns-on-signals]]

import { isAbsolute, join } from "node:path";
import { asks } from "./config.js";

export const WAIT = "wait";
export const WAIT_CALL = `mcp__level0__${WAIT}`;
const MOST = "wait.most";
const QUIET = "wait.quiet";
const SECOND = 1000;
// The wait looks at its signals once a second, and the clock decides the rest. [[spec/design_output/level0#the-wait-returns-on-signals]]
const STEP = SECOND;

export const SPECS = () => [waitSpec()];
export const TOOLS = { [WAIT_CALL]: (e, box) => waits(e, box) };

// [[spec/design_output/level0#the-wait-returns-on-signals]]
export async function waits(e, box, pause = sleep) {
  const watch = watchOf(e, box);
  const { signals, from } = watch;
  if (!signals.length)
    return said(`${WAIT} takes an agent, an output or files to wait on.`);
  const most = Number(asks(box, MOST) ?? 0) * SECOND;
  const quiet = Number(asks(box, QUIET) ?? 0) * SECOND;
  watch.turn += 1;
  const turn = watch.turn;
  for (;;) {
    // A later post of the same wait reads the watch now, so this loop answers a post nobody reads and ends. [[spec/design_output/level0#the-wait-returns-on-signals]]
    if (watch.turn !== turn) return said("A later post of this wait takes its watch.");
    for (const heard of signals) {
      const line = heard(nowOf(box), quiet);
      if (line) return done(watch, box, line);
    }
    if (nowOf(box) - from >= most)
      return done(
        watch,
        box,
        `The wait reaches its cap of ${most / SECOND}s, and no signal comes.`,
      );
    await pause(STEP);
  }
}

// The host cuts a long post at its own timeout, and the bridgehead posts it again under the stamp of the first. So the watch that stamp begins stands on the box, and the cap counts from it. [[spec/design_output/level0#the-wait-returns-on-signals]]
function watchOf(e, box) {
  const since = Number(e?.since);
  if (!since) return { signals: signalsOf(e, box), from: nowOf(box), turn: 0 };
  box.waits = box.waits ?? new Map();
  if (!box.waits.has(since))
    box.waits.set(since, { since, signals: signalsOf(e, box), from: since, turn: 0 });
  return box.waits.get(since);
}

function done(watch, box, line) {
  if (watch.since) box.waits?.delete(watch.since);
  return said(line);
}

// A helper's stop lands in the log as its report, and the wait reads it off the box. The session's own stop passes on. [[spec/design_output/level0#the-wait-returns-on-signals]]
export function helperReports(e, box) {
  if (!e?.agentId) return null;
  const agent = String(e?.agentId ?? "");
  box.reports = [...(box.reports ?? []), agent];
  box.log.say("info", "report", `the helper ${agent} reports`, { agentId: agent });
  return { pass: true };
}

function signalsOf(e, box) {
  const out = [];
  const agent = String(e?.agent ?? "").trim();
  if (agent) out.push(reportOf(agent, box));
  const output = String(e?.output ?? "").trim();
  if (output) out.push(outputOf(output, e?.pid, box));
  const files = (Array.isArray(e?.files) ? e.files : []).map(String).filter(Boolean);
  if (files.length) out.push(filesOf(files, box));
  return out;
}

function reportOf(agent, box) {
  return () =>
    (box.reports ?? []).includes(agent) ? `The helper ${agent} reports.` : "";
}

function outputOf(path, pid, box) {
  const still = quietOf([path], box);
  return (now, quiet) => {
    if (pid !== undefined && pid !== null && !box.proc.alive(pid))
      return `The output ${path} ends, because its process exits.`;
    return still(now, quiet)
      ? `The output ${path} stands quiet for ${quiet / SECOND}s.`
      : "";
  };
}

function filesOf(paths, box) {
  const still = quietOf(paths, box);
  return (now, quiet) =>
    still(now, quiet)
      ? `The files ${paths.join(", ")} stand quiet for ${quiet / SECOND}s.`
      : "";
}

// The paths stand quiet once their size and stamp hold for the span, counted from the last change seen. [[spec/design_output/level0#the-wait-returns-on-signals]]
function quietOf(paths, box) {
  let seen = stateOf(paths, box);
  let since = nowOf(box);
  return (now, quiet) => {
    const state = stateOf(paths, box);
    if (state !== seen) {
      seen = state;
      since = now;
    }
    return now - since >= quiet;
  };
}

function stateOf(paths, box) {
  return paths
    .map((path) => {
      const at = isAbsolute(path) ? path : join(box.work, ...path.split("/"));
      return box.disk.exists(at)
        ? `${box.disk.size(at)}:${box.disk.modified(at)}`
        : "none";
    })
    .join("|");
}

function nowOf(box) {
  return box.clock.now().getTime();
}

function said(line) {
  return { result: { result: line } };
}

function sleep(ms) {
  return new Promise((done) => setTimeout(done, ms));
}

function waitSpec() {
  return {
    name: WAIT,
    description:
      "Waits on the first of three signals, and returns at its cap where none comes: a helper's report, an output's end, or a set of files standing quiet. Ask it in place of a loop of sleeps.",
    inputSchema: {
      type: "object",
      properties: {
        agent: {
          type: "string",
          description: "The helper's agent id, whose report returns the wait.",
        },
        output: {
          type: "string",
          description:
            "An output file, whose quiet or whose process's exit returns the wait.",
        },
        pid: {
          type: "number",
          description: "The process writing the output, whose exit returns the wait.",
        },
        files: {
          type: "array",
          items: { type: "string" },
          description: "Files whose quiet, every one of them, returns the wait.",
        },
      },
      required: [],
    },
  };
}
