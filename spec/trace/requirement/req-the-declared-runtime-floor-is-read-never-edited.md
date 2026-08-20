---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: req-the-declared-runtime-floor-is-read-never-edited
type: "[[requirement]]"
statement: Where the running runtime is below the floor the project declares, the system shall stop and name both versions, and shall never alter the declaration to proceed.
kind: constraint
verify_method: test
breaks_if_removed: Editing the pin to go green turns a loud failure into a silent one, and the next box runs an engine the project never claimed to support.
breaks_how_badly: fatal
refines:
  - uc-arrive-on-an-unattended-machine
source_refs:
  - uc-arrive-on-an-unattended-machine extension 3a
  - guidance/method/cloud-runner.md
  - raid-asm-the-declared-node-floor-matches-what-the-engine-needs
priority: must
---

## Detail

THE FLOOR IS READ FROM `engines.node`, never copied, so there is one declaration
and everything that checks it checks the same one.

THIS DOES NOT MAKE THE FLOOR CORRECT, and i35 measured it wrong at the edge: the
engine's full battery passes on node 22.22 while the pin demands 24. Correcting a
declared floor is the owner's act. Working around it is nobody's.
