---
form: build-steps
by: agent
signed_off: 2026-08-18T09:59:29.405Z
authors: agent
files: null
---

# Evidence form / build-steps

## current_situation

The four chunks are built in the order the plan named, and the seventeen cases that were red at observe-red are green.

WHAT LANDED, chunk by chunk.

- CHUNK 1, engine/pool.ts. Where an option lives (project/spec/trace/option/), how one is written, how they are read back. `mintOption` refuses before it writes, always, so a refused crossing leaves the pool and the note store exactly as it found them.
- CHUNK 2, the refusal. SE-C-140 in errors.ts, its feed-forward section in refusals.md — the pairing rule is that a clause is not done until that section stands — and the longest-common-run check in pool.ts. Six words is the threshold and it is written in the code with its reasoning, not buried.
- CHUNK 3, the drain. inbox.ts takes a statement and a root, MINTS FIRST and marks the note drained second. The order is the guarantee: a refused mint must not consume the note anyway. tools.ts carries the argument, and the mirror's own path carries it too, so the person's hand and the agent's get the same demands.
- CHUNK 4, the offer. survey.ts reads standingOptions from the repository. The old line read backlogNotes out of .se, which is exactly the defect: two clones disagreed about what the project was holding and neither was wrong.

ONE THING CHANGED IN THE PRODUCT BECAUSE A TEST WAS RIGHT AND THE CODE WAS NOT. The refusal quoted the overlapping run back in lower case, because the comparison lowercases. An author cannot find that in what they typed. The run now comes back in the STATEMENT'S own case — comparing is case-insensitive, reporting is not.

TWO EXISTING TESTS FAILED AND BOTH WERE RIGHT TO. They encoded the pre-i17 contract, where a backlog disposition wanted only a re-entry condition. They now assert the new one, and one of them asserts the thing that is easy to lose: a condition says WHEN an option comes back and never what it IS.

WHAT THE STATE COULD NOT DO WITH THE LANE'S OWN VERB. build-steps grants se_run and se_lint and NOT se_test, so a builder cannot check its own work through the sanctioned door. The shell path is correctly refused as a truncating shape, and then correctly refused again as a lane tool's job. The scoped run went through `no_tool_reason`, twice, with the reason logged: five files, the four that read the survey or the backlog plus the window cases. Green.

## follow_up

- the full battery is verification's, and it is the first state after this that grants se_test. What this state proved is scoped: the seventeen new cases plus the five files that read the survey or the backlog
- trace-design comes next and gives the design spec's file list its teeth; every file dsp-the-options-pool names now exists
- THE INSPECTION SPEC CAN FINALLY DISCRIMINATE. tsp-one-door-into-the-pool passed vacuously at observe-red because there were no writers to read. There is exactly one now — engine/pool.ts mintOption, reached only through the drain — so verification is where that checklist is run for the first time against something
- raid-asm-the-drain-is-the-only-door-into-the-pool is probeable from here, and it was unprobed at gate-requirements for exactly this reason
- SE-C-140's threshold of six words is the number to watch. It is a judgement with no data behind it, which is what raid-asm-a-verbatim-overlap-check-catches-the-paste-that-matters says, and the first real pool content is what moves it
- build-steps granting se_run but not se_test is a seam worth a retro. The lane refused the shell twice, correctly, and the only way through was the escape hatch — which is the shape of a state that cannot do its own job

## anything_else

