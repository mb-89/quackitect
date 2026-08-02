# walking — how the machine is driven

One verb drives the walk: `se_pull`. You say pull, the machine says what
to do, you do it, you pull again. The machine owns every decision about
the walk — the route, the hop, the proof, the position.

## The pull

One call, one optional payload. It answers with an INSTRUCTION, and the
`pull` key names which of five you got.

- `read` — a document rides along, and `prove` names its last words. Read
  it, then pull again with `form: {"read": "<those words>"}`. The next
  document arrives when this one is proven.
- `fill` — the next step wants evidence. THE MACHINE BUILT THE FORM and
  handed it over, so you never look one up. Fill it and return it on the
  next pull as `form`.
- `choose` — the road splits. The options ride along with their statement,
  weight and whether they are open. Answer on the next pull as
  `form: {"choice": "<to>"}` — the choice is itself a form, and it exists
  only because the machine handed it to you.
- `do` — the happy path was WALKED for you, every hop to the next
  branching point in one call. `here` is where you landed, with its
  guidance and what it will ask. Do the work, then pull again.
- `wait` — the machine is out of work, or the next step weighs more than
  the session autonomy. Say plainly WHICH step waits, then STOP: the
  slider alone cannot wake you, a message resumes you.

THERE IS NO SUBMIT VERB. A pull carrying a filled form IS the submit.
Pulling again without it hands back the same form, so there is no way
forward except filling it.

BLOCKING IS AN INSTRUCTION, NOT AN ERROR. This is the point, and it is
v2's law (§6). A threshold, an unmet condition and an undrawn route are
the machine knowing what should happen next — the pull says it instead of
throwing it. What stays a refusal is what is genuinely ILLEGAL: a choice
outside the offer, a form nothing asked for. A refusal is typed — clause,
expected, got, and an executable remedy. Follow the remedy; recover in
one turn. When a result carries a banner, show it to the user VERBATIM.

A PULL MAY MOVE THE WALK. There is no passive position query for the
agent — the answer to "where am I" is the pull's `where`, and the answer
to "what now" is the rest of it. The walk only advances through states
whose conditions pass and whose weight fits the slider, so following the
pull is safe by construction.

## What the agent still decides

The payload is the whole list, and it is TWO fields (owner ruling
2026-08-02).

- `form` — the filled form the machine handed you. For evidence, the
  sections. For an OFFERED choice, `{"choice": "<to>"}` — a LIST is
  legal where the work fans out; one agent walks the first and the rest
  come back as `not_walked`. You never choose unasked: a choice is a
  form, and the machine builds every form.
- `escape` — stepping out, with the reason. ONE hatch for every kind:
  the person said stop, the walk is mechanically stuck, earlier work no
  longer stands. It lands at the FRONT DESK, where the person routes,
  and the reason is the whole record.

A QUESTION IS NOT AN ESCAPE. Waiting on an answer, STAY where you stand:
say the question plainly and stop — the state holds, and the person's
reply resumes you right there. Escape only when the walk is MECHANICALLY
stuck: when you already know that no answer could let it continue from
here. Escaping to ask routine questions abandons work that was fine.

REDOING EARLIER WORK is not a payload field. Escape to the desk and say
what no longer stands, and the person routes it from there.

Those two fields are the whole payload. There is no position to assert —
the pull recomputes from wherever the walk stands, so the person's hand
can never race you. There is no route to draw either: the mirror draws
it, and the pull walks it.

## The person's hand

The person AIMS; they never walk. Their controls are the slider, the
target and the checkboxes — and that is the whole list. Nothing they can
press moves the machine a state forward or a state back.

The walk advances on the agent's pull, and on nothing else. The engine
recomputes on every pull, so a target the person sets steers the agent's
very next one: they draw the line, and the pull walks it.

THE READING — the pull's own answer, not a second tool:

- Whenever anything is owed, the pull answers `read` and the document rides in `document`.
- `prove` names what to hand back: the document's LAST WORDS.
- Read it, then pull again with `form: {"read": "<those words>"}`. The next document arrives with that same answer.
- Keep going until the pull stops answering `read`. Then you have everything, by construction.
- You never name a path and you never work out what you owe.
- What you have already read is never served twice, so it always drains.
- ONE DOCUMENT AT A TIME, and that is the point. A host that moves a large tool result to disk hands you a PREVIEW instead of the text. A single document cannot be eaten.
- WHY THE TAIL. Truncation drops the END, so the end is precisely what a host that ate the text cannot give back. It is also the only proof you can actually produce: you cannot compute a hash, and a hash the engine handed you would prove only that a message arrived.
- A wrong answer credits nothing and the same document comes again.
- `.se/reading.md` is the same thing as a file, for a person to open.

READ SERIALLY FOR NOW. Send `se_file_read` calls one after another, not as a
parallel batch. This is a RETREAT, not a preference, and it is written down
so nobody re-optimises it back by accident.

WHY, and be precise about where the fault is. Parallel reads work: the lane
serves them, and they work on Claude Code today. A COPILOT HARNESS appears
to cancel itself when calls go out in parallel — observed on 2026-07-31, not
yet proven to the mechanism. Nothing about the MCP server or the lane is
implicated.

WHEN THIS LIFTS: when the harness bug is understood and fixed, or when the
host can be detected reliably enough to batch only where it is safe. Until
then the slow way is the only way that works everywhere.

Narration rides the walk (the unified log + the decision graph):

- `update: {...}` on ANY lane call carries a decision-graph op. Ride one
  on EVERY call that changes something (a write, a run, a move) — the
  5-minute toll is the enforcement floor, never the rhythm; the mirror's
  log should tell the story without gaps.
  - plan `{items}` starts the state's checklist. THE RHYTHM: any
    multi-step work opens with a plan, BEFORE the first edit — the
    panel's checklist IS this graph, and a visit without a plan shows
    the reader nothing to follow. Check items off with done AS each one
    lands, never in bulk at the end.

    WHY, because the rule keeps getting broken: the checklist is a
    PROGRESS view, not a completion record. A reader watching it wants
    to know where you are while you are still there.

    Fourteen items ticked in the last minute of an hour's work tell
    them nothing they could not have read from the commit. If an item
    is genuinely done, close it in the same breath as the work — the
    next call, not the last one.

    Only genuinely simultaneous work closes together. The engine nudges
    when updates keep landing and nothing closes.
  - fork `{brief, items?}` opens an unplanned branch where you are — a
    BLOCKING detour: the current item cannot continue until this is fixed;
    resolve it and return. Extra work that merely grows the scope is not a
    fork — append it to the checklist with another plan.
  - done | obsolete | revert `{node, brief}` resolves a node.
  - defer `{node, to}` parks a point for the state that can do it —
    entering that state materializes it as an open to-do. A point that
    cannot be done HERE is deferred, never claimed or ignored.
  - update `{node, brief}` says what you are doing, ON a checklist item.
    An update is never called a note — notes are the retro's strays
    (se_note).

    Every update CHANGES THE RENDER: the engine lands it as a checked
    point under that node — clicking the log line always shows what
    changed. Work that should stay open gets plan or fork instead.

    THE NODE IS REQUIRED WHILE A CHECKLIST STANDS. An update floating
    free of every item is narration wearing progress's clothes: the
    board fills with checked leaves while the items it should be moving
    stay open.

    With nothing open there is nothing to attach to, and a bare update
    is exactly right. The open node map rides home on every call, so
    naming one costs a glance.
- THE BRIEF IS ONE SHORT LINE. Ninety characters at most. It may not
  chain three or more separator-joined parts, because a chain is an
  unrendered list. The engine refuses one (SE-C-120). The rule binds
  PLAN ITEMS exactly as it binds briefs.
  THIS IS THE LANE'S MOST-HIT REFUSAL. Ten of the thirteen update
  failures on 2026-07-29 were this one, across two different sessions.
  If a brief wants commas, it wanted to be a plan.
- Everything started gets resolved. Abandoning is legal. Abandoning
  silently is not — the graph shows the drop.
- The TOLL: when the cadence lapses the next call carries a warning.
  Ignore it, and the call after is refused until an update rides. A
  volunteered update is never stopped, and always resets the count.
- HOW OFTEN IS THE PERSON'S CONTROL, on the mirror's bar beside the
  autonomy and the shutdown level. Five notches, and BOTH clocks run:
  minutes and calls, whichever falls due first.
  - `1m` — an update every minute, or every 5 calls.
  - `2m` — every 2 minutes, or every 10 calls.
  - `5m` — every 5 minutes, or every 20 calls. The default.
  - `15m` — every 15 minutes, or every 60 calls.
  - `off` — nothing is ever owed.
  The setting rides every pull as `narration`. A low notch is the
  person asking to see the work, not a tax to pay with filler: say what
  you are actually doing, on the item you are actually on.
- `se_note {text}`: capture a stray anywhere, keep walking (contract
  rule 4). Notes join the log feed.
- `se_note_drain {ref, disposition}`: take one back OUT, anywhere (owner
  ruling 2026-08-01). An inbox you may only add to is not an inbox.
  - `done` and `obsolete` are CHECKS ANYONE CAN RUN. The note says the code
    lacks something; look, and if it is there, drain it. Say where in
    `where:`, so the next reader does not re-check.
  - `carried` and `backlog` still belong to the RETRO. Those decide what
    the work MEANS and when it comes back, and that wants the whole
    picture. The engine refuses them elsewhere.
  - Drain as you go. A note you have just disproved is noise from that
    moment on, and leaving it standing makes every later survey lie.
  In a LIVE discussion with the owner, do not note every exchange —
  discuss first, write ONE consolidated note when the point settles.
  BEFORE building in an area, sweep the pending notes touching it —
  a noted ruling must never be built around.
- The human sees it all live in the mirror's log pane. One line per act.
  Clicking an update line opens the decision tree.

THE MACHINE COMMITS, NOT YOU (owner ruling):

- NEVER ask whether something needs committing. The machine does it.
- A dirty tree is not a loose end. Never report one as a risk or a caveat.
- The states that own the git work do it themselves. An expedition's close
  commits whatever is left before it merges, which is exactly why `se_git`
  is not legal in the leave state.
- You MAY commit when you want a checkpoint. You never have to.
- A tool being illegal where you stand is the machine holding that job, not
  an obstacle to route around.

Conditions gate movement. Every `entry`/`exit` key is a condition type; its
note (linked in every refusal) says what it wants. A condition is worked
only from inside its state — and the pull TELLS you when one stands in the
way, as `read`, `fill`, or the stopped step's own remedy.
