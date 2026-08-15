---
form: record-adrs
by: agent
signed_off: 2026-08-14T12:49:47.215Z
reopened: "2026-08-14T12:49:02.243Z — It records that no architecture was decided, and cand-core-satellite has since taken the seat on a re-audited demand table and a fresh blind scoring."
authors: agent
files:
---

# Evidence form / record-adrs

## current_situation

THE ARCHITECTURE IS DECIDED: cand-core-satellite. One core that knows the whole state, one satellite per agent that knows its own, and every call routed to whatever owns the path.

THE DECIDING ADRs ARE THE TWO BELOW, and they decide different things.

raid-dec-a-must-outranks-a-score DECIDED HOW THE CHOICE IS MADE. A demand graded `must` is pass or fail, never weighed, and a candidate failing one is out whatever it scored. Without it this milestone had two standing answers and no rule between them: a convergence matrix computed a stable leader across six passes, and that leader failed a fatal demand the arithmetic could not see.

raid-dec-thin-tree SHAPES THE WINNER AND IS UNEXECUTED. It reads decided and the probe of 2026-08-14 found it unbuilt. The winner keeps a record's tree thin and carries the engine as a DELTA over trunk's rather than a copy, so the thin tree is not a nicety here - it is what makes the winner's engine answer affordable.

WHAT IS NOT YET AN ADR AND WILL BE. What a satellite actually is, what the core serves over which channel, and what a partial failure looks like. Those are the winner's own open decisions and they belong to M6 - naming them here would be inventing decisions nobody has taken.

## adrs

- project/spec/trace/raid/raid-dec-a-must-outranks-a-score.md
- project/spec/trace/raid/raid-dec-thin-tree.md

## follow_up

raid-dec-thin-tree'S STATUS IS THE FIRST THING M6 TOUCHES. It reads decided and is unbuilt, and the winner rests on it. Either the status is corrected or the build is carried as the architecture's opening cost.

THREE DECISIONS THE WINNER OWES AND HAS NOT TAKEN.

- WHAT A SATELLITE IS: a process, a worker thread or an isolate. The option says the choice is undecided and four scored axes move with it.
- WHAT THE CORE SERVES AND OVER WHAT CHANNEL. The mirror is a server today so it is the natural core; nothing says the note inbox and the claim ledger can live behind it and no probe has run.
- WHAT A PARTIAL FAILURE LOOKS LIKE. One process either runs or does not. A core with N satellites has states in between, and no other line had to answer for them.

THE PROFILE OUTRANKS ALL THREE. The winner's case rests on parallelism and raid-asm-the-target-machine-is-many-throttled-cores names its own falsifier: if the slow calls are IO-bound, more processes buy nothing. Nobody has run it, and it decides whether the seat holds.

TWO ENGINE FIXES FROM THIS SESSION ARE ALREADY IN TRUNK and belong in this record's implementation with the rest: the why-and-the-guard sharing one mechanism, and a state that runs a machine carrying no evidence form of its own. The demand check itself is owed as a build, and so is a verdict cell that carries its quote.

## anything_else

WHY THIS STATE RAN TWICE AND SAID DIFFERENT THINGS.

The first pass recorded that no ADRs could be listed, because the architecture was not decided and the table that would decide it was unsound. That was true when it was written.

WHAT MADE IT DECIDABLE was not more analysis. It was three rulings and one re-audit: a must outranks a score, an unanswered demand is incompleteness rather than weakness, and a defect found while building is solved rather than carried. Then the demand table was rebuilt blind with every verdict quoted, and the scoring redone by an agent given no earlier scores.

BOTH AGENTS LANDED ON THE SAME LINE, having never seen each other's work. That is the strongest evidence here and it is also where scrutiny should be highest, because a result that confirms itself twice invites less of it.

THE DECISION THAT MATTERED MOST WAS NOT ABOUT ANY CANDIDATE. raid-dec-a-must-outranks-a-score is a rule about how design choices get made, and it changed the answer of a milestone that had already run six scoring passes and four gates.
