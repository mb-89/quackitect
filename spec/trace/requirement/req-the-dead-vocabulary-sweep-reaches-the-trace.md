---
minted_in: i44-the-corpus-resolves-duplicate-headings-a
id: req-the-dead-vocabulary-sweep-reaches-the-trace
type: "[[requirement]]"
statement: When the dead-vocabulary sweep runs, the engine shall cover the trace folder as well as the guidance and machine folders, and report every named verb, state or control that no longer exists.
kind: functional
verify_method: test
breaks_if_removed: A use case teaching a verb the lane retired costs the next reader a refused call, and the sweep that would have caught it never looked there.
breaks_how_badly: corrosive
refines:
  - uc-let-the-system-catch-up
source_refs:
  - uc-let-the-system-catch-up
priority: should
---

## Detail

| vocabulary kind | where its existence is settled |
| --- | --- |
| a lane verb | the tool surface |
| a state name | the machine it belongs to |
| a control or a setting | the surface that offers it |
| a refusal clause | the error registry |

THE CLASS HAS BEEN FOUND THREE TIMES, per the overhaul's own record: retired
shutdown levels, a retired start verb, and pre-i34 merge vocabulary.

WHAT THIS ROW CHANGES is the reach, not the check. The sweep already runs; it
did not look at the trace folder, which is where the use cases live.
