---
form: gate-release
bless: blessed by agent
by: agent
signed_off: 2026-08-16T10:27:40.733Z
authors: agent
files:
---

# Evidence form / gate-release

## current_situation

The package stands at dist/quackitect-4.2.0.zip and was checked by being used: extracted clean, dependencies installed from its own manifest, preflight and smoketest both green from the extraction.

EVERYTHING BEFORE THIS GATE IS SIGNED. The battery is 1299 of 1299 with biome and preflight green, the implementation gate is blessed, the validation gate is blessed, and the consistency sweep found and fixed six documents still teaching the superseded way.

THE BLESS SHIPS IT. This is the last thing standing between i34 and shipped.

## market_block


## round_0_verify

- evidence vs claims: Opened what the evidence points at rather than reading the list. Four verification rounds by one verifier that never wrote the code and was never respawned. Each round found real defects with the battery green; none found the same one twice. The claims that mattered were checked against primary sources — a deleted requirement was read out of git at its own commit, and i27's acceptance line was read verbatim rather than paraphrased.
- types: Clean. `preflight green`, exit 0, both in the repository and from the extracted package.
- lint: Clean. biome over 245 files, no fixes applied, no new suppression.
- tests: 1299 of 1299, 0 fail, run `test-msvnad5q-23`. An identical-tree re-run was refused by the engine with SE-C-130, which is the discipline working rather than a skipped check.

## round_1_validate

- exercised against the goal: One tree, with the seam deleted rather than fixed. Deleted — nine symbols, proven absent by a mechanical sweep run twice by someone who did not write the code. The package was not merely built: it was extracted onto an empty folder, installed from its own manifest and run green, which is the only check that answers whether a stranger receiving this archive gets a working system.
- missing: Nothing the iteration promised. One capability it never promised and now cannot do — working on two machines — named in the release notes' own "What this release takes away" section rather than left for a user to discover.
- wrong: Four things, all caught by verification and all fixed. Two requirements retired by reading their ids instead of their statements. One container fixed while its sibling kept the identical defect. And the version had not been bumped at all — the manifest still read 4.1.0, which shipped on 2026-08-14.
- out of scope: The expeditions container fix, and the two requirement restorations. Both taken because the harm was i34's own and recorded rather than smuggled.
- prior art: TRUNK-BASED DEVELOPMENT is the practice this moves to, and it is what large repositories actually run. Better than ours: proven at scale, with tooling built for it. What ours sheds: the record FOLDER is the unit rather than the branch, so a job's work reads without checking anything out. GIT WORKTREES are what this removes, and they do one thing better than we now do — real isolation between concurrent work. Shed deliberately. THE COMPARISON IS REASONED FROM DOCUMENTED PRACTICE AND NOT MEASURED, and claiming more would be fabrication.

## round_2_red_team

- STEELMAN: do not ship — a release that removes a shipped capability should be a major version => The strongest case: 4.0.0 advertised "any machine there can take it and run it" and guaranteed two machines could never hold the same one. Removing that is breaking, and semantic versioning says 5.0.0. The case is CORRECT on semver's own terms and is recorded in the package form's follow-up for the owner. What is done here follows the state's instruction — change size minor, so minor bump — and the release notes carry the loss in their own section, so no reader is misled by the number alone.
- KILL-CRITERION: a stranger extracts the archive and cannot get a working system => That would make shipping wrong, and it is the one thing that was tested rather than argued. Extracted to an empty folder, npm install exit 0, preflight green, smoke green in 0.6s. The first attempt FAILED on a missing dependency before install, which is correct behaviour and is recorded so a reader does not mistake it for a defect.
- The installer was never run, so the ship is partly unproven => True, and the scope is stated rather than glossed. RUNME.ps1 would copy the extension into the owner's own ~/.vscode/extensions and rewrite their extensions.json — overwriting their installed extension with a temp copy, unasked. Its other path refuses while this session holds the ports. What is proven is the part that decides quality: the engine inside installs and runs on a machine that has only the archive.
- Two open jobs now share files, and 22 jobs stand open => The real hazard of this release, and nothing mechanical prevents it. What holds is that one job is walked at a time, which is a habit. The release notes say so in plain words: "work one job at a time".
- Three gates today, all "pass with overrides" => Worth asking whether the phrase has become a formality. Each names a DIFFERENT loss with its own decision node: a broken isolation requirement, a switched-off story, and a version-significance tension. None would have been visible if the losses had been left implicit, which is exactly what the original reasoning did before a verifier asked what the decision had cost.

## raid_additions

- none

## verdict

pass with overrides — the package is built, extracted and run green, and two losses ride with it that a clean pass would hide

THE FIRST OVERRIDE IS THE CAPABILITY. Working on two machines is switched off. It is the owner's recorded decision, it never ran end to end, and the way back is written down — but a shipped capability is gone and the release says so in its own section rather than in a footnote.

THE SECOND IS THE VERSION NUMBER, and it is a dissent rather than a defect. This ships as 4.2.0 because the state's instruction binds the version bump to the CHANGE SIZE, which is minor. Semantic versioning would argue 5.0.0 for removing an advertised capability. The instruction was followed and the disagreement is recorded for the retro, because change size and version significance are two different judgments the matrix currently ties together.

WHAT EARNS THE PASS. The archive was not merely assembled — it was extracted onto an empty folder, installed from its own manifest, and its preflight and smoketest both ran green from there. That is the check that answers whether a stranger receiving this gets a working system, and it is the one that was actually performed rather than argued.

WHY NOT A CLEAN PASS. A shipped capability was removed and the version does not say so. Both are defensible and neither is invisible, which is the whole difference between an override and a defect.

WHY NOT A FAIL. Nothing promised is missing, nothing ships damaged, the battery is green at rest, and every finding from four verification rounds is fixed or recorded with its dissent.

## follow_up

THE RETRO IS WHERE THIS SESSION'S REAL OUTPUT GOES, and five notes wait there.

- note-b79353db45e9 — the testing counts and the polling waste, with the measured numbers.
- note-30476b7ab834 — the rework, traced to deletions done without their sweep.
- note-5c0a12ee47e5 — a correction: nothing demanded the batteries that were run, and the machine already says the engine owns them.
- note-8fcdb8ed9261 — test as a lane.
- note-cb2093278822 — the fix-findings fallback should fire on findings.

SEVEN EMIT-BACK ITEMS stand on the package form, for the shared method rather than this product. The sharpest is that a deletion warns nobody about what it orphans — sighted four times in this one iteration, each caught by a coverage law states later.

TWO MACHINE DEFECTS STAND. Fresh-eyes findings have no route to fix-findings, and no state that owes work has a route BACKWARD — every recovery here was an escape and a re-entry.

ONE CONTESTED ITEM IS THE ADJUDICATOR'S: req-a-method-change-reaches-every-tree, restored over the verifier's reading. Both cases are in the node.

THE VERSION-SIGNIFICANCE QUESTION IS OPEN and belongs with the retro.

## anything_else

