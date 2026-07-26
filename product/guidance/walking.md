# walking — how the machine is driven

One tool drives everything: `se_tick`. It is legal in every state.

- No arguments: where you are — state, guidance, conditions, pulled
  documents, next states.
- `to: <state>`: complete the current state, enter that one. Required when
  several edges leave a state.
- `advance: true`: advance along a single drawn edge.
- `confirm: true`: confirm you READ what the current state's read condition
  lists. Logged as evidence. Confirm only after actually reading.
- `state: <id>`: peek at any state without moving.
- `back: <state>`: return to an earlier filled state. Everything downstream
  is superseded; its evidence is invalidated and earned again.

Conditions gate movement. Every `entry`/`exit` key is a condition type; its
note (linked in every refusal) says what it wants. A condition is worked
only from inside its state.

Refusals are typed: clause, expected, got, and an executable remedy. Follow
the remedy — recover in one turn. When a tick result carries a banner, show
it to the user verbatim.
