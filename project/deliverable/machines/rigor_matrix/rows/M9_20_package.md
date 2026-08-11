---
kind: matrix-row
name: package
statement: "Package: the versioned artifact assembles by script - README, the one-time installer and the editor extension inside - then it is checked by using it."
state_kind: work
filled_by: agent
depends_on:
  - gate-validation
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
    description: the versioned artifact with its contents listed - README, installer, extension
  - name: works
    description: the package used for real - what was installed, what was observed, or the honest gap
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
  The patch version bump and its changelog line. Nothing repackages beyond
  what the release lane already does.
product_note: |
  STANDING ARTIFACT: the released package - versioned, with a README and
  a one-script installer that work on a fresh machine, and the editor
  extension inside. The product at rest is installable, not just correct.
specification_note: |
  DOCUMENT FORM: README and the installer script, shipped IN the
  package; release notes per version. The README is an ENTRY document -
  plain language, no method jargon (owner law).
---

## Guidance

Per [[meth-ship-package]]: the packaging is AUTOMATED - a script assembles the artifact, and assembling by hand is the defect. The human-shaped work is the check: use the package and record what was observed.

The package holds a README, the one-time installer script, and the editor extension, with the versioned engine and method underneath them.
