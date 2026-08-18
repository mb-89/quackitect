---
form: gate-release
bless: blessed by agent
by: agent
signed_off: 2026-08-14T19:51:46.157Z
authors: agent
files: null
---

# Evidence form / gate-release

## current_situation

The package stands, and this gate found one defect in it before shipping.

THE ARTIFACT. dist/quackitect-4.1.0.zip, assembled by `node engine/bin/package.ts --root .`. It holds the README, RUNME.ps1, the editor extension, and the versioned engine and method underneath them.

WHAT THIS GATE FOUND. The packaged engine announced `se-mcp 3.0.0-bootstrap` out of a 4.1.0 archive. The string was hardcoded in four places: the call log's per-call stamp, the startup banner, the MCP server's advertised version, and the websearch hook's log entry. None of them followed the 4.0.0 release, so every call logged across the whole of v4 carried a version the product had already left behind.

WHY THAT IS NOT COSMETIC. vp-the-ledger asks for every decision recorded and attributed. A version stamp nobody maintains reads as provenance and is false, which is worse than no stamp at all.

WHAT WAS DONE. engine/version.ts reads the manifest once at import, and the four sites read it. The archive was rebuilt and re-run from the expansion. Its own banner now says `se-mcp 4.1.0`.

The battery is green over the fix: 1301 of 1301, 135 suites, 0 fail, job test-mstd0vao-32.

## market_block


## round_0_verify

- evidence vs claims: one miss, found here and fixed here. package's `works` said yes on observations that were all true, and none of them looked at the version the engine announced. It announced 3.0.0-bootstrap from a 4.1.0 archive. The archive was rebuilt after the fix and its banner now reads `se-mcp 4.1.0`, taken from the process's own stderr. package's cited path resolves: dist/quackitect-4.1.0.zip was expanded and run from exactly that path.
- types: clean. npx tsc --noEmit in project/deliverable returned exit 0 in 3.8 seconds, run after the five files the version fix touched.
- lint: clean. biome check --error-on-warnings over 241 files in job test-mstd0vao-32, no errors.
- tests: green. 1301 of 1301, 135 suites, 0 fail, job test-mstd0vao-32. The read ceiling was raised from 103 to 104 with its reason written into the test, which is what that test's own message instructs when a new read is genuinely one-shot.

## round_1_validate

- exercised against the goal: yes, and by using the package rather than reading it. The archive expanded, npm install added 30 packages at exit 0, the packaged engine started on the expanded tree, and /api/alive answered from that folder standing at `start` and aiming at the front desk. A fresh product on a root it created for itself.
- missing: RUNME.ps1 was never run. It places the VS Code extension and opens the editor, which changes the machine outside the expansion folder, and that is not an act to take unasked. So the installer's own path is the one part of the install unexercised.
- wrong: the version the product announced. Four hardcoded strings, stale since 4.0.0 shipped on 2026-08-12. Every call logged in v4 carries the wrong one. The entries already written keep what they recorded, because a log is what happened.
- out of scope: a changelog for 4.0.0's own version-stamp error. RELEASES.md names the fix under 4.1.0 in plain language, and rewriting a shipped entry would be rewriting history.
- prior art: not compared for this gate, and here is why. The release step is assembling an archive and running it, which is the same shape everywhere and has no interesting rival. The comparison this iteration owed was for the transport choice, and it was made at gate-validation against Vitest's `pool` at the primary source, https://vitest.dev/config/pool.md. Repeating it here would be a citation wearing a comparison's clothes.

## round_2_red_team

- STEELMAN: this gate is about to ship an artifact whose install path was never run end to end. RUNME.ps1 is the single command the README tells a stranger to type, and nobody typed it. => ACCEPTED AND NOT REFUTED. Everything the installer would do afterwards was exercised by hand from the package: dependencies installed, engine started, desk reached. What is unproven is the installer script itself, and it is named in package's own evidence and in this gate's `missing`.
- STEELMAN: the version defect had been live since 4.0.0 shipped two days ago, and no check caught it. A release gate that finds a defect by accident is not a check, it is luck. => ACCEPTED. It was found because the packaged engine was RUN and its stderr read, which the method demands and which is the difference between using the package and inspecting it. No automated check compares the announced version to the manifest, and none is added here.
- KILL-CRITERION for shipping: the archive not standing up on a machine that is not this one. => NOT FIRED, AND ONLY PARTLY PROBED. The expansion was driven from a clean folder with its own root and its own .se, so nothing of this repository's state was inherited. It is still the same machine, the same node and the same disk.
- SECOND KILL-CRITERION: the version fix breaking a reader of the old stamp. => LOOKED FOR AND NOT FOUND. Nothing pins the string: logquery.test.ts uses its own value, and the search over the tree found only the four write sites and the comments now describing them.
- The archive was rebuilt after package was signed, so the signed claim describes an earlier build. => ACCEPTED, and deliberately not amended. Every observation in that claim is still true of the rebuilt archive, and the one thing it did not look at is recorded here, in the gate whose subject is the package. Amending a standing claim to add what a later gate found would blur which check caught what.

## raid_additions

- none

## verdict

pass with overrides — the package assembles by script, installs from the archive, and reaches the desk, each observed rather than assumed. The version defect this gate found is fixed at its root rather than patched at the four call sites, and the rebuilt archive proves it from its own banner. TWO OVERRIDES RIDE WITH IT. First, RUNME.ps1 was never run: the installer is the one command the README gives a stranger, and no agent should place an editor extension and open an application on somebody's machine unasked. Everything downstream of it was exercised by hand. Second, nothing mechanically checks that the announced version matches the manifest, so the defect this gate found by reading stderr could return and would again depend on somebody looking. Neither override is a reason to hold the ship; both are reasons the next record has work.

## follow_up

- Run RUNME.ps1 from the package on a machine that can take the change. It is the last unexercised install path, and it needs a person's say-so rather than an agent's judgment.
- Add a check that the announced version matches the manifest. This gate caught the drift by reading a startup line, which is luck rather than a check.
- The emit_back list from package carries five method findings into the next record's promotions, including a wrapped catalogue item in meth-consistency-sweep that serves truncated.

## anything_else

ON FINDING IT AT ALL.

The defect surfaced because the method says check the package by USING it, and using it means reading what the process actually printed. Inspecting the archive's contents would have passed it: every file was present and correct, and the wrong version was in the running behaviour rather than in the listing.

That is the argument for the rule, and it is worth recording where the rule can see it.

ON THE LOG'S HISTORY.

Every call logged between 2026-08-12 and today carries se_version 3.0.0-bootstrap. Those entries are not corrected and must not be. A log records what was recorded, and rewriting it to say what was true would destroy the only evidence that the stamp was ever wrong.
