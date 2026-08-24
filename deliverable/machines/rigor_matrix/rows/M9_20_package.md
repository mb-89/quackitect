---
kind: matrix-row
name: package
statement: "Package: the versioned artifact assembles by script - README, the one-time installer and the editor extension inside - then it is checked by using it."
state_kind: work
filled_by: agent
depends_on:
  - spawn-for-release
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_run
  - se_git
evidence:
  - name: package
    description: the built ZIP - ONE line, the root-relative path to the versioned archive
    template: file-ref
  - name: works
    description: the package used for real - does it work? yes passes plainly, no owes its rationale
    template: choice-with-rationale
    options:
      - yes
      - no
    passing:
      - yes
    rationale_for:
      - no
  - name: emit_back
    description: what this record learned about the SHARED method - a matrix row, a form, a method card, a refusal, a missing check - one line each naming the target and the change, or none-found stated plainly
    template: list
major: full
minor: full
patch: tailored
product: full
specification: full
major_note: |
  Applies in full: major version bump, the package assembles by script,
  and the check uses it - install from the package, reach the desk.
minor_note: |
  Applies: minor version bump, the package assembles by script, the
  check uses it.
patch_note: |
  The patch version bump. Nothing repackages beyond what the release lane
  already does, and no notes file is written.
product_note: |
  STANDING ARTIFACT: the released package - versioned, with a README and
  a one-script installer that work on a fresh machine, and the editor
  extension inside. The product at rest is installable, not just correct.
specification_note: |
  DOCUMENT FORM: README and the installer script, shipped IN the
  package. The README is an ENTRY document - plain language, no method
  jargon (owner law).
---

## Guidance

Per [[meth-ship-package]]: the packaging is AUTOMATED - a script assembles the artifact, and assembling by hand is the defect. The human-shaped work is the check: use the package and record what was observed.

The package holds a README, the one-time installer script, and the editor extension, with the versioned engine and method underneath them.

## The emit

THE OUTPUT PHASE EMITS BACK (owner ruling 2026-08-13). A record is input, process, output, and the output is owed to the shared method as well as to the product.

`emit_back` is that debt, and [[meth-emit-back]] holds the shape.

What to name: a state whose guidance was wrong or missing while you walked it, a form that asked for the wrong evidence, a method card that did not answer its own question, a refusal that blocked without a remedy, a check that should exist.

What not to name: anything about this record's own subject. That is the product's output, not the method's.

IT IS A CAPTURE, AND IT MAY ALSO BE A WRITE (owner ruling 2026-08-14). Shared method resolves to the machine root from any bound tree. The change lands on the one copy, from where you stand. Make it if it is yours to make. Name it here either way — this list is what the next record reads.

The next record's `promotions` field at onboard-retro consumes this list, and the machine it is seeded with is compiled from the matrix as it then stands. So a landed improvement travels with no further act - the emit is what gets it landed.
