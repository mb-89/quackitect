# walking — how the machine is driven

<!-- AUTHORED TERSE. This register IS the source: the start-the-agent step
     assembles this file verbatim into the prompt layer. No LLM stands in that
     path, so what is written here is what the agent reads.

     RULES ONLY. Provenance, measurements and the history of a decision belong
     in the design corpus, not here. Every character of this file is paid on
     every request. -->

One verb drives the walk: `se_pull`.

Pull, do what comes back, pull again.

Without a routed goal, staying in the current state is valid progress. A
no-goal pull reports there is nothing to do here and shows the options.

The machine owns every decision about the walk: the route, the hop, the proof,
the position.

## The pull

One call, one optional payload. It answers with an INSTRUCTION, and `pull`
names which of four you got.

### read

A document rides in `document`, and `prove` asks THREE FILL-IN-THE-BLANK
QUESTIONS about it. Answer all three, in one string, and pull again with
`form: {"read": "<the answers>"}`. Keep going until no `read` comes back. Then
you hold everything, by construction.

### fill

The machine BUILT the form and handed it over. Fill it, and return it as `form`
on the next pull. There is no submit VERB. There IS a submit FLAG, and it rides
in the form.

THREE KEYS ARE ACTS, NOT SECTIONS. Everything else is a field and gets saved.

- `submit: true` — stamp it. Runs every check, then signs.
- `bless: true` or `bless: false` — the gate's thumb, up or down.
- neither — SAVED and NOT stamped, on purpose. Fill half a form now and the
  rest later.

SO A FORM YOU MEAN TO FINISH CARRIES `submit: true`. Without it the fields
land, nothing signs, and the same form comes back looking untouched. That reads
exactly like a refusal and is not one.

EACH FIELD SAYS WHICH OF TWO ACTS IT WANTS, on its hint, as `act`.

- `author` — the page is yours, and nothing computed it. Write it.
- `rule` — THE ENGINE ALREADY DREW IT from what stands elsewhere. Read the
  drawing, then accept it, reject it, or pick among what it offers. Your
  judgment is the answer; prose is not.

A DRAWN FIELD IS NOT AN EMPTY PAGE. The engine says the flips are these three,
and you say which are credible. It says the clusters are these, and you move
the rows it got wrong. Re-deriving the drawing by hand is waste. An essay where
a pick was wanted is the other waste.

A GATE IS THE SAME MECHANISM. It takes `submit` and `bless` like any other
form, and at high autonomy the agent uses both. Blessing your own gate is
normal where the person has said so. Below the dial it is theirs.

WHICH ONE APPLIES IS THE ENGINE'S ANSWER, NEVER YOURS TO DERIVE. Every gate
carries a weight, and a bless from the agent is refused when the dial sits at
or below it. The refusal names both rungs. SO SEND THE BLESS AND READ THE
ANSWER.

Both in one pull is legal: `form: {"verdict": "pass — why", "submit": true,
"bless": true}` fills, stamps and blesses in a single call.

A `recheck` BLOCK MEANS THE CLAIM ALREADY STOOD. Somebody signed it, then
something upstream moved and sent it back. The body and the signature are both
still on the file.

- Do not answer it again. Read what is written, ask only whether the named
  change moved it, and submit if it still holds.
- Rewrite ONLY the fields the change actually touched.
- THE SUBMIT IS THE REBLESS. It re-runs every check against the corpus as it
  now stands and stamps a newer signature, which clears the mark by itself.
- Nothing can be waved through. A claim the change really did break refuses,
  and names what broke.

### do

The happy path was walked for you, every hop to the next branching point.
`here` is where you landed. Do the work, pull again.

OPTIONS RIDE A `do`. There is no separate `choose` instruction. Where the road
splits, the options ride along with weight and openness. Answer
`form: {"choice": "<to>"}` only when a routed goal needs that door. A LIST is
legal where work fans out: one is walked, and the rest come back as
`not_walked`.

You never choose unasked, and you do not choose just because options were
offered.

A CHOICE AIMS THE WALK. Taking an offered door SETS the target to it, and that
is how the agent moves toward anything at all. "You never name a target" means
you never invent one.

AN ITERATION HAS ONE TARGET AND IT IS ITS SHIP STATE. Never aim at a state in
the middle of one. The machine routes; the agent works whatever the route lands
on, and pulls again. Aiming one state further on, over and over, is the agent
doing the router's job by hand. Every arrival clears the target, so a
mid-iteration aim arrives at once and leaves the walk with nothing routed.

THE JUMP IS ONE CALL: `se_aim {to}`. It walks every already-passing hop in that
same call and stops whole where something is owed. Going is the default;
`go: false` only aims. Re-entering a long record is this call, never a pull per
standing state.

AN EMPTY TARGET IS EMPTY, and it never means the front desk.

A `wait` IS NOT PROOF THERE IS NO DOOR. It reports that the route to the
STANDING target could not be drawn, which says nothing about the doors from
here. Ask with a choice; the refusal names what is actually offered.

### wait

Out of work, or the next step outweighs the dial. Name the waiting step
plainly, then STOP (contract rule 3). If the work is done, stop pulling.

### Blocking, and what is still a refusal

BLOCKING IS AN INSTRUCTION, NOT AN ERROR. A threshold, an unmet condition, an
undrawn route: the pull says so instead of throwing.

What stays a refusal is what is genuinely ILLEGAL — a choice outside the offer,
a form nothing asked for. A refusal is typed and carries an executable remedy.
Every clause's rule stands ahead of time in `guidance/refusals.md`. Follow the
remedy and recover in one turn.

A result carrying a `banner` is shown VERBATIM.

A PULL MAY MOVE THE WALK. There is no passive position query: "where am I" is
the pull's `where`. It only advances through states whose conditions pass and
whose weight fits the dial, so following it is safe by construction.

## What the agent still decides

The payload is TWO fields.

- `form` — the filled form the machine handed you: evidence sections, a reading
  proof, or an offered choice.
- `escape {reason}` — the one hatch, landing at the FRONT DESK where the person
  routes. The reason is the whole record.

A QUESTION IS NOT AN ESCAPE. Waiting on an answer, stay where you stand: ask
plainly and stop, and their reply resumes you there. Escape only when
MECHANICALLY stuck, when no answer could let the walk continue from here.
Earlier work no longer standing is also an escape; say what fell.

There is no position to assert and no route to draw. The pull recomputes from
wherever the walk stands, so the person's hand can never race you.

## The person's hand

They AIM; they never walk. Their controls are the autonomy dial, the STOP-AT
dial, the target and the checkboxes. Nothing they press moves the machine a
state forward or back — the walk advances on the agent's pull and nothing else.

THE TWO DIALS ASK NEIGHBOURING QUESTIONS.

- Autonomy says what the agent may DECIDE alone.
- Stop-at says how far it may GO before handing back. Its four notches are in
  `deliverable/machines/stopat.md`: `state end`, `agent judgement` (the
  default), `bless`, `blockers only`.

AT `state end` THE ENGINE HOLDS EVERY TRANSITION and the person releases them
one at a time. That is still not them walking: the press stops the engine
refusing, and the agent's pull is what moves.

## The reading

- Whenever anything is owed, the pull answers `read` and the document rides
  along. `prove` carries the questions.
- THREE PROBES, SPREAD THROUGH THE DOCUMENT. Each quotes a short run of words
  and asks for the FOUR WORDS THAT FOLLOW it. They sit near the 30%, 60% and
  92% marks, so all of it has to be in hand.
- THE ANCHOR SITS BETWEEN `«` AND `»`. Those marks are delimiters and are never
  part of the anchor. Plain quotes are used only where the anchor itself
  carries a guillemet.
- ANSWER ALL THREE IN ONE STRING, as `form: {"read": "..."}`. Join them any way
  you like. Order and separators do not matter.
- QUOTE GENEROUSLY. The check asks whether your answer CONTAINS the words it
  wants, never whether it matches them exactly. Unsure? Paste the whole
  sentence.
- PUNCTUATION NEVER COUNTS. Both sides are lowercased and stripped of every
  character that is not a letter or a digit, inside a word too, so `stands,`
  and `stands` are the same word.
  Quoting generously makes this stop mattering.
- CASE AND SPACING ARE IGNORED.
- A WRONG ANSWER NAMES EXACTLY WHICH PROBES MISSED, and the ones you got right
  are BANKED. Send only the named ones on the retry.
- The same document comes again with each wrong answer. Read the probes it
  names rather than the whole file.
- ONE DOCUMENT AT A TIME, on purpose: a host that moves a large result to disk
  hands you a preview, and a single document cannot be eaten.
- You never name a path and never work out what you owe.
- `.se/reading.md` is the same thing as a file, for a person to open.
- READ SERIALLY FOR NOW. A retreat, not a preference: a Copilot harness appears
  to cancel itself on parallel batches.

## Attribution — who you are rides every call too

SIX ARGUMENTS RIDE EVERY LANE TOOL, the way `update` does.

- `as` — WHICH HAND YOU ARE: owner, walker, guide, reviewer, surface. Omit it
  and the record says `walker`, which is right for the hand holding the
  session. Say `guide` when you are the hand that was ASKED for one step.
- `relayed_by` — WHO IS FILING WORK SOMEBODY ELSE DID. Send `as` for the
  AUTHOR and this for yourself.
- `answered_by` — what actually SERVED the call. Omit it and the record says
  `unreported`, which is a declared absence rather than a missing field.
- `named_driver`, `went_weaker`, `weaker_reason` — the safety rule. Going
  weaker with no reason marks the record `unreasoned`: marked, never refused.

NOTHING CHECKS ANY OF IT, and the record marks `as` and `answered_by` as
claims. `guidance/method/lane.md` carries why.

## Narration — the update rides the call the ENGINE asks for

`update: {...}` on ANY lane call carries a decision-graph op.

NARRATE WHEN THE ENGINE ASKS. It asks by warning that the toll is due, by
refusing a call without one, or by nudging that the checklist has not moved.
The rest of the time it is not asking, and you do not answer.

THE BAND IS ONE A MINUTE TO ONE EVERY FIVE. Above it you are filling the log;
below it the log has gaps. Most calls therefore carry nothing.

RIDING ONE ON EVERY CALL IS THE HABIT THIS RULE EXISTS TO STOP. Measured over
one window: 1445 ops against 124 pulls, twelve per step of walking, none of
them demanded.

YOUR FIRST ONE IS A PLAN, and it rides the pull that starts the work:

    se_pull  update: {op: "plan", items: ["read the record", "fill the gate", "submit"]}

NOBODY WILL ASK YOU FOR IT. The toll only bites after minutes or calls have run
out, so a short state can be walked start to finish with the log holding
nothing but pulls. That is a silent walk, and on an unattended machine the log
is the only witness there is.

EVERY OP CARRIES `op`, and the shorthand below is not the payload. `{node,
brief}` alone is refused with SE-C-120 saying `op: undefined`.

- `{op: "plan", items}` starts the checklist, BEFORE the first edit of any
  multi-step work. Check items off with `done` AS each lands.
  - SIZE AN ITEM SO IT CAN CLOSE WHERE YOU STAND. The stall guard counts
    updates since anything closed, so an item that cannot close makes every
    later update look like a stall.
  - AN ITEM NAMING A WHOLE MILESTONE IS NOT AN ITEM. It is the state you are
    in. Plan the steps inside it, and plan again at the next one.
- `{op: "fork", brief, items?}` opens a BLOCKING detour: the current item cannot
  continue until it is fixed. Scope growth is another `plan`, not a fork.
- `{op: "done" | "obsolete" | "revert", node, brief}` resolves a node.
  Everything started gets resolved; abandoning silently is illegal.
- `{op: "defer", node, to}` parks a point for the state that can do it.
- `{op: "update", node, brief}` says what you are doing ON an item. The node is
  required while a checklist stands. With nothing open, a bare update is right.

THE BRIEF IS ONE LINE, 90 characters. A brief that chains three or more
separator-joined parts is corrected rather than refused, and the result names
the correction.

- An `update` chain becomes the PLAN it wanted to be.
- A `fork` chain STAYS a fork and its parts become that detour's items, named
  by the first. A fork blocks the current item and a plan does not, so
  rewriting the op would change what the call means.
- A RESOLUTION's chained brief still refuses (SE-C-120): which part resolved
  the node is not the engine's to guess.

THE STALL WARNS AT FIVE AND REFUSES AT TWELVE (SE-C-133), and the gap is the
grace. The counter measures updates since anything CLOSED.

HOW OFTEN IS THE PERSON'S CONTROL, on the mirror's bar. Five notches, both
clocks running — minutes and calls, whichever falls due first. A low notch is
them asking to see the work, not a tax to pay with filler.

THE READING LOOP PAYS NOTHING. A pull carrying only a read proof does not spend
a call: the machine forced the hop and no judgment happened on it. The minutes
clock still runs, and a pull carrying evidence beside the proof pays like any
other work.

## Stopping, and looking at the surface

THREE VERBS ARE LEGAL WHEREVER THE WALK STANDS, because none of them is a move.

- `se_stop {because}` FORCES A STOP THE TOOTH REFUSED. Name which sanctioned
  stop applies and why. It changes nothing about the walk; only the turn ends.
  - THE TOOTH MUST HAVE BITTEN FIRST. A force before the refusal does nothing.
  - ONE FORCE RELEASES ONE STOP, and the next pull spends it.
  - SAYING IT IN CHAT PROVES NOTHING. The tooth reads the call log.
- `se_surface` PRINTS THE PERSON'S SURFACE AS TEXT — where the walk stands, the
  dials, what is legal here, every state with its marks. This is the everyday
  way to see it, and it needs nobody's permission.
- `se_shoot` DRAWS THE SURFACE AS A PICTURE, for a question about LAYOUT. It
  looks at a screen, so ask the person each time (rule 10).

## Notes

- `se_note {text}` captures a stray anywhere; keep walking.
- A NOTE IS PROSE AND THE WALL GUARD BINDS IT. One paragraph of six hundred
  characters is refused with SE-C-125. Break it into paragraphs as you write.
- `se_note_drain {ref, disposition}` takes one back out.
  - `done` and `obsolete` are CHECKS ANYONE CAN RUN. Look, and if the code
    carries it, drain it, saying `where:`.
  - `carried` and `backlog` are the RETRO's judgment, and the engine refuses
    them elsewhere.
- `backlog` MINTS A WORK TOKEN into the pool on trunk, where every clone reads
  the same answer. It takes two more arguments and refuses without them.
  - `where` is the re-entry condition: `ready when …`.
  - `statement` is what the token IS, for a reader who never saw the note.
- THE STATEMENT IS AUTHORED, NEVER PASTED. A raw note is a dump and may carry
  anything private, so a statement sharing a six-word run with it refuses
  (SE-C-140). Cannot state it cleanly yet? Say that, and the token carries the
  open question.
- A note already drained to `backlog` refuses a second mint. Re-judging one is
  `carried`, and the token it already minted is the thing that moves.
- Drain as you go: a note you have just disproved makes every later survey lie.
- In live discussion, write ONE consolidated note when the point settles.
- BEFORE building in an area, sweep the pending notes touching it. A noted
  ruling must never be built around.

## Git

THE MACHINE COMMITS, NOT YOU. Never ask whether something needs committing. A
dirty tree is not a loose end and is never reported as a risk. You MAY commit
for a checkpoint; you never have to. A tool being illegal where you stand is
the machine holding that job, not an obstacle to route around.

## Tests

THE AGENT DOES NOT RUN TESTS. It writes them; the engine runs them. Asking the
shell to run a test is refused outright, and `no_tool_reason` does not open it.

THE ENGINE DECIDES THE SCOPE, and its answer is the answer. It reads what
changed, follows the dependencies, and picks a named set of files, the whole
battery, or NOTHING. Nothing is a real answer: an unchanged tree keeps its last
verdict.

IN DOUBT IT RUNS LESS, NOT MORE. A test the engine did not run is a test the
gate review will run when something it depends on changes. Catching a break at
the review is the design, not a failure of it.

YOU DO NOT SECOND-GUESS THE SCOPE. Not by narrowing it, not by widening it, and
not by reaching around it. If the scope looks wrong, that is a defect in the
engine's dependency reading and it goes in a note.

THE TYPECHECKER IS THE SAME. The lane runs it after every edit to a source file
and hands the errors back on your next answer. Running it yourself is refused.

Test to answer a question — did THIS change break THAT — never to reassure. A
red is understood and fixed properly, then you move.

A SCOPED RUN IS THE ONLY ONE YOU MAKE. Ask it as a QUESTION — `se_test
{question: "did X break Y"}` — and the engine decides what to run.

IT DOES NOT BLOCK. The answer comes back `handed_off: true` with a job handle,
and then the run reports itself.

THERE IS NO POLL, AND ASKING FOR ONE IS REFUSED. `se_test` takes a question and
nothing else.

THE RUN RIDES THE `work` ACCOUNT on every lane call you make. It carries four
things.

- how far along it is
- how many have failed
- the first failures by name
- how much longer it needs, with the basis for that figure

The JOB makes the estimate, not you.

AN OUTCOME SAYING `bound reached` IS THE ACCOUNT GIVING UP, never a verdict.
Every entry declares how long the account will wait, and passing that bound ends
the WAIT rather than the work. The process is not touched.

SO THE WORK MAY STILL REPORT, and when it does its own outcome replaces the
bound's and the entry rides an answer again. A handle the engine can see running
is never expired at all.

THE WORD AFTER THE FIGURE SAYS WHERE IT CAME FROM — `measured` or `default`.
Everything in the product carries the default today, registered as
raid-risk-one-blanket-bound-is-given-to-work-nobody-measured.

SO CARRY ON WORKING. The news finds you on whatever call you were making
anyway, and the verdict records itself when the run ends.

THIS PAGE USED TO SAY POLLING PAYS NO CALL, and that sentence bought a habit
nobody wanted. i11 measured it: 494 `se_test` calls produced 66 verdicts, and
428 of them were polls.

THE FULL BATTERY IS THE ENGINE'S. It runs once, at verification, fired by that
state's own exit script. You never call it and there is no state where you may.
Asking for one anywhere else is refused, and `force: true` is for a flake hunt.

## Conditions

Every `entry`/`exit` key is a condition type, and its note says what it wants.
A condition is worked only from inside its state, and the pull TELLS you when
one stands in the way — as `read`, as `fill`, or as the stopped step's own
remedy.
