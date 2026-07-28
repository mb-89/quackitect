// WHAT STANDS OPEN — one mechanical answer: open expeditions, open
// iterations, pending notes, and parked backlog items with their ready-when.
//
// BOTH HANDS ASK IT (owner ruling 2026-07-28). The agent calls se_survey;
// the person clicks it in the mirror. It lived inside the tool handler and
// so was reachable only by the agent, which made "what is open" a question
// the owner had to route through someone else. One implementation, two
// doors.
import { backlogNotes, pendingNotes } from "./inbox.ts";
import { expList, readRecord } from "./worktree.ts";
import { itList, readItRecord } from "./iterations.ts";
import { seDir } from "./paths.ts";

export interface Survey {
  counts: { expeditions: number; iterations: number; notes: number; backlog: number };
  expeditions: { id: string; goal: string }[];
  iterations: { id: string; goal: string }[];
  notes: { ref: string; at: string; brief: string }[];
  backlog: { ref: string; ready_when: string; brief: string }[];
}

const firstLine = (t: string): string => t.split("\n")[0].slice(0, 120);

export function survey(projectRoot: string): Survey {
  const exps = expList(projectRoot).filter((e) => e.open).map((e) => ({ id: e.id, goal: firstLine(String((readRecord(projectRoot, e) ?? {}).goal ?? "")) }));
  const its = itList(projectRoot).filter((i) => i.open).map((i) => ({ id: i.id, goal: firstLine(String((readItRecord(projectRoot, i) ?? {}).goal ?? "")) }));
  const notes = pendingNotes(seDir(projectRoot)).map((n) => ({ ref: n.ref, at: n.at, brief: firstLine(n.text) }));
  const backlog = backlogNotes(seDir(projectRoot)).map((n) => ({ ref: n.ref, ready_when: n.drained?.where ?? "", brief: firstLine(n.text) }));
  return {
    counts: { expeditions: exps.length, iterations: its.length, notes: notes.length, backlog: backlog.length },
    expeditions: exps,
    iterations: its,
    notes,
    backlog,
  };
}
