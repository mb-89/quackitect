# walking — how the machine is driven

One tool drives everything: `se_tick`. It is legal in every state.

- No arguments: where you are — state, guidance, conditions, pulled
  documents, next states.
- `to: <state>`: complete the current state, enter that one. Required when
  several edges leave a state.
- `advance: true`: advance along a single drawn edge.
- `read_hashes: {"<path>": "<hash>", ...}`: your proof-of-read for this
  tick. A transition demands it for the current state's read list and for
  everything the TARGET pulls; each hash rides a `se_file_read` result and
  must match the doc as it stands now. Fresh every tick — after a
  compaction, re-read before advancing.
- `park: true`: mark the session as waiting on the human, then END your
  turn. The machinery watches the machine while you sleep and wakes you
  with a message when their hand moves (slider, tick, check).
- `wait: true`: the short in-turn hold — blocks until something moves,
  returns the fresh packet (changed: false on timeout). Prefer park for
  anything longer than seconds.
- `state: <id>`: peek at any state without moving.
- `back: <state>`: return to an earlier filled state. Everything downstream
  is superseded; its evidence is invalidated and earned again.

Conditions gate movement. Every `entry`/`exit` key is a condition type; its
note (linked in every refusal) says what it wants. A condition is worked
only from inside its state.

Refusals are typed: clause, expected, got, and an executable remedy. Follow
the remedy — recover in one turn. When a tick result carries a banner, show
it to the user verbatim.
