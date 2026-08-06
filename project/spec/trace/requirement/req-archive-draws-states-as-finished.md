---
id: req-archive-draws-states-as-finished
type: "[[requirement]]"
statement: "When an archived record is opened, the engine shall draw every state as it finished, with the walked route visible and zero states omitted."
kind: functional
verify_method: test
breaks_if_removed: "The walk's shape at close is unreadable, and how a record finished has no answer."
refines:
  - uc-browse-the-archive
source_refs:
  - uc-browse-the-archive step 3
  - uc-browse-the-archive ext 3a
priority: should
---

## Detail

## Detail

| state at close | drawn as | carries |
| --- | --- | --- |
| passed | passed | its verdict |
| failed | failed | its verdict |
| struck by change size | struck | the column that struck it |

The walked route is visible over the drawing. Zero states are omitted, struck ones included.
