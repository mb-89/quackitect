---
steps:
  - id: write-budget-probe
    statement: the cheapest possible check runs inside a write and the number is taken — a parse of the incoming content, timed against the standing one-second rule
    depends_on: []
    realization: code
  - id: guard-refuses-a-parse-break
    statement: a write carrying content the engine's own reader cannot parse is refused before anything lands, naming the file, the line, the value and the fix
    depends_on:
      - write-budget-probe
    realization: code
  - id: guard-refuses-a-wrong-word
    statement: a frontmatter value outside the vocabulary its key declares is refused, and the refusal names the key, the value and the whole allowed list
    depends_on:
      - guard-refuses-a-parse-break
    realization: code
  - id: the-sweep
    statement: se_lint takes a whole tree and answers with findings, which is what its own description has promised since 2026-07-28
    depends_on: []
    realization: code
  - id: report-versus-refuse
    statement: a break the corpus already carried lands and reports on the write's own result, and a corpus-wide subject never refuses at all
    depends_on:
      - guard-refuses-a-wrong-word
      - the-sweep
    realization: code
  - id: rules-bind-to-nodes
    statement: a rule written into a corpus node arms itself with no engine file changed, and the refusal names the node it came from
    depends_on:
      - report-versus-refuse
    realization: code
  - id: an-unbound-rule-is-named
    statement: a rule binding to nothing the corpus holds is reported as unbound, told apart from a rule nothing violated
    depends_on:
      - rules-bind-to-nodes
    realization: code
  - id: a-check-names-its-escape
    statement: a rule declaring no way forward does not arm, and the three that work are report, a signed answer, and carry
    depends_on:
      - rules-bind-to-nodes
    realization: code
  - id: coverage-computes-both-sides
    statement: a covers-declaring field reads both sets from the corpus, and asks the author only which nodes this delta touched
    depends_on: []
    realization: code
  - id: the-seed-states-its-dependency
    statement: depends_on is required on both seed verbs, an empty list is legal and lands on the record, and the remedy shows the call to make instead
    depends_on: []
    realization: code
  - id: assertion-red
    statement: observe-red tells an assertion failure from a crash, reading ERR_ASSERTION out of the TAP, and demands the first kind
    depends_on: []
    realization: code
  - id: the-ripple-names-its-root
    statement: a fallen-input refusal walks to the ROOT of the chain rather than naming the first hop, and picks the verb that can actually fix it
    depends_on: []
    realization: code
  - id: no-state-demands-what-it-cannot-supply
    statement: a compile-time check over the machine refuses a state whose form demands something no legal tool of that state can produce
    depends_on: []
    realization: code
  - id: the-cloud-start-reads-trunk
    statement: se-start checks the record folder on trunk instead of an origin/it/* branch, so the branches can go
    depends_on: []
    realization: code
  - id: dead-branch-code-goes
    statement: listBranches and its ref-stamp cache are deleted, with whatever else the deletion sweep names
    depends_on:
      - the-cloud-start-reads-trunk
    realization: code
---

# i6 — the build chunks

## The order is binding, and it is a mitigation

`raid-risk-the-small-fixes-crowd-out-the-conformance-system` is graded
crippling and plausible. Seven of this iteration's items are small fixes
with no shared design, and work flows to what is easy to close.

SO THE ORDER IS THE MITIGATION, recorded here rather than left to
judgment.

- THE PROBE IS FIRST. `write-budget-probe` takes the number that can move
  the architecture. Nothing else starts until it is known.
- THE CONFORMANCE SYSTEM COMES SECOND. Chunks two through ten.
- THE FIXES COME LAST. Chunks eleven through fifteen.

`gate-implementation` checks the ORDER, not the count. A brief reporting
fifteen closed items without saying which came first has not answered it.

## What fans out and what does not

FOUR CHUNKS HAVE NO DEPENDENCY and can run in parallel:
`write-budget-probe`, `the-sweep`, `coverage-computes-both-sides`,
`the-seed-states-its-dependency`.

FOUR MORE ARE INDEPENDENT FIXES: `assertion-red`,
`the-ripple-names-its-root`, `no-state-demands-what-it-cannot-supply`,
`the-cloud-start-reads-trunk`.

THE GUARD CHAIN IS SERIAL ON PURPOSE. Each of
`guard-refuses-a-parse-break` through `an-unbound-rule-is-named` builds
on the pass the one before it established, and splitting them would give
two places that decide the same thing.

## Two chunks exist because of this walk's own failures

`guard-refuses-a-wrong-word` comes from `status: part-closed`, which
parsed perfectly, was accepted, and trapped the walk eleven calls later.

`the-ripple-names-its-root` comes from the remedy that named
`identify-assumptions` — a state that was entirely fine — and could not
have worked however many times it was run. `se_why` walked the chain in
two calls after three failed remedies.

## The strategies that shaped the order

RISK-FIRST for the head: the unmeasured assumption goes first because it
is the only thing that can send the architecture somewhere else.

DEPENDENCY-ORDER for the middle: the guard chain is a real chain.

VALUE-LAST for the tail, deliberately inverted. The fixes are the most
certain to land and the least likely to teach anything, so they are
where a slipping iteration should lose time rather than where it spends
it first.
