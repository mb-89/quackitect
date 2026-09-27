// The retro's backlog read: every prose criterion a ticket the window closes
// carries, printed beside the verdict the retro's folder holds for it.
// [[spec/tickets/the-retro-reads-the-backlog]]

import { closedIn } from "../../scripts/retro-collect.js";
import { askOf, CLOSED, fieldOf, GROUP, isGroup, NOTE_END, TICKETS } from "../group.js";
import { homeOf } from "./timeline.js";

const COLLECTED = "collected.json";
export const VERDICTS = "backlog.json";
const VERDICT = ["holds:", "falls short:"];
const BULLET = /^\s*[-*]\s+/;
const COMMAND = /`[^`]+`/;

// The verb: prints each prose criterion, and answers 0 once each holds a verdict with its reason. [[spec/tickets/the-retro-reads-the-backlog]]
export function backlog(it, name) {
  const home = name ? homeOf(it, name) : "";
  if (!home || !it.disk.exists(home)) {
    console.error("retro backlog reads the folder of a retro, and none stands.");
    return 2;
  }
  const since = Date.parse(String(parsed(it, it.join(home, COLLECTED))?.since ?? ""));
  const closed = closedIn(it, Number.isFinite(since) ? since : 0);
  if (!closed.ok) {
    console.error(`retro backlog reads no trunk: ${closed.err}`);
    return 1;
  }
  const verdicts = parsed(it, it.join(home, VERDICTS)) ?? {};
  let waiting = 0;
  for (const [ticket, landing] of closed.landings) {
    const shown = it.git.run(
      ["show", `${landing.sha}:${TICKETS}/${ticket}${NOTE_END}`],
      true,
    );
    if (!shown.ok || !isBacklog(shown.out)) continue;
    for (const criterion of criteriaOf(shown.out)) {
      const verdict = String(verdicts[ticket]?.[criterion] ?? "").trim();
      const judged = VERDICT.some(
        (word) => verdict.startsWith(word) && verdict.slice(word.length).trim(),
      );
      if (!judged) waiting += 1;
      console.log(`${ticket}  ${criterion}${judged ? `  ${verdict}` : ""}`);
    }
  }
  if (waiting) {
    console.error(
      `${waiting} criterion(s) wait on a verdict in ${VERDICTS}: ${VERDICT.join(" or ")} with its reason.`,
    );
  }
  return waiting ? 1 : 0;
}

// A backlog ticket closes on trunk and stands in no group. [[spec/tickets/the-retro-reads-the-backlog]]
function isBacklog(text) {
  return fieldOf(text, "state") === CLOSED && !isGroup(text) && !fieldOf(text, GROUP);
}

// A prose criterion is an Ask bullet naming no command in backticks. [[spec/tickets/the-retro-reads-the-backlog]]
export function criteriaOf(text) {
  return askOf(text)
    .split("\n")
    .filter((row) => BULLET.test(row))
    .map((row) => row.replace(BULLET, "").trim())
    .filter((row) => row && !COMMAND.test(row));
}

function parsed(it, path) {
  if (!it.disk.exists(path)) return null;
  try {
    return JSON.parse(it.disk.read(path));
  } catch {
    return null;
  }
}
