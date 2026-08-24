---
id: i60-the-walk-gets-fast-and-it-is-measurable-
status: open
started: 2026-08-24T14:37:20.758Z
opened: 2026-08-24T13:52:40.083Z
goal: "The walk gets fast, and it is measurable first: every interface a person or an agent meets is named, each one carries its own timing instrument, and only then are the slow paths repaired."
vision: "THE OWNER'S COMPLAINT, in their own framing: everything takes too long. The pulling, the aiming, all of it.\n\nMEASURE FIRST, AND MEASURING MEANS MODELLING (owner ruling 2026-08-24). You cannot put a stopwatch on something nobody has named. So the first milestone is not profiling — it is enumerating every interface a person or an agent meets, in one place a reader and a check can both find. Each named interface then carries a measuring device built into it, so anybody can ask what took how long.\n\nTHE ONE-SECOND RULE APPLIES ONLY TO WHAT SOMEBODY SEES (owner ruling 2026-08-24). Past a second, two things are owed together: it says what it is doing, and it finishes in the background. The lane row has carried that since i1. The surface row did not, and this retro corrected it.\n\nWHAT WAS MEASURED, over 3,707 calls since the previous retro.\n\n- 418 pulls. 140 over five seconds, 23 over thirty.\n- 48 aims. 36 over five seconds, 28 over fifteen. The published ceiling is a twentieth of a second per hop.\n- THE SIX SLOWEST PULLS RAN 60 TO 131 SECONDS AND EVERY ONE ANSWERED `wait`, each reporting that nothing routed to the target from where it stood.\n- The mirror logged 642 slow requests, 16 of them past a minute, including a 110-second lane call and a 92-second surface fetch. The panel freezes because the lane shares its drawing loop.\n- A full major round demands 98 method-card reads that cost 190 fetches at the present cap. That is 92 wasted round trips per round.\n- 1,245 job files stand where 598 stood the same morning.\n\nTHE LEADING SUSPECT IS ALREADY IN THE REGISTER, and its trigger has fired. `raid-debt-the-route-drawer-reads-a-standing-as-a-boolean` says a hop whose leaving judgment is still deciding reads to the route drawer as FAILED. Its trigger names a walk redrawing its route while a long judgment is in flight, which is exactly the condition under which those six pulls happened.\n\nTEST THAT BEFORE PROFILING ANYTHING. Start a long judgment, pull toward a target beyond it, and time the answer. Fast without a judgment running and slow with one settles it for the cost of two calls.\n\nDO NOT GUESS THE CAUSE otherwise. The owner's own instruction: measure per-hop timings first, then decide what any cached verdict covers.\n\nDONE LOOKS LIKE.\n\n- Every interface a person or an agent meets is enumerated in one place, and nothing outside that list counts as one.\n- Each of them reports what took how long, without anybody instrumenting it by hand.\n- Aiming returns at once; the computing happens when the next step is asked for, and the pull still walks through every hop that already passes.\n- A pull that will answer `wait` says so quickly instead of spending two minutes first.\n- A document handed over for reading arrives whole.\n- The engine holds what it launches, asks whether each is alive, and ends the silent ones.\n- Nothing over a second holds the loop that draws the panel.\n- The editor panel is the only surface that counts, and files it never draws are gone.\n\nTHE BUG FIXES RIDE THIS ROUND TOO (owner ruling 2026-08-24). A finished test run that never closes its record; a score cell with no evidence forced into a number; a re-signed answer that fails to knock down what rests on it; matrix rows served at twice their count and a companion view at half; the standing suite failures; two engines on one folder and one port; and a launch record blocked by whichever step the walk stands on.\n\nWHAT IS NOT IN SCOPE. The judgment-shaped surface questions went to i23. The criterion-pool defect went to i53, the stale served word to i42, and the duplicated config value to i46.\n\nTHE POOL CARRIES THE DETAIL. Fourteen work tokens were minted by the retro of 2026-08-24, each stating one piece of this in full."
inputs:
  - "note-125f758443c0"
  - "wt-one-hop-of-the-walk-gets-a-published-time-budget-of-a-twenti"
  - "wt-pointing-the-walk-at-a-destination-returns-immediately-and-e"
  - "wt-a-large-record-is-built-once-committed-and-kept-solely-as-a-"
  - "wt-a-document-handed-to-an-agent-for-reading-arrives-whole-rath"
  - "wt-the-engine-keeps-hold-of-everything-it-launches-and-asks-eac"
  - "wt-how-long-a-completed-task-s-file-is-worth-keeping-gets-decid"
  - "wt-a-test-run-closes-its-own-entry-when-the-process-behind-it-e"
  - "wt-every-screen-a-human-being-reads-is-enumerated-in-one-place-"
  - "wt-the-editor-panel-is-the-single-place-that-counts-and-any-oth"
  - "wt-a-score-cell-with-no-evidence-behind-it-may-say-so-in-words-"
  - "wt-re-signing-an-answer-that-others-rest-on-knocks-those-others"
  - "wt-the-matrix-rows-served-to-a-reader-match-the-rows-on-disk-a-"
  - "wt-the-suite-s-standing-failures-are-counted-and-driven-to-noth"
  - "wt-one-engine-holds-a-given-folder-and-its-network-port-or-the-"
  - "wt-recording-that-a-helper-was-launched-works-from-anywhere-ins"
  - "wt-the-cage-instructions-move-out-of-every-helper-s-opening-tex"
  - "raid-debt-the-route-drawer-reads-a-standing-as-a-boolean"
depends_on: []
---

# i60-the-walk-gets-fast-and-it-is-measurable-

## Goal

The walk gets fast, and it is measurable first: every interface a person or an agent meets is named, each one carries its own timing instrument, and only then are the slow paths repaired.

## Rough vision

THE OWNER'S COMPLAINT, in their own framing: everything takes too long. The pulling, the aiming, all of it.

MEASURE FIRST, AND MEASURING MEANS MODELLING (owner ruling 2026-08-24). You cannot put a stopwatch on something nobody has named. So the first milestone is not profiling — it is enumerating every interface a person or an agent meets, in one place a reader and a check can both find. Each named interface then carries a measuring device built into it, so anybody can ask what took how long.

THE ONE-SECOND RULE APPLIES ONLY TO WHAT SOMEBODY SEES (owner ruling 2026-08-24). Past a second, two things are owed together: it says what it is doing, and it finishes in the background. The lane row has carried that since i1. The surface row did not, and this retro corrected it.

WHAT WAS MEASURED, over 3,707 calls since the previous retro.

- 418 pulls. 140 over five seconds, 23 over thirty.
- 48 aims. 36 over five seconds, 28 over fifteen. The published ceiling is a twentieth of a second per hop.
- THE SIX SLOWEST PULLS RAN 60 TO 131 SECONDS AND EVERY ONE ANSWERED `wait`, each reporting that nothing routed to the target from where it stood.
- The mirror logged 642 slow requests, 16 of them past a minute, including a 110-second lane call and a 92-second surface fetch. The panel freezes because the lane shares its drawing loop.
- A full major round demands 98 method-card reads that cost 190 fetches at the present cap. That is 92 wasted round trips per round.
- 1,245 job files stand where 598 stood the same morning.

THE LEADING SUSPECT IS ALREADY IN THE REGISTER, and its trigger has fired. `raid-debt-the-route-drawer-reads-a-standing-as-a-boolean` says a hop whose leaving judgment is still deciding reads to the route drawer as FAILED. Its trigger names a walk redrawing its route while a long judgment is in flight, which is exactly the condition under which those six pulls happened.

TEST THAT BEFORE PROFILING ANYTHING. Start a long judgment, pull toward a target beyond it, and time the answer. Fast without a judgment running and slow with one settles it for the cost of two calls.

DO NOT GUESS THE CAUSE otherwise. The owner's own instruction: measure per-hop timings first, then decide what any cached verdict covers.

DONE LOOKS LIKE.

- Every interface a person or an agent meets is enumerated in one place, and nothing outside that list counts as one.
- Each of them reports what took how long, without anybody instrumenting it by hand.
- Aiming returns at once; the computing happens when the next step is asked for, and the pull still walks through every hop that already passes.
- A pull that will answer `wait` says so quickly instead of spending two minutes first.
- A document handed over for reading arrives whole.
- The engine holds what it launches, asks whether each is alive, and ends the silent ones.
- Nothing over a second holds the loop that draws the panel.
- The editor panel is the only surface that counts, and files it never draws are gone.

THE BUG FIXES RIDE THIS ROUND TOO (owner ruling 2026-08-24). A finished test run that never closes its record; a score cell with no evidence forced into a number; a re-signed answer that fails to knock down what rests on it; matrix rows served at twice their count and a companion view at half; the standing suite failures; two engines on one folder and one port; and a launch record blocked by whichever step the walk stands on.

WHAT IS NOT IN SCOPE. The judgment-shaped surface questions went to i23. The criterion-pool defect went to i53, the stale served word to i42, and the duplicated config value to i46.

THE POOL CARRIES THE DETAIL. Fourteen work tokens were minted by the retro of 2026-08-24, each stating one piece of this in full.

## Inputs

- note-125f758443c0
- wt-one-hop-of-the-walk-gets-a-published-time-budget-of-a-twenti
- wt-pointing-the-walk-at-a-destination-returns-immediately-and-e
- wt-a-large-record-is-built-once-committed-and-kept-solely-as-a-
- wt-a-document-handed-to-an-agent-for-reading-arrives-whole-rath
- wt-the-engine-keeps-hold-of-everything-it-launches-and-asks-eac
- wt-how-long-a-completed-task-s-file-is-worth-keeping-gets-decid
- wt-a-test-run-closes-its-own-entry-when-the-process-behind-it-e
- wt-every-screen-a-human-being-reads-is-enumerated-in-one-place-
- wt-the-editor-panel-is-the-single-place-that-counts-and-any-oth
- wt-a-score-cell-with-no-evidence-behind-it-may-say-so-in-words-
- wt-re-signing-an-answer-that-others-rest-on-knocks-those-others
- wt-the-matrix-rows-served-to-a-reader-match-the-rows-on-disk-a-
- wt-the-suite-s-standing-failures-are-counted-and-driven-to-noth
- wt-one-engine-holds-a-given-folder-and-its-network-port-or-the-
- wt-recording-that-a-helper-was-launched-works-from-anywhere-ins
- wt-the-cage-instructions-move-out-of-every-helper-s-opening-tex
- raid-debt-the-route-drawer-reads-a-standing-as-a-boolean

## The prose the agent is served is a speed problem (owner ruling 2026-08-24)

THE OWNER'S COMPLAINT, reading another agent's pull result: the guidance for the
file verbs should be two sentences, the refusal is a wall of text, and all of it
is far too long. Their conclusion: this slows the agent down, so it belongs in
this round.

THE RULE THEY STATED. Only actionable information goes into guidance. No
philosophising. No governance discussion. No provenance discussion. Anything
else becomes a reference to further reading.

### What was measured, 2026-08-24

| what the agent is served | size |
| --- | --- |
| the prompt layer, carried on every turn | 9,229 words |
| the refusal reference, a reading document | 5,504 words over 684 lines |
| 63 tool descriptions | 2,461 words, longest 151, eight over 100 |
| all 21 state-note guidance blocks together | 1,148 words, averaging 55 |

### Where the fat actually is

THE STATE NOTES ARE NOT THE PROBLEM and should not be touched for size. They
average 55 words and only two exceed 150.

THE TOOL DESCRIPTIONS ARE. Sixty-three of them carry 2,461 words, and the owner
wants roughly two sentences each. That is about a quarter of what stands.

THE REFUSAL PAYLOAD IS. A rejection carries the clause, what was expected, what
arrived, a remedy, a pointer and often a long explanatory note. The first four
are actionable and the rest is reading.

THE PROMPT LAYER IS THE BIGGEST SINGLE COST and nobody had counted it. It rides
every turn, so a word cut there is paid back on every call of every session.

### How it divides against the round that already exists

A SEEDED ROUND ALREADY OWNS THE CORPUS-WIDE SWEEP, and it counted 3,572 flagged
lines across 897 files before starting. That sweep stays where it is.

WHAT COMES HERE IS ONLY WHAT IS SERVED TO A WALKER: the tool descriptions, the
refusal payloads and the prompt layer. Those are read on every call, which is
what makes them this round's business rather than that one's.

THE TWO MUST NOT BOTH EDIT ONE FILE. Whichever lands second reads what the first
left and works from that.

## A finished record has no way to be closed (found 2026-08-24)

THERE IS NO LANE CALL THAT CLOSES A FINISHED ROUND. A close writes exactly two
things, a status and a stamp, and both are written when the walk reaches the
final state. Nothing else can write them.

WHAT THAT COSTS. A round that finished its work and lost its session stays open
for ever, and the only way to clear it is to walk the whole thing again. One
such round stood open for five days with all ten of its gates blessed.

THE OWNER'S RULING, 2026-08-24: a completely finished round is not walked again
because somebody forgot to close it. Invent the mechanism instead.

WHAT THE VERB MUST DO. Refuse unless everything is genuinely signed, so it can
never wave an unfinished round through. Write the same two keys the walk writes.
Carry forward anything still owed, the way a normal close does.

WHY IT SITS IN THIS ROUND. Re-walking a finished record to clear a flag is the
plainest possible case of the walk costing more than the work.

## Editing a guidance document re-owes reading the whole of it

OBSERVED 2026-08-24, during the retro that seeded this round. Two lines were
added to a method card. The next pull answered `read` and handed the entire
document back, and the walk could not continue until three probes about it were
answered again.

THE COST. That card runs to five pages at the present cap. One two-line edit
bought five fetches plus a proof, on a document the agent had read in full
twenty minutes earlier and had just written into itself.

WHY THE RULE IS RIGHT ANYWAY. The reading proof exists so an agent cannot claim
to hold a document it has not read, and a changed document genuinely is a
different document.

WHAT IS WRONG IS THE GRAIN. The whole document is re-owed for any edit, however
small, and by the very hand that made the edit.

TWO SHAPES WORTH WEIGHING.

- RE-OWE ONLY WHAT MOVED. The proof asks about the changed part rather than
  three points spread across the whole.
- THE AUTHOR IS ALREADY PROVEN. A hand that just wrote a passage has
  demonstrably read it, and the write is stronger evidence than any probe.

THIS COMPOUNDS WITH THE PRUNING ABOVE. Shorter documents make every re-read
cheaper, so the two land well together.

## The leading suspect for the two-minute pulls is already in the register

A STANDING DEBT PREDICTS THIS EXACT SYMPTOM, and its trigger has now fired.

WHAT IT SAYS. The route drawer reaches its hop checks through a plain
true-or-false answer, so a step that is still deciding reads the same as a step
that failed. Its trigger names a walk redrawing its route while a long judgment
is in flight.

WHY THAT MATTERS NOW. The round that just shipped was walked with leaving
judgments running, and the six slowest pulls happened alongside them. So this is
no longer a debt waiting for its condition. The condition arrived, which is what
the register says should force a decision.

WHAT IS NOT PROVEN. That it accounts for the full two minutes. The debt's own
impact section calls the cost wasted work and never quantifies it, and no
per-hop timing exists yet.

TEST IT BEFORE PROFILING ANYTHING. Start a long judgment. Pull toward a target
beyond it. Time the answer. Then do the same with nothing running. If the pull
is fast when the machine is quiet and slow when it is not, the question is
settled for the price of two calls.

THE REPAYMENT IS DESCRIBED AS ONE CHANGE: give the drawer its own question about
a step's standing, and leave the shared check alone.

DO THIS FIRST. It is the cheapest thing in this round and it may remove the need
for most of the rest.

## This round was split three ways on 2026-08-24

THE OWNER ASKED FOR THREE ROUNDS THAT RUN AT ONCE, on three different hands,
separated so the merges stay simple. This record collected everything first, so
two thirds of what stands above has moved out.

WHAT STAYS HERE, AND IT IS THE WALK'S HOT PATH.

- The route-drawer debt, tested before anything else is built.
- Per-hop timings, so the published budget is enforceable rather than hoped for.
- Aiming returns at once and the pull does the walking.
- A target that cannot be routed to fails fast instead of spending two minutes.
- The large committed record that makes any of it measurable.
- Three defects that live in these same modules: the re-signed input that did not
  fall what depends on it, the matrix serving twice the rows that exist, and the
  score cell with no way to say it has no evidence.

WHAT MOVED OUT, and each has its own record now.

- Everything served to an agent — the tool descriptions, the refusal payloads and
  the prompt layer — went to the round about served prose.
- The background-work lifecycle — the watchdog, the entry that never closes, the
  file pile, the two engines on one port, the blocked registration — went to the
  round about background work reporting its own end.

HOW THEY ARE KEPT APART. Each round owns its own modules, and no two reach the
same one. The single exception is the file where tools are declared: one round
rewrites its descriptions while another may register a verb in it. Those are
different regions, and whichever lands second re-reads the file and applies onto
what the first left.

THE ORDER INSIDE THIS ROUND IS NOT NEGOTIABLE. The route-drawer test comes
first, because it costs two calls and may remove the need for most of the rest.