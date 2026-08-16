---
id: i22-judgment-the-frozen-window-pull-dependen
status: seeded
opened: 2026-08-12T19:46:37.778Z
goal: "JUDGMENT — the frozen window: pull dependencies and references at iteration start, push at ship, freeze in between, and add the ship-review row the rigor matrix lacks."
vision: "NEEDS THE OWNER, because it changes how an iteration begins and ends.\n\nWAITS ON i10. There is nothing to freeze until references exist as a register with versions.\n\nTHE OWNER'S RULING, and his reason. Pull at iteration start, push at ship, frozen between. It is the same INPUT-PROCESS-OUTPUT principle the project wants everywhere else.\n\nIT COVERS REFERENCES, NOT ONLY CODE. His example: a new version of a standard comes out mid-iteration. WE DO NOT ADOPT IT. The iteration continues on the version it started with, and the standard is updated afterwards. That is the whole rule in one case.\n\nTHE ROW THAT IS MISSING. The rigor matrix holds 52 rows under machines/rigor_matrix/rows/. M9 runs M9_20_package, M9_90_gate-release, M9_99_shipped. THERE IS NO DEPENDENCY SHIP-REVIEW ROW. Whatever the window becomes, it needs one, and minting a matrix row is a method change with its own weight.\n\nWHAT V2 DESIGNED, and it is the missing half of our absent row: a ship-time review with STICKY PER-DEPENDENCY RULINGS, so a judgment made about one dependency does not have to be remade at every ship. And an UPSTREAM INBOX that carries a vehicle's changes UP as offers rather than as edits.\n\nWHAT TO SETTLE IN THE DISCUSSION. What the ship review actually ASKS the person, because a review that asks nothing answerable becomes ceremony — v2 recorded exactly that failure, where mandatory rounds degraded into agreement prose. What a sticky ruling covers and when it expires. And whether the freeze is enforced by the engine or is a discipline; the owner has been clear elsewhere that a system you can simply ignore is a bad system.\n\nFULL CONTEXT: project/spec/version-planning.md, section J4.\n\nFROM THE POOL, 2026-08-13. One more, and it is the freeze seen from its cost side.\n\nA RETRO RUN INSIDE AN ITERATION SWEEPS A STALE REGISTER (note-0a766b7fd6b0). The debt sweep run from inside one record finds TWO debts; trunk carries a THIRD. A record's worktree is a snapshot of trunk at SEED time, and while method resolves to the root and stays current, the spec corpus is the record's own content and is frozen. THAT FREEZE IS DELIBERATE AND THIS ITERATION OWNS IT. WHY IT IS STILL A DEFECT: the retro is not iteration work, it is a look at the whole system, and a sweep asking whether a debt is still true cannot answer from a frozen corpus - it sees the register as it stood when the record was seeded, which for a long-lived seed can be weeks. THE FAILURE IS SILENT: nothing says two of three, so the report looks complete. It cost nothing that day only by luck, because the missing debt had been swept an hour earlier from the front desk. THREE CANDIDATE FIXES, and the third is the cheapest and stops the silence, which is the real harm: the debt sweep reads the register from TRUNK; or the bound retro refreshes the record's corpus from trunk first, which is this iteration's pull half arriving early; or the sweep reports its source and its count, naming the worktree and its seed date."
inputs:
  - "project/spec/version-planning.md"
  - "i10-the-big-sweep-one-pass-over-one-key-a-mo"
  - "project/deliverable/machines/rigor_matrix/rows/"
  - "project/V2-INVENTORY.md"
depends_on:
  - i10-the-big-sweep-one-pass-over-one-key-a-mo
---

# i22-judgment-the-frozen-window-pull-dependen

## Goal

JUDGMENT — the frozen window: pull dependencies and references at iteration start, push at ship, freeze in between, and add the ship-review row the rigor matrix lacks.

## Rough vision

NEEDS THE OWNER, because it changes how an iteration begins and ends.

WAITS ON i10. There is nothing to freeze until references exist as a register with versions.

THE OWNER'S RULING, and his reason. Pull at iteration start, push at ship, frozen between. It is the same INPUT-PROCESS-OUTPUT principle the project wants everywhere else.

IT COVERS REFERENCES, NOT ONLY CODE. His example: a new version of a standard comes out mid-iteration. WE DO NOT ADOPT IT. The iteration continues on the version it started with, and the standard is updated afterwards. That is the whole rule in one case.

THE ROW THAT IS MISSING. The rigor matrix holds 52 rows under machines/rigor_matrix/rows/. M9 runs M9_20_package, M9_90_gate-release, M9_99_shipped. THERE IS NO DEPENDENCY SHIP-REVIEW ROW. Whatever the window becomes, it needs one, and minting a matrix row is a method change with its own weight.

WHAT V2 DESIGNED, and it is the missing half of our absent row: a ship-time review with STICKY PER-DEPENDENCY RULINGS, so a judgment made about one dependency does not have to be remade at every ship. And an UPSTREAM INBOX that carries a vehicle's changes UP as offers rather than as edits.

WHAT TO SETTLE IN THE DISCUSSION. What the ship review actually ASKS the person, because a review that asks nothing answerable becomes ceremony — v2 recorded exactly that failure, where mandatory rounds degraded into agreement prose. What a sticky ruling covers and when it expires. And whether the freeze is enforced by the engine or is a discipline; the owner has been clear elsewhere that a system you can simply ignore is a bad system.

FULL CONTEXT: project/spec/version-planning.md, section J4.

FROM THE POOL, 2026-08-13. One more, and it is the freeze seen from its cost side.

A RETRO RUN INSIDE AN ITERATION SWEEPS A STALE REGISTER (note-0a766b7fd6b0). The debt sweep run from inside one record finds TWO debts; trunk carries a THIRD. A record's worktree is a snapshot of trunk at SEED time, and while method resolves to the root and stays current, the spec corpus is the record's own content and is frozen. THAT FREEZE IS DELIBERATE AND THIS ITERATION OWNS IT. WHY IT IS STILL A DEFECT: the retro is not iteration work, it is a look at the whole system, and a sweep asking whether a debt is still true cannot answer from a frozen corpus - it sees the register as it stood when the record was seeded, which for a long-lived seed can be weeks. THE FAILURE IS SILENT: nothing says two of three, so the report looks complete. It cost nothing that day only by luck, because the missing debt had been swept an hour earlier from the front desk. THREE CANDIDATE FIXES, and the third is the cheapest and stops the silence, which is the real harm: the debt sweep reads the register from TRUNK; or the bound retro refreshes the record's corpus from trunk first, which is this iteration's pull half arriving early; or the sweep reports its source and its count, naming the worktree and its seed date.

## Inputs

- project/spec/version-planning.md
- i10-the-big-sweep-one-pass-over-one-key-a-mo
- project/deliverable/machines/rigor_matrix/rows/
- project/V2-INVENTORY.md
