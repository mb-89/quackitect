// The systematic machine, bootstrap cut: one linear iteration (§17 B4).
// Only the transitions a single-agent desk iteration needs; tailoring later
// policies means REMOVING transitions from this one (§12).
import type { MachineDecl } from "../machine.ts";

export const systematic: MachineDecl = {
  id: "systematic",
  reentry: "restart",
  initial: "declare_goal",
  states: [
    {
      id: "declare_goal",
      kind: "work",
      statement: "State what this iteration ships and why it is load-bearing.",
      filled_by: "agent",
      guidance:
        "One goal, one iteration. Name the failure the work is load-bearing for (the v2 test). Then name the exit check: how will close_iteration know the goal happened?",
      evidence_form: [
        { name: "goal", description: "one line: what ships", required: true },
        { name: "load_bearing_for", description: "the named failure this addresses", required: true },
        { name: "exit_check", description: "how close will verify it", required: true },
      ],
      edges: [{ to: "do_work", role: "normal" }],
    },
    {
      id: "do_work",
      kind: "work",
      statement: "Do the work; record what changed.",
      filled_by: "agent",
      guidance:
        "Work through the tool surface. Every write rides se.set.apply; ad-hoc gaps go through se.help first. Target ~5-minute steps; submit when the change is visible and testable.",
      evidence_form: [
        { name: "changed", description: "what changed, one line per artifact", required: true },
        { name: "run_ref", description: "call-log ref of the run backing it (se.run), if any", required: false },
      ],
      edges: [{ to: "verify", role: "normal" }],
    },
    {
      id: "verify",
      kind: "work",
      statement: "The declared check runs mechanically.",
      filled_by: "engine",
      command: "npm test --silent",
      guidance:
        "Engine-filled: the command declared on this state runs through the se.run capture lane; the result lands as evidence with zero model turns. A failing command is a normal Failed — the fallback edge reopens do_work.",
      evidence_form: [],
      edges: [
        { to: "close_iteration", role: "normal" },
        { to: "do_work", role: "fallback", guard: "verify_attempts < 3" },
      ],
    },
    {
      id: "close_iteration",
      kind: "gate",
      statement: "The iteration closes against its declared goal.",
      filled_by: "agent",
      guidance:
        "Compare the evidence against declare_goal's exit_check. Gates are adjudicated, never engine-blessed: mechanical states fill, never bless. (TTY gate arms at B5 — until then submit records the close evidence.)",
      evidence_form: [
        { name: "exit_check_result", description: "the declared exit check, and what it showed", required: true },
      ],
      edges: [{ to: "closed", role: "approval" }],
    },
    {
      id: "closed",
      kind: "terminal",
      statement: "Iteration closed.",
      filled_by: "agent",
      guidance: "Nothing to do — terminal.",
      evidence_form: [],
      edges: [],
    },
  ],
};
