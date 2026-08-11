---
id: tsp-first-run
type: "[[test-spec]]"
statement: A newcomer reaches the desk's greeting from a fresh machine with one command, and the boot stands without an agent, verified by demonstration on a real machine.
method: "demonstration"
demonstrates:
  - "sty-ramp-up"
  - "sty-start-a-new-product"
verifies:
  - "req-newcomer-one-command"
  - "req-newcomer-orients-unaided"
  - "req-newcomer-leaves-able-to-ask"
  - "req-one-script-installs"
  - "req-second-product-reuses-install"
  - "req-setup-serves-shipped-method"
  - "req-begin-says-own-window"
  - "req-fresh-machine-runs"
  - "req-boot-stands-agentless"
files:
  - "none — the procedure below is the definition; the observed run is the evidence"
---

## Scope

The first hour on a fresh machine: install, greeting, orientation, a
second product, and the agentless boot. Observed working end to end,
without instrumented capture — the population measures (2 of 3
newcomers) are read over real first-timers.

## Approach

System level, on a machine holding only an editor and a shell. Scenario
design: one journey per claim, walked by a person, the observations
recorded against each step. The two population claims accumulate over
real newcomers rather than one sitting.

## Procedure

- Run the one setup script on a fresh machine. Observe: exactly one
  command, zero hand-edited files, the desk's greeting arrives.
- Open the workspace with no agent attached. Observe: every panel
  control live.
- Ask a first-time reader to open the entry documents unaided. Observe:
  they state what the product is within the session.
- Begin a second product where the extension already stands. Observe:
  zero further extension installs; the scaffold states the own-window
  rule.
- After their first tour, ask the newcomer to name the parts they will
  use and pick a fitting desk offer. Observe: unaided, same session.
