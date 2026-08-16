---
form: gate-release
bless: blessed by agent
by: agent
signed_off: 2026-08-16T19:53:26.996Z
authors: agent
files:
---

# Evidence form / gate-release

## current_situation

The package is built, checked and signed. This gate decides whether it ships.

The archive is `dist/quackitect-4.4.0.zip` at 2,752,882 bytes, assembled by script in 14.8 seconds.

It was extracted outside the repository and used from there, which is the only way to catch what the exclusion filter got wrong.

The delta itself was already ruled on twice. The implementation gate is the owner's and they blessed it. The validation gate passed at this dial.

So this gate's subject is narrow on purpose: does the thing in the box work, and is anything owed that should stop it leaving.

## market_block


## round_0_verify

- evidence vs claims: the package claim was opened rather than trusted. Its own file names a version stamp, an empty records folder, a rendered README and two exclusions, and every one was re-read out of the extracted archive before this line was written.
- types: clean. The preflight ran green in this battery, and the only source change since the last full run is one version string in package.json.
- lint: clean. Biome checked 266 files in 407 ms and applied no fixes.
- tests: 1385 of 1385, 134 suites, 0 failures, decided as the whole battery because 150 changed files have no scoped test that answers for them.

## round_1_validate

- exercised against the goal: yes, and by the package rather than by the repository. The packaged launcher read the packaged brand, found node and printed the packaged engine's one help. The version stamp read 4.4.0 out of the archive, which is the exact defect version.ts was written for after a 4.1.0 archive announced 3.0.0-bootstrap.
- missing: the conformance sweep did not run in this battery, and that is a real gap rather than a pass. Its trigger needs half the diff to be corpus documents; 150 files changed and fewer than 75 sit under spec, machines or guidance, so it stayed silent. Its standing verdict is 1019 nodes green in 327 ms at sweep-consistency, and every node written since passed the write guard at the write.
- wrong: nothing found wrong in the package. The three defects this iteration found in my own work were all found earlier and fixed on the record.
- out of scope: the version bump is the only source change at this state. Nothing else was touched, and no check was widened to make the gate easier.
- prior art: NOT COMPARED, and the reason is specific rather than a shrug. The packaging mechanism did not change this iteration, so it is not this delta's question, and the delta's own prior art was named as unmade at the implementation gate rather than repeated here as though it had been done.

## round_2_red_team

- STEELMAN: a release gate that ships a minor whose packaging code did not change is ceremony, and the battery already said green => Half true. The battery says the repository stands; it says nothing about the archive. The two checks that only this gate could make are the version stamp read out of the extracted copy and the exclusion filter's result, and one of those is the exact defect that shipped undetected through the whole of v4.
- THE KILL-CRITERION: if the archive carries something that stays home, or omits something the receiver needs, shipping is the wrong call => Looked for it directly. 0 files under project/spec, no node_modules, no .se, and both the installer and the editor extension present. The README rendered with 0 unrendered placeholders. Nothing found.
- THE SWEEP DID NOT RUN AND I AM SHIPPING ANYWAY => Conceded rather than defended. The mitigation is real but partial: the write guard covers each node as it is written, and it accepted the one node minted at this gate with all three of its references resolving. What the guard cannot see is a corpus-wide break that no single write introduces. The sweep runs at idle, which is the next thing that happens after this bless, so the exposure is one state wide.
- THE PACKAGE WAS CHECKED BY THE SAME EYES THAT BUILT IT => True, and it is the same weakness the verification state recorded. What limits it is that every check here is a stated command with a stated result, re-runnable rather than re-judgeable.
- WHAT THIS GATE CANNOT SEE => whether the archive installs on a machine that is not this one. RUNME's real path runs npm and opens an editor; only the help path was exercised. That sits on raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make, unchanged since i34.

## raid_additions

- raid-asm-the-conformance-checks-stay-affordable-as-the-corpus-grows

## verdict

pass — the archive assembles by script, runs from outside the repository, stamps its own version correctly, and leaves home what should stay home.

WHAT THE PASS RESTS ON: a battery green at 1385 of 1385; biome clean at 266 files; preflight green; and eight checks run against the extracted copy rather than the repository.

WHAT IT DOES NOT COVER: the conformance sweep did not fire on this diff, and its standing verdict is one state old. A real install on a second machine was not attempted, and never has been.

ONE ASSUMPTION WAS MINTED HERE that the validation gate named in prose and left to leave with the record. Every conformance number this iteration recorded came off one corpus size, and the method's own escape hatch demotes a slow check to the sweep quietly.

BLESSED AT THIS DIAL, per the owner's standing ruling that the implementation gate is theirs and the rest are mine.

## follow_up

SHIPPED IS NEXT, then the retro.

Nine notes stand in the inbox for the retro to drain. Three of them are the owner's own rulings from today.

- note-0af46cbcd41f: verification must stop looping. A fixable finding is fixed once, a tree-invalidating one becomes a debt note, and the gate weighs the debt.
- note-4be3cfe2a2fe: too much back and forth. An amend should carry a fix.
- note-4ead924e4cab: a handed-off verdict must be waited for, not reported past.

ONE ACT IS THE OWNER'S, outside the lane. 26 stale `origin/it/*` remote branches and `origin/claude/cloud-deployment-handover-1g70sb` are safe to delete. Four refs are not safe and were named.

ONE ASSUMPTION IS OPEN with a cheap probe. Grow a fixture corpus to three thousand nodes, run the sweep, time one guarded write. Two numbers settle it.

## anything_else

The eight checks against the extracted copy, each with its result:

- The packaged launcher printed the packaged engine's one help. Exit 0 in 2.0 seconds.
- The version stamp read 4.4.0 out of the archive.
- 0 record files shipped under project/spec. The folder exists and is empty.
- README.md is the entry document at 1265 chars, opening `# Quackitect`.
- 0 unrendered `$PRODUCT$` placeholders survived.
- The installer is present.
- The editor extension is present.
- node_modules and .se both stayed home.

Size against the last release: 2,752,882 bytes, up 52,666 from 4.3.0's 2,700,216. That is 1.95 percent for four new test scripts and five new trace nodes.
