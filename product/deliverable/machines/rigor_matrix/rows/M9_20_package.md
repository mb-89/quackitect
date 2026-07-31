---
kind: matrix-row
name: package
statement: "Package: versioned artifact, baselined configuration, README and the one-script entry."
state_kind: work
filled_by: agent
depends_on:
  - finalize-docs
evidence:
  - name: package
    description: "the versioned artifact with its contents listed"
  - name: entry_script
    description: "the one-script entry, or the recorded skip"
---

## Guidance

Per [[meth-ship-package]]: every release carries README plus the RUNME equivalent for its realization kind - install-and-run for software, install-everything-to-check-the-design for a design, recorded skip for a pure document.
