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
names which of five you got.

- `read` — a document rides in `document`; `prove` names its last words. Read
  it, pull again with `form: {"read": "<those words>"}`. Keep going until no
  `read` comes back — then you hold everything, by construction.
- `fill` — the machine BUILT the form and handed it over. Fill it, return it
  as `form` on the next pull. THERE IS NO SUBMIT: the pull carrying the form
  is the submit.
- `choose` — the road splits; the options ride along with weight and
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
- `wait` — out of work, or the next step outweighs the slider. Name the
  waiting step plainly, then STOP (contract rule 3). If the work is done,
  stop pulling.

BLOCKING IS AN INSTRUCTION, NOT AN ERROR. A threshold, an unmet condition, an
undrawn route: the pull says so instead of throwing. What stays a refusal is
what is genuinely ILLEGAL — a choice outside the offer, a form nothing asked
for. A refusal is typed: clause, expected, got, executable remedy. Follow the
remedy; recover in one turn. A result carrying a `banner` is shown VERBATIM.

A PULL MAY MOVE THE WALK. There is no passive position query: "where am I" is
the pull's `where`. It only advances through states whose conditions pass and
whose weight fits the slider, so following it is safe by construction.

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

They AIM; they never walk. Their controls are the slider, the target and the
checkboxes. Nothing they press moves the machine a state forward or back —
the walk advances on the agent's pull and nothing else.

## The reading

- Whenever anything is owed, the pull answers `read` and the document rides
  along. `prove` names its LAST WORDS.
- ONE DOCUMENT AT A TIME, on purpose: a host that moves a large result to disk
  hands you a preview, and a single document cannot be eaten.
- WHY THE TAIL: truncation drops the END, so the end is exactly what a host
  that ate the text cannot give back. It is also the only proof you can
  produce — you cannot compute a hash, and one the engine handed you would
  prove only that a message arrived.
- A wrong answer credits nothing and the same document comes again.
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

- `plan {items}` starts the checklist, BEFORE the first edit of any
  multi-step work. Check items off with `done` AS each lands. The checklist is
  a PROGRESS view, not a completion record — fourteen items ticked in the last
  minute tell a reader nothing the commit would not.
- `fork {brief, items?}` opens a BLOCKING detour: the current item cannot
  continue until it is fixed. Scope growth is another `plan`, not a fork.
- `done | obsolete | revert {node, brief}` resolves a node. Everything started
  gets resolved; abandoning silently is illegal.
- `defer {node, to}` parks a point for the state that can do it.
- `update {node, brief}` says what you are doing ON an item. The node is
  required while a checklist stands — an update floating free of every item is
  narration wearing progress's clothes. With nothing open, a bare update is
  right.
- THE BRIEF IS ONE LINE, 90 characters. A brief that chains three or more
  separator-joined parts wanted to be a plan, and the engine APPLIES it as
  one — the parts become the items, and the result names the correction. A
  RESOLUTION's chained brief still refuses (SE-C-120): which part resolved
  the node is not the engine's to guess.

HOW OFTEN IS THE PERSON'S CONTROL, on the mirror's bar. Five notches, both
clocks running — minutes and calls, whichever falls due first. A low notch is
them asking to see the work, not a tax to pay with filler.

## Notes

- `se_note {text}` captures a stray anywhere; keep walking.
- `se_note_drain {ref, disposition}` takes one back out. `done` and `obsolete`
  are CHECKS ANYONE CAN RUN — look, and if the code carries it, drain it,
  saying `where:`. `carried` and `backlog` are the RETRO's judgment and the
  engine refuses them elsewhere.
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
Scoped runs are the default and the battery is EARNED; the lane enforces
both. A red is understood and fixed properly, then you move.

## Conditions

Every `entry`/`exit` key is a condition type, and its note says what it wants.
A condition is worked only from inside its state, and the pull TELLS you when
one stands in the way — as `read`, as `fill`, or as the stopped step's own
remedy.
