---
form: fix-findings
by: agent
signed_off: 2026-08-21T12:11:14.831Z
authors: agent
files:
---

# Evidence form / fix-findings

## current_situation

ALL FOURTEEN FINDINGS ARE FIXED, in one pass, committed as 494d608b — 76 files, 1007 insertions. A fifteenth was found while writing the tests for the twelfth.

THE ACCOUNT. A run this session started and that settled between two lane calls was dropped before any caller saw it, because a test operation is rebuilt from its record on every read and never enters the in-memory table. The account now records what this session started. The code also said an entry leaves the table once read while the design spec and the element both said it never does; the requirement is the tiebreak, so the entry stays and takes a standing instead. That third standing, `read`, was declared in two documents and existed nowhere in the returned shape. The read and running marks were process-global and keyed without a root, so two trees sharing a job id shared a verdict.

THE DURATION. The basis claimed a figure was measured on this run without checking, while every test operation writes to one progress path — so a file left by the previous run was projected as this one. The header's `start` is now read, the way the sibling reader already read it. A figure that stops moving looked identical to a working estimate; the basis names a count that has not advanced. And only a battery carried a total, so every scoped run could say nothing but that it cannot estimate.

THE HANDBACK. On the one path the handback exists for, the refusal said the check had not started while it was running, and its remedy said the script re-runs when a second attempt in fact joins the first. No account rode a refusal at all, because the decorator pass ran only on the success path. And the bound was exactly 1000ms against a measure of under one second, which a timer firing at or after its delay cannot meet.

THE SCOPE DECISION. The answer named three unmapped files and dropped the rest — 128 were unrecoverable on this record's own run. The middle partition had no test, and the documents case tested a file that was not a document.

THE FIFTEENTH, found while writing the twelfth's test: `git status --porcelain` collapses an untracked directory into one entry, so a folder of new files was reported as the folder. Both call sites now name every file.

## follow_up

- THE TESTER IS RE-VERIFYING as gatekeeper, shown the deltas rather than respawned. Its verdict per finding lands after this submit.
- THE PUSH IS REFUSED BY THE LANE. SE-C-003 keeps push with the owner, and `guidance/method/cloud-runner.md` line 314 rules that a refusal here is a finding for the field report and not a reason to reach around it. The work is committed locally on `claude/iteration-fifty-one-xdrwvp` and the field report carries it.
- THREE THINGS THE TESTER COULD NOT CHECK stay open until it answers again: the gate's own reader of the `deciding` standing, the route drawer's standing read, and timing under load.
- `raid-asm-a-check-left-running-survives-on-every-platform` is measured on Linux only. Windows and macOS stay unmeasured, and the assumption says so.

## anything_else

MEASURED BEFORE THIS SUBMIT: tsc exit 0, and the three touched test files run 69 of 69 green. The timing case measures the answering call at 907ms, which is the first time this record's central promise was measured rather than argued.

SIX OF THE FIFTEEN WERE PREDICTED BY THE SPECS THEMSELVES. Three test specs parked a case until a mechanism existed, and each of those mechanisms was built during this record. A parked reason that expires and is never revisited is its own failure mode, and it happened three times here.
