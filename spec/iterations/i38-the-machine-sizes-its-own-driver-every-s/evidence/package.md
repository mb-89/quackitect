---
form: package
by: agent
signed_off: 2026-08-21T00:13:01.900Z
authors: agent
files:
---

# Evidence form / package

## current_situation

THE ARTIFACT IS BUILT AND IT WAS USED. `dist/quackitect-7.0.0.zip`, 3,101,755 bytes, assembled by `engine/bin/package.ts` and expanded to `dist/check-7.0.0` to be run rather than read.

### The version

6.0.0 to 7.0.0, MAJOR, and the bump lands in one place because everything reads it from the manifest. `se-mcp.ts --version` inside the expanded package answers `7.0.0`, so the bump travelled with the artifact rather than only living in the repository.

MAJOR IS THE SIZE THIS RECORD WAS PINNED AT, and the matrix row asks for the matching bump. What ships is additive — a published pair and rung on the pull, six arguments on every lane tool — so nothing a caller depends on was removed.

### What is in it, seen rather than assumed

- `README.md` (1,728 bytes), the ENTRY document rendered from `brand/README.entry.md`.
- `RUNME.ps1` (25,284 bytes), the one-time installer.
- `RELEASES.md` (12,369 bytes) carrying the 7.0.0 entry at the top.
- `project/AGENTS.md` and `project/CLAUDE.md`, both 55,880 bytes. They are the same contract served to two hosts, and equal sizes are the check that was available here.
- `project/deliverable/package.json` reading `"version": "7.0.0"`.

### How it was checked, and what could not be

THE INSTALLER IS POWERSHELL AND THIS BOX HAS NO POWERSHELL. `RUNME.ps1` could not be run: no `pwsh`, no `powershell`. What was run instead is the one step the engine cannot start without, taken from the installer's own text — `npm install --no-audit --no-fund` under `project/deliverable`, which added 32 packages in 6 seconds.

WHAT THAT LEAVES UNCHECKED, said rather than papered over: the winget preflight for node, git and ripgrep; the editor extension install; the attach configs. None of them were exercised, and a Windows machine is where they would be.

THE REST OF THE CHECK IS THE PRODUCT ITSELF RUNNING FROM THE PACKAGE. The lane server started against `dist/check-7.0.0` as its root, walked its whole boot reading loop, and answered at `front_desk` with the desk's own guidance — the router with a brain, the method riding in by tag. That is the greeting the method asks for.

### The first boot of a fresh package is RED, and this is the finding

PREFLIGHT REFUSED ON THE WAY OUT OF BOOT: `project/.claude/skills/deep-research/SKILL.md` and `project/.github/skills/deep-research/SKILL.md` are MISSING.

THEY ARE MISSING BY DESIGN AND NOBODY PLACES THEM. `engine/produce.ts` excludes `project/.claude` because it is GENERATED, and `project/.github` is excluded by name with one path let through. The remedy preflight names is `engine/bin/place-prompt-layer.ts`, and `RUNME.ps1` never calls it — the string does not appear in the installer.

SO A FRESH INSTALL REACHES A RED CHECK BEFORE IT REACHES THE DESK. It is recoverable: the boot state makes the repair tools legal while a check stands red, and the lane carries `se_prompt_place` for exactly this. Running the named script placed six files, and the next boot went green to the desk.

IT IS STILL A DEFECT IN THE PACKAGE. A first run that is red is a first run a person has to debug, and the fix is one line in the installer.

## package

- dist/quackitect-7.0.0.zip

## works

yes

## emit_back

- M7_50 verification: its exit script IS the battery and its legal_tools are read-only, so a red battery cannot be repaired from where it fires — and fix-findings, the state for repairs, sits behind that same exit. Give the row what boot/prepare_idle already has: the repair tools legal while its own check stands red.
- RUNME.ps1: call engine/bin/place-prompt-layer.ts during the install. A fresh package's first boot fails preflight on two skill files nothing places, and the installer never names the script preflight names.
- engine/sessionclaims.ts standingStateFormOwed: LANDED IN THIS RECORD. A claim sent back on a state that runs a sub-machine could not be re-earned — its form is served only while that sub is unseeded, and leaving the sub needs the claim. The walk dead-ended for good at run-demos/end. dsp-walk-machine.md carries the design and tests/reopen-past-a-sub.test.ts guards it.
- the claim guard's remedy: it named the reopen that created the dead end above, as the cure. A remedy the engine cannot then serve is worse than no remedy, and nothing checks that one can be served.
- se_run: it refuses an intent argument while se_file_search takes one. Either the argument is the lane's or it is one verb's, and today a caller learns which by being refused.

## follow_up

THE MATRIX IS STILL UNRATED, and that is the standing debt this record opened rather than closed. One cell was rated by hand for the demonstration. Nothing else carries a complexity, so nearly every step publishes nothing — which is the designed behaviour for an unrated step and not a failure, but it means the feature is dark in the shipped product until the rating is done.

THE PACKAGE'S FIRST-BOOT RED IS NOT FIXED HERE. It is named in emit_back with the one-line fix, and it belongs to the installer rather than to this record's subject.

THE INSTALLER WAS NOT EXERCISED. A Windows check of RUNME.ps1 against this archive is owed before anyone claims the install path works for 7.0.0.

## anything_else

