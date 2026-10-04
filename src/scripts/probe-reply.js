// The reply probe. It runs the client headless on a prompt asking for a line
// of text and a call in one message, and reads what the call's event carries
// and whether the prompt reaches the session opening on the warning.
// [[spec/tickets/the-reply-probe-runs]]

import { REPLY_PROBE } from "../../.claude/skills/level0/lib/guidance.js";
import { SESSION } from "../../.claude/skills/level0/lib/log.js";
import { PROMPT_WHY } from "../bridge/answer.js";
import { logRows } from "./probe-cold.js";

// The span the client gets, the bound the compaction probe takes. [[spec/design_output/level0#what-the-probe-does]]
const WAIT = 900000;
const KEY_WIDTH = 12;
const SHOWN = 80;

// The rows the run adds, the call's fields, the fields carrying the message's text, and the warning. [[spec/tickets/the-reply-probe-runs]]
export function readsReply(rows, out) {
  const row = (rows ?? []).findLast((one) => one.said === REPLY_PROBE.event);
  const warned = String(out ?? "").includes(`"${PROMPT_WHY}`);
  if (!row) {
    return {
      fields: null,
      carries: [],
      warned,
      why: "no call after the probe's prompt reaches the log, so this client loads no function hooks",
    };
  }
  const fields = parsed(row.detail);
  const carries = Object.keys(fields).filter(
    (key) => typeof fields[key] === "string" && fields[key].includes(REPLY_PROBE.says),
  );
  return {
    fields,
    carries,
    warned,
    why: carries.length
      ? `the call carries the message's text on ${carries.join(", ")}`
      : "no field of the call carries the message's text",
  };
}

function parsed(text) {
  try {
    const said = JSON.parse(String(text ?? ""));
    return said && typeof said === "object" ? said : {};
  } catch {
    return {};
  }
}

// [[spec/tickets/the-reply-probe-runs]]
export function probeReply(root, it, client) {
  const log = it.join(root, SESSION);
  const before = logRows(it.disk, log).length;
  const cage = it.join(root, ".claude", "skills", "level0");
  let ran = null;
  try {
    ran = it.proc.run([client, "-p", REPLY_PROBE.opens, "--plugin-dir", cage], {
      cwd: root,
      timeoutMs: WAIT,
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    console.error("claude stands nowhere, so this box probes no reply.");
    return 1;
  }

  const read = readsReply(logRows(it.disk, log).slice(before), ran?.stdout);
  for (const [key, value] of Object.entries(read.fields ?? {})) {
    console.log(
      `  ${key.padEnd(KEY_WIDTH)} ${String(value).replace(/\s+/g, " ").slice(0, SHOWN)}`,
    );
  }
  console.log(`\n${read.why}.`);
  console.log(
    `The prompt reaches the session opening on the warning: ${read.warned ? "yes" : "no"}.`,
  );
  if (ran?.exitCode) console.error(`The client answers ${ran.exitCode}.`);
  return read.fields ? 0 : 1;
}
