---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-16T11:31:06.556Z
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

M3 is done and this gate ends design input. Four new requirements stand, each traced to a story, a use-case extension and a function that already existed.

THE SCOPE MOVED IN BOTH DIRECTIONS DURING M3, and neither move was knowable before the probes ran.

- THE BATTERY REFUSAL GOT CHEAPER. se_test already branches on scope and the battery path already carries two gates. One condition goes inside a gate that already runs.
- THE BUCKET GOT DEARER. Its close-side guard does not exist. req-close-refuses-loose-ends is a must graded fatal and searching the engine for a loose-end computation returns nothing.

THE OWNER RULED ON THAT SECOND ONE IMMEDIATELY: "you're building the close site in this iteration. There's no way around it." So it is scope rather than a risk to carry.

## round_0_verify

- evidence vs claims: The probes read code and counted evidence rather than arguing. One of them CONTRADICTED a claim written into this iteration's own register three hours earlier — raid-risk-an-owed-item-without-a-guard-ships-a-known-defect said both halves of the bucket guard already existed. Only the form half does. The entry is corrected on the file rather than quietly carried, and the correction makes the risk larger.
- types: Green at rest, preflight exit 0, unchanged since i34 shipped.
- lint: Green at rest, biome over 245 files.
- tests: Green at rest, 1299 of 1299. No battery was run for this gate and none was owed — nothing has been built yet, and running one would be the behaviour this iteration exists to stop.

## round_1_validate

- exercised against the goal: The four rows are traced end to end — story, use-case extension, function, register entry — and every one carries a pass line with a measured baseline from 2026-08-16. The coverage laws checked both directions mechanically at write-requirements and derive-functions.
- missing: Fourteen of the twenty-four original defects are still unchecked, scoped as a check rather than a fix. And one requirement now has a known gap in its implementation route: the deletion warning cannot be built on the trace graph alone, because the graph sees roughly a fifth of what a deletion breaks.
- wrong: One thing, and it was mine. This iteration's own risk entry asserted a mechanism existed because a requirement described it. Reading the requirement is not reading the code, and a must graded fatal with no implementation reads exactly like one with an implementation.
- out of scope: Unchanged from M1's seven exclusions. Nothing was quietly pulled in during M3, and the one thing that grew — the bucket's close side — grew because a probe found the ground missing, not because scope drifted.
- prior art: Answered in full at gate-motivation and not re-argued here. The one that bound M3's work is NASA NPR 7123.1, whose disposition model is what req-a-harmless-finding-names-an-open-entry encodes: agreed, not asserted. Bazel and Shake bound what LEFT scope. No new comparison was made at M3 and none was owed.

## round_2_red_team

- STEELMAN: the register is blessed on four rows written by the same agent that will build them and judge them => The strongest case, and it is the standing weakness of every gate in this session. What limits it here is that M3's checks are MECHANICAL — the coverage laws refused twice until the trace closed both ways, and the probe field refused until the outcomes were written back onto the nodes. Neither is my judgment. The four statements are still mine.
- KILL-CRITERION: the bucket cannot be built without a close-side reader, and building one is bigger than the whole bundle => This would make the scope wrong. It is now the largest single unknown, because the reader does not exist and nobody has sized it. The owner ruled it in anyway. What makes that survivable is that the close ALREADY refuses on other grounds — the requirement and its use case are written, so what is missing is an implementation inside an existing act rather than a new act.
- The probes were run by the agent whose scope they change => True, and one of them changed the scope AGAINST the agent's interest by making the bucket dearer. A probe that only ever made work smaller would be worth distrusting.
- Four requirements for a dozen fixes looks like under-specification => Deliberate, and the test is whether a fix violates a row that already stands. The payload trim answers req-the-answer-never-exceeds-its-bound; the amend and the argument names answer req-call-answers-in-one-second. Minting a row for each would have been minting duplicates, and the register already carries 211.
- req-close-refuses-loose-ends may have an implementation under a name I did not search for => A real possibility and the honest bound on that probe. Two searches were run — for the phrase and for the concept in the close path — and both returned nothing. That is evidence, not proof, and decompose-structure looks again before anything is written.

## raid_additions

- none

## verdict

pass — the register is traced both ways by mechanical check, the four rows carry measured pass lines, and the one belief that turned out false was found here rather than at the build

WHAT EARNS IT. Every new row traces to a story, a use-case extension and an existing function, and the coverage laws refused until it did. The probes changed the iteration's shape in both directions, which is what tells you they were run rather than filled in.

THE FINDING THIS GATE IS PROUDEST OF is a correction to its own record. Three hours ago this iteration wrote that both halves of the bucket guard existed and were merely unused. The close-side half does not exist. That was caught by a probe, corrected on the file, and it makes the work larger.

WHY NOT AN OVERRIDE. Nothing is waved through and nothing is assumed away. The two things that could have been — the missing close reader and the graph's blind spot — are both written into the requirements' constraints rather than left for the build to discover.

THE DISSENT CARRIED FORWARD: the close-side reader is unsized. It is the largest unknown in the bundle and decompose-structure is where it gets a shape.

## follow_up

DECOMPOSE-STRUCTURE CARRIES THREE THINGS THIS MILESTONE HANDED IT.

- THE CLOSE-SIDE READER, ruled in by the owner and unsized. Look once more for an existing implementation under another name before writing one.
- THE DELETION WARNING READS TWO SOURCES, the trace graph and a text sweep over the id. The graph alone would report a clean list and be believed.
- THE BATTERY REFUSAL IS ONE CONDITION IN AN EXISTING GATE, not a new mechanism. batteryGate and testGate already run on that path.

AUTHOR-TESTS OWES A DEMONSTRATION-METHOD SPEC to sty-carry-a-finding-without-stopping, because it is a must story. i34 shipped with exactly that link broken and it was caught two gates late.

THE THIRD ASSUMPTION IS STILL OWED and cannot be probed until the close-side reader exists: which of the register's eight status values count as open. `accepted` and `deferred` are where a carried finding drifts.

## anything_else

