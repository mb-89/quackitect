---
steps:
  - id: container-blind-spots
    statement: "shoot.ts finds the Chromium a container actually has, and passes --no-sandbox only as root — the browser path and the flag ship together or neither is testable"
    depends_on: []
    realization: code
  - id: corpus-frontmatter-guard
    statement: "preflight refuses a trace note whose frontmatter is unterminated, unparseable or absent — the fence counted before the parse, because the parse cannot see it"
    depends_on: []
    realization: code
  - id: the-fallback-is-driven
    statement: "the verification/fix-findings loop is driven on the shipped matrix at every column, and the dead guard counter is pinned so a half-fix fails loudly"
    depends_on: []
    realization: code
  - id: the-arrival
    statement: "one idempotent act takes a fresh clone to a live lane: refs and their local branches, the runtime judged against the pin, the install, the cage, a headless lane, and a written client"
    depends_on: []
    realization: code
  - id: the-arrival-hook
    statement: "the committed root settings fire the arrival at session start, and the hook exits zero whatever happened — a hook that ends a session start is worse than the hand-work it replaces"
    depends_on: [the-arrival]
    realization: code
  - id: the-arrival-guards
    statement: "tests/arrival.test.ts pins the runtime refusal, the untouched declaration, the cage that is never half-placed, the loud opt-out and the degrading fetch"
    depends_on: [the-arrival-hook]
    realization: code
  - id: the-guidance-follows
    statement: "cloud-runner.md leads with the one command and keeps the five acts, and Arrival A carries the fetch with the measurement behind it"
    depends_on: [the-arrival]
    realization: doc
---

# The build plan

Six chunks over two surfaces: what a container gets wrong, and what an arrival
costs.

## THE PLAN IS TWO ISLANDS AND ONE CHAIN

THREE CHUNKS DEPEND ON NOTHING and could have run in any order:
`container-blind-spots`, `corpus-frontmatter-guard` and `the-fallback-is-driven`.
They are the seeded findings, and they share no file with each other.

THE OTHER FOUR ARE A CHAIN, and each link is a real precedence rather than a
preference. `the-arrival` has to exist before a hook can fire it. The hook has to
exist before its guards can be written, because the case that matters most —
the hook surviving an arrival that failed — is about the hook rather than the
act. And the guidance follows the act it documents, so that the prose describes
something already observed rather than something intended.

## THE ORDER THIS ACTUALLY RAN IN WAS NOT THIS ORDER, and the record says so

`the-arrival-guards` came AFTER the thing it guards, so the checks were green
from birth. That is what `observe-red` exists to catch, and it caught it: the
red was observed late, by inverting the guarantee under test, watching the case
fail on an assertion, and reverting.

WHY THE ORDER WENT WRONG. The arrival was built mid-run on an owner instruction,
while the walk was still standing at M0 waiting on the dial. So the build
happened before the milestone that plans it, and this drawing is written
afterwards describing what was done rather than before it, planning what to do.

THAT IS RECORDED HERE RATHER THAN TIDIED AWAY. A chunk drawing authored after
the build is a weaker artifact than one authored before it, and pretending
otherwise would make every future reader trust it more than it deserves.

## What is NOT a chunk

NO SHARED MODULE WITH `se-start.ts`. Four functions are implemented twice, and
folding them changes the unattended start path — which deserves its own
verification rather than riding along here. It is filed as
[[raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them]] with its
repayment written.

NO DIAL CHANGE. The arrival takes the autonomy as a parameter and never chooses
it. A script that raised it would be an agent granting itself autonomy through
a file.
