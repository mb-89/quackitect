---
form: package
by: agent
signed_off: 2026-08-18T21:17:26.511Z
authors: agent
files:
---

# Evidence form / package

## current_situation

THE ARTIFACT IS BUILT AND IT WAS STARTED, not only opened. `dist/quackitect-5.0.0.zip`, assembled by `engine/bin/package.ts` in 16.4 seconds and expanded to `dist/check-5.0.0`.

### The version

4.5.0 to 5.0.0, MAJOR, and the bump lands in one place because everything reads it from the manifest.

MAJOR IS THE RIGHT SIZE, and it is the first in this line. `RUNME.ps1 --export` was a documented way in and it is REMOVED, so a caller who depended on it breaks. That is the semver test, and it agrees with the column the kickoff blessed.

### What is in it, seen rather than assumed

- `README.md` — the entry document, rendered from `brand/README.entry.md`, which is the same template a produced vehicle renders, so the two front doors cannot drift.
- `RUNME.ps1` — the one-time installer, 25,284 bytes, down from 30,267 at 4.3.0. The 85-line export block is gone and the size shows it.
- `RELEASES.md` — carrying the 5.0.0 entry.
- `.claude/settings.json` — THE CAGE TRAVELLED. Verification found this being dropped, and it is the only hook a fresh clone reads at session start, so its absence would have meant no produced copy ever arrived.
- `project/` carrying `.github`, `deliverable`, `guidance` and `spec`. The Copilot prompt layer under `.github` travels by a written exception.
- `project/deliverable/package.json` reading `"version": "5.0.0"`.
- `AGENTS.md` and `CLAUDE.md` both 40,961 bytes, the same contract served to two hosts.

## package

- dist/quackitect-5.0.0.zip

## works

yes — expanded, inspected, and the entrypoint RUN from inside the package: `se-mcp.ts --help` answered in 686 ms at exit 0, printing the corrected text that says the export flag is gone.

THAT PROVES MORE THAN A LISTING DOES. The entrypoint resolves inside the artifact, the code loads, and the help it serves is this iteration's rather than a stale copy.

WHAT WAS NOT DONE, AND IT IS THE ROW'S OWN BAR. Nobody installed from the package and nobody reached the desk. Running `RUNME.ps1` installs the extension over the machine's working setup, and doing that unasked while nobody is here is a side effect rather than a check.

AND ONE THING THE METHOD ASKS FOR DOES NOT EXIST. A house ruling says a package proves itself with a VERSION FLAG. `se-mcp.ts` has `--help` and no `--version`, so the flag named in that ruling cannot be run. Asking for it started the server instead and the call timed out, which is how it was found.

## emit_back

- M8_20A_sweep-consistency: `depends_on` moves from fill-story-evidence to run-demos, with a section saying why. A fan whose leg is a SUBMACHINE cannot be walked by one agent, and the sweep now chains after the demonstrations.
- guidance/refusals.md: SE-C-143, SE-C-141 and SE-C-142 added whole, each with its rule ahead of the refusal.
- guidance/refusals.md: SE-C-102 rewritten twice — once because a declared root may now be writable, once because it claimed there is no third door outside the root while a producing act writes into one.
- guidance/method/lane.md: a declared root is READ-ONLY BY DEFAULT, and the writable door is how this system drives a project that is not itself.
- guidance/method/retro.md: the same correction, plus a wall of text split and a machine username removed from stored guidance.
- engine/tools.ts: se_file_read, se_file_write and se_file_patch now name the writable-root door. An agent could previously only learn it existed by hitting the refusal.
- engine/paths.ts and engine/resolve.ts: three comments that contradicted the code beneath them, all saying roots are read surfaces only.
- meth-emit-back.md: the overlay-and-import model it taught was overturned on 2026-08-18. Nothing is sealed, and a vehicle owns everything it carries.
- raid-issue-must-demos-owed: corrected to stop citing three report files that have never existed, and to stop asserting what they say.
- A MISSING CHECK, and it is the sharpest thing here: no gate opens the report paths it cites. Zero of 21 must stories have a demonstration report anywhere in the corpus, and six story decks plus i27's gate cite files that do not exist.
- A SECOND MISSING CHECK: nothing tests the SHAPES a drawing can take. The battery tests the engine's parts, a fan is a shape, and 1471 passing cases had nothing to say about a fan that cannot be walked.
- A THIRD: the version flag a house ruling says a package proves itself with does not exist. `se-mcp.ts` has `--help` and no `--version`.

## follow_up

IMMEDIATELY: gate-release, then shipped. After that the git close the owner authorised — fetch from remote, merge, and push.

### What the next record should pick up from this state

- ADD `--version` TO THE ENTRYPOINT. One flag, and it makes the house's own package proof runnable instead of aspirational.
- THE INSTALL WAS NOT EXERCISED. A package that nobody installs from is checked at the wrong end, and this is the third release in a row to say so.

## anything_else

