---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: if-bootstrap-to-toolchain
type: "[[interface]]"
statement: The first run meets a bare computer here, and it is the one crossing where being slow is expected and being silent is not.
source: el-bootstrap
destination: nbr-toolchain
carries:
  - flow-bare-computer
  - flow-toolchain
form: child process
bound: not one second, and it says so
source_refs:
  - "i33 model-the-boundaries: the outside edges the element matrix never drew"
---

## What crosses

- what the machine already has, discovered rather than assumed
- what it installs to become able to run the product

## Measured 2026-08-17, the discovery half only

- `node --version`: 33 ms
- `npm --version`: 470 ms

DISCOVERY IS FAST AND INSTALLATION IS NOT. What a machine already has can be
read in under half a second. What it lacks takes minutes, and that half cannot
be measured here without a bare computer.

npm AT 470 MS IS WORTH NOTING ON ITS OWN: fourteen times node's own startup,
for a version string. A first run that shells out to npm repeatedly pays that
every time.

## Why the bound is not a second

INSTALLING IS MINUTES ON A BARE COMPUTER, and no amount of engineering makes it
a second. This is the clearest case in the whole boundary set where the fast
half is simply unavailable.

## What it owes instead, and why this edge sets the standard for the honest half

IT IS SOMEBODY'S FIRST EXPERIENCE OF THE PRODUCT. A person who has never run it
before is watching, so they have no baseline for what normal looks like and
cannot tell a long install from a hang.

SO IT OWES MORE THAN THE OTHERS: what is running, what has already finished,
and what is left. A progress signal on this edge is not a courtesy — it is the
only thing standing between a first-time user and the conclusion that the
product does not work.
