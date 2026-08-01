# walking — how the machine is driven

One tool drives everything: `se_tick`. It is legal in every state.

- No arguments: where you are — state, guidance, conditions, pulled
  documents, next states.
- `to: <state>`: complete the current state, enter that one. Required when
  several edges leave a state.
- `from: <state>`: your assumed CURRENT state — send it on EVERY moving
  tick. The human's hand moves the walk too; when `from` is not where the
  machine stands, the move is refused (SE-C-114) and the refusal names
  the real position. Continue from there — never replay the stale move.
- `advance: true`: advance along a single drawn edge.
- `read_hashes: {"<path>": "<hash>", ...}`: your proof-of-read for this
  tick. A transition demands it for the current state's read list and for
  everything the TARGET pulls; each hash rides a `se_file_read` result and
  must match the doc as it stands now. Fresh every tick — after a
  compaction, re-read before advancing.
- `wait: true`: the short in-turn hold — blocks until something moves
  (slider, tick, check), returns the fresh packet (changed: false on
  timeout). Only when you expect the change within seconds. For anything
  longer: STOP, telling the user plainly that the slider alone cannot
  wake you — they must message you (continue is enough) after changing
  it, and you resume from wherever the machine stands.
- `state: <id>`: peek at any state without moving. A LIST of ids peeks them
  all in ONE call, answering with `states`. Peeking every door before you
  choose is the normal case, so it should cost one round trip, not one each.
- `back: <state>`: return to an earlier filled state. Everything downstream
  is superseded; its evidence is invalidated and earned again.
- `target: <state>`: set the destination the route line tracks. The session
  already has one at engine start, pointing at the front desk.

Default movement rule:

- If a target is set, keep walking toward it.
- Prefer any `enter_met` edge that advances toward that target.
- Stop at idle only when no reachable in-threshold step advances toward target.
- A refusal still stops the walk. Follow its remedy.
- SE-C-113 means user handoff. Report and wait for a message.

THE READING — a loop, not a list:

- Whenever anything is owed, the packet carries `reading`. Call `se_reading`.
- It hands back ONE document: the next guidance the way ahead demands, as text.
- Read it. Call `se_reading` again. Stop when it answers `done: true`.
- Pull until it gives you nothing. Then you have everything, by construction.
- You never name a path. You never carry a hash. The engine credits what it served.
- You never work out what you owe either. The machine knows:
  - A TARGET is set — every document the whole way there, plus what the target's neighbours demand at entry.
  - NO target — where you stand is the target: what this state pulls, plus what its neighbours demand.
- What you have already read is never served twice, so the loop always drains.
- ONE DOCUMENT PER CALL, and that is the point. A host that moves a large tool result to disk hands you a PREVIEW instead of the text — and the engine has already credited it, so you stand proven to have read what you never saw. A single document cannot be eaten.
- `.se/reading.md` is the same thing as a file, for a person to open. Agents use the tool.

Read-ahead discipline (every state):

- `route_reads` and `lookahead_read` NAME what is owed. `reading` HANDS IT OVER. Prefer the reading.
- Read a named path directly only when you want that one document for its own sake.
- Keep a session cache of path -> hash from `se_file_read`.
- Re-read only when a refusal says the hash is missing or stale.
- If a state allows no tools, do not read there. Tick only.

Two more arguments go with `target`, and only make sense beside it — they
are how you walk a KNOWN way without one round trip per hop:

- `route: <state>`: the way from here to there — every hop, its priority, and
  what each will ask for. It MOVES NOTHING. Read it to answer every judgment
  on the way at once, before committing to the walk.
- `sweep: true` with `to:`: WALK THAT ROUTE IN ONE CALL instead of one tick
  per hop. It collapses round trips and nothing else — every hop still weighs
  the slider, proves its reads and runs its scripts, and it stops at the
  first hop that will not pass, saying which and why.

A WORD OF WARNING ON "SWEEP", because this page uses it three other ways:
the desk sweeps the machinery before advising, the overhaul sweeps what is
active, and you sweep the pending notes before building. Those are all the
ordinary English word. Only `sweep: true` on a tick is the verb.

READ SERIALLY FOR NOW. Send `se_file_read` calls one after another, not as a
parallel batch. This is a RETREAT, not a preference, and it is written down
so nobody re-optimises it back by accident.

WHY, and be precise about where the fault is. Parallel reads work: the lane
serves them, and they work on Claude Code today. A COPILOT HARNESS appears
to cancel itself when calls go out in parallel — observed on 2026-07-31, not
yet proven to the mechanism. Nothing about the MCP server or the lane is
implicated.

So the cost is real and accepted. Boot demands seven or eight documents and
serial reads pay a round trip for each. A boot that COMPLETES on every host
beats a faster one that dies on one of them.

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
    to know where you are while you are still there. Fourteen items
    ticked in the last minute of an hour's work tell them nothing they
    could not have read from the commit. If an item is genuinely done,
    close it in the same breath as the work — the next call, not the
    last one. Only genuinely simultaneous work closes together.
    The engine nudges when updates keep landing and nothing closes.
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
    (se_note). Every update CHANGES THE RENDER: the engine lands it as a
    checked point under that node — clicking the log line always shows
    what changed. Work that should stay open gets plan or fork instead.
    THE NODE IS REQUIRED WHILE A CHECKLIST STANDS. An update floating
    free of every item is narration wearing progress's clothes: the board
    fills with checked leaves while the items it should be moving stay
    open. With nothing open there is nothing to attach to, and a bare
    update is exactly right. The open node map rides home on every call,
    so naming one costs a glance.
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
  The setting rides every packet as `narration`. A low notch is the
  person asking to see the work, not a tax to pay with filler: say what
  you are actually doing, on the item you are actually on.
- `se_note {text}`: capture a stray anywhere, keep walking (contract
  rule 4). Notes join the log feed; they drain at a retro, later.
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
only from inside its state.

Refusals are typed: clause, expected, got, and an executable remedy. Follow
the remedy — recover in one turn. When a tick result carries a banner, show
it to the user verbatim.
