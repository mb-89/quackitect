---
minted_in: i1
id: dsp-walk-machine
type: "[[design-spec]]"
statement: the pull-driven walk over compiled machines, carried by one session that recomputes position on every call
realizes:
  - el-walk-engine
  - if-method-compiler-to-walk-engine
  - if-record-store-to-walk-engine
files:
  - project/deliverable/engine/session.ts
  - project/deliverable/engine/sessionclaims.ts
  - project/deliverable/engine/machine.ts
  - project/deliverable/engine/pull.ts
  - project/deliverable/engine/route.ts
  - project/deliverable/engine/atamwalk.ts
  - project/deliverable/engine/conditions.ts
  - project/deliverable/engine/scale.ts
  - project/deliverable/engine/readproof.ts
  - project/deliverable/engine/sessionreads.ts
  - project/deliverable/engine/sessionviews.ts
  - project/deliverable/engine/sessionscript.ts
---

## Two files were unclaimed, and one of them is where green is decided

`sessionclaims.ts` holds the claim readers — what stands, what is blessed,
what a law proved, and what drift painted suspect. It was named by no design
spec at all, so the sweep counted it as code nobody designed.

IT BELONGS HERE BY ITS OWN IMPORTS AND BY ITS SUBJECT. The session recomputes
position on every call, and what it recomputes is which claims still stand.

## Responsibility

One pull answers with one instruction: read, fill, choose, do or wait.

THE READING PROOF IS PART OF THAT ANSWER, which is why engine/readproof.ts sits
here rather than beside the lane door. A `read` instruction is not complete
until the walk can tell whether the document arrived, and the probe maths is
what decides it. It was minted on trunk on 2026-08-18 and claimed by nothing
until i17 reached this check.
The session recomputes position from the repository on every call,
weighs each hop against the autonomy slider, serves the owed reading
with its proof, and never trusts a client-held position.

## Interface

The compiled machine arrives from the method compiler; the record's
instance and worktree arrive from the record store. The session is the
one consumer of both.

## Behavior and constraints

- Blocking is an instruction, never an error.
- A crash lands safe: the walk resumes from the repository.
- The pull answers inside a second on the driver's critical path.

## The busbar is the only AND

A STATE'S INPUTS MEET AT AN AND BAR. The bar is passed only when every state
feeding it is done, and the state cannot submit before then.

IT IS THE ONLY AND-MECHANISM. The activation rule, the submit check and the
drawing all read the same field. There is no second word and no second place
it is enforced.

THE BAR IS AUTHORED, NEVER INFERRED. It is an element of the state machine,
drawn by whoever writes the row. The engine never decides where one belongs.

ITS ABSENCE IS THE OR, and that is the default. A state with several inputs
and no bar above it moves on the first input that arrives. No vocabulary says
this — the missing bar already does.

IT IS NOT A GATE THING. A gate is one state that happens to carry a bar, and
work states carry them too. The engine once keyed the rule off the state being
a gate, which gave every work state an accidental OR.

`state_kind: join` survives as DRAWING vocabulary only. The compiler turns it
into a busbar and nothing at run time reads it. The two used to be read in two
places under two names: a matrix row's bar was checked at submit and never at
activation, a drawn join at activation with no submit rule. Same idea, two
mechanisms, nothing making them agree.

INBOUND EDGES ARE DEDUPED, because two edges from one source into one state
are one inbound. Counted twice, a busbar could never reach its own total.

## A green branch satisfies its edge

A BUSBAR WAITS FOR EVERY INBOUND EDGE. An edge whose source already stands
filled has nothing left to deliver — the work is done and its fuel was consumed
the last time the join ran.

WITHOUT THIS A THREE-WAY JOIN IS UNREACHABLE by a single token. Walking one
branch fires one edge; reaching a sibling routes back through the fork, which
re-walks the branch and clears the fuel. Measured: all three branches walked,
the gate still shut, and stepping out to re-enter reset the count to zero.

THE REOPEN PATH SOLVES THE SAME PROBLEM BY PUTTING FUEL BACK. This solves it
for a plain walk, by not demanding it.

## What makes a branch an AND

A BRANCH IS AN AND WHEN a state is reachable from every leg AND carries a
busbar over several inputs.

THE INPUT COUNT IS LOAD-BEARING. Reachability alone says nothing: a machine's
END is downstream of every leg by construction, so any bar on it would turn
every branch in every machine into an AND — including idle's doors, where
taking one is a decision and the others are never walked.

A BAR OVER ONE INPUT SYNCHRONISES NOTHING. It is a bar over two that says the
legs below it are all required.

## The ripple names its root

A FALLEN CLAIM USUALLY FELL BECAUSE ITS INPUT FELL, and that one because its
own did. Naming the first hop sent a reader to amend a state that was merely
waiting, watch nothing change, and ask again.

WHAT IT COST: a value outside its vocabulary trapped a walk for eleven calls,
four states away. Three amends were aimed at states that were fine.

A ROOT IS A FALLEN CLAIM WITH NO FALLEN INPUT OF ITS OWN. That is where work
has to happen; everything between it and here is waiting. The path comes back
with it, root first, so a reader can see how a state four hops away is the
reason this one will not go.

A CYCLE RETURNS NO ROOT, and the caller falls back to naming the first hop,
which is still better than silence.

## Feeders are looked through, never gated on

THE CLAIM-BEARING FEEDERS of a state are found by looking THROUGH states that
carry no claim of their own. This is the ripple computed rather than written:
green stops at the first input that is not green, and no mark on a file is
needed to say so.

TRANSPARENT STATES ARE LOOKED THROUGH. `start` and plain waypoints carry no
evidence form, so they can never be green, and gating on them would grey the
entire machine. The question is the first input that COULD be green and is not.

## Tokens go on the frontier

A RE-PIN REOPENS SEVERAL STEPS, and a token belongs only on the roots of that
set.

WHAT PUTTING ONE EVERYWHERE COST: a re-pin reopened eight scattered steps and
placed eight tokens. The walk then stood in M0's kickoff gate and M3's
requirements at once — two steps on one sequential chain, which no legal
marking holds. The mirror painted eight live states, the pull offered eight,
and the input check refused the later ones on arrival. Enforcement held; the
POSITION was a lie.

A REOPENED STATE BELOW ANOTHER IS RE-REACHED BY WALKING. Its inbound fuel was
just dropped above, so it re-arms and fires again once its feeders sign. Only
the roots need placing by hand.

A GENUINE FORK KEEPS ITS SEVERAL TOKENS. The frontier of a real AND branch is
several states, none downstream of another, and the filter leaves every one of
them standing.

## The route computes what is needed, not what is nearest

THE FRAME IS `make`: name a target, compute what is needed, run it. It was a
breadth-first shortest path instead, which is a different question with a
different answer. Two things followed:

- IT WAS BLIND TO GREEN. A state already standing was routed through exactly
  like one that still owed work.
- IT WAS BLIND TO THE AND. From one state it found ONE way to a gate. But a
  gate collects EVERY input, so a branch the path never mentioned is still
  owed — and the walk marched to a gate that then refused, naming a feeder
  nobody had been sent to.

DEFAULT IS AND. In most machines every branch must be covered, so the objective
is the first prerequisite that does NOT yet stand, and the target itself only
once they all do.

IT RE-ASKS ON EVERY PULL. Finishing one objective simply makes the next one the
answer, so no plan is stored and none can go stale.

## A record is work, not a corridor

A ROUTE NEVER PASSES THROUGH A RECORD WHEN A PLAIN DOOR EXISTS.

WHY THE ROUTER IS THE ROOT AND EDGE ORDER WAS NOT. The container's own guidance
promised an offer and the offer was real, but the ROUTER never reads an offer.
It searches, and a record was just another node on the way. So a target OUTSIDE
the container — the front desk, most often — drew its shortest path straight
through whichever record came first, and walking that path ENTERED it, bound it
and stamped it started.

BOTH HALVES WERE SEEN: five entries into one record after dropped connections,
and separately, aiming at an intended iteration drawing a route THROUGH two
more and starting those as well.

PASSING THROUGH A RECORD IS NEVER INCIDENTAL to going somewhere else, because
entering it takes it up.

THE GUARD IS CONSERVATIVE ON PURPOSE. It only withholds a record when the same
state also offers a door that is NOT a record, so no container can be stranded
by it. Where a record is the only way on, the route still goes through it.

A RECORD THE WALK IS NOT INSIDE OWES NOTHING, which is the other half of the
same fix. Restricting the upstream walk to INPUT edges closed one route in;
this closes the other.

## One rule for landing, whichever move brought you

A STATE THAT CARRIES A SUB-MACHINE IS NEVER A POSITION. The position is that
machine's own start.

The normal edge knew this and the POP did not, so popping out of one container
landed ON the next container and the route stepped straight over every state
inside it. Five states sat outside the search and the walk reported no path to
them.

## The scenario walk

THE SCENARIO WALK — ATAM's qualitative half, dealt as a deck (owner ruling
2026-08-10). The corpus splits design review into a computed half and a
judged half; this module computes the READINGS for both. The judgments stay
button-fed lines in the evidence form, exactly like the flip deck's rulings.

Pure over its inputs. The args assembly in stateform.ts does the reading,
so the tests need no filesystem.

## Which picked columns still take something else

WHICH PICKED COLUMNS STILL TAKE SOMETHING ELSE (owner ruling
 2026-08-08: "this should just show me all the clusters, and I can only
 choose clusters").

 A PICK IS CLOSED BY DEFAULT, because that is what a known set means. A
 column named here is the exception: the offer is help, and typing past
 it is legal. The comparison cards need it — their cells hold an id PLUS
 a reason, and a closed chooser would forbid the reason.

## The change sizes that do not ask this question

THE CHANGE SIZES THAT DO NOT ASK THIS QUESTION (owner ruling 2026-08-13).

 A rigor cell could only ever do two things: keep the state or strike it,
 and swap its guidance prose. So "keep the step but ask less at this size"
 had no mechanical form, and the note asked the agent to be brief — a
 judgment, made afresh every time, by whoever happened to be walking.

 Naming the sizes here makes the trim MECHANICAL. The column compiler
 drops the field; nothing at that size can ask for it, and nothing at any
 other size loses it.

 ABSENT MEANS ASKED EVERYWHERE, on purpose. A key nobody wrote must never
 silently delete a question — the safe direction for a typo is to ask too
 much.

## Another field in this state that this one is

ANOTHER FIELD IN THIS STATE THAT THIS ONE IS DERIVED FROM.

 A derived field asks for nothing. It reads the named field, computes,
 and shows the answer — so the answer cannot disagree with what it was
 computed from, which is what a second typed copy always eventually does
 (owner report 2026-08-08, on a Pareto front typed beside its scores).

## The instrument is not the deliverable

THE INSTRUMENT IS NOT THE DELIVERABLE. A READER WHO OWES AN ANSWER IS
(i33, 2026-08-17). i12 shipped the one-second rule and the timings were
recorded from that day; two days later 1834 of 8424 calls were over it,
because nothing in the machine ever obliged anybody to look.

ITS OWN RED TEAM HAD WRITTEN THIS DOWN IN ADVANCE: a milestone three that
ends with no state reading the instrument means the iteration repeated
i12 and should be judged failed. This field is the state that reads it.

EMPTY MEANS NONE BREACHED, and renders as nothing rather than refusing.

## Asked at every gate

ASKED AT EVERY GATE, SO NOTHING IS DROPPED (owner ruling 2026-08-06).
A review is where somebody has just looked hard at the work, which is the
moment a risk or an assumption is most visible and least likely to be
written down. Waiting for the state that owns the register is how an
entry is lost. NONE IS A LEGAL ANSWER and most gates will give it; the
cost of asking is one line, and the cost of not asking is an assumption
nobody records until it breaks.

## Authored meaning or empty

AUTHORED meaning, or empty (owner ruling 2026-07-28): a statement
 exists only when it says something the id does not ("In doubt, go
 here."). The mirror renders it small under the node's name; filler
 like "The retro machine." is struck, never generated.

## Every state carries the weight of entering it

HUMAN INVOLVEMENT (owner ruling 2026-07-26): the weight of the
 decision to ENTER this state, 0.01 (mechanical) .. 1 (milestone). The
 agent may enter only when priority <= the session threshold; the
 human always may. Required on every state.

## Superseded and reopened

"superseded" and "reopened" (i12): a reopen must be representable IN the
record, not by deleting it. A superseded fill happened and did not survive
review; erasing it would make a reopen indistinguishable from work that was
never done, which is exactly the history a reader needs most.
"paused" writes no more (one escape since 2026-08-02) — old records keep it

## Green is green

GREEN IS GREEN, WHOEVER WALKED IT (owner ruling 2026-08-09). A state whose
evidence stands owes nothing. Nothing records this instance having walked
over it, and nothing needs to.

Two sources, and the second is the one that survives. History says THIS
instance filled it, which a reload or a re-entry wipes. The evidence says
it stands at all, which outlives every one of those.

## One watcher per directory

ONE WATCHER PER DIRECTORY, NEVER `recursive: true` (found 2026-08-13,
note-15acce44d2f3). unref() is supposed to let a watcher hold the cache
warm without holding the process open, and it does — on a single,
non-recursive watch. Measured on this platform: `watch(dir, {recursive:
true}, cb).unref()` still keeps node alive indefinitely (a `node --test`
run that finished every case sat for hours until killed by hand).
Non-recursive watches on the same tree, each unref'd, exit clean in
under 150ms. The tradeoff this accepts: a subdirectory created AFTER
boot goes unwatched until the next restart — correct and slow beats
fast and wrong, and a brand-new guidance folder is rare next to an
edited file in an existing one.

## The reading proof

THE READING PROOF — the probe maths, in ONE place.

WHY THIS FILE EXISTS (owner, 2026-08-18: "why don't you have three copies of
the same math? Export it, put it in one place, call it from everywhere").

There were three. The engine's own `readingProbes`, a mirror called
`proofFor` in the test helpers, and two more copies inlined inside
tests/iterations.test.ts. On 2026-08-18 the engine stopped counting markdown
list markers as words; the helper was moved with it and the two inlined
copies were not, so two cases went red on a change that was correct.

A MIRROR IS A COPY WITH A COMMENT ON IT. The helper's own comment said "the
engine's own proof, mirrored" and named the function it mirrored, and it
still went stale — because a comment cannot make two functions change
together. Only calling one function can.

SO: the engine builds probes from here, the tests answer them from here, and
tests/one-probe-maths.test.ts fails if a fourth copy appears.

## The words a reader would count

THE WORDS A READER WOULD COUNT.

 A markdown document is full of tokens that are not words: a list dash, a
 heading's hashes, a table pipe, a horizontal rule. Splitting on whitespace
 counts every one of them, so "the 4 words that FOLLOW" could ask for `-`
 and then refuse every answer a person would actually give.

 MEASURED 2026-08-18. Boot cost four round trips on
 guidance/method/cloud-runner.md. The expected answer was
 `remedy; follow it. -` and the document reads:

     ... Every refusal carries a
       remedy; follow it.
     - DO NOT PUSH.

 Three attempts gave the three words a reader sees. Only quoting the list
 marker of the NEXT bullet was accepted.

 THE i35 FIELD REPORT READ THE SAME SYMPTOM AS LINE-BREAK SENSITIVITY. It is
 not that: normWords flattens whitespace on both sides, so an anchor
 crossing a newline compares fine. The tokens were the fault, not the
 breaks.

 A token counts when it carries a letter or a digit.

## The comparison rule

THE COMPARISON RULE, beside the probe rule because they are one decision.
 Whitespace and case are flattened, so an answer whose words crossed a line
 break in the source still matches.

 AND THE ANSWER IS COUNTED THE WAY THE PROBE WAS CUT. WORDY drops the tokens
 a reader would not count when the probe is built; until 2026-08-18 nothing
 dropped them again when the answer came back, so a reader who did what the
 hint says — quote it VERBATIM, punctuation and all — failed on any window
 holding a standalone em dash.

 MEASURED AT THE i17 BOOT. front-desk.md reads "and NO vocabulary on purpose
 —\nthose must come from the sweep". The probe asked for the 4 words that
 FOLLOW "and NO vocabulary on". The verbatim answer carried the dash and was
 refused; only the answer with the dash REMOVED was accepted. Two calls, on a
 document that had been read.

 ONE FILTER ON BOTH SIDES IS THE FIX, and it is strictly more permissive:
 every answer that passed before still passes.

## The autonomy scale

The autonomy scale — an Obsidian-editable markdown TRUTH
(machines/scale.md): the engine reads it fresh, never defines it.

THE RUNGS CARRY NO NUMBERS, AND THE ORDER IS THE SCALE (owner ruling
2026-08-18: "it is a terrible idea to have scales for things that are not
numeric... I never see them, and nobody ever has to wonder about these
numbers").

The grammar is "- abbr | name — description" under a heading, and a rung's
place in that list is its rank. The engine still compares numbers, because
a gate is a `>` and always was; it DERIVES them from position instead of
reading them off the page. Nothing that reaches a person carries one.

THE DERIVED VALUES ARE THE ONES THAT WERE AUTHORED. Six rungs spread across
nought to one give 0, .2, .4, .6, .8, 1 — the exact ladder that used to be
typed in by hand. So this removes the numbers without moving a single
threshold.

A malformed line fails loudly — a silently misparsed scale would draw
confident wrong notches.

## A states weight

A STATE'S WEIGHT, said as a word — the least rung that admits it.

 NOT tierOf, WHICH IS THE DIAL'S FUNCTION. tierOf answers "which rung does
 this SETTING reach", so it looks DOWNWARD and a value below the lowest rung
 reaches nothing — "blocked". Applied to a state that is exactly backwards:
 a terminal at 0.01 is the lightest step there is, and it read as the
 heaviest. Seen live 2026-08-16 the moment the doors started serving words:
 `iterations/end` came back as `weight: "blocked"`.

 ABOVE THE TOP RUNG IS GENUINELY BLOCKED, and that is the one case where the
 word is right: nothing admits it, so the agent never may. The archives are
 drawn that way on purpose.

## The default rung

THE DEFAULT RUNG, BY NAME. Nothing in the engine writes the dial's
 starting value as a number: it is looked up from the scale like every
 other rung.

 TACTICAL IS THE DEFAULT EVERYWHERE (owner ruling 2026-08-18). Measured:
 the heaviest state inside an iteration is a gate, and a gate weighs
 tactical. Everything else is lighter, so tactical ENTERS every state an
 iteration has — retros, overhauls and seeding stay strategic, and stay
 with the person.

 IT WAS OPERATIONAL, AND THAT COULD NOT ENTER A GATE AT ALL. gate-kickoff is
 the first gate of every iteration and it is tactical, so an unattended run
 stopped at the first milestone every time. Measured on the i15 and i35
 cloud runs.

 IT DOES NOT WALK AN ITERATION END TO END, AND THIS COMMENT SAID IT DID
 (found at i17's gate-kickoff, 2026-08-18, on an unattended box). ENTERING a
 state refuses on `priority > autonomy`, so a hand AT the weight is admitted.
 BLESSING refuses on `autonomy <= priority`, so it wants a hand strictly
 ABOVE — that is the 2026-08-04 design, where a gate is reviewed from one
 rung above the work it reviews, and it is deliberate.

 SO THE TWO COMPARISONS ARE BOTH RIGHT AND THE CLAIM BETWEEN THEM WAS WRONG.
 tactical fills a gate and cannot sign it. An unattended run that must sign
 its own gates is launched at strategic, which is the person's call to make
 (se-arrive says so in its own help), and this default is not it.

 raid-iss-tactical-is-documented-as-enough-to-walk-an-iteration-and-is-not
 carries the measurement.

## The state a recorded visit names

THE STATE A RECORDED VISIT NAMES. A visit is stored qualified and
 occurrence-stamped ("expeditions/e30@0"), and the graph-is-evidence check
 compared it against the bare state name. It matched nothing, so the check
 passed vacuously: every expedition closed so far went unlooked-at, one of
 them with nineteen open points standing (measured 2026-08-02).

 A flag computed and never compared is this codebase's recurring defect,
 and it hides because a check that SEES nothing reports exactly like a
 check that FINDS nothing.

## Sereopen and seamend join them because a claim is

se_reopen and se_amend join them because A CLAIM IS FIXED FROM OUTSIDE IT
 (owner ruling 2026-08-07). Both act on a state you are not standing in —
 that is the whole point, since standing in it means it is already owed and
 neither op is needed. Gating them by the current state's legal_tools would
 make them reachable only from the one place they are useless.

 Their safety is not the gate's. reopenClaim and amendClaim each refuse an
 unsubmitted form, and an amend that breaks a check is refused with the file
 put back.
 se_why joins them because A DIAGNOSTIC IS NEEDED EXACTLY WHERE THE WALK IS
 STUCK. A verb that explains why a state is grey, but is only callable from
 states where nothing is grey, is useless at the one moment it exists for.

 It was written gated and its own first test caught it: refused at
 boot/read_contract, which is precisely the kind of place somebody asks.

 IT CHANGES NOTHING. It reads the conditions the walk was about to compute
 anyway and returns them. There is no state to corrupt by asking.

## Every engine start aims at the front desk

THE TARGET — where the walk is headed, and the blue line the mirror
 draws. Every engine start aims at the front desk (owner ruling
 2026-07-29): the desk is where a person says what they want, so it is
 the destination unless somebody names another.

## An empty target is a deliberate clear

AN EMPTY TARGET IS A DELIBERATE CLEAR, NOT A MISSING ONE. `aimAt("")` is
how the walk says it arrived and is aimed at nothing, and it persists
that empty string faithfully. Refusing to restore it left `_target` at
its field default, `front_desk` — so a cleared aim came back pointing at
a state BEHIND the walk, and every packet reported the machine headed
for the desk while it walked deeper into a record.

SEEN LIVE 2026-08-16: `target: front_desk` on every pull inside i11,
after a reload, with nobody having aimed there.

`undefined` still restores nothing, which is the real "never set".

## Where the dial stands

WHERE THE DIAL STANDS, AS A WORD. The number above runs the comparison
 and nothing else should ever ask for it — a caller that wants to know
 the rung wants this (owner ruling 2026-08-18: nobody has to wonder what
 the numbers mean). Empty only when the scale itself cannot be read.

## The update cadence

THE UPDATE CADENCE (owner design 2026-07-31, redrawn 2026-08-01): how
 often narration is OWED. TWO NUMBERS, not a level — an update every n
 minutes at least, or every n calls at least, whichever falls due first.
 The reader types them, because a preset list is someone else guessing
 which rhythm suits the surface they are watching from.

 Zero on either means that clock does not run. Both zero owes nothing.

## Atomic ticks retired with the tick

ATOMIC TICKS RETIRED WITH THE TICK (owner ruling 2026-08-02). The
`from` assertion existed because an agent PLANNED a move and the
human's hand could shift the walk under it. The pull plans nothing:
it recomputes from wherever the walk stands, every call, so the race
the assertion guarded against no longer exists to lose.

## The ordered reload

THE ORDERED RELOAD (owner ruling 2026-07-27): engine swaps fire only
 on request — never on their own — and only at idle. The canary
 refuses to kill a running engine for a tree that does not load; then
 the child exits 42 and the shim respawns it on the new sources. The
 walk reboots — by design; boot re-proves the new engine green.

 EMERGENCY RELOADS FROM ANY STAND (owner ruling 2026-08-04). Emergency
 is repair, and repair is exactly when the walk cannot afford to go
 home first: reaching idle costs an escape, and the escape costs the
 target.

## Where the lane works

Where the LANE works. ONE TREE, so this is the root and nothing else
 (owner ruling 2026-08-16).

 IT USED TO READ `this.bound?.path ?? this.machineRoot()`, which is the
 same chooser `storeFor` carried, one layer up. A bound record answered
 with its own tree, so the same relative path named different files
 depending on what was open.

 A BOUND RECORD'S path IS THE ROOT NOW, so this could have been left as
 it was and would have given the right answer. It is written out anyway:
 a chooser that happens to have one branch is still a chooser, and the
 requirement asks for the absence of one, not for the right answer.

## One checkout owns every record

THERE IS ONE WORKING TREE. A record is a folder inside it, never a
checkout of its own, so nothing selects between trees and no call can pick
the wrong one.

TWO THINGS BELONG TO THE MACHINE AND NEVER TO A RECORD.

- `.se/` session state: the call log, the notes, the handover, settings,
  the mode and the autonomy levels. One per machine, not one per record.
- The claim ledger and the machine id, which say WHICH machine this is.

WHY IT IS A METHOD AND NOT THE RAW FIELD. Eighty-seven callers reached
past `workRoot` straight to the field, and most of them were right to want
the repo. One of them was not, and nothing distinguished it: a state's
script condition ran against one root while every file verb wrote to
another, so the check judged a corpus the agent had no write path to.
Naming the intention is what makes the odd one out visible.

## The corpus a reader sees

THE CORPUS A READER SEES. One entry, because there is one tree.

 IT USED TO BE A CHOICE (owner ruling 2026-08-06), back when a record was
 its own checkout and a whole-corpus view belonged to no single one of
 them. The person picked which they meant instead of the engine guessing,
 which it had done three times, differently each time.

 i34 GAVE THE QUESTION ONE ANSWER by deleting the second tree. The ruling
 is not overturned: nobody guesses. There is simply nothing left to pick
 between, so the picker is hidden rather than asked.

## Resolved by what the path is

RESOLVED BY WHAT THE PATH IS, never by where the walk stands (owner
ruling 2026-08-07). paths.ts holds the classification and the reasons.

A DECLARED ROOT is session state exactly like .se/ — its declaration
lives in the project root's .se/roots.json, so a bound worktree must
never make the owner's roots read as undeclared (found live 2026-07-30).

## Does this state owe a signature fields are the

DOES THIS STATE OWE A SIGNATURE? Fields are the usual answer and they are
 not the question (owner, 2026-08-17: "If it's not submitted, then you're
 not going to the next state").

 THREE SHAPES, AND ONLY THE MIDDLE ONE WAS EVER HANDLED.

 - A state with evidence FIELDS. Signs, and `evidence_form.length > 0`
   finds it. Almost every state.
 - A state with a FORM BUT NO FIELDS. Signs on a bare submit, because its
   check is computed rather than typed — fill-story-evidence reads every
   story deck and refuses on an empty slide. It has an instance and a
   signature line and no fields at all.
 - A state with NO FORM. Never signs. read_contract and prepare_idle are
   reading and machinery, and asking them for a claim wedges the boot.

 ASKING ABOUT `kind` WAS TRIED FIRST AND IS TOO WIDE: read_contract is a
 `work` state too, and five tests said so within a minute of the change.
 The instance on disk is what actually separates the middle from the last:
 a state that has a form has a file, and a state that has no form has
 none.

 WHAT THE MIDDLE CASE COST while it read as machinery: the walk crossed
 fill-story-evidence unsigned three times, two states signed under the
 gap including a gate, the panel painted them green, the record was merged
 to trunk as finished, and the only route back was twenty-five hops
 forward through `shipped`. note-fa24138d389e.

## Completestate with the wedge guard

completeState with the WEDGE GUARD: a move that would leave an open
 machine with NO active state is refused with the starving join named —
 the walk stands instead of stranding. Found live 2026-07-28: plain
 return edges compiled as normal made idle an AND-join, and completing
 boot dropped the only token into nowhere.

## A claimful state completes on its claim

A CLAIMFUL STATE COMPLETES ON ITS CLAIM (owner rule 2026-08-09: the
walk once passed build_chart unsigned and reached the gate — a
sub-machine skipped whole. subObjective closed that route; this
closes the CLASS, at the one gate every completion passes). A
"filled" completion of a state that declares evidence, while its
claim is not green, is work that was never done. The unchosen leg of
a choice is never completed, so a choice machine cannot wedge here.
Claimful completions only — mechanical hops stay free of the corpus
load this check costs.

## A completion that would open several alternatives chooses none

A COMPLETION THAT WOULD OPEN SEVERAL ALTERNATIVES CHOOSES NONE OF THEM
(owner ruling 2026-08-16, req-a-pull-carrying-no-choice-enters-no-iteration).

WHAT WENT WRONG WITHOUT IT. completeState fires every alternative edge
at once and then takes `inst.active[0]` as the new position. So a state
with several open doors did not offer them — it walked through the first
one, and "first" meant whatever order the edges were built in.

IT COST FIVE ENTRIES INTO THE WRONG ITERATION ON ONE DAY. Each was a
bare pull after a dropped connection. Entering BINDS the record and
stamps it started, so a connection failure was starting work nobody
chose, and nothing recorded that nobody chose it.

`only` IS THE CHOICE. The choose path passes the named target through,
so a chosen door completes exactly as before. What is refused is the
completion that names none.

STANDING STILL IS THE ANSWER, not a refusal. The walk stays where it is
and the pull reports the doors, which is what an offer IS here — there
is no `choose` instruction and there never was.

ONE ALTERNATIVE IS NOT A CHOICE. A lone alternative edge is how a return
and a single-visit machine are drawn, and both must keep walking through.

## The outcome a hop completes with

THE OUTCOME A HOP COMPLETES WITH, and it is the drawing that says which.

 A `fallback` or `error` edge IS the drawn path for the thing going wrong,
 so taking one is not a state finishing its work — it is a state failing
 and the machine having somewhere to put it.

 WITHOUT THIS THE FALLBACK WAS UNREACHABLE. `completeState` fires fallback
 edges only on a non-filled outcome, and every hop completed "filled", so
 a fallback edge could never fire at all. verification's exit script would
 come back red, the forward door stayed shut on the condition, and the
 repair door the drawing put there for exactly that case never opened.
 Found live 2026-08-16, with the walk holding read verbs and no legal move.

 AND IT LEAVES THE STATE RED (owner ruling 2026-08-16: "if we complete on
 failed outcome, then it must be marked red"). `settledStates` counts a
 state green only where its LATEST history outcome is "filled", so a
 failed completion takes it back out of the green set by construction.
 Walking on is not the same as passing, and the record says so.

## The machine is read live

THE MACHINE IS READ LIVE (owner ruling 2026-07-29). Editing a state
 note — its legal tools, its priority, its guidance — takes effect on
 the next call. The markdown is the single truth, so a running lane
 that enforces yesterday's copy of it is enforcing a lie.

 se_reload is still the door for ENGINE CODE, which Node caches as
 modules and no re-read can reach.

 TWO THINGS NEVER MOVE THE GROUND UNDER THE WALK:
 - A drawing that will not compile. The last good one stands and the
   walk continues — the same bargain SE-C-124 already makes.
 - A drawing that no longer holds a state the walk is standing in.
   Deleting the active state out from under a live walk would strand
   it, so the edit waits until the walk has moved on.

## The qualified name of a state in the machine

The qualified name of a state in the machine that governs now. THE
 ROUTE GRAPH SPEAKS QUALIFIED IDS, so everything that hands a state
 name outward has to speak them too. An offer that named a bare one
 was a door nothing could walk: a freshly seeded expedition came back
 as "e31", and every legal answer to it was refused as unreachable
 (found live 2026-08-02, on the ordinary path into an expedition).

## A submachine is named by its container

A SUBMACHINE IS NAMED BY ITS CONTAINER, but the search graph never holds
 that name: expandNode replaces the container with its inner states. So
 aiming at "expeditions" found no path to a state the reader had just
 walked into, which made the target useless for half the drawing (found
 live 2026-07-29, the moment the mirror got a key for setting it).
 Aim at its start. The render maps that back to the container node, so
 the destination dot still lands exactly where the reader pointed.
 The target's OWN machine answers this, never the main one. A door
 inside a container is named "expeditions/e31", and looking that up
 in main found nothing, so every such door read as not-a-submachine
 by accident rather than by test.

## A sub-machines work is not invisible

A SUB-MACHINE'S WORK IS NOT INVISIBLE (2026-08-09). claimFeeders looks
THROUGH a state carrying no claim. That is right for a waypoint and
wrong for a CONTAINER: everything drawn inside it disappears from the
objective, so a walk aimed past `enumerate-space` ran seven finders
and a chart in one hop without being asked for anything.

Found when build_chart reached gate-candidates unsigned, with three
empty evidence fields and no file on disk at all.

## The first owed state inside a sub-machine that lies

THE FIRST OWED STATE INSIDE A SUB-MACHINE THAT LIES UPSTREAM OF THE AIM.

 Walks the inbound INPUT edges of THIS machine, and for each container it
 meets, asks that machine what it still owes. The first answer wins, in
 the sub-machine's own declaration order, so a chart that waits on its
 finders is named after them rather than before.

 INPUT EDGES ONLY (owner emergency ruling 2026-08-11). Every idle door is
 double-headed, and the compiler names each return half alternative.
 Counting those as inbound made the WHOLE machine upstream of the front
 desk, so an aim at the desk descended into whatever record stood open:
 boot marched into i2, parked at a gate, and served the record's reading
 as boot's own. The desk is never behind the work.

 THE WALK'S OWN CONTAINER STILL ANSWERS. A walk standing inside a record
 keeps finding its owed legs — the container it stands in is asked even
 though no input edge makes it upstream of the aim. That keeps the same
 day's wedge fix: a finished fan leg still learns its owed sibling.

## The first owed claim in a sub-machine

THE FIRST OWED CLAIM IN A SUB-MACHINE, HOWEVER DEEP (owner ruling
 2026-08-11). One level was not enough: aimed at the front desk with a
 composer leg owed two containers down, the objective fell back to the
 aim, the branch return could not map it into the leg's machine, and the
 walk stood on a finished leg answering `do` with nowhere to go. Every
 such wedge cost an escape to the desk and a re-aim by hand.

 Declaration order is walk order in these machines, so the first undone
 claimful state found this way is the same one a person reading the
 drawing would name. A container met on the way is asked the same
 question before the walk moves past it.

## The route is recomputed

THE ROUTE IS RECOMPUTED, NEVER RE-DERIVED (measured 2026-08-02: 200 ms
a call, and readingList asks for it on EVERY pull). Draining eight
documents therefore paid it nine times without one input changing.

The key is everything the search can see. The machine is compared by
IDENTITY, which is safe because compileMachineCached returns the same
object while the drawing's CONTENT is unchanged — so an edited canvas
misses the memo, and the truth stays read live. `generation` covers what
no file content can: a record seeded or a worktree bound changes what a
generated container expands to.
THE OBJECTIVE IS PART OF THE KEY, and it is computed BEFORE the memo is
consulted. The route used to be pure graph search over the drawing, so
the drawing's identity was a complete key. It now depends on which
claims stand, and those change under a walk that is filling forms.

Caught live 2026-08-07: a claim was signed, the objective should have
moved on, and the memo kept handing back the route to the state the
walk was already standing in — so the walk had nowhere to go. A stale
derived value, which is the exact fault this whole day removed
elsewhere.

nextObjective reads the evidence files, which is cheap. What stays
memoized is expandNode, which WRITES generated containers.

## The objective is computed on a memo miss

THE OBJECTIVE IS COMPUTED ON A MEMO MISS, never before the check.

It reads the evidence, and evidence reading is not free. Computing it
ahead of the memo put a full green recomputation on EVERY packet, and
route() is built into every packet — se_aim measured 2936 ms and the
next pull never came back.

The staleness that ordering was meant to fix is handled at the other
end instead: a WRITE clears this memo. Invalidate on the event, do not
recompute on every read.

IT USED TO BE FORM WRITES ONLY, on the reasoning that a form write is
the only thing that can change which claims stand. That is false, and
it wedged the walk on 2026-08-07. A claim's green also depends on the
TRACE NODES it references, so repairing a node changed the answer while
the memo kept handing back the old objective. The walk stood in a state
the router still believed was owed, and re-aiming could not shift it.

Every lane write now clears it. The cost is one recomputation after a
write, which is exactly when the answer may have moved.

## No way forward is not the same as no

NO WAY FORWARD IS NOT THE SAME AS NO WAY (owner design 2026-08-07).

A fan hands out ONE leg. Walk it to the end and the drawing offers
nothing: the other legs are behind you and the join above wants them
all. The walk was not stuck, it was facing the wrong way.

Until today the only exit was se_pull {escape} — back to the desk, a
full re-aim, every owed document served again. It cost two escapes in
one session from states that were signed, met and green.

So: where no forward path exists, look for an AND branching point
behind the walk that reaches the objective, and return to it. An OR
branch is never offered, because there the branch is where a DECISION
was made and walking backwards would un-make it.
A found route that WRAPS out of the shared machine is the loop-the-
machine line: prefer the branch return there too.

## The number is gone from the answer

THE NUMBER IS GONE FROM THE ANSWER (owner ruling 2026-08-14, final:
"that number leaves... there's no call to be made"). The tier WORD is
the autonomy, and req-autonomy-is-categorical says so. The cut-over
that raid-risk-autonomy-rework-breaks-walking asked for came first and
is complete; this is the removal it said would follow.

## One document, not a list of them

── THE READING (owner design 2026-07-31) ──────────────────────────

ONE DOCUMENT, NOT A LIST OF THEM. The engine knows both halves already:
what the way ahead demands, and what the head already holds. So it hands
over the DIFFERENCE as a single file. One read instead of eight, and
reading it credits every document inside it.

NAMING THE LIST WAS NOT ENOUGH. route_reads gathered the paths in one
place and the reading still cost a call per batch, because a list of
eight paths is still eight documents to ask for.

ONLY THE UNREAD PART IS GATHERED, so nothing is read twice and the
reading shrinks to nothing as the walk proceeds.

EACH PART CARRIES ITS OWN HASH in its header, and crediting re-hashes
from disk: a document that moved between the gathering and the crediting
is skipped and simply demanded again. A stale credit would be a proof of
reading something nobody was shown.

## Always look ahead

ALWAYS LOOK AHEAD — never only when the route gave nothing.

THE ROUTE STOPS AT THE STEP IT CANNOT ENTER, so that step is not among
its steps and its entry documents were never gathered. When the reason it
could not be entered IS an unread document, that document is the only one
that matters, and it was the one thing missing from the reading.

The old guard made it worse by testing the UNFILTERED list. A route that
contributed only documents already in the head counted as not empty, the
lookahead was skipped, and the filter below then left the reading EMPTY
while the walk stood blocked on a document nobody was shown. The pull
answered with a refusal whose own remedy could not be executed: pulling
served nothing, and reading the file by hand credits only the gathered
reading, never an arbitrary path. Found live 2026-08-06.

Gathering more candidates is free: the filter drops everything the head
already holds, so nothing is ever read twice.

## Name it in the reading rather than skipping in

NAME IT IN THE READING rather than skipping in silence.

An owed document that cannot be read used to leave the reading
EMPTY: the header said "1 document(s) the way ahead demands", the
body said nothing, and the refusal repeated a name with no way on
Earth to satisfy it. The comment here claimed it "says so where it
is asked for". It did not.

It cost a state its entry on 2026-08-06, and the cause was a row
naming a bare id where a PATH is owed — a five-second fix that took
an hour to see, because nothing anywhere said which document or why.

No part is pushed, so it stays owed and the walk still blocks. It
blocks legibly now.

## The word never the number

THE WORD, NEVER THE NUMBER, ON A SERVED SURFACE
(req-autonomy-is-categorical; owner, 2026-08-16: "I don't want the old
scale anywhere anymore").

THIS WAS THE LAST LEAK, and it was the loudest: every door of every
pull carried `priority: 0.2`, so the number the answer had stopped
saying at the top was said a dozen times just below it. It is where
the agent read one and repeated it back to the owner in chat.

THE NUMBER STILL RUNS THE COMPARISON one line above. That half is
i14's, and raid-risk-autonomy-rework-breaks-walking asked for the
cut-over first and the removal second, never both at once.

## The offer and the check read one graph

THE OFFER AND THE CHECK READ ONE GRAPH. A sub holds the drawing the
 walk entered with; the router re-derives it live. Archiving a record
 takes its states out of the live one, so an offer built from the held
 copy names doors the router then refuses, and the walk is stranded
 with no legal move left (found live 2026-08-02, closing e31).

## What the machine wants next

WHAT THE MACHINE WANTS NEXT. One of five instructions, and never a
 refusal for a walk that simply cannot move yet:

 - `read`   documents are owed; nothing walks over unread guidance.
 - `fill`   the next step wants a form. Built HERE and handed over.
 - `choose` the road splits. The options ride along.
 - `do`     the happy path, already walked, up to the next branch.
 - `wait`   out of work, or the next step is the person's.

 THE PAYLOAD IS WHAT THE AGENT STILL OWNS, and it is TWO fields
 (owner ruling 2026-08-02). `form` — the filled form the LAST pull
 handed over: evidence for the step being left, or the answer to a
 choice the machine offered ({choice: "<to>"}). A choice exists ONLY
 where one was offered. `escape` — stepping out, with the why: one
 hatch for every kind, landing at the front desk. Everything else —
 the hop, the proof, the position, the route, invalidating earlier
 work — is the machine's or the person's.

 A genuinely ILLEGAL call still throws (v2's Rejected kind): a choice
 outside the offer, a form nothing asked for. Those are contract
 violations, not a machine with nowhere to go.

## The aim is read after the payload lands

THE AIM IS READ AFTER THE PAYLOAD LANDS. A CHOICE IS THE ACT OF
AIMING, so reading the aim first threw it away: standing at idle,
the walk fell back to the front desk and went THERE while the
chosen door sat recorded and unwalked. Proven live 2026-08-05 —
choice "expeditions" at autonomy 0.2 answered `do` for front_desk.
A DEFAULT TARGET IS NOT AN AIM (i34, req-a-pull-carrying-no-choice-enters-no-iteration).

With nothing aimed, the walk falls back to the front desk so an idle
agent drifts home rather than standing nowhere. That fallback WALKED A
CHOICE POINT: standing on the iterations container with two records
open, a bare pull left through the container's exit and arrived at the
desk, because the desk looked like somewhere it had been told to go.

THE REQUIREMENT HAS TWO CONJUNCTS and this is the second: the engine
"shall enter no iteration AND shall answer with the offer". Leaving
satisfies the first and fails the second, which is exactly the half a
tester with fresh eyes caught after the builder tested only the first.

SO A CHOICE POINT HOLDS THE DEFAULT. Where the walk stands on a state
offering more than one alternative and nobody has aimed anywhere, the
target is HERE. A real aim still crosses it, because that is somebody
saying where they want to be.

## The machine says what is wrong and what to

THE MACHINE SAYS WHAT IS WRONG AND WHAT TO DO (owner ruling 2026-08-07).

A `fill` that comes back unchanged IS a refusal, and every refusal in
this system carries its remedy. This one did not: the problems sat deep
inside the form model, and a big form is moved to disk by the host,
which hands back a PREVIEW — the head of the JSON. The problems fell in
the part that was dropped.

SO THEY RIDE AT THE TOP, beside `pull`, where a preview still shows
them. Five calls went on guessing at one word before this existed.

IT IS NEVER THE AGENT'S JOB TO ASK WHY. The machine holds the verdict;
handing it over is the machine's job, not a question the agent has to
know to ask.
THE STANDING FORM COMES FIRST (owner rulings 2026-08-04): inside an
iteration's state with evidence fields, the stored form IS the work.
The pull serves it until it is met; the payload fills it.

## Every door is shown

EVERY DOOR IS SHOWN, INCLUDING A LONE ONE.

This read `> 1`, on the reasoning that one way on is not a BRANCH. It
is still the way FORWARD, and hiding it turns a signed state with a
single outgoing edge into a dead end: no options, no remedy, and a
sentence about geography.

MEASURED AT i33's trace-design on 2026-08-17. The state was signed,
verification stood one edge away, and the walk could not see it. The
verb that would have re-aimed is not legal there either, so there was
no move at all.

A branching point is where several doors are worth WEIGHING. A wait is
where the walk needs to know what exists. Those are different
questions and only the first one wanted a threshold.

## A stuck join is the one place a choice

A STUCK JOIN IS THE ONE PLACE A CHOICE OUTRANKS EVERYTHING (found live
2026-08-15, and it stopped the walk dead).

One agent walks one leg of a fan, arrives at the join, and the join
refuses because a parallel leg was never walked. From there:

- THE ROUTE TO THAT LEG RUNS THROUGH THE JOIN IT IS BLOCKING, so se_aim
  sweeps zero hops however many times it is asked.
- A CHOICE WAS REFUSED TWICE OVER: once because the join owed a form,
  and again because a target was set.
- se_amend, WHICH THE REFUSAL ITSELF RECOMMENDS, cannot run — the leg
  has no form on disk, because it was never served.

joinStuck and walkBackTo existed for exactly this and could not be
reached. Filling the join is pointless while a leg is unwalked, so the
leg wins over both guards.

## A choice while a form is owed is not

A CHOICE WHILE A FORM IS OWED IS NOT A FILL (found live 2026-08-06:
a backward choice arrived here, was SAVED as a field named "choice"
on the owed form, and the walk stood still — accepted, swallowed,
repeated). A payload that is ONLY a choice is a move, and it is
refused with both sanctioned ends named: fill the owed form to go
forward, or reopen the passed state to go back. A form genuinely
declaring a field called "choice" is filled with its siblings, so
the one-key test lets it through.

## A list is legal on purpose

A LIST is legal on purpose: the seam for "send three agents, one
 per lane" must not be designed shut (owner, 2026-08-01). Only
 the first is walked, because one agent is walking — and every
 pick must come from the OFFER, because a choice exists only
 where the machine asked for one (owner, 2026-08-02).

## A static sub-machine is a drawing

A STATIC SUB-MACHINE IS A DRAWING, and a drawing is viewable wherever
it hangs (owner report 2026-08-08: clicking enumerate-space landed back
on the main machine). Every resolver here knew only GENERATED children,
so a state whose submachine names a .canvas was invisible to the mirror
even though the walk could descend into it.

## A seeded container inside an open record resolves without

A SEEDED CONTAINER INSIDE AN OPEN RECORD RESOLVES WITHOUT A DESCENT
(owner report 2026-08-11): the panel colours from trunk, and a fresh
session used to grey every sub-machine the walk had not entered — the
ripple then greyed everything downstream of it.

## A drawn sub-machine compiled and served as its own

A drawn sub-machine, compiled and served as its own view.

 THE DRAWING IS GENERATED, NEVER THE AUTHORED COORDINATES (owner ruling
 2026-08-08). Serving the authored canvas laid a hand-drawn machine out
 left to right while every compiled machine reads top to bottom, and a
 fan's AND bar did not read as a bar. One layout, whatever built the
 states.

## The live run for a machine view

The LIVE run for a machine view (owner ruling 2026-07-27: re-entry
 resets the drawing) — done states and completion of the CURRENT run
 only. A machine not being walked shows gray; past passes live in the
 main record, not on the drawing.

## Both hands fill the same evidence form

── EVIDENCE FORMS (owner design 2026-07-27) — A3-shaped one-pagers in
   the bound record; the condition is a MECHANICAL LINT over them.
   Both hands use the same machinery: the agent writes the instance
   through the lane, the human fills it through the mirror; done runs
   the same checks either way. ────────────────────────────────

## The graph is evidence

THE GRAPH IS EVIDENCE (owner ruling 2026-07-27): no point of this
work's decision graph may stand OPEN when the evidence claims done.
The RECORD's jsonl is the source — every live op lands there too,
so the check survives engine reloads. Attached, never copied.

## A visit is recorded qualified

A VISIT IS RECORDED QUALIFIED ("expeditions/e30@0"), and this compared
it against the bare state name. It matched nothing, so the check passed
vacuously and every expedition closed so far was never actually looked
at — one of them with nineteen open points standing (measured 2026-08-02).

A flag computed and never compared is this codebase's recurring defect,
and it is invisible precisely because a check that sees nothing reports
the same as a check that finds nothing wrong.

## A reopened claim is owed again

A REOPENED CLAIM IS OWED AGAIN, and without this the walk DEADLOCKS.

 Three rules meet and close a loop (found live on i3, 2026-08-13):

 - A claim reopened after its signature does not stand, so the state
   cannot be left.
 - `met` asks only whether the fields are FILLED, and they are, so the
   pull decides nothing is owed and serves no form.
 - A form payload with nothing owed is illegal (SE-C-110).

 So the agent that reopened the claim can never re-earn it. Every submit
 is refused for having nothing to submit to, and the reopen mark stays.

 The contract already says the submit IS the rebless, and that a newer
 signature clears the mark by itself. It could not, because no submit was
 reachable. This makes the form owed so that sentence can be true.

 IT COST MOST OF AN AFTERNOON, and none of it looked like this: the state
 was reported as a claim that does not stand, so the form was rewritten,
 reformatted and re-submitted repeatedly. The form was never the problem.

## What the form refuses

WHAT THE FORM REFUSES, AND WHAT TO DO — at the top of the answer.

 A `fill` that comes back unchanged IS a refusal, and every refusal in
 this system carries its remedy. This one did not: the problems sat deep
 inside the form model, and a big form is moved to disk by the host, which
 hands back a PREVIEW — the head of the JSON. The problems fell in the
 part that was dropped, so the only way left was to guess.

 IT IS NEVER THE AGENT'S JOB TO ASK WHY (owner ruling 2026-08-07). The
 machine holds the verdict, so handing it over is the machine's job — not
 a question the agent has to know to ask.
THE AGENT'S COPY OF A FORM, without the reference corpus.

 Every form carries `ref_paths` and `ref_facts`: the path, statement and
 breaks_if_removed of EVERY node in the record. The mirror needs them — a
 card asking which of two rows matters more cannot be answered from two
 ids. That need is real, and it is the MIRROR's.

 The agent renders no cards. It reads ids and opens the files itself. So it
 was paying for 467 nodes of facts on every single form: measured at about
 380,000 characters against 3,700 for an ordinary answer. A hundred times
 the size, for something never read.

 IT COST A DIAGNOSIS, NOT ONLY TOKENS. The same answer carries `problems`,
 naming exactly which check refuses a claim. At that size the host moves
 the response to disk and every reader truncates it, so the one field that
 explains a stuck state is the one field that never arrives. i3 sat blocked
 on precisely that.

 THE MIRROR'S COPY IS UNTOUCHED — formGet still returns everything.

 THIS IS THE NARROW REPAIR. The general rule the owner ruled on 2026-08-13
 is a size limit on every lane answer with a handle to page the rest, so
 the class cannot come back somewhere else. That is retro work.

## A write is what changes which claims stand

A WRITE IS WHAT CHANGES WHICH CLAIMS STAND, so it is the one event the
 route memo has to hear about. Clearing it here keeps the objective
 honest without making every read recompute green.

 THE VERDICT CACHE CLEARS WITH IT. Its key covers the corpus, the body
 and the form — but trace-design's law reads the ENGINE TREE, an input
 no key covers. A dead file deleted after a red verdict served that red
 forever (found 2026-08-11, the walk wedged at a green state).

## The dispatch between the two form kinds

The dispatch between the two form kinds: a state of the machine on
 display, unshadowed by a named template.

 IT ASKED FOR EVIDENCE FIELDS AND THAT WAS THE LAST OF SIX (2026-08-17).
 A state form is a state's form. Whether the state declares FIELDS is a
 fact about that form's shape, not about which system owns it, and using
 it here sent fill-story-evidence down the generic path — where it looked
 for machines/forms/fill-story-evidence.md, found nothing, and threw.

 SO THE STATE COULD NEVER BE SERVED AND NEVER BE SIGNED. Its guidance says
 signing is a bare submit, and there was no path by which a bare submit
 could reach it. Every other symptom of that afternoon hung off this line:
 the walk crossing it, two states signing under the gap, the panel painting
 green over a hole, a record merged to trunk as finished, and a deadlock
 whose only exit was the escape hatch.

 A NAMED TEMPLATE STILL SHADOWS IT, which is the check above and is about
 ownership rather than shape: if somebody authored machines/forms/<name>.md
 then that template is what the name means.

## Every trace nodes id against the path that holds

Every trace node's id against the path that holds it, root-relative —
 what a surface needs to turn a reference into something clickable.
WHERE THE TRACE CORPUS IS READ FROM. ONE answer, for every reader.

 It used to be two. The form check read the project root while the walk
 WROTE to the bound record's worktree, so a node the lane had just
 authored resolved to nothing — and the green light read the root as
 well, so a form could pass its own submit while the state stayed grey.
 Two readers, one path, two answers, and nothing caught it.

 The value is the root of the RECORD BEING CHECKED, because a standing
 artifact lands on trunk when its record closes and lives in that
 record's worktree until then (owner ruling 2026-08-06).

 IT IS THE RECORD'S ROOT, NEVER THE SESSION'S BINDING. The green light
 runs for an iteration whether or not the walk is standing in it — the
 mirror renders from the desk — so reading the corpus from wherever the
 session happens to be bound made the same claim green from inside the
 record and grey from outside it.

## The idpath map for a documents own record

The id→path map for a DOCUMENT's own record — the /doc renderer's
 wiki-link pass (owner report 2026-08-09: a [[cand-…]] in a free-form
 field rendered as dead text). A doc under a record resolves that
 record's corpus; everything else reads the working root's.

## An owed box is not green

AN OWED BOX IS NOT GREEN, AND IT DOES NOT DISAPPEAR (owner ruling
2026-08-13). It never contributes to `problems` once its ref resolves,
so it has to ride somewhere else or a debt behind a clean submit would
be invisible to the next reader — this is that somewhere else, on the
same object a gate reads as the state's verdict.

## A recheck is not a rewrite

A RECHECK IS NOT A REWRITE (owner ruling 2026-08-07). A reopened claim
arrived looking exactly like a fresh one, so the agent answered it from
scratch — re-deriving evidence that had already been earned and signed.

THE PACKET NOW SAYS WHICH IT IS. The body is still on the file, the
signature is still on the file, and the only open question is whether
the named change moved any of it. Where it did not, the submit IS the
rebless: it re-runs every check and stamps a newer signature, and the
newer signature clears the mark by itself.

THE CHECKS ARE NOT SKIPPED and cannot be. A submit refuses unless every
condition is green against the corpus AS IT NOW STANDS, so a claim the
change did break cannot be waved through by calling it a recheck.

## Green from the record

GREEN FROM THE RECORD (owner ruling 2026-08-04): a record-backed
 state is done when its stored claim STANDS — signed, and blessed
 where it is a gate. Session runs die with the engine life; the
 record does not. States without records stay uncoloured.
Where a state's stored claim lives, in the record's own worktree.

## The signature time comes out of this read

THE SIGNATURE TIME COMES OUT OF THIS READ (i33, 2026-08-17). The
ripple's time half needs it for every claim, and fetching it in a
second pass over the same files put recordDone at 1117 ms over 200
nodes against a 1000 ms budget — this iteration's own one-second
rule catching this iteration's own change, which is exactly what
req-one-operation-reads-its-input-once says.

THE TIME IS THE SIGNATURE AND ONLY THE SIGNATURE. An amend does not
move it; a reopen followed by a fresh signature does (owner ruling
2026-08-17, given twice). THIS COMMENT SAID THE OPPOSITE for most of
a day, four thousand lines from the correction on claimTime itself,
and a reader of standingClaims met the wrong one first.

## Green means submitted

GREEN MEANS SUBMITTED (owner ruling 2026-08-11): for the PAINT a
signed gate whose checks stand is green, and the bless rides as
the thumbs-up mark. The ROUTE keeps demanding the bless — an
unblessed gate is still the walk's next objective.

## Green is calculated

GREEN IS CALCULATED, NEVER STORED (owner ruling 2026-08-07, v1's design).

 THE FAILURE THIS ENDS. A `suspect:` line used to be WRITTEN into a claim
 when an input moved, and writing it STRIPPED the signature, the author
 and the bless. Two things went wrong with that, and both were seen live:

 - A derived value on disk goes stale. It was written by a pass that runs
   at some moments and not others, so between them the file and the truth
   disagreed. States painted green that had fallen, and one that had not
   fallen painted grey.
 - It destroyed the one fact that genuinely had to be stored. A signature
   is a person's act. A computed check may refuse to paint it green; it
   may never erase it. One claim lost its signature to a merge and no
   longer says who signed it or when.

 v1 SETTLED THIS AND WE DRIFTED OFF IT. adr-verdict-cache, at ref main:
 verdicts live keyed by input hash outside the spec, because "a cache is
 never truth and the repo must stay cache-free". adr-evidence-hash: the
 gate folds its evidence hash into its own, so editing blessed evidence
 flips it suspect — a COMPARISON made at look time, never a written mark.

 So there is nothing to go stale here. Every look recomputes.
IS THIS CONTAINER'S DRAWING FINISHED? Every claim inside it stands, and
 every container inside it is finished too.

 A CONTAINER IS A CLAIM LIKE ANY OTHER (owner ruling 2026-08-09). It used
 to be painted by the RENDERER, from its own interior, with no regard for
 its inputs — so enumerate-space drew green while derive-criteria feeding
 it drew grey. Green that ignores the ripple is not green. It is a second
 rule, and two rules is how the drawing came to contradict itself.

 IT NESTS BY CONSTRUCTION, because it asks recordDone, which asks this
 again for whatever containers that machine holds.

## An empty drawing is vacuously finished

AN EMPTY DRAWING IS VACUOUSLY FINISHED (owner ruling 2026-08-11). Zero
spikes is a sanctioned outcome, and returning provable-only made the
empty spike machine an unmet feeder forever: run-spikes drew grey, the
ripple knocked signed fold-back out of green, the objective pinned on
the standing state and the route to gate-prototype computed empty. The
ripple still guards a vacuous container through its own feeders, and an
UNSEEDED drawing still proves nothing — viewFor throws above.

## Collect the input once

COLLECT THE INPUT ONCE, PROCESS, OUTPUT (owner ruling 2026-08-09,
 software.md). One operation — a route, a render, a pull — makes ONE of
 these and hands it down. Every machine and every container it touches
 reads the same corpus and the same version out of it.

 WHAT IT REPLACES. Entering one record asked for the same 328-node corpus
 SIXTY-SIX times, because each hop asked what was green and each green pass
 fetched its own inputs. Stamping made each ask cost 4 ms instead of 300 —
 and left the sixty-six.

 IT IS A PARAMETER, NOT A CACHE, and that is the point. It lives on the
 stack for one operation, so it cannot outlive its inputs, cannot go stale
 and needs no invalidation. It is the version of a cache that cannot be
 wrong — unlike the two I built today that could.

## The ripple covers containers too

THE RIPPLE COVERS CONTAINERS TOO, so claimFeeders must not look THROUGH
one. A container carries no evidence of its own and used to read as a
waypoint, which is what let the objective skip a whole sub-machine.

AND IT COVERS A STATE WITH NO EVIDENCE FIELDS, which is the same hole in
a third shape (owner, off the panel, 2026-08-17: "sweep consistency
can't be green if fill story evidence is not green").

THIS USED TO KEY ON `evidence_form.length > 0`, which is a PROXY for
carrying a claim rather than the thing itself. For almost every state
the two coincide. fill-story-evidence is the one where they part: its
row declares no fields on purpose, because its check is COMPUTED from
the story decks rather than typed into a form, and its own guidance says
signing is a bare submit. It has a form, an instance and a signature
line. What it has none of is fields.

SO IT WAS NEVER CLAIMFUL, claimFeeders never named it as an input, and
the fixed point below never asked whether it stood. Two states signed
under an unsubmitted one — one of them a GATE — the panel painted them
green, and an agent read that as a finished record and closed it.

owesASignature ANSWERS IT: fields where there are fields, and otherwise
whether the state has a form instance at all. A state with no form is
machinery and is looked through, which is right — read_contract has no
claim to make and putting it here wedges the boot.

## Green stops at the first input that is not

GREEN STOPS AT THE FIRST INPUT THAT IS NOT GREEN. This is the ripple,
and it is a graph walk rather than a mark on a file. A claim may be word
for word fine and still rest on ground that moved.

GROUND THAT MOVED AND CAME BACK GREEN COUNTS TOO (owner ruling
2026-08-17). Colour alone cannot see a feeder that was EDITED and
re-signed in the same breath: it is green again before anything
downstream looks, so the walk sails through claims that answered the
OLD question. i33's kickoff replaced its one prose goal with a list of
five, and ten signed states below it never noticed — the walk ran
straight through two gates that had never heard of four of the goals.

SO THE SECOND COMPARE IS TIME. A claim signed BEFORE its feeder's
current signature answered older ground, and stale is not green.

Run to a FIXED POINT: knocking one out can knock out what stood on it.
ALREADY COLLECTED, by the pass over these same files just above.

## The gates whose claims carry a bless

The gates whose claims carry a bless — the thumbs-up overlay's truth.

 A BLESS ONLY COUNTS WHILE THE CLAIM STANDS (owner ruling 2026-08-17).
 The thumb adjudicates ONE body of work. When the ground under it moves
 the adjudication is about something that is no longer there, so the thumb
 falls with the green and the person is asked again.

 IT IS READ FROM THE GREEN SET, NOT FROM THE FILE. The ripple is a graph
 walk and never touches frontmatter, so a stale gate still carries its
 `bless:` line on disk — and used to keep painting a thumbs-up over work
 that had fallen out from under it.

## The iteration this machine belongs to

THE ITERATION THIS MACHINE BELONGS TO, if there is one and it is open.

 IT USED TO ASK WHETHER THE DECL *IS* AN ITERATION (2026-08-09). That is
 true of `i1` and false of every drawn sub-machine inside it, so for
 `enumerate-space` it returned undefined, recordDone returned an empty
 green set, and NOTHING INSIDE A SUB-MACHINE WAS EVER GREEN.

 The walk then pinned its objective on the sub-machine's first state
 forever. Seven finder forms stood signed and the join above them would
 not open, because the router could not see that any of them was done.

## Only a pass can lapse

ONLY A PASS CAN LAPSE (owner, 2026-08-05). The cone runs to the end of
the machine, and most of it was never walked. Emptying those cards
marks steps that had nothing to lose and drowns the ones that did —
seen live, as the whole tail of the machine going blank at once.

## Two operations on a standing claim

TWO OPERATIONS ON A STANDING CLAIM (owner ruling 2026-08-07), because
 there was ONE and it was neither of these: a submitted form could not be
 touched at all. A typo in it was permanent, and the only reopens were the
 gate's vote and the pin's drift, neither of which an agent can reach.

 REOPEN says the claim must be re-earned. The work is wrong, or its ground
 moved. Everything downstream falls with it — free, because green ripples
 through the feeders already.

 AMEND says the claim stands and its TEXT moved. A renamed reference, a
 path that changed, a typo. The signature is untouched because nothing it
 attested to has changed, and reopening a tree to fix a spelling is the
 cost that made people leave the spelling wrong.

 WHICH ONE IS A JUDGMENT and the engine does not make it. What the engine
 guarantees is that an amend cannot smuggle a reopen past the checks: the
 form is re-checked after the edit, and an amend that breaks a check is
 refused with the file untouched.

## Say what it will drop

SAY WHAT IT WILL DROP, BEFORE DROPPING IT (i27, 2026-08-14).

A reopen keeps the SIGNATURE and se_reopen says so. It does not keep
the BLESS, and nothing said so. On 2026-08-14 a reopen taken on the
engine's own bad advice erased a person's adjudication, and the walk
stopped until they were asked again.

A signature records who wrote it. A bless records who ADJUDICATED it,
and at a low dial only a person can. Losing one silently is not the
same kind of loss, so this one is confirmed rather than assumed.

## An amend may not break what the signature covers

AN AMEND MAY NOT BREAK WHAT THE SIGNATURE COVERS. Written first and
judged after, because the check reads the file; a failure puts the
original back, so a refused amend leaves nothing behind.

ANY FAILURE RESTORES, not only a failed check (found 2026-08-07). The
re-read itself can THROW — an unparseable frontmatter is not a
"problem" in the list, it is an exception — and that path used to
escape without restoring, leaving the file corrupt and the caller told
only that something errored.

## An amend leaves the signatures date alone

AN AMEND LEAVES THE SIGNATURE'S DATE ALONE, and the comment that once
stood here argued the opposite from a wrong diagnosis. Both halves of
that argument were false, and the correction is kept because the wrong
reasoning is easy to reach again.

A TIMESTAMP DOES NOW PLAY A PART, and this paragraph is kept with the
correction on top (i33, 2026-08-17). It used to end "a date plays no
part", which was true until the ripple gained its time half. A claim
signed BEFORE its feeder's current claim time is stale, and claimTime
counts an amend as freshly as a signature.

SO AMENDING A STATE NOW GREYS EVERYTHING BELOW IT. That is the ripple
working rather than a defect, and it is why `chain` exists: ten hand
amends down one chain, three times in one afternoon, is what it costs
without it.

WHAT THE PARAGRAPH STILL GETS RIGHT: the guard does not compare the
signature against the corpus. standingClaims reads that a signature is
PRESENT, that the form is not reopened after signing, and that
claimProblems comes back empty.

IT CLAIMED SEVEN AMENDS UP A SIX-LEVEL CHAIN CLEARED NOTHING. They
cleared nothing because they were aimed at the wrong states. The chain
had ONE root: write-stories listed sty-work-on-two-machines, which had
been deleted, so its own content genuinely stopped passing. One amend
at that root cleared all six levels at once.

WHY THE ROOT WAS HARD TO SEE, which is the part worth keeping. A
fallen_input names the FIRST fallen input of the state that refused,
never the root of the chain, and it attaches fallenRemedy's verdict for
THAT state. So the refusal recommended se_amend on a state whose own
content was fine, and following it changed nothing. se_why walks one
level per call and reaches the root; the refusal does not.

AND RE-STAMPING WOULD HAVE BEEN A LIE. The panel shows the signing date
to a person. Moving it on every amend destroys when the claim was
actually signed, to satisfy a check that never reads it.

## Re-freshen everything below a mended claim

RE-FRESHEN EVERYTHING BELOW A MENDED CLAIM, in one act (owner ask
 2026-08-17: one act that re-freshens a whole chain).

 WHY IT IS NEEDED. The ripple's time half greys every claim standing on a
 state that was just amended. Each is usually fine and each needed a
 hand-written amend of its own. i33 walked ten states that way, three
 times in one afternoon, writing sentences whose only content was that
 nothing had changed.

 IT CANNOT WAVE A DEFECT THROUGH, and that is the whole design. A state is
 re-freshened only where its OWN checks come back clean. One that does not
 is left exactly as it stands and NAMED in the answer, so a real break
 surfaces rather than being buried under a bulk stamp.

 IT STAMPS `amended:` AND NEVER `signed_off:`, like every other amend. The
 signing date is what a person reads off the panel.

## One or many fields into the stored instance

One or many fields into the stored instance — multi-pass by law.
 A save never stamps: SUBMIT is the one checking, stamping act.
THE FORM WRITES THROUGH TO THE NODES (owner ruling 2026-08-07).

 A `node-table` field is a two-way view. The form shows what each node's
 frontmatter says; what is typed in a cell lands back on that node.
 Edit the note and the form agrees at the next look. Edit the form and
 the note agrees at once. Nothing is stored twice, so nothing can
 disagree with itself.

 A LINE NAMING AN UNKNOWN ID IS IGNORED, never refused. The list is live,
 and an entry closed since the form was last opened would otherwise make
 the save impossible until somebody hand-edited a section.

## Only a cell that moved is written

ONLY A CELL THAT MOVED IS WRITTEN (owner ruling 2026-08-16, after
probe-assumptions could not be submitted without round-tripping
twenty-two probe results it was not asked to change).

The table is a view over EVERY standing node, so a state answering
three empty cells resends two dozen it never touched. Anything that
shortens a large payload between the agent and the engine then lands
on somebody else's evidence. Comparing before writing makes that
whole class impossible: an unchanged cell cannot damage its node,
whatever happened to it on the way here.

## The charts lines are notes

THE CHART'S LINES ARE NOTES (owner ruling 2026-08-08).

 A drawn line becomes a [[candidate]] note, so it can be opened, given
 prose, and referenced by everything downstream. Removing the row removes
 the note — the table and the register never hold different sets.

 A PRUNE LANDS ON THE OPTION, not on the chart. The reason belongs where
 the option is, so a reader of the note learns why it is out without
 finding the form that struck it.

 AN EMPTY FIELD DELETES NOTHING. A form opened and saved before anything
 is drawn would otherwise wipe every candidate, which is a destructive act
 nobody asked for.

## A named cell mints one skeleton

ONE OWED CELL, ONE SKELETON (owner design 2026-08-10). The element
 matrix's NAME button posts a cell; the interface node mints with the
 crossing flows already in carries, and the judgment fields arrive as
 comments per the house convention — answering them is the authoring.
 Idempotent: a standing node is never overwritten.

## Not every quality needs a decision

NOT EVERY QUALITY NEEDS A DECISION (owner ruling 2026-08-10). A
scenario the structure delivers by plain construction is addressed
with the path as its evidence; the decision ref is named only where
a recorded choice is why it holds.

## The sensitivity cards credible rulings become raid tripwires at

The sensitivity card's credible rulings become RAID tripwires at the
 moment they are saved (owner ruling 2026-08-10). One node per ruled
 cell; a ruling whose node already stands reuses it, so a re-save never
 duplicates. The line is rewritten with the minted ref, and the card
 renders the tripwire link from then on.

## The state form the walk itself owes

The state form the walk itself owes: standing in an iteration's
 state with evidence fields, the stored form IS the work.

 MEMBERSHIP, NOT DEPTH (2026-08-09). This asked whether the SECOND-FROM-TOP
 sub was `iterations`, which is true at exactly one level of nesting and
 false one level deeper. A drawn sub-machine inside an iteration — the
 finders under enumerate-space — therefore owed no form at all: the walk
 stood on the state, the packet listed its asks, and the submit refused
 with "nothing on the way wants one".

 It only surfaced there because the route was ALSO empty, the chart above
 being a starved join. Anywhere else the route's own demand covered for
 the missing standing form, so the fault sat hidden behind it.

## The fourth place this proxy lived

THE FOURTH PLACE THIS PROXY LIVED (owner, 2026-08-17). Asking
`evidence_form.length === 0` meant a state with a form but no FIELDS was
never owed — so the pull never served it, so {submit: true} was refused
with "nothing asked for one", so it could never be signed, so it could
never be green. The owner's rule is that there is no middle: either the
state is done and paints green, or it is not and everything below it is
grey. This made the first half unreachable.

## Every state requires all its inputs

EVERY STATE REQUIRES ALL ITS INPUTS (owner ruling, 2026-08-06). Each
 feeder carrying an evidence form must be SIGNED before this state may
 stamp or pass. No state is an exception, and a gate was never special —
 it was only the one place the rule happened to be written down.

 THE LINE THAT USED TO STAND HERE was `if (gate.kind !== "gate") return
 []`, and it was the whole defect. Several incoming edges met as an OR:
 one signed feeder let the state through and the panel went green over a
 hole. The owner caught it on generalize-use-cases, standing green with
 an unsigned write-stories directly above it.

 FALLBACK AND RECOVERY EDGES ARE NOT INPUTS. A fallback hangs off its
 dependency as the guard-failure path, and the recovery edge points back
 the way it came. Neither is something the state waits for.
Is this submachine still the pin's placeholder? The same question the
 entry guard asks before refusing to walk into one, asked here so a
 placeholder is not counted as an input it can never satisfy. A drawing
 that will not compile is not a scaffold — it is broken, and the entry
 guard reports that with its own clause.

## A placeholder that runs a submachine is an input

A PLACEHOLDER THAT RUNS A SUBMACHINE IS AN INPUT TOO (owner instruction
2026-08-15, after i28 stamped six states on top of an unfinished one).

THE TWO GUARDS DISAGREED ABOUT WHAT AN INPUT IS. claimBlockers builds
`claimful` as `evidence_form.length > 0 || submachine !== undefined`.
This filter tested only the first half, so a `runs:` placeholder was not
a feeder here at all and the submit stamped straight over an unseeded
fan.

THAT IS THE WORST SHAPE AVAILABLE: green everywhere at the submit, and a
dead chain found six states later by the claim-guard. The refusal never
landed where the work was, so nothing could be fixed while it was cheap.
AN UNAUTHORED SCAFFOLD IS NOT AN INPUT, and the line above without this
one deadlocked i28 at gate-validation on 2026-08-15.

THE SHAPE OF THE DEADLOCK, because it is not obvious. A gate fed by a
`runs:` placeholder nobody has authored can never be filled: the gate
owes no form while a feeder is unsigned (standingStateFormOwed), and the
feeder can never sign, because ENTERING an unauthored scaffold is itself
refused a few hundred lines below. The walk had no legal move left.

IT ALSO BROKE A RULE THAT HELD BEFORE. i27 shipped through this same
gate with demos unauthored, which was legal and still is. Counting the
placeholder made a past-legal walk impossible, which is the tell that
the widening went one step too far.

SO THE TEST IS AUTHORED-NESS, NOT EXISTENCE. An AUTHORED submachine is a
real input and still guards — that is the defect the owner reported the
same morning, where six states stamped on top of an unfinished fan. An
unauthored one means nobody planned that work, and the state that would
author it is the real input.

## Every condition holding a state grey

EVERY CONDITION HOLDING A STATE GREY, collected instead of thrown.

 The walk has always known this. It computed the conditions one at a time
 and threw the FIRST one that failed, so the answer to "why is this grey"
 existed for a microsecond and was discarded. Asking it took a cluster of
 shell probes against files the lane already holds.

 ONE MECHANISM, TWO CALLERS. `assertStateFormMet` throws the first of
 these; `se_why` reports all of them. A second copy of the reasoning would
 drift, and the drift would be invisible — the verb would explain a state
 the walk judges by other rules.

 THE ORDER IS THE WALK'S OWN, so the first entry is exactly what the next
 pull would refuse with.

 WHAT IS NOT HERE, deliberately: the autonomy dial. The dial governs the
 HOP, not the state — a step above the dial is not grey, it is waiting for
 a person. Reporting it as a blocker would tell somebody to fix a claim
 that is already fine.
WHAT HOLDS A STATE'S CLAIM — the ripple and the content check, computed
 once and read by both callers.

 THE WHY AND THE GUARD WERE TWO MECHANISMS (owner instruction 2026-08-14,
 in emergency). The completion guard ran the ripple over the claim's
 feeders and the content check over its fields. se_why ran NEITHER: it
 asked the form's own conditions and the feeders' signatures, which is a
 weaker question, because a feeder can be signed and still not standing
 when ITS feeder fell.

 SO THE TWO DISAGREED ABOUT ONE STATE AT ONE MOMENT. i27 stood at
 cut-criteria with se_why reporting `standing: true, blockers: []` while
 the guard dropped it for an input that was not standing. The verb built
 to explain a block reported no block, and the record deadlocked.

 ONE MECHANISM NOW INFORMS BOTH QUESTIONS. The guard throws the first
 entry; the verb lists them all. Neither computes anything of its own.

 WHAT IS NOT HERE: the "neither signed nor standing" case. That is a
 completion-time sentence, and for a state simply not walked yet it says
 nothing `form_incomplete` has not already said. The guard keeps it as
 its own fallback.
WHAT IS WRONG WITH THIS ONE CLAIM'S OWN CONTENT, ignoring its feeders.

 Extracted so the fallen-input remedy can ask it about the state that
 FELL, which is how the refusal knows whether to name se_amend or
 se_reopen. Asking about feeders here would recurse; the ripple already
 walks them.

## Which verb fixes a fallen input

WHICH VERB FIXES A FALLEN INPUT, decided rather than guessed.

 A claim loses its green two ways, and they want different verbs.

 - ITS CONTENT STILL PASSES. The ripple dropped it because something
   upstream moved. A small correction goes in with se_amend, which LEAVES
   THE TREE STANDING.
 - ITS CONTENT NO LONGER PASSES. The work is genuinely wrong, and
   se_reopen sends it back to be re-earned.

 se_reopen on the first case is what cost a bless on 2026-08-14. The
 resubmit dropped the person's adjudication and everything downstream
 fell with it.

## Neither case is an amend

NEITHER CASE IS AN AMEND, and this used to say it was (corrected
2026-08-17). An amend fixes WORDING and leaves the signature where it
is — and the signature is what says a claim answers today's ground.
A claim that is down with clean content is down for one of two
reasons, and amending is the wrong act for both.

## The seventh place

THE SEVENTH PLACE (2026-08-17), and the one that made the other six
hard to find. Returning [] for a fieldless state left BOTH readers mute:
the completion guard fell through to "the claim is neither signed nor
standing" with no reason attached, and se_why answered "stands — nothing
holds it" about a state the guard was refusing.

THAT BREAKS THE PROJECT'S OWN RULE, quoted from guidance/refusals.md:
"THE MACHINE HOLDS THE VERDICT, SO THE MACHINE HANDS IT OVER. It is
never the agent's job to ask why it was blocked." And its test: "could
somebody act on it without asking a second question?" The engine had the
failing list the whole time and dropped it on the floor.

## The content check below already reports the failing list

THE CONTENT CHECK BELOW ALREADY REPORTS THE FAILING LIST. It was simply
never reached for a fieldless state, because the early return above cut
the function off before it. Nothing new is needed here.
NAME THE CLAIM THAT ACTUALLY FELL (i3, 2026-08-13). recordDone runs a
RIPPLE: green stops at the first input that is not green, because a
claim may be word for word fine and still rest on ground that moved.

## Name the verb

NAME THE VERB, never just the word "re-earn" (i27, 2026-08-14).
This remedy used to say se_pull with no arguments, which only
repeats the refusal. The agent picked the verb whose NAME matched
the sentence, chose se_reopen where se_amend was right, and the
guess cost a person's bless and a six-milestone cascade.

The engine already knows which verb fits, because it can ask the
fallen claim whether its OWN content still passes.

AND IT ASKS THE ROOT (i6). Asking the first hop picked the verb
for a state that is merely waiting, so the answer was right about
the wrong subject.

## A placeholder owes no form

A PLACEHOLDER OWES NO FORM, so it must never be reported as owing one
(owner, 2026-08-15). run-candidates declares `runs:` and no evidence at
all. Saying its "evidence form" was unfilled named a path no state ever
writes, and the only honest reading of that message is to go and write
the file by hand — which is exactly what happened.

## The root of the ripple

THE ROOT OF THE RIPPLE, followed to the end in ONE answer.

 A grey state is usually grey because a feeder is unsigned, and that feeder
 because ITS feeder is. The verb named only the first hop, so finding the
 actual cause took one call per hop and the reader had to know to keep
 asking.

 MEASURED 2026-08-16: four grey states in i11, and the cause was one
 register three states upstream naming three deleted requirements. Fixing
 three lines turned all four green in a single pull. The hunt for those
 three lines was the expensive part, and it was a chain of se_why calls.

 A ROOT IS A GREY STATE WITH NO UNSIGNED FEEDER OF ITS OWN. That is where
 work actually has to happen; everything between is waiting.

## Content passing is not standing

CONTENT PASSING IS NOT STANDING. The ripple's time half drops a claim
whose own text is fine, and staleness is not a content problem — so
this branch used to answer `stands, nothing holds it` for a claim the
walk could not step off, and sent the reader looking at the route and
the dial, neither of which was the reason.

THE READER COULD ONLY FIND IT BY ASKING ABOUT THE STATE BELOW, whose
fallen_input names this one as the root. That works exactly one hop
from where they stand (owner, 2026-08-17, after ten states unstuck by
hand).

## The suites spawn-skip

THE SUITE'S SPAWN-SKIP (SE_SCRIPT_SKIP). A condition script is a
node spawn, a booted walk runs two, and the battery boots ~200
walks — a third of its whole clock went here (measured 2026-08-02).
The skip answers green WITHOUT spawning and SAYS SO in the
evidence; the test files whose job is proving the scripts delete
the guard at their top.

## The read proof

── THE READ PROOF (owner ruling 2026-07-26). A doc's hash is a TOKEN
   held only by reading through the lane: se_file_read returns it, the
   agent's packets never print it. The AGENT proves reading by SENDING
   hashes on the tick (read_hashes: {path: hash}) — fresh every time,
   so after a compaction the tokens are gone from its head and
   re-reading is forced by construction (the hook only has to say so).
   The HUMAN proves reading by CHECKING the doc in the mirror — once
   per VERSION (the check pins the hash; an edited doc unchecks
   itself). And THE PULL GATES ENTRY: a state is entered only when its
   pulled guidance is proven read — armed outside boot, because boot
   IS the reading room where the first tokens are earned. ────────────

## The proof hashes the doc the lane served

THE PROOF HASHES THE DOC THE LANE SERVED (owner ruling 2026-07-28).

It used to hash the PROJECT ROOT while se_file_read served the bound
worktree. Two consequences, and the second is the serious one:

 - Editing a pulled guidance doc inside an expedition made every later
   tick refuse, because the hash you could honestly produce was never the
   hash the engine wanted. Guidance could not ride a branch, though it
   merges exactly like code.
 - Worse, when the two trees differed the gate PASSED on the root's hash
   for a document the lane never showed you. A proof you can satisfy with
   a document you were never given is not a proof. Seen live in e19: a
   whole expedition attested to a voice.md it had not read.

Guidance is not special. It is branch content like any other file; only
the read-proof ever made it look otherwise.

The two trees agree whenever trunk is clean — a worktree branches from the
last commit — and the close now commits the root's strays to keep it that
way. Where they genuinely differ, the doc HAS changed, and a stale check
being re-asked is the rule working: one check per version.

## The consume list

THE CONSUME LIST (condition read_consume) — documents the state reads
 and then DESTROYS. A listed path that is not there demands nothing, so
 a state may name a document that is only sometimes present; the
 session handover is exactly that.

 This used to be a hardcoded boot rule. It is a declaration now, so the
 drawing says what happens rather than the engine knowing a state by
 name (owner ruling 2026-07-31).

## The written handover is gone

THE WRITTEN HANDOVER IS GONE (owner ruling 2026-08-07).

 It used to be demanded here, on the way out through `end`. The owner
 settled it in one sentence: they kill the session, so the gate never
 fired and there was never a handover. A duty that only discharges on the
 tidy path is not a duty, it is a wish.

 The log already records what happened, so boot DERIVES the briefing
 instead of asking anyone to write it. See lastSessionBriefing below and
 CallLog.lastSession. Nothing to forget, nothing to go stale.

## One reading list

ONE READING LIST (owner ruling 2026-07-31). A document a state NAMES
 and a document a tag BINDS to it are not two kinds of thing: both are
 read, both are proven by the same hash or the same checkbox, both are
 refused the same way. Only the PROVENANCE differs, and that rides in
 each document's `sources`.

 What genuinely differs is WHEN, so that is the only axis left here.

## The handover rule

THE HANDOVER RULE (owner ruling 2026-07-26): what the human checked
is the SESSION's reading list. A human who walked read_contract on
checkboxes and then raised the slider hands the walk to a head that
never read — so the agent's every advance must prove the same list,
even past transitions the human already spent.

## A fallback is the drawn path for the condition

A FALLBACK IS THE DRAWN PATH FOR THE CONDITION FAILING, so the condition
may not guard it (found live 2026-08-16, in the mechanism that had just
been built).

verification's exit script runs the battery. Its FALLBACK is fix-findings
— "Fix the battery's findings: all of them, in one pass" — which exists
for precisely the case where that script comes back red. Gating every
exit on the script made the repair unreachable exactly when it was
needed, and the walk had to step out to the desk to get at it.

THE FORWARD EDGES ARE STILL GUARDED, which is the whole point: a red
battery may not walk on to the gate. It may only walk to the state whose
job is fixing it.

## The tier is the answer

THE TIER IS THE ANSWER, AND THE NUMBER DOES NOT RIDE WITH IT (owner
ruling 2026-08-14: "the number leaves the answer").

req-autonomy-is-categorical says no numeric autonomy value survives on
any surface. This packet is the surface the agent reads on every call,
so it is where the number was most visible and least useful: nothing
an agent does with the dial is arithmetic.

THE WEIGHING STILL COMPARES NUMBERS INSIDE. That half is i14's — "every
numeric priority left in the engine, the scale and the guidance goes" —
and the requirement itself says cut over first, then remove, never both
in one commit (raid-risk-autonomy-rework-breaks-walking).

## The exit is the hard gate

THE EXIT IS THE HARD GATE (owner ruling 2026-08-04): a state with
evidence fields leaves only on a COMPLETE stored form — the claim
stands in the record before the walk moves.

EXCEPT ALONG A FALLBACK, AND THAT EXCEPTION IS THE WHOLE REPAIR LOOP
(owner instruction 2026-08-18: "you do the verification, you fail, you go
to fix-findings, you go back to verification, you try again... I don't
know why every agent keeps messing that up").

THEY WERE NOT MESSING IT UP. A fallback edge IS the drawn path for this
state failing, and this line demanded a GREEN CLAIM before it could be
walked — which is demanding that the failure not have happened. So a
verification that found a real defect had no legal move at all: the
forward door wanted every claim green, the repair door wanted the same
green claim, and the state grants read verbs only.

MEASURED AT i17's VERIFICATION, 2026-08-18. A tester returned three
blocking findings with the battery green — two of them inspection
findings that no test can turn red. The walk had to escape to the desk.
raid-iss-a-verification-finding-that-is-not-a-test-failure-has-no-route
carries the measurement.

NOTHING IS SKIPPED BY TAKING IT. `outcomeFor` returns "failed" for a
fallback or error edge, `completeGuarded`'s claim guard applies only to
a "filled" completion, and `settledStates` counts a state green only
where its LATEST outcome is "filled". So this route DEMOTES the state
and can never advance one: the walk must come back and sign it green.

## The ticks result

The tick's result — plus the booted banner the first time idle lands.
 Reaching end fires onClosed once: the session is OVER — the server
 entry shuts the whole session down (owner ruling 2026-07-26).
THE HANDOVER, DERIVED FROM THE LOG (owner ruling 2026-08-07).

 Rides the boot banner, which the harness rule already shows VERBATIM. So
 it costs no extra document, no reading proof and no extra hop — the
 owner's condition was that boot must not get slower, and this adds one
 tail scan of a file the engine writes anyway.

 A BRIEFING THAT CANNOT BE BUILT MUST NEVER BLOCK BOOT. A first-ever
 session has nothing behind it, and that is normal rather than an error.

## A placeholder may be drawn and routed through

A PLACEHOLDER MAY BE DRAWN AND ROUTED THROUGH. IT MAY NOT BE WALKED
INTO (owner report 2026-08-13).

The pin scaffolds every seeded drawing so the route stays drawable
before its authoring state has run. That scaffold compiled to a bare
start-to-end pill, and the walk went straight through it without a
word — i3 passed specify-build, seeded nothing, and build-steps found
the placeholder and reported itself done. A whole build was skipped in
silence.

THIS IS THE SEAM iterations.ts NAMES. Refusing at compile time breaks
the machine view, which must draw a route through a sub-machine nobody
has authored yet. Refusing at ENTRY breaks nothing and closes the hole.

An AUTHORED none is not a scaffold and walks through as it always did.

## Only what might need action earns a dot

The exposure chart plots what a reader might still have to do something
about. Three states are excluded and each for its own reason.

- CLOSED is done.
- SUPERSEDED is done, by something else.
- DEFERRED is parked behind its own until, so it is not owed yet.

An entry in any of the three is real and recorded; it just is not a call on
anybody today, and plotting it buries the ones that are.
