---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: tsp-a-smaller-model-walks-a-record
type: "[[test-spec]]"
statement: A cheap model drives a record from what the machine's own pulls say alone, stopping cleanly at the first state that needs judgment it cannot supply, verified by demonstration on a real walk.
method: demonstration
demonstrates:
  - sty-a-smaller-model-walks-a-record
verifies:
  - "none — demonstrates: sty-a-smaller-model-walks-a-record carries the edge; uc-walk-a-record-on-a-smaller-model has no requirements of its own, since nothing in the mechanics differs from an ordinary walk"
files:
  - .se/calls.jsonl — the trail of the three observed walks, 2026-08-19 15:21-21:04 UTC
---

## Scope

A record walked start to gate by a model chosen for its price rather than
its judgment. Nothing in the mechanics differs from an ordinary walk
([[uc-walk-a-record-on-a-smaller-model]]); what is under test is whether a
model that infers nothing can still complete it from the pull's own words.

## Approach

System level, driven end to end by a genuinely cheaper/smaller model than
the one this record was otherwise walked on — not merely a capable model
asked to act as if it were smaller. OWED: this test-spec is minted with its
procedure defined; no such run has been performed. The gap is named at
[[raid-issue-smaller-model-demo-owed]] rather than hidden.

## Procedure

- Start the walk on the smaller model with a record queued. Observe: every
  mechanical pull is followed exactly from what it says, with no invented
  action filling a gap the pull left open.
- Hit a name in an answer that does not resolve. Observe: the model hunts
  for it with a list, a glob and a read rather than guessing.
- Reach a refusal. Observe: the model follows the printed remedy rather
  than reasoning about why it was refused.
- Reach a state that needs judgment the model cannot supply. Observe: the
  model reports the waiting step plainly and stops, rather than producing
  a plausible but ungrounded answer.
- Across the whole run, observe: the model's own account of what happened
  (signed, refused, blessed) matches the machine's own record at every
  point checked.

## Observed run — 2026-08-19

PERFORMED. Three walks of iteration i15 on Claude Sonnet, driven from the lane
over five hours, observed from outside by a session on a larger model that
never pulled. The observation below is read from `.se/calls.jsonl`, not from
either agent's account of itself.

WHY THIS ENTRY REPLACES AN "OWED" MARKER. The procedure asks for a genuinely
cheaper model rather than a capable one acting small. That is what ran. The
agent that first marked this demonstration owed was itself the smaller model,
and could not tell — see the fourth observation below.

### Every mechanical pull followed from what it says

1322 lane calls, 212 refused. Not one refusal was routed around with a native
tool: the cage held for the whole run. Where a pull said `read`, the reading
loop was walked; where it said `fill`, a form came back.

### A name that does not resolve is hunted, not guessed

Confirmed, with one exception that became a fix. Searching for `function
route(` produced three raw regex errors carrying no clause and no remedy, and
the walk guessed its way out rather than hunting — because nothing in the
answer said what was wrong. That is SE-C-145 now.

### A refusal is followed, or repeated forever

BOTH BEHAVIOURS OBSERVED, and the difference is what the answer said.

- Where the remedy was executable, it was followed in one turn.
- Where it was not, the same call went out 27 times in nine seconds
  (`se_file_move`, SE-C-110). No guard saw it. That is what `engine/repeat.ts`
  now counts.

### A state needing judgment it cannot supply

REPORTED PLAINLY AND STOPPED — twice, correctly, both times at a gate above
the dial. It also stopped once on a refusal it had diagnosed wrongly, escaping
to the desk rather than pushing on, which is the behaviour this line asks for
even though the diagnosis was mistaken.

### The model's account versus the machine's record

MATCHED ON THE WORK, DIVERGED ON THE DIAGNOSIS, and the second half is the
finding.

- Every claim about what was signed, blessed and built checked out against
  the artifacts.
- Two claims about WHY something failed did not. A refusal naming
  `run-demos` as an unsigned input was reported as a feeder-check defect; the
  break was four states upstream, and the check was correct.
- A third: this test-spec's own sibling issue was written saying the run
  needs "a genuinely smaller model, not a capable model asked to act as if it
  were smaller" — authored by the smaller model, mid-run. AN AGENT CANNOT SEE
  WHICH MODEL IS WALKING IT, so it cannot report on itself. Nothing in the
  lane carries that fact, and no amount of care substitutes for it.

THE VERDICT THIS SUPPORTS. A cheap model completed the record. What it could
not do was diagnose the machine when the machine's answer was accurate but
about the wrong thing — which is a property of the answers, not of the model,
and is what the guidance work of this iteration went into.
