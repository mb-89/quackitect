---
id: q-i0016-selftests
type: question
state: decided
decided_via: B
statement: The i0016 note claimed test-model-groom and test-model-tray declare missing selftests, but no such test nodes exist. What is the real state, and does anything block i20-m4-tests-pass?
class: review
killer: false
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  state: user-ruling via handoff
  decided_via: user-ruling: the owner chose B - drop the dormant requirements rather than defer them forever
---
## Context

The i0016 red note (2026-07-12) said `test-model-groom.md` and `test-model-tray.md` declare `selftest:model-groom` / `selftest:model-tray`, which do not exist in the engine. Re-checked on 2026-07-17: **no such test nodes exist on disk.** What exists is two dormant requirements, `req-model-groom` and `req-model-tray`, already scrap-deferred by `adr-fu55aja` and `adr-6cfyu3a`. The note was stale.

## Options

A) The note is obsolete; the phantom tests were already removed. Verify `i20-m4-tests-pass` is unblocked, then archive the note. No spec change.

B) The dormant requirements should be dropped, not merely deferred. Retire `req-model-groom` and `req-model-tray` with recorded vetoes. This touches blessed i0016 history.

C) Leave the deferral as-is; the dormant requirements stay parked until their canvas feature is pulled.

## Rationale (not load-bearing)
The owner said drop tests for features we do not have. There are no such tests. The live question is whether the dormant requirements stay parked or get dropped. The owner rules.
