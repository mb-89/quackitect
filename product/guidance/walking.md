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
- `state: <id>`: peek at any state without moving.
- `back: <state>`: return to an earlier filled state. Everything downstream
  is superseded; its evidence is invalidated and earned again.

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
- The TOLL: after five silent minutes the next call carries a warning.
  Ignore it, and the call after is refused until an update rides. A
  volunteered update is never stopped.
- `se_note {text}`: capture a stray anywhere, keep walking (contract
  rule 4). Notes join the log feed; they drain at a retro, later.
  In a LIVE discussion with the owner, do not note every exchange —
  discuss first, write ONE consolidated note when the point settles.
  BEFORE building in an area, sweep the pending notes touching it —
  a noted ruling must never be built around.
- The human sees it all live in the mirror's log pane. One line per act.
  Clicking an update line opens the decision tree.

Conditions gate movement. Every `entry`/`exit` key is a condition type; its
note (linked in every refusal) says what it wants. A condition is worked
only from inside its state.

Refusals are typed: clause, expected, got, and an executable remedy. Follow
the remedy — recover in one turn. When a tick result carries a banner, show
it to the user verbatim.
