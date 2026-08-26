---
minted_in: i36
id: tsp-interrupted-call-names-the-stopping-layer
type: "[[test-spec]]"
statement: A lane call that ends without a normal result reports which layer ended it — server, transport, host or stop hook — or reports the layer as unknown, and never infers a cause nobody observed.
method: test
verifies:
  - req-interrupted-call-names-the-stopping-layer
files:
  - tests/stophook.test.ts
  - tests/ptyend.test.ts
---

## Scope

The report a lane call produces when it ends without a normal result. Four
named layers and one honest escape hatch.

- The server ended it.
- The transport lost it.
- The host cancelled it.
- The stop hook vetoed it.
- None of the above could be evidenced, so the report says unknown.

WHAT IS DELIBERATELY OUT. Preventing the interruption. That is a different
requirement with a different mechanism, and this spec is about what the
engineer is told after the fact.

## Approach

DESIGN METHOD: state-transition testing over the interruption source. Each
layer is one transition into the same end state, and the report is the only
observable that distinguishes them.

A negative partition carries equal weight here: an interruption whose source
left no evidence must produce `unknown`, not a guess. That case is the one the
requirement was minted for.

LEVEL: integration. The layers only exist together, and a component test
cannot tell a transport loss from a server exit.

DEPTH: high. The requirement is graded `corrosive`, and the failure mode is
silent: a wrong layer reads exactly like a right one, so recovery starts from
a confident guess and repeats the interruption.

## Steps

Every case in `tests/stophook.test.ts` and `tests/ptyend.test.ts` is one step.
The twenty cases in the stop-hook file and the one in the pty file stand
today, and they stay.

THE FIVE BELOW ARE RED TODAY. Neither file reports a stopping LAYER; they
assert whether a stop is blocked or passed, which is a different question.

- A call ended by the server reports the server, and cites what showed it.
- A call ended by transport loss reports the transport.
- A call cancelled by the host reports the host.
- A call vetoed by the stop hook reports the stop hook.
- A call whose end left no evidence reports `unknown`, and reports nothing
  else. This case fails if the report names any layer.

## Why unknown is a passing answer

An interrupted call is exactly the situation where the system knows least. A
report that always names a layer would be guessing on the very calls that
matter most, and a guess in this position is worse than a blank because it
routes real recovery work.

The requirement's own measure says it: zero reports infer an unobserved cause.
`unknown` is how that measure is met, not how it is dodged.
