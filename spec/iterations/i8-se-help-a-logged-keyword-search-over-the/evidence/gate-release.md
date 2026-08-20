---
form: gate-release
bless: blessed by agent
by: agent
signed_off: 2026-08-13T11:08:25.492Z
authors: agent
files:
---

# Evidence form / gate-release

## current_situation

i8 built se_help and the owed checkbox; M0-M8 complete. gate-validation passed with overrides (4 of 8 must-demos owed, needing the owner's screen). package.ts had a Windows-only PowerShell dep and a POSIX path bug, both fixed on trunk this session; the archive is real and on disk (dist/quackitect-4.0.0.zip). works was answered from every headlessly-checkable signal; the live install/desk-greeting check is filed as raid-issue-package-live-check-owed. This is the release gate, on the owner's explicit remote authorization for this unattended run.

## market_block


## round_0_verify

- evidence vs claims: holds — package.md's claim is real (file on disk, manifest complete, README rendered, tsc clean, 49/49 scoped tests against the packaged copy itself).
- types: clean — tsc --noEmit clean against both trunk and the packaged copy.
- lint: clean — confirmed at gate-implementation and gate-validation, unchanged since.
- tests: full battery this session 1115/1126 (11 pre-existing, unrelated); a scoped 49/49 run directly against the packaged copy's own code (4 files, no server boot).

## round_1_validate

- exercised against the goal: the release artifact is real and structurally verified — file manifest, rendered README, typecheck, scoped tests — not read from source alone.
- missing: the literal 'install via RUNME.ps1, reach the desk's greeting' check — no PowerShell and no GUI editor in this headless Linux container; filed as raid-issue-package-live-check-owed.
- wrong: none found.
- out of scope: unchanged from gate-validation.
- prior art: n/a for a release gate.

## round_2_red_team

- this gate is self-blessed at dial 0.8 (strategic) => sanctioned per owner ruling 2026-08-09 and this run's explicit remote authorization (2026-08-13: "this iteration needs to go live", "do the shipping").
- the works verdict rests on headless evidence only, never a live install => named directly and filed as its own raid entry rather than folded silently into the existing must-demos entry.
- two unexplained lane outages occurred while running package.ts this session => both self-recovered, walk position untouched on disk both times, cause left open in the field report rather than guessed at here.

## raid_additions

- raid-issue-package-live-check-owed
- raid-issue-must-demos-owed
- raid-issue-trace-design-checks-existence-not-content
- raid-debt-checklist-panel-lacks-owed-state

## verdict

pass — the package stands (real archive, structurally complete, its code typechecked and tested clean) and works to the limit of what is honestly checkable in this container; the remaining live-install check is owed, not faked. Blessed at dial 0.8 on the owner's explicit remote authorization for this run.

## follow_up

raid-issue-package-live-check-owed closes when RUNME.ps1 runs against a real built package on a real Windows/VS Code machine and the observation is recorded.

## anything_else

Nothing.
