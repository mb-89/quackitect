# M1 — Frame the problem & vision (i0010_engine_workshop)

## Vision & scope stated  → i10-m1-vision-scope-stated

**Vision (Moore).**

- **For** the quackitect user — owner, adjudicator, maintainer, vehicle owner.
- **Who** waits seconds for a board, gets "fresh — nothing changed" on real suspects, cannot see pending notes, scaffolds vehicles into the pre-i9 world, answers two pagers back-to-back, and reads "human" all over the surface.
- **The** i0010 engine workshop **is** a maintenance-and-observability iteration of the quack engine.
- **That** answers from a verification cache within a second, explains derived suspects, lists its notes, logs its calls, emits modern vehicles, ratchets by version instead of mtime, merges ready pagers into one hand-off, and says "user".
- **Unlike** adding a UI layer or rewriting the engine, it hardens the existing zero-dep Go binary and its method.

**PR-FAQ pressure test.**

- *Press line:* "The ledger now answers before you finish blinking — and when it says SUSPECT, it tells you exactly why."
- *Hardest FAQ:* "Is a cached verdict trustworthy?" — Yes by construction: the key is the test's full input hash plus the engine build identity. Any edit or rebuild is a miss and re-runs.
- *Second FAQ:* "Why touch wording now?" — The ruling exists (user replaces human), the sweep is mechanizable (allowlist selftest), and it rides the same surface the other items already touch.

**Scope.**

- **In:** verification cache + re-run feedback, fast status, `why` on derived flips, `quack notes` list, call-log instrumentation, mint dedupe + `--rationale`, vehicle scaffold modernization, semantic ratchet, merged killer pagers, user-wording sweep (stamp schema decided at M4).
- **Out (backlog, with ready-whens):** mobile adapter family (awaits the Remote Control trial), `quack listen`, evidence-doc templates, companion app.

## Problem agreed  → i10-m1-problem-agreed

The delta is real, and each item has a referent:

- **Slow answers:** `quack status` ≈ 7s since i9 — the tests-pass battery runs live (measured, perf note 2026-07-04, superseded into the verification-cache note).
- **Mute why:** `quack why` answers "fresh — nothing changed" on coverage-driven suspects (field note 2026-07-04, 09:42).
- **Invisible notes:** since the i9 data-home move there is no in-repo notes folder and no list command (owner note, 14:27).
- **Legacy scaffold:** `start init`/`stubs` still emit the `.quack` world; i9 removed it. Ratchet compares mtimes, so a fresh clone can rebuild the global binary BACKWARD (two notes, 13:06–13:11).
- **Double ceremony:** a milestone's last killer subtask and its gate ripen together and cost two consecutive pagers (owner note, 10:47).
- **Wrong word:** the surface says "human" where the voice rules say role or "user" (owner ruling 2026-07-04: replace with "user"; stamp schema decided in-iteration).

Worth solving: every item is either a daily-friction cost (speed + ceremony + visibility) or a correctness hazard (backward ratchet, stale scaffold).

## Success measurable  → i10-m1-success-measurable

Ch1 criteria, each checkable:

- 1. Fully cached `quack status` answers ≤ 1s on the reference machine (timed selftest).
- 2. A re-running battery announces itself before the first test; a cached run is silent.
- 3. `quack why` on a coverage-flipped check names the rule and the delta — "fresh" is gone for that class.
- 4. `quack notes` prints location + id, age, first line for every open note.
- 5. Every dispatch appends one redacted calls.jsonl line.
- 6. `mint veto --of scrap` writes the sink once; `--rationale` lands in the node.
- 7. A fresh `start init` emission carries project.toml, launcher, vendored source, pointer-chain entries — and drives from inside.
- 8. A stale-mtime old-version clone does NOT rebuild the binary backward.
- 9. One combined pager when the last killer subtask and its gate are ready together; split answer possible.
- 10. No "human" in prose, prompts, or CLI display strings outside the actor-stamp allowlist (selftest).

## Top risks (RAID)  → i10-m1-top-risks-logged

- **Risk — cache staleness:** a verdict survives an input change → falsely green board. Mitigation: key = full input hash + engine build identity; spike at M5 proves the key.
- **Risk — backward/broken ratchet:** the semantic stamp misreads and the binary stops updating (or still regresses). Mitigation: selftest with fresh-mtime/old-version fixture.
- **Risk — stamp-schema churn:** renaming actor vocabulary breaks the ledger schema and the self-cert metric. Mitigation: M4 decision with the metric as a criterion; prose sweep is safe regardless.
- **Assumption:** the selftest battery stays the only verification runner (cache sits at one choke point).
- **Issue:** `report-live` costs ~5s per render inside the battery — the cache must cover it once per build.
- **Dependency:** Go toolchain present for `quack build` (unchanged).

## Milestone review  → i10-m1-gate

**Round 1 — verify.** Each subtask has its referent in this doc:

- Vision in Moore form plus PR-FAQ.
- Six problems, each anchored to a dated note or measurement.
- Ten checkable Ch1 criteria.
- RAID with mitigations.

The killer (`problem-agreed`) was adjudicated by the user at the pager.

**Round 2 — validate.** Scope matches the started motivation exactly — all eight pulled work items appear in scope AND are covered by at least one Ch1 criterion:

- 1–2 cache
- 1 status
- 3 why
- 4 notes
- 5 call-log
- 6 mint
- 7 scaffold
- 8 ratchet
- 9 pager
- 10 wording

Out-list matches the backlog ready-whens. Nothing out of scope smuggled in.

**Round 3 — red-team (scaled to a framing gate).** Opposing case: "a maintenance pass needs no iteration — just fix things." Rejected: two items are correctness hazards (backward ratchet + stale scaffold) and one touches the ledger schema (stamp vocabulary) — those need gates and decisions, not drive-by fixes. Kill-criterion check: none of the criteria is unmeasurable; none unmet at this stage.

**Verdict: PASS** — proceed to bless. No reopened checks.
