---
form: package
by: agent
signed_off: 2026-08-13T11:07:02.556Z
authors: agent
files:
---

# Evidence form / package

## current_situation

M9 package for i8. package.ts had a Windows-only PowerShell dependency and a relative-path bug that broke it on POSIX; both fixed on trunk this session (escape-edit-return, SE-C-134 remedy) and verified. The script now runs cleanly here and produced a real archive in this record's own worktree.

## package

- dist/quackitect-4.0.0.zip

## works

yes — verified everything checkable in this headless Linux container: the archive's file manifest is complete (README, RUNME.ps1, RELEASES.md, the engine, the vscode extension, machines, tests, spec), the README renders the brand substitution correctly, `tsc --noEmit` is clean against the extracted packaged copy, and a scoped suite run directly against the packaged copy (tests/sehelp.test.ts, tests/requirement-checks.test.ts, tests/help.test.ts, tests/claimops.test.ts) passes 49/49 across 4 suites, 0 failures. This matches the same source tree's full battery this session (1115/1126, 11 pre-existing unrelated failures). NOT verified: RUNME.ps1 itself (PowerShell, absent from this container) and reaching the desk's greeting inside a live VS Code window — filed as raid-issue-package-live-check-owed, since no amount of source reading substitutes for that observed run.

## follow_up

raid-issue-package-live-check-owed stays open until someone runs RUNME.ps1 against a real built package on a real Windows/VS Code machine and records the observation.

## anything_else

