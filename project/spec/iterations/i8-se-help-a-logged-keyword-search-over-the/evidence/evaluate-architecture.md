---
form: evaluate-architecture
by: agent
signed_off: 2026-08-12T21:35:06.681Z
authors: agent
files:
---

# Evidence form / evaluate-architecture

## current_situation

M5 evaluate-architecture: this state has never been walked in this product before — no prior iteration submitted it. Walking all 19 standing kind:quality requirements, worst grade first, since the mechanical completeness law reads the whole corpus. Depth matches the minor tailoring: the six the delta plausibly touches get full reasoning, the rest a shorter addressed line since the standing structure already satisfies them unchanged.

## walk

- [[req-trees-never-mix]] — addressed: help.ts writes only inside the engine's own .se/help-demand.jsonl, never into a vehicle's overlay tree; untouched by this delta.
- [[req-mirror-stays-on-the-machine]] — addressed: verified directly against engine/mirror.ts:915, `server.listen(o.port, "127.0.0.1")` binds loopback only. The row's own Detail section was stale (described the pre-fix call) and is corrected as part of this walk.
- [[req-every-artifact-is-readable-text]] — addressed: the new demand log (.se/help-demand.jsonl) is plain JSONL text, one JSON object per line, the same shape as the already-satisfying notes.jsonl and calls.jsonl.
- [[req-every-call-logged]] — addressed: se_help dispatches through the same MCP call path as every other lane tool (by construction, per req-help-query-logged-with-result); no new dispatch path was added.
- [[req-walk-resumes-from-repo]] — addressed: the demand log is a side-channel usage log, not walk-position state; untouched by this delta.
- [[req-reachable-capability-is-traced]] — addressed: se_help itself and its demands:true call are both covered by uc-find-the-right-lane-tool, confirmed at gate-inputs' unspecified_capability field this session.
- [[req-crash-lands-safe]] — addressed: this scenario governs the live-offer/grant channel at the front desk; help.ts creates no live offer and is untouched by this delta.
- [[req-no-agent-act-destroys-work]] — addressed: help.ts's only write is an append to a new log file, never a delete, move or rewrite of committed content — the same append-only shape already proven by se_note's notes.jsonl.
- [[req-walk-survives-host-swap]] — addressed: the host-arming and position-resume mechanism is untouched by this delta.
- [[req-resume-needs-no-person]] — addressed: the panel/resume mechanism is untouched by this delta.
- [[req-overlay-survives-update]] — addressed: help.ts is engine-owned code; no overlay file is touched.
- [[req-fresh-machine-runs]] — addressed: the install path is untouched, and help.ts adds no new dependency (node:fs and node:path only, per identify-assumptions.md's toolchain sweep).
- [[req-acts-carry-role-and-channel]] — addressed: se_help rides the same standard dispatch path that already stamps role and channel on every act.
- [[raid-ar-call-answers-in-one-second]] — at risk: [[req-call-answers-in-one-second]] hinges on [[el-walk-engine]] — searchHelp adds a per-doc guidanceStatement read (parseStateNote) on top of the already-proven scanGuidance, on the same 1-second-bound dispatch path; the one test that would measure it (tests/sehelp.test.ts, job test-msqkf74m-1) has not returned a verdict (note-bf519286c7c8).
- [[req-entry-speaks-plainly]] — addressed: this delta adds no entry document; the entry chain is unchanged.
- [[req-audit-answers-from-log]] — addressed: se_help's calls answer from the same standing call log as every other tool, by construction.
- [[req-newcomer-leaves-able-to-ask]] — addressed: the tour and desk-offer mechanism is untouched by this delta.
- [[req-newcomer-orients-unaided]] — addressed: the entry documents are unchanged.
- [[req-newcomer-one-command]] — addressed: the install script is untouched.

## fitness_candidates

- req-call-answers-in-one-second
- req-every-call-logged
- req-crash-lands-safe
- req-walk-resumes-from-repo
- req-newcomer-one-command

## follow_up

gate-architecture next.

## anything_else

One stale requirement doc corrected in passing: req-mirror-stays-on-the-machine's Detail section still described a pre-fix listen() call; the fix (loopback-only bind) had already landed. Fixed as part of reading the real artifact for this card, per meth-review-rounds' verify rule.
