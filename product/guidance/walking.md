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

- `update: {...}` on ANY lane call carries a decision-graph op.
  - plan `{items}` starts the state's checklist.
  - fork `{brief, items?}` opens an unplanned branch where you are — a
    BLOCKING detour: the current item cannot continue until this is fixed;
    resolve it and return. Extra work that merely grows the scope is not a
    fork — append it to the checklist with another plan.
  - done | obsolete | revert `{node, brief}` resolves a node.
  - note `{brief, node?}` says what you are doing.
- Everything started gets resolved. Abandoning is legal. Abandoning
  silently is not — the graph shows the drop.
- The TOLL: after five silent minutes the next call carries a warning.
  Ignore it, and the call after is refused until an update rides. A
  volunteered update is never stopped.
- `se_note {text}`: capture a stray anywhere, keep walking (contract
  rule 4). Notes join the log feed; they drain at a retro, later.
- The human sees it all live in the mirror's log pane. One line per act.
  Clicking an update line opens the decision tree.

Conditions gate movement. Every `entry`/`exit` key is a condition type; its
note (linked in every refusal) says what it wants. A condition is worked
only from inside its state.

Refusals are typed: clause, expected, got, and an executable remedy. Follow
the remedy — recover in one turn. When a tick result carries a banner, show
it to the user verbatim.
