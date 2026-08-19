# walking — how the machine is driven

<!-- AUTHORED TERSE. This register IS the source: the start-the-agent step
     assembles this file verbatim into the prompt layer. No LLM stands in that
     path. Edit the rule here. -->

One verb drives the walk: `se_pull`.

Pull, do what comes back, pull again.

Without a routed goal, staying in the current state is valid progress.

A no-goal pull should report there is nothing to do here and show options.

The machine owns every decision about the walk — the route, the hop, the
proof, the position.

## The pull

One call, one optional payload. It answers with an INSTRUCTION, and `pull`
names which of four you got.

- `read` — a document rides in `document`, and `prove` asks THREE
  FILL-IN-THE-BLANK QUESTIONS about it. Answer all three, in one string, and
  pull again with `form: {"read": "<the answers>"}`. Keep going until no
  `read` comes back — then you hold everything, by construction.
- `fill` — the machine BUILT the form and handed it over. Fill it, return it
  as `form` on the next pull. There is no submit VERB; the pull is the only
  call. There IS a submit FLAG, and it rides in the form.

  THREE KEYS ARE ACTS, NOT SECTIONS. Everything else in the form is a field
  and gets saved.

  - `submit: true` — stamp it. Runs every check, then signs.
  - `bless: true` or `bless: false` — the gate's thumb, up or down.
  - a bare fill with neither — SAVED and NOT stamped, on purpose. Fill half a
    form now and the rest later.

  SO A FORM YOU MEAN TO FINISH CARRIES `submit: true`. Without it the fields
  land, nothing signs, and the same form comes back looking untouched — which
  reads exactly like a refusal and is not one. This cost four round trips on
  2026-08-09 before anybody read the engine.

  A GATE IS THE SAME MECHANISM. It takes `submit` and `bless` like any other
  form, and at high autonomy the agent uses both (owner ruling 2026-08-09).
  Blessing your own gate is normal here when the person has said so. Below the
  dial it is theirs, exactly like every other step.

  WHICH ONE APPLIES IS THE ENGINE'S ANSWER, NEVER YOURS TO DERIVE. Every gate
  carries a weight, and a bless from the agent is refused when the dial sits
  at or below it — the refusal names both rungs. SO SEND THE BLESS AND READ
  THE ANSWER. Reading the contract, the autonomy scale and the stop-at scale
  to work out whether you are allowed costs three documents and settles
  nothing the one call would not.

  BOTH IN ONE PULL IS LEGAL: `form: {"verdict": "pass — why", "submit": true,
  "bless": true}` fills, stamps and blesses in a single call.

  A `recheck` BLOCK MEANS THE CLAIM ALREADY STOOD (owner ruling 2026-08-07).
  Somebody signed it, then something upstream moved and sent it back. The body
  is still on the file and the signature is still on the file.

  SO DO NOT ANSWER IT AGAIN. Read what is written, ask only whether the named
  change moved it, and submit if it still holds. Rewrite ONLY the fields the
  change actually touched.

  THE SUBMIT IS THE REBLESS. It re-runs every check against the corpus as it
  now stands and stamps a newer signature, and the newer signature clears the
  mark by itself. Nothing is skipped and nothing can be waved through: a claim
  the change really did break refuses, and names what broke.

  RE-DERIVING A STANDING CLAIM IS WASTE, and it is the waste this block exists
  to stop. A reopened form used to arrive looking exactly like a fresh one.
- OPTIONS RIDE A `do` — there is no separate `choose` instruction, and the
  engine has never emitted one. Where the road splits; the options ride along with weight and
  openness. Answer `form: {"choice": "<to>"}` only when a routed goal needs
  that door. A LIST is legal where work fans out; one is walked, the rest
  come back as `not_walked`. You never choose unasked, and you do not choose
  just because options were offered.

  A CHOICE AIMS THE WALK. Taking an offered door SETS the target to it, and
  that is how the agent moves toward anything at all. There is no separate
  verb and none is missing. "You never name a target" means you never invent
  one — it has never meant you cannot move.

  A `wait` IS NOT PROOF THERE IS NO DOOR. It reports that the route to the
  STANDING target could not be drawn, which says nothing about the doors from
  here. Ask with a choice; the refusal names what is actually offered.
- `do` — the happy path was walked for you, every hop to the next branching
  point. `here` is where you landed. Do the work, pull again.
- `wait` — out of work, or the next step outweighs the dial. Name the
  waiting step plainly, then STOP (contract rule 3). If the work is done,
  stop pulling.

BLOCKING IS AN INSTRUCTION, NOT AN ERROR. A threshold, an unmet condition, an
undrawn route: the pull says so instead of throwing. What stays a refusal is
what is genuinely ILLEGAL — a choice outside the offer, a form nothing asked
for. A refusal is typed and carries an executable remedy. Every clause's
rule stands ahead of time in project/guidance/refusals.md. Follow the remedy;
recover in one turn. A result carrying a `banner` is shown VERBATIM.

A PULL MAY MOVE THE WALK. There is no passive position query: "where am I" is
the pull's `where`. It only advances through states whose conditions pass and
whose weight fits the dial, so following it is safe by construction.

## What the agent still decides

The payload is TWO fields.

- `form` — the filled form the machine handed you: evidence sections, a
  reading proof, or an offered choice.
- `escape {reason}` — the one hatch, landing at the FRONT DESK where the
  person routes. The reason is the whole record.

A QUESTION IS NOT AN ESCAPE. Waiting on an answer, stay where you stand: ask
plainly and stop; their reply resumes you there. Escape only when
MECHANICALLY stuck — when no answer could let the walk continue from here.
Earlier work no longer standing is also an escape: say what fell.

There is no position to assert and no route to draw. The pull recomputes from
wherever the walk stands, so the person's hand can never race you.

## The person's hand

They AIM; they never walk. Their controls are the autonomy dial, the STOP-AT
dial, the target and the checkboxes. Nothing they press moves the machine a
state forward or back — the walk advances on the agent's pull and nothing else.

THE TWO DIALS ASK NEIGHBOURING QUESTIONS. Autonomy says what the agent may
DECIDE alone. Stop-at says how far it may GO before handing back, and its four
notches are project/deliverable/machines/stopat.md: `state end`, `agent judgement` (the default),
`bless`, `blockers only`.

AT `state end` THE ENGINE HOLDS EVERY TRANSITION and the person releases them
one at a time. That is still not them walking: the press stops the engine
refusing, and the agent's pull is what moves.

## The reading

- Whenever anything is owed, the pull answers `read` and the document rides
  along. `prove` carries the questions.
- THREE PROBES, SPREAD THROUGH THE DOCUMENT. Each quotes a short run of words
  and asks for the FOUR WORDS THAT FOLLOW it. They sit near the 30%, 60% and
  92% marks, so all of it has to be in hand.
- THE ANCHOR SITS BETWEEN `«` AND `»`. Those marks are the delimiters and are
  never part of the anchor. Plain quotes are used only where the anchor itself
  carries a guillemet, so the delimiter is always a character the anchor does
  not hold — an anchor ending in a quote mark used to hide its own end.
- ANSWER ALL THREE IN ONE STRING, as `form: {"read": "..."}`. Join them any
  way you like. Order does not matter and separators do not matter.
- QUOTE GENEROUSLY. The check asks whether your answer CONTAINS the words it
  wants, never whether it matches them exactly. A longer quote around the
  anchor passes; a clipped one misses. Unsure? Paste the whole sentence.
- PUNCTUATION IS NOT A WORD. Only tokens carrying a letter or a digit count,
  so a dash, a bullet or a bare quote mark sitting between two words is
  skipped. Counting four words by eye and including one costs you the probe.
  Quoting generously makes this stop mattering.
- CASE AND SPACING ARE IGNORED, so there is nothing to normalise by hand.
- A WRONG ANSWER NAMES EXACTLY WHICH PROBES MISSED, and the ones you got right
  are BANKED. Send only the named ones on the retry — there is no need to
  resend what already landed, and no penalty if you do.
- The same document comes again with each wrong answer. Read the probes it
  names rather than the whole file: the answer is in the text you already
  hold.
- WHY PROBES AND NOT A HASH: you cannot compute one, and one the engine handed
  you would prove only that a message arrived. Spread probes are the cheapest
  thing that a host which truncated the text cannot answer.
- ONE DOCUMENT AT A TIME, on purpose: a host that moves a large result to disk
  hands you a preview, and a single document cannot be eaten.
- You never name a path and never work out what you owe.
- `.se/reading.md` is the same thing as a file, for a person to open.

READ SERIALLY FOR NOW. A RETREAT, not a preference: a Copilot harness appears
to cancel itself on parallel batches (observed 2026-07-31). The lane serves
parallel reads fine. Lifts when that bug is understood or hosts can be
detected.

## Narration — the update rides every call

`update: {...}` on ANY lane call carries a decision-graph op. Ride one on
every call that changes something. The toll is the enforcement floor, never
the rhythm; the log should tell the story without gaps.

YOUR FIRST ONE IS A PLAN, and it rides the pull that starts the work:

    se_pull  update: {op: "plan", items: ["read the record", "fill the gate", "submit"]}

NOBODY WILL ASK YOU FOR IT. The toll only bites after minutes or calls have
run out, so a short state can be walked start to finish with the log holding
nothing but pulls. That is a silent walk, and on an unattended machine the log
is the only witness there is.

EVERY OP CARRIES `op`, AND THE SHORTHAND BELOW IS NOT THE PAYLOAD. `{node,
brief}` alone is refused with SE-C-120 saying `op: undefined`; the call is
`{op: "done", node, brief}`. The op names the line you are reading, never the
whole object.

- `{op: "plan", items}` starts the checklist, BEFORE the first edit of any
  multi-step work. Check items off with `done` AS each lands. The checklist is
  a PROGRESS view, not a completion record — fourteen items ticked in the last
  minute tell a reader nothing the commit would not.
- `{op: "fork", brief, items?}` opens a BLOCKING detour: the current item
  cannot continue until it is fixed. Scope growth is another `plan`, not a
  fork.
- `{op: "done" | "obsolete" | "revert", node, brief}` resolves a node.
  Everything started gets resolved; abandoning silently is illegal.
- `{op: "defer", node, to}` parks a point for the state that can do it.
- `{op: "update", node, brief}` says what you are doing ON an item. The node
  is required while a checklist stands — an update floating free of every item
  is narration wearing progress's clothes. With nothing open, a bare update is
  right.
- THE BRIEF IS ONE LINE, 90 characters. A brief that chains three or more
  separator-joined parts is corrected rather than refused, and the result
  names the correction. An `update` chain becomes the PLAN it wanted to be.
  A `fork` chain STAYS a fork and its parts become that detour's items,
  named by the first — a fork blocks the current item and a plan does not,
  so rewriting the op would change what the call means. A RESOLUTION's
  chained brief still refuses (SE-C-120): which part resolved the node is
  not the engine's to guess.
- THE STALL WARNS AT FIVE AND REFUSES AT TWELVE (SE-C-133), and the gap is
  the grace. Both were five, so the warning bit one call later — which is a
  two-stage refusal, not a warning. The counter measures updates since
  anything CLOSED, and real work runs past six while reading its way to a
  root cause.

HOW OFTEN IS THE PERSON'S CONTROL, on the mirror's bar. Five notches, both
clocks running — minutes and calls, whichever falls due first. A low notch is
them asking to see the work, not a tax to pay with filler.

THE READING LOOP PAYS NOTHING (owner ruling 2026-08-18). A pull carrying only
a read proof does not spend a call. The machine forced that hop and no
judgment happened on it, so there is nothing to narrate — and a toll falling
due mid-loop could only ever be paid with filler. The minutes clock still
runs, and a pull carrying evidence beside the proof pays like any other work.

## Notes

- `se_note {text}` captures a stray anywhere; keep walking.
- A NOTE IS PROSE AND THE WALL GUARD BINDS IT. One paragraph of six hundred
  characters is refused with SE-C-125, the same as any other text the lane
  takes. Break it into paragraphs as you write it.
- `se_note_drain {ref, disposition}` takes one back out. `done` and `obsolete`
  are CHECKS ANYONE CAN RUN — look, and if the code carries it, drain it,
  saying `where:`. `carried` and `backlog` are the RETRO's judgment and the
  engine refuses them elsewhere.
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
- Drain as you go: a note you have just disproved makes every later survey
  lie.
- In live discussion, write ONE consolidated note when the point settles.
- BEFORE building in an area, sweep the pending notes touching it. A noted
  ruling must never be built around.

## Git

THE MACHINE COMMITS, NOT YOU. Never ask whether something needs committing. A
dirty tree is not a loose end and is never reported as a risk. You MAY commit
for a checkpoint; you never have to. A tool being illegal where you stand is
the machine holding that job, not an obstacle to route around.

## Tests

Test to answer a question — did THIS change break THAT — never to reassure.
A red is understood and fixed properly, then you move.

A SCOPED RUN IS THE ONLY ONE YOU MAKE. It blocks and answers, so there is
nothing to poll: no handle, no second call asking whether it finished.

THE FULL BATTERY IS THE ENGINE'S. It runs once, at verification, fired by
that state's own exit script — you never call it and there is no state where
you may. Asking for one anywhere else is refused, and `force: true` is for a
flake hunt.

## Conditions

Every `entry`/`exit` key is a condition type, and its note says what it wants.
A condition is worked only from inside its state, and the pull TELLS you when
one stands in the way — as `read`, as `fill`, or as the stopped step's own
remedy.
