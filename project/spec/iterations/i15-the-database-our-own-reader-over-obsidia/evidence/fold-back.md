---
form: fold-back
reopened: 2026-08-16T18:42:15.205Z — Regaining write access to fix two project-wide raid assumptions (raid-asm-an-entry-status-says-whether-it-is-open, raid-asm-the-three-transports-behave-identically) that block gate-prototype's route-leave check but cannot be edited from gate-prototype itself, which grants no file-write tool. fold-back's own claim is unchanged in substance and will be resubmitted as-is.
by: agent
signed_off: 2026-08-16T18:42:53.447Z
authors: agent
files: null
---

# Evidence form / fold-back

## current_situation

One spike ran: exp-i15-query-latency-at-real-corpus-scale, probing raid-risk-i15-query-latency-unmeasured-at-real-scale. Its verdict is holds, with folds_to and promote already written on the experiment node.

## folded

- exp-i15-query-latency-at-real-corpus-scale

## follow_up

folds_to: raid-risk-i15-query-latency-unmeasured-at-real-scale moved from open to mitigated, dated measurement (31 ms / 768 files, 32x margin under the 1s bound) appended to its body — already done directly on the raid node, not just proposed. promote: none — the throwaway script is not build code; the real filters.and/or evaluator and YAML frontmatter parser are still owed at M7 build time, unchanged by this finding. No requirement or architecture edit is owed — the design already assumed a fresh unindexed read and the measurement confirms it holds.

## anything_else

