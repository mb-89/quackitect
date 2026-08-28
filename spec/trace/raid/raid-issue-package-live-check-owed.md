---
minted_in: i8
id: raid-issue-package-live-check-owed
type: "[[raid]]"
kind: issue
statement: The M9 package state's "works" check — install via RUNME.ps1, reach the desk's greeting inside a real VS Code editor — cannot run in this headless Linux container. No PowerShell, no GUI editor.
owner: the owner
trigger: the owner (or an agent with a Windows machine and VS Code) runs RUNME.ps1 against a built package and records what was observed
status: open
impact: package's "works" field is answered from headless-verifiable evidence only (file manifest, rendered README, typecheck, the scoped suite run against the packaged copy) rather than the literal install-and-see-the-greeting check the method card describes.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - deliverable/machines/methods/meth-ship-package.md
  - raid-issue-must-demos-owed
place: backlog
---

Same underlying limit as raid-issue-must-demos-owed — an unattended
agent on a headless Linux container has no fresh Windows machine and
no GUI editor to run a live check in — applied to a different concern
with a different mitigation: this one closes when RUNME.ps1 is run
against a real built package on a real machine, once per release it is
asked of, not by any amount of source reading or in-container testing.

i8's M9 package (2026-08-13) verified everything checkable without a
GUI: the archive's file manifest is complete, the README renders the
brand substitution correctly, `tsc --noEmit` is clean against the
packaged copy, and a scoped suite (49/49, four files) passes when run
directly against the packaged copy's own code — the same source this
session's full battery already ran clean (1115/1126, the 11 failures
pre-existing and unrelated).

What stayed unverified: RUNME.ps1 itself (PowerShell, absent from this
container) and the actual desk greeting inside a live VS Code window.
