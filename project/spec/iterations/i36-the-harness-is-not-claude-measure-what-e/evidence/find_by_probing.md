---
form: find_by_probing
by: agent
signed_off: 2026-08-19T11:26:39.952Z
authors: agent
files:
---

# Evidence form / find_by_probing

## current_situation

Six finders are recorded. This is find_by_probing, the seventh and last, which runs a cheap check instead of reasoning about one.

## applies

yes

## probes

| question | timebox | what_was_faked | verdict |
| --- | --- | --- | --- |
| Does this project's flag-free `node <file>.ts` execution catch a missing case in a closed-union switch at run time? | 5 minutes | nothing; the harness type and the switch are the real shape opt-closed-harness-type-with-explicit-unknown proposes | exit 0, stdout "fell through" — the missing case did not error. package.json carries no tsc/typecheck script, so nothing else in this project's toolchain would have caught it either. The closed type is an editor/review-time guarantee only. |

## options

- opt-closed-harness-type-needs-a-separate-typecheck-gate

## dead_ends

none — the one probe run this pass produced a qualifying finding rather than a dead end.

## follow_up

All seven finders have now run for i36's touched clusters. Enumeration converges next into a morphological chart and candidates.

## anything_else

