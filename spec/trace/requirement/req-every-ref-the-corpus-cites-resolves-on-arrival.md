---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: req-every-ref-the-corpus-cites-resolves-on-arrival
type: "[[requirement]]"
statement: When the arrival completes, the system shall make every branch the corpus cites as a `ref:` resolvable as a local revision, and shall name any branch it left unresolved.
kind: functional
verify_method: demonstration
breaks_if_removed: "A cloud clone carries one branch, so every record citing `ref: main` is dead on arrival. Measured on i15: four refused calls, a wrongly-minted assumption, and a false claim that spread through six evidence forms."
breaks_how_badly: crippling
refines:
  - uc-arrive-on-an-unattended-machine
source_refs:
  - uc-arrive-on-an-unattended-machine steps 2 and extension 2b
  - guidance/method/cloud-runner.md Arrival A
priority: must
---

## Detail

A FETCH IS HALF OF IT AND THE HALF PEOPLE SKIP IS THE OTHER. `git show main:...`
fails against `origin/main`, because a remote-tracking ref is not a revision named
`main`.

MEASURED 2026-08-17 on this box, both ways. After `git fetch --all --prune` alone,
an `se_file_search` at `ref: main` answered `unknown revision`. After
`git branch main origin/main` it returned real matches.

NAMING WHAT IT LEFT UNRESOLVED is the second half of the requirement. An
unreachable remote degrades `ref:` searches and must stop nothing else — but a
silent degradation is how i15 came to cite a branch that was never there.
