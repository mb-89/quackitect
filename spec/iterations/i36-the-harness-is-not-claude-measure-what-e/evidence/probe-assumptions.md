---
form: probe-assumptions
by: agent
signed_off: 2026-08-19T10:55:37.928Z
authors: agent
files: null
---

# Evidence form / probe-assumptions

## current_situation

The six assumptions identified this pass, plus one pre-existing entry missing its required Probe section, were the only rows the register flagged as unanswered. Each has now been checked against the real channel: two hold with fresh evidence from this session, one turned out false and became an issue, and three stay honestly unprobed with a named reason.

## probes

| raid | probe | probed |
| --- | --- | --- |
| [[raid-asm-a-bound-check-runs-inside-the-write-budget]] | Time a write through se_file_write with one corpus-reading check armed, on the largest realistic… | 2026-08-16, HOLDS with two orders of magnitude of margin for a content-only check. |
| [[raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep]] | Introduce a malformed node by hand, outside the lane. Measure how many calls and… | not yet — the sweep this relies on does not exist (raid-iss-se-lint-has-no-whole-repo-sweep). |
| [[raid-asm-a-cancelled-call-is-a-request-abort-not-a-crash]] | Cheapest real check ran this session: the mirror's process (pid 20652) stayed listed on… | 2026-08-19 |
| [[raid-asm-a-cloud-clone-can-reach-the-remote-it-came-from]] | holds here. i35 on 2026-08-17: git fetch --all --prune brought main, v2 and 26… | 2026-08-17 |
| [[raid-asm-a-host-keeps-a-backgrounded-lane-alive]] | HOLDS, AND THE POSIX BRANCH IS NO LONGER UNEXERCISED. Re-probed 2026-08-18 on the i17… | 2026-08-18 |
| [[raid-asm-a-migrated-pool-does-not-drown-the-corpus]] | OWED, and it cannot be probed on this machine — the 205 are machine-local… | 2026-08-18 |
| [[raid-asm-a-node-file-per-option-holds-at-the-sizes-this-pool-reaches]] | UNPROBED, and not probeable from this machine. The 205 parked options are machine-local on… | 2026-08-18 |
| [[raid-asm-a-peer-understands-the-ledger]] | HOLDS for the property that matters, probed 2026-08-13 against the real parser.… | 2026-08-13 |
| [[raid-asm-a-record-folder-is-addressed-only-from-inside-itself]] | FALSE, probed 2026-08-16. ModelFileSystem.stamp matches the root against a worktree pattern and… | 2026-08-16 |
| [[raid-asm-a-running-agent-session-cannot-attach-its-own-mcp-server]] | holds on this harness only. i35 on 2026-08-17: the session began with no se_… | 2026-08-17 |
| [[raid-asm-a-verbatim-overlap-check-catches-the-paste-that-matters]] | UNPROBED, because the thing it is about does not exist yet… | 2026-08-18 |
| [[raid-asm-an-entry-status-says-whether-it-is-open]] | SETTLED 2026-08-17, both halves, when the merge of the cloud walk forced two contradictory… | 2026-08-16 |
| [[raid-asm-an-omit-is-authored-honestly]] | unprobed. Two rows carry an omit today and both were authored in the same… | 2026-08-13 |
| [[raid-asm-battery-timings-measure-work]] | scheduled — the instrument is broken on both paths, per raid-iss-a-bound-record-records-no-test-timings.… | 2026-08-15 |
| [[raid-asm-dial-carries-adjudication]] | holds — owner ruling 2026-08-09 records that at high autonomy the agent blesses its… | 2026-08-12 |
| [[raid-asm-documented-harness-limits-stay-stable]] | No cheap check exists this session: verifying this needs re-fetching each vendor's current documentation… | unprobed 2026-08-19 — see draw-context follow_up |
| [[raid-asm-engine-serves-from-the-bound-tree]] | Bind a record on a product that does NOT edit the engine, move the… | not yet — cannot be probed from this repository, the only product here and the exception itself. |
| [[raid-asm-every-condition-can-say-what-it-wants]] | partially probed, holds so far. Five condition types stand under machines/conditions and every one… | 2026-08-13 |
| [[raid-asm-git-answers-open-without-a-worktree]] | holds, WITH A NAMED CONDITION on the implementation. Measured 2026-08-15 over 33 iteration branches.… | 2026-08-15 |
| [[raid-asm-grey-verb-distinct-from-se-help]] | scheduled. The check is putting both verb signatures side by side… | 2026-08-13 |
| [[raid-asm-help-query-vocabulary-overlaps]] | unprobed — no help-demand log exists yet, so there is no real usage to… | not yet — needs real se_help usage |
| [[raid-asm-i15-corpus-suits-lexical-matching]] | scheduled. Its own Probe section needs the BM25 sibling built, then a sample of… | 2026-08-16 |
| [[raid-asm-i15-one-threshold-separates-candidates]] | scheduled. Its own Probe section needs the BM25 sibling built, then a sample of… | 2026-08-16 |
| [[raid-asm-i15-query-plus-rows-earns-trust]] | scheduled. Its own Probe section needs the query verb built and used a few… | 2026-08-16 |
| [[raid-asm-i15-unindexed-scan-stays-inside-budget]] | scheduled. Its own Probe section needs the query verb built, then call latency measured… | 2026-08-16 |
| [[raid-asm-line-endings-do-not-move-under-us]] | unprobed. The check means rewriting a file's line endings to see whether its hash… | 2026-08-13 |
| [[raid-asm-machine-wide-state-serves-over-a-local-channel]] | holds — 144 microseconds per crossing against a one-second budget, for the call log… | 2026-08-14 |
| [[raid-asm-method-write-reaches-every-tree]] | SETTLED BY CONSTRUCTION at i34, and the mechanism it watched is deleted.… | 2026-08-16 |
| [[raid-asm-node-tap-carries-durations]] | holds on the installed Node — a failing case in this record's own scoped… | 2026-08-15 |
| [[raid-asm-one-parser-decides-what-parses]] | Take the node that broke this walk, and any other malformed sample. Feed it… | 2026-08-16, HOLDS on the parser while failing on the handling — two frontmatterOf functions disagree. |
| [[raid-asm-one-scoring-pass-is-enough-to-eliminate]] | probed for this iteration and it holds here. The eliminated candidate needs a two-band… | 2026-08-15 |
| [[raid-asm-only-one-agent-works-a-clone-at-a-time]] | HOLDS, both halves probed 2026-08-16. THE INTENT HALF: the owner's own words that two… | 2026-08-16 |
| [[raid-asm-our-requirement-lint-catches-the-rules-that-matter]] | List the lint's implemented rules from machines/items/requirement.md against the INCOSE guide rules… | 2026-08-17 |
| [[raid-asm-peer-runs-supported-platform]] | held narrowly, on a DIFFERENT platform than the 2026-08-12 answer named.… | 2026-08-13 |
| [[raid-asm-refusals-recover-a-weak-model]] | one-sided evidence, i35 on 2026-08-17, and the model was not weak.… | 2026-08-17 |
| [[raid-asm-session-identity-survives-a-reload]] | FALLS. Two reloads ran mid-walk on 2026-08-15 and the decision graph's id space restarted… | 2026-08-15 |
| [[raid-asm-slow-surface-is-not-self-contention]] | scheduled — it needs a spike. The lane forbids calling its own mirror… | 2026-08-15 |
| [[raid-asm-the-arrival-runs-before-the-agent-reads-anything]] | HOLDS ON THIS HOST, probed 2026-08-18 on the i17 arrival, and the ordering evidence… | 2026-08-18 |
| [[raid-asm-the-boundaries-are-few-enough-to-model-one-node-each]] | Count the element-to-neighbour pairs that actually carry traffic, walking the element nodes against the… | 2026-08-17 |
| [[raid-asm-the-bundles-defect-list-still-stands]] | half. Ten of about twenty-four read against the system i34 left. One obsolete, one… | 2026-08-16 |
| [[raid-asm-the-cage-holds-so-every-write-passes-the-lane]] | RE-PROBED 2026-08-18, THE ENFORCEMENT HALF STILL HOLDS: se_help refused SE-C-110 at onboard-retro… | 2026-08-18 |
| [[raid-asm-the-conformance-checks-stay-affordable-as-the-corpus-grows]] | unprobed by i35, and the empty date is filled rather than the verdict invented.… | 2026-08-17 |
| [[raid-asm-the-corpus-sweep-already-covers-a-minted-option]] | HOLDS. Run 2026-08-18 against a throwaway root carrying one minted option under project/spec/trace/option/… | 2026-08-18 |
| [[raid-asm-the-declared-node-floor-matches-what-the-engine-needs]] | false at the edge. i35 on 2026-08-17: the engine declares >=24.0.0 and its full… | 2026-08-17 |
| [[raid-asm-the-drain-is-the-only-door-into-the-pool]] | UNPROBED, and it is an inspection rather than a test: read every writer of… | 2026-08-18 |
| [[raid-asm-the-engine-can-tell-who-asked-for-a-run]] | holds, and better than predicted. Read engine/tools.ts: se_test already branches on scope… | 2026-08-16 |
| [[raid-asm-the-harness-scan-still-matches-current-releases]] | No cheap check exists this session: it needs each cited source re-fetched and its… | unprobed 2026-08-19 |
| [[raid-asm-the-installed-runtime-is-one-the-engine-runs-on]] | RESOLVED 2026-08-18 by dropping the floor to the runtime a bare host already has… | 2026-08-17 |
| [[raid-asm-the-launched-agent-can-authenticate-itself]] | unprobed. The launch step runs `<agent> --version` and treats exit 0 as proof… | 2026-08-16 — unprobed and now unprobeable, i34 switched off the guarded work. |
| [[raid-asm-the-pool-is-a-node-kind-under-project-spec]] | OWED. Express three of the i17 arrival's own findings as pool nodes at M1… | 2026-08-18 |
| [[raid-asm-the-slow-phase-is-the-green-derivation-repeated]] | Split the machine phase into its four parts and read the split against two… | 2026-08-17 |
| [[raid-asm-the-stop-hook-fires-the-same-on-posix]] | No cheap check exists this session: it needs a POSIX host with a stop… | unprobed 2026-08-19 |
| [[raid-asm-the-target-machine-is-many-throttled-cores]] | Run the same scoped call on the throttled laptop and on a normal desktop… | not from this session — reported by the owner 2026-08-14, accepted on their word. |
| [[raid-asm-the-three-transports-behave-identically]] | partially probed, i35 on 2026-08-17. The entire walk was driven over the HTTP transport… | 2026-08-17 |
| [[raid-asm-the-trace-graph-holds-every-reference]] | false in part. The check is a count i34 already produced.… | 2026-08-16 |
| [[raid-asm-unflagged-typescript-execution-is-universal]] | Cheapest real check ran this session: node -v reported v24.18.0, and node scratchpad/probe-ts-exec.ts executed… | 2026-08-19 |
| [[raid-asm-v1-ref-for-spec-queries-is-reachable]] | holds, with one correction. se_file_glob returns 25 files, not 26… | 2026-08-16 |
| [[raid-asm-waiting-makes-a-person-look-less]] | unprobed — nothing counts artifacts opened per adjudication. The count is derivable from the… | 2026-08-15 |
| [[raid-asm-wall-clock-is-a-baseline]] | unprobed, and the attempt is the finding. Two green batteries on one tree wrote… | 2026-08-15 |

## follow_up

Run the fresh primary-source harness scan draw-context already scheduled, which clears the two harness-scan assumptions. Get a POSIX host to force a stop event, which clears the stop-hook-on-POSIX assumption. Both are named on their own entries.

## anything_else

