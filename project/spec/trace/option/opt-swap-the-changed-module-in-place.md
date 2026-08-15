---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: opt-swap-the-changed-module-in-place
type: "[[option]]"
statement: keep one engine process and load its modules per record, so a changed file is swapped in for the record that changed it and every other record keeps the module it already holds
cluster: cluster-the-walk
question: how a change to the engine's own code takes effect
found_by: prior_art
source: "hot module replacement — the Vite and webpack dev servers, Erlang OTP code_change, and Node's own loader hooks all replace running code without stopping the process"
---

## Mechanism

One process, one port, one session. What changes is WHICH copy of a module a
call uses: the engine keys its module registry by the record the call belongs
to, and a changed file invalidates that record's entry alone.

The next call in that record loads the new code. Every other record's calls
keep the module already resolved for them.

## Prior art, and where it is honest

HOT MODULE REPLACEMENT IS ORDINARY. The Vite and webpack dev servers do it
for browser code thousands of times a day. Erlang OTP does it in production
with code_change and two live versions per module, which is the closest
comparable because it is a server rather than a browser.

WHERE IT IS NOT ORDINARY. Those systems replace LEAF code - a component, a
handler. Replacing a module that holds session state, open handles or a
running walk is where hot reload gets a bad name, and this engine holds all
three.

## What it costs

MODULE-GRAPH DISCIPLINE THE ENGINE DOES NOT HAVE TODAY. Every module reached
from a call must be resolvable per record, and any module holding state
across calls has to say what happens to that state when it is replaced.

A PARTIAL SWAP IS WORSE THAN NONE, which is the same shape as a partial fan.
Half the graph new and half old does not compile and does not fail cleanly.

## What it buys

THE ONLY ANSWER ON THIS ROW WITH NO RESTART AT ALL. Nothing in flight stops,
in the changing record or anywhere else, and there is exactly one process to
supervise.
