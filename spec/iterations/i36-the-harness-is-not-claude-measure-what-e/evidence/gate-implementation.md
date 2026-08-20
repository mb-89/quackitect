---
form: gate-implementation
amended: "2026-08-19T18:25:52.035Z by agent — Two must requirements compute a result that reaches no surface, so a clean pass overstates what shipped; the gap is now carried as owner-accepted debt."
bless: blessed by human
by: agent
signed_off: 2026-08-19T18:08:20.749Z
authors: agent
files:
---

# Evidence form / gate-implementation

## current_situation

The build is done and the battery is green at rest. Ten chunks were planned, built and signed, and every one of them carries its tests.

WHAT WAS BUILT, in one line each.

- `harness.ts` — a registry of three measured hosts, each limit carrying where the number came from.
- `mcp.ts` — the lane now reads `clientInfo` at initialize and stamps every record with the client and the harness.
- `lifecycle.ts` and `stopping-layer.ts` — the server leaves lifecycle lines, and a stopped call can be told which layer ended it.
- `bound.ts` — the answer bound is derived from the tightest measured host limit instead of being a number somebody chose.
- `cage-inventory.ts` — the cage list is checked in both directions against the tools it is meant to exclude.
- `payload-limit.ts` — served documents are measured on the wire against that same tightest limit.
- `failure-shapes.ts` — a failure shape that recurs becomes a work statement instead of a memory.
- `record-inspect.ts` — a boot no longer stalls on test records written before the current shape.

THE BATTERY IS 1456 TESTS IN 140 SUITES, and it ran green twice through this state.

THREE ROUNDS OF FIXES CAME BEFORE THAT, all at fix-findings and all recorded there. The last of them was not this iteration's doing: twelve test dial sites named `localhost` against a mirror that binds 127.0.0.1 only, which fails at random on Windows. That is fixed.

WHAT IS NOT DONE is the debt this iteration minted for itself before implementation started. Most of it is repaid. The web-search and web-fetch items are not, and they are named below.

## quality_ok

- [x] Dependencies stay layered
- [x] Every new element carries one stated responsibility
- [x] The linter and the complexity ceiling are clean, with no new suppression
- [x] Every new behavior carries its check, and the battery is green at rest
- [owed] Nothing speculative shipped — raid-debt-two-must-requirements-compute-a-result-that-reaches-no-surface
- [x] What changed is findable
- [x] Every quick-and-dirty taken stands as a visible raid debt entry

## debt_taken

- raid-debt-harness-fallback-and-bounds-need-implementation-proof

## risks_acceptable

acceptable — Two assumptions carry this iteration, and both are already in the register with their triggers. `raid-asm-documented-harness-limits-stay-stable` says each vendor's documented limit holds across releases; it is graded corrosive and plausible, and it is honestly marked unprobed, because probing it means re-fetching four vendors' documentation. `raid-asm-the-harness-scan-still-matches-current-releases` covers the scan itself. THE GRADE IS RIGHT AND THE DIRECTION MATTERS: a host that RAISES its limit costs us nothing, because our own ceiling of 6000 bytes stays the binding one. A host that LOWERS its limit below 6000 breaks us silently, and that is the case the register does not separate out. It is acceptable for now because no measured host is anywhere near 6000 — the tightest is 20480, more than three times the ceiling — so a vendor would have to cut by a factor of three before it bit. THE FIX FOUND ONE DEFECT WHILE CHECKING: that assumption node had lost its `source_refs:` key, leaving its reference orphaned under `how_likely`. Repaired here.

## round_0_verify

- evidence vs claims: CHECKED, and one claim did not survive. Verification's claims checklist stands with every non-test spec observed green, and the ten chunk forms each carry their own evidence. The claim that did not survive was mine: I opened this gate believing types and lint were covered by the battery. They are not, which is why this form was reached twice.
- types: GREEN, run by hand from `project/deliverable`. `npx tsc -p . --noEmit --pretty false` exits 0 with no output. It is NOT in the battery: the verification row's command is `npm --prefix project/deliverable test`, which is `node --test "tests/*.test.ts"`, and Node strips types rather than checking them. The typecheck lives only in `project/deliverable/hooks/pre-commit`, and no commit had run since the build edits.
- lint: GREEN, same run. `npx biome check --error-on-warnings .` exits 0 over 312 files with no fixes applied. A search for `biome-ignore`, `@ts-ignore` and `@ts-expect-error` across `project/deliverable/engine/*.ts` returns nothing, so the clean run bought no suppressions. Like the typecheck, it is in the pre-commit hook and not in the battery.
- tests: GREEN. 1456 tests, 140 suites, 1455 passing on the first run and 1456 on the second. The one failure was `mcp-http.test.ts` reporting `fetch failed` against a server that was listening, and it was not left as a flake — see the red team below.

## round_1_validate

- exercised against the goal: YES, by this session. The spill cursor was used to read this gate's own form, page by page, after the answer crossed the bound — the mechanism was proved by being needed. The harness stamp identifies this host as vscode-copilot. The stale-record skip is what let boot finish. NOT EXERCISED: `stoppingLayer` has never diagnosed a real interruption, because none happened after it was built. Its cases are synthetic.
- missing: TWO THINGS. First, there is still no scoped test run in the lane — `se_test` accepts only `question`, `force`, `job` and `update`, so every scoped run this iteration went through `se_run` with a `no_tool_reason`, and the log carries several. Second, the battery does not run the typechecker or the linter, so `verification` can sign while two of the three gates named in `project/guidance/method/engineering.md` have never run.
- wrong: THE REGISTRY IS KEYED BY NAME. `harnessFor` matches on the client string a host volunteers, which is the pattern the web spent a decade abandoning. MCP offers a `capabilities` object at initialize and `engine/mcp.ts` accepts it on the wire, but nothing derives a limit from it.
- out of scope: THE DEBT'S TAIL. `se_web_search` without a configured Brave key, the honest native-search handoff, and `se_web_fetch` reporting its post-redirect URL are all listed in the repayment plan and none was touched. So is refreshing the unreachable Codex, Cursor and Claude primary sources. All four are deliberately not this iteration's work, and all four keep the debt entry open.
- prior art: COMPARED, WITH ONE CITATION HONEST ABOUT ITS SOURCE. Terminfo is the closest working relative: a capability database keyed by terminal name, and it does two things better — it is maintained by many hands rather than one afternoon's scan, and programs query a named capability rather than a host identity. Browser development is the cautionary one: the web moved from user-agent sniffing to feature detection precisely because name-keyed tables rot, and our registry is the pattern that lost. Neither of those two is re-verified against a primary source in this session, and I am saying so rather than dressing recall as a citation. THE ONE I DID CHECK is our own protocol handling: `engine/mcp.ts` lines 55 to 57 accept `protocolVersion`, `capabilities` and `clientInfo`, and line 193 answers with `capabilities: { tools: { listChanged: true } }` — so capability negotiation is on the wire and unused. WHAT OURS SHEDS, and it is real: every limit carries `measured`, saying where the number came from, and an unmeasured host gets `undefined` rather than a default. Terminfo entries carry no provenance and cannot tell a guess from a measurement.

## goals_served

- Measure what every supported host actually provides.: SERVED. The primary-source scan is `project/spec/references/ref-agent-harness-portability-2026-08-19.md`. The numbers it found live in `engine/harness.ts` as three entries, each with a `measured` field naming its provenance, and `smallestInlineOutputBytes()` returns 20480 from Copilot CLI's `COPILOT_LARGE_OUTPUT_THRESHOLD_BYTES`. Five cases in `tests/harness.test.ts` hold it. NOT SERVED FOR HOSTS NOBODY MEASURED: `harnessFor` returns undefined rather than a guess, which is the point.
- Close the five measured harness breaks in the prepared brief.: SERVED, by six of the ten chunks — `spill-is-per-server`, `harness-identification`, `server-lifecycle-logging`, `stopping-layer-report`, `bound-ties-to-measured-limit` and `cage-inventory-check`. Each is signed with its own evidence under `spec/iterations/i36-the-harness-is-not-claude-measure-what-e/evidence/`.
- Make the lane report which harness it is talking to.: SERVED. `McpServer.clientInfo()` and `McpServer.harness()` read `msg.params.clientInfo` at initialize, and `observe()` stamps `client` and `harness` onto every record. An unidentified client is left unstamped rather than labelled. Seven cases in `tests/harness-identity.test.ts` hold it.
- Make future boots quicker by removing the test-metadata recovery step from the manual boot path.: SERVED. `engine/bin/record-inspect.ts` now treats a record carrying neither a question nor a scope as stale rather than as a finding, and reports a caveat when every record is stale. Three cases in `tests/record-inspect.test.ts` hold it, and the standing entry is `raid-boot-test-metadata-coupling`.
- Make oversized pull results recoverable through the lane instead of host files.: SERVED, and used to write this very form. The spill directory is per server rather than a module global, and two guards that stood between a caller and the lane's own cursor are lifted — the narration toll in `toll.ts` and the state gate in `session.ts` both exempt an `se_file_read` under `.se/answers/`. Three cases were added to `tests/answer-bound.test.ts`, one of them reconstructing a spilled answer byte for byte.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED, four times in this gate, and every one was a verb asked to spawn a process. `se_run` running the typechecker took 2421 ms, the linter 1903 ms, both together 3903 ms, and the `se_pull` that fired verification's exit script took at least 111765 ms, which is the battery's own reported duration. DISPOSITION: no fix, and the question is now written down. The bound of one second describes the door; these numbers are the room behind it, and the caller asked for the wait. What is genuinely wrong is that nobody has ever decided whether the bound governs spawning verbs, so every gate answers it again by hand. That is minted as raid-iss-the-one-second-bound-counts-calls-that-spawn-external-work, and the interface node it belongs on is if-agent-harness-to-entrypoint. NOT OWNED BY THIS MILESTONE: this iteration is about harness measurement, and rewriting a bound on the busiest edge in the product is a model change, not a build fix.

## round_2_red_team

- STEELMAN, the strongest case against this whole iteration => A name-keyed table of three hosts, measured on one day, is configuration pretending to be knowledge. It will be wrong within weeks, and being wrong quietly is worse than having no table, because the code now trusts it. The honest alternative was to keep one conservative ceiling for everybody and never ask which host is calling. That argument is good, and the reason it does not win is the provenance field and the `undefined` return: an unmeasured host is not guessed at, and every number says where it came from. That turns a rotting table into a dated one, which a person can check.
- THE KILL CRITERION, what would have to be true for this to be the wrong call => A supported host would have to LOWER its inline limit below our own ceiling of 6000 bytes without saying so. Then `smallestInlineOutputBytes()` keeps answering 20480 from a stale table, `ANSWER_BOUND_BYTES` stays 6000, and answers get eaten by the host again — the exact defect this iteration set out to fix, restored silently. I looked for it: the tightest measured limit today is 20480, over three times the ceiling, so a vendor would have to cut by a factor of three. The direction is now written into risks_acceptable, which is where it was missing.
- A RENAME IS THE OTHER HALF, and it is safe => A host that changes its client string falls out of `harnessFor` and returns undefined, so the bound falls back to our own 6000. That is the conservative direction, by construction rather than by luck.
- THE FLAKE FIX COULD BE A COVER-UP => Changing a failing test's URL to make it pass is exactly what a careless fix looks like, so this deserves the accusation. It is not one, and the evidence is the server's own bind: `mirror.ts` calls `server.listen(o.port, "127.0.0.1")`, which is a pre-existing line and a stated design claim at `dsp-mirror-render.md#the-mirror-binds-loopback-and-says-so`. The failure carried BOTH `ECONNREFUSED ::1` and `ETIMEDOUT 127.0.0.1` in one AggregateError, which is what a dual-family race looks like and not what a broken server looks like. The tests were dialling an address the mirror never promised to answer on. WHAT WOULD FALSIFY THIS: the same case failing again on 127.0.0.1 alone. It has now run green twice under full battery load.
- `stoppingLayer` DECLARES A LAYER IT CAN NEVER RETURN => `"host"` is in the union and no branch produces it. That reads as speculative code, and the checklist box next to "nothing speculative shipped" is checked anyway. The defence is written at the function's tail: the host is the one layer nothing observes, so returning it would be inference dressed as evidence, and the vocabulary still needs the word for the report that names what was ruled out. I accept this is the weakest box on the list.
- ONE STRING HOLDS THREE PLACES TOGETHER => The prefix `.se/answers/` now appears where the spill writes it, where the narration toll exempts it, and where the state gate exempts it. Nothing enforces that a rename moves all three, and the failure mode is the lane serving a cursor it then refuses to follow. It is already written into fix-findings as what to watch, and it is not fixed here.
- THE BATTERY'S GREEN IS NARROWER THAN IT READS => Verification signs on tests alone. Types and lint ran only because this gate was reopened to run them, and a walk that did not reopen would have shipped without them. That is a hole in the floor, not in this iteration, and it belongs to whoever owns the verification row.

## raid_additions

- raid-iss-the-one-second-bound-counts-calls-that-spawn-external-work
- raid-debt-two-must-requirements-compute-a-result-that-reaches-no-surface

## verdict

pass with overrides — THE OVERRIDE, and the dissent it is logged with. Two modules built this iteration have no production caller: `stopping-layer.ts` computes a diagnosis nothing asks for, and `failure-shapes.ts` computes a work statement nothing mints. So `req-interrupted-call-names-the-stopping-layer` and `req-repeated-failure-shape-becomes-durable-work` read as met in the corpus and are not met in the running system. Both are `must`. Both test-specs declare LEVEL: integration and name existing files, and the cases were written in new component files instead. THE DISSENT: on the evidence, two of the five kickoff goals are served only in part, and the honest ruling on those two alone would be fail. THE OVERRIDE IS THE OWNER'S, taken knowingly on 2026-08-19: ship it, carry the gap as technical debt, and repay it when there is room. It is minted as raid-debt-two-must-requirements-compute-a-result-that-reaches-no-surface, which carries the repayment plan and the contradiction that has to be settled first — the test-spec demands a report naming the host, and the design says the host is the one layer nothing observes. WHAT STILL STANDS UNCHANGED: the measurement work this iteration was really about. The harness registry with its provenance, the client identification, the answer bound tied to a measured limit, the boot tolerating a stale test record, and the two guard modules whose test is the product are all wired, exercised and green. The battery is 1456 tests with no failures, and the typechecker and linter are clean.

## follow_up

WHAT THIS ITERATION HANDS ON, in the order it should be picked up.

THE DEBT ENTRY STAYS OPEN. `raid-debt-harness-fallback-and-bounds-need-implementation-proof` has four repayment items untouched. Two are `se_web_search` behaviour without a configured Brave key and an honest native-search handoff when a provider fails. One is `se_web_fetch` reporting its post-redirect URL and paging against that resolved page. The last is refreshing the unreachable Codex, Cursor and Claude primary sources, or marking their claims unverified. READY WHEN a milestone owns the research verbs.

THE BATTERY SHOULD COVER WHAT THE PRE-COMMIT HOOK COVERS. Verification signs on tests alone today, so a walk can reach shipped with the typechecker never having run. The row at `machines/rigor_matrix/rows/M7_50_verification.md` names one command, and that is the right place to widen it. READY WHEN somebody owns the verification row.

THE BOUND ON THE BUSIEST EDGE NEEDS A DECISION. `raid-iss-the-one-second-bound-counts-calls-that-spawn-external-work` states it: either the spawning verbs are excluded by name, or they report their own overhead separately from the child's runtime. READY WHEN the model is next opened.

THE HARNESS SCAN NEEDS A CALENDAR. `raid-asm-documented-harness-limits-stay-stable` is unprobed on purpose, and its probe is a re-fetch of four vendors' documentation. The dangerous direction is a limit falling below 6000 bytes, not rising. READY WHEN a quarter has passed or a vendor changelog touches a documented limit.

THE RETRO IS OWED, and it is the next thing. Fourteen notes stand in the inbox, and they are not a tidy list — they include the target clearing itself on arrival, finished sub-machines being walked again, a node table whose submit silently deleted node data, and a missing route line in the mirror. The owner has also asked the retro to answer why weaker models cannot drive this machine.

## anything_else

