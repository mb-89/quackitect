---
kind: matrix-row
name: package
statement: "Package: versioned artifact, baselined configuration, README and the one-script entry."
state_kind: work
filled_by: agent
depends_on:
  - finalize-docs
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
    description: "the versioned artifact with its contents listed"
  - name: entry_script
    description: "the one-script entry, or the recorded skip"
major: full
minor: full
patch: tailored
product: full
specification: full
major_note: |
  Applies in full: major version bump, versioned artifact, baselined
  configuration, README and entry script current.
minor_note: |
  Applies: minor version bump, versioned artifact, baselined
  configuration, README and entry script current.
patch_note: |
  The patch version bump and its changelog line. Nothing repackages beyond
  what the release lane already does; configuration stays baselined.
product_note: |
  STANDING ARTIFACT: the released package - versioned, configuration
  baselined, README and one-script entry that actually work on a fresh
  machine. The product at rest is installable, not just correct.
specification_note: |
  DOCUMENT FORM: README and the RUNME-equivalent entry script, shipped
  IN the package; release notes per version. The README is an ENTRY
  document - plain language, no method jargon (owner law).
---

## Guidance

Per [[meth-ship-package]]: every release carries README plus the RUNME equivalent for its realization kind - install-and-run for software, install-everything-to-check-the-design for a design, recorded skip for a pure document.
