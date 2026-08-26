---
form: wire-lane-tools
by: agent
signed_off: 2026-08-19T18:52:21.299Z
authors: agent
files: null
---

# Evidence form / wire-lane-tools

## current_situation

build-query-evaluator and build-coupling-disposer both signed with real, tested implementations, but neither was reachable from the lane's tool surface — the goal's own served-read-only-over-the-tool-surface line was unmet, and gate-implementation's fail verdict named this as the direct cause.

## built

engine/tools-query.ts registers se_query and se_couplings on the lane's tool surface (wired into coreTools in tools.ts). se_query executes a harvested .base file's own declared view against the vault through engine/tables.ts's existing pinned subset (loadBase, selectRows, readVault) rather than inventing a second query grammar — engine/query.ts was rewritten mid-build once this seam was flagged: the original version queried the trace corpus directly by node kind, with no connection to the .base format the goal names, so a 25-file harvest would have had nothing to execute it. se_couplings ranks candidates via rankCandidateCouplings then forces a disposition row per candidate via the now-real recordCouplingDisposition, which this same build pass wrote for real after finding tsp-coupling-disposition.md's inspection claim did not match the actual file (a genuine gap, not drift, corrected and noted). A new refusal clause, SE-C-144, was minted for the unknown-column case with its own refusals.md section. tests/query.test.ts was rewritten to fixture a real .base file and vault notes rather than the old ad-hoc grammar; tests/remedies.test.ts and tests/trace-coverage.test.ts both required follow-on fixes (helpers.ts's laneSources list, the verb-count pin, two interface entries, two use-case edits) before the battery returned clean.

## follow_up

Both verbs are real and reachable. Four chunks remain: harvest-v1-queries (copy the 25 .base files and the ADR from ref main), conformance-fixtures (pin the subset against drift using the harvested shapes), fix-delta-default-resolvers, and mint-interface-entries — the last one is now done ahead of its own chunk, since gate-implementation's fail verdict and the coordinator's review both named it as blocking before the harvest could be verified against a working verb.

## anything_else

