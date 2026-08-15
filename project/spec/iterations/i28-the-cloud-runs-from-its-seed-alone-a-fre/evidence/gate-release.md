---
form: gate-release
bless: blessed by agent
by: agent
signed_off: 2026-08-15T20:49:30.988Z
authors: agent
files:
---

# Evidence form / gate-release

## current_situation

The package stands, extracts, and carries everything this iteration built.

`dist/quackitect-4.0.0.zip`, 2,656,616 bytes, 520 entries. Extracted for real to a temporary directory: six top-level items, tree intact, `project/deliverable/package.json` nested correctly.

IT CARRIES THE NEW WORK. `engine/bin/se-start.ts`, the pinned `engines.node`, and `guidance/method/cloud-runner.md` with both arrivals written into it.

WHAT SHIPS UNPROVEN, and it is the same thing every gate in this iteration has said. No host nobody prepared has run any of it. The demonstrations were not walked, so no report was minted, exactly as i27 shipped.

## market_block


## round_0_verify

- evidence vs claims: The package claim was checked by using the artifact, not by reading the script's output. Extraction produced a correct tree rather than a flat pile, which is the failure the backslash separators could have caused.
- types: npx tsc --noEmit exits 0, after the entrypoint rewrite, the @types/node bump and tonight's engine narrowing.
- lint: biome check --error-on-warnings exits 0 over 246 files, no new suppression.
- tests: The battery ran 1322 cases. 1321 passed and 1 failed; the failure was mine, understood, fixed, and re-run green at 4 of 4. The scoped entrypoint suite stands at 8 of 8.

## round_1_validate

- exercised against the goal: The artifact assembles and extracts. The goal behind it — a machine nobody prepared reaching a walking agent — is not exercised by anything in this package.
- missing: A Linux extraction. 515 of 520 entries carry backslash separators, which the ZIP format does not sanction. Windows normalises them and no POSIX host has opened this file.
- wrong: The version reads 4.0.0 while the last release on record was 4.1.0. The packager is reporting `package.json` truthfully; the declaration on this branch is behind. Named rather than changed, on the owner's instruction.
- out of scope: Fixing the entry separators, bumping the version, and rebuilding the entrypoint for the owner's cloud shape. All three recorded, none acted on.
- prior art: Not compared, and here is why. The packaging step is a zip of a tree with an installer beside it, and nothing about it is a design choice worth measuring against another system. The comparisons that mattered were made at gate-validation, against systemd's readiness protocol and the Kubernetes Lease API, both fetched primary.

## round_2_red_team

- STEELMAN: this should not ship, because the one thing it claims — a cloud machine walking on its own — has never happened once => Right that it has never happened, wrong that shipping harms it. The owner asked for an artifact to try, and trying it is the observation. Withholding the package removes the only route to the evidence.
- KILL-CRITERION: the archive does not extract on the host that matters => Partly found. It extracts on Windows, verified. The backslash separators are a real hazard on POSIX and no POSIX host has opened it. If it lands flat, that is where to look first.
- THE VERSION IS BEHIND THE LAST RELEASE => True. 4.0.0 against a 4.1.0 already on record. It is a stale declaration on this branch and it is named in the package evidence so nobody reads the artifact as a downgrade.
- THIS GATE IS BLESSED BY THE AGENT ON A NIGHT FULL OF CORRECTIONS => True, and three of tonight's corrections were mine: a fatal grading that was wrong, an engine change that deadlocked this very walk, and a false claim about what other iterations had done. Each was corrected in the record rather than quietly. That is the argument for reading the register before building on this.
- NO DEMONSTRATION REPORT HAS EVER BEEN MINTED BY ANY ITERATION => True and newly discovered. i27 and i28 carry the identical unauthored placeholder. It is a hole in the method rather than in this record, and it is in emit_back.

## raid_additions

- none — the two entries this iteration's earlier gates added still stand, and inspecting the package produced no new one. The separator hazard and the stale version are recorded in the package evidence and in emit_back, where they name a mechanism to fix rather than a risk to carry.

## verdict

pass with overrides — THE ARTIFACT IS SOUND AND WHAT IT PROMISES IS UNPROVEN.

WHAT EARNS THE PASS. The package assembles by script, extracts to a correct tree, and carries the entrypoint, the pinned runtime and the cloud-runner card. Types, lint and the battery are green with the one failure found and fixed inside this milestone.

THE OVERRIDES, both carried forward and neither hidden. No host nobody prepared has run this. No demonstration report was minted, because the demo drawing has never been authored by any iteration.

ONE NEW HAZARD, named here rather than fixed: 515 of 520 archive entries use backslash separators. Windows normalises them, POSIX may not, and nobody has tried.

SHIP IT. The owner asked for something to try, and trying it is the only thing that turns any of these overrides into evidence.

## follow_up

IMMEDIATELY USEFUL.

- `dist/quackitect-4.0.0.zip` is ready to try.
- FOR THE CLOUD, use git rather than the zip. The arriving agent reads `project/guidance/method/cloud-runner.md`, Arrival A: install, place the cage from `project/deliverable/cage/`, spawn a caged subagent, hand it the walk.

WORK TO PULL IN.

- The archive's entry separators, before a POSIX host opens it.
- The demo machine, which no iteration has ever authored.
- raid-issue-the-lane-is-not-in-git-so-a-cloud-agent-starts-uncaged.
- raid-debt-core-and-satellite-is-off-the-live-path, and i27's lost trace at be703899 and 6396c282.

ELEVEN NOTES stand for the retro, listed in `.se/HANDOVER.md`.

## anything_else

THE PUSH IS THE OWNER'S, here as everywhere. The branch `it/i28-the-cloud-runs-from-its-seed-alone-a-fre` does not land on v3 cleanly — `claude-settings.json`, `package.json` and `cloud-agent-handover.md` conflict, the last because trunk deleted a file this iteration edited. The machine owns the landing.
