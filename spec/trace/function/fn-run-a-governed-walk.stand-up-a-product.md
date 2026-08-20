---
minted_in: i1
id: fn-run-a-governed-walk.stand-up-a-product
type: "[[function]]"
cluster: the-bootstrap
statement: take a computer with nothing on it to a product that is running, whether it stops at its own front desk or walks straight into work
satisfies:
  - req-one-script-installs
  - req-setup-floor-editor-shell
  - req-setup-stops-before-partial
  - req-newcomer-one-command
  - req-second-product-reuses-install
  - req-product-is-a-folder
  - req-extension-replaced-reported
  - req-fresh-machine-runs
  - req-scaffold-from-template
  - req-pin-writes-seeded-scaffolds
  - req-begin-touches-nothing-existing
  - req-begin-says-own-window
  - req-purpose-recorded-at-begin
  - req-fresh-product-starts-empty
  - req-one-command-starts-an-unattended-machine
  - req-the-lane-runs-without-a-console
  - req-work-starts-without-a-reachable-remote
  - req-the-folder-shows-what-to-run
inputs:
  - flow-bare-computer
  - flow-product-template
  - flow-intent
outputs:
  - flow-toolchain
  - flow-scaffolded-product
controls:
  - the missing-tool check, which stops before anything changes
  - the existing products, none of which may be touched
source_refs:
  - uc-install-quackitect
  - uc-begin-a-product
---

## Rationale

INSTALLING AND SCAFFOLDING ARE ONE FUNCTION because they answer one
question: does a product exist and does it run. A person who has installed
but has nothing to open has not arrived.

Stopping BEFORE a partial install is the discipline that makes it one
function rather than a sequence. A half-installed machine is worse than an
uninstalled one, because it looks finished.

Beginning a second product touches nothing of the first. That is what keeps
this allocatable without dragging the running system into its blast radius.

## Finding the way in is part of this function, not part of teaching

`req-the-folder-shows-what-to-run` sits here rather than with the newcomer's
tour, and the tour's own rationale is why. That function explains the system
FROM THE LIVE SYSTEM. Before the launcher runs there is no live system to
derive anything from, so the tour cannot reach this moment at all.

SO THE FIRST STEP OF THE PATH IS FINDING THE PATH. This function's statement
already begins at a computer with nothing on it, and a person who cannot find
what to run has not left that starting point.

ITS PASS LINE IS READ OFF PEOPLE RATHER THAN OFF THE MACHINE, which this
function has not had before. That is a real change to what verifying this
function costs, and it is named here rather than discovered later.
