---
id: req-drain-one-home-with-payload
type: "[[requirement]]"
statement: When a note is drained, the engine shall accept the drain only with exactly one home, that home's payload, and that home's legal context, per the Detail table.
kind: functional
verify_method: test
breaks_if_removed: Notes drain homeless or payloadless and the next retro re-reads and re-litigates every one.
breaks_how_badly: corrosive
refines:
  - uc-drain-the-inbox
  - uc-capture-a-stray
source_refs:
  - uc-drain-the-inbox step 4
  - uc-drain-the-inbox step 5
  - uc-drain-the-inbox ext 3a
  - uc-drain-the-inbox ext 3b
  - uc-drain-the-inbox ext 3c
  - uc-drain-the-inbox ext 5a
  - ".se/req-mine-sebots.md: capture, decisions, change"
  - uc-capture-a-stray ext 4a
  - ".se/req-mine-v2.md: notes and the toll"
priority: must
---

## Detail

## Detail

Each home binds its payload and its context. A drain breaking a row of this table is refused with the broken part named.

| home | payload the drain must carry | legal context |
| --- | --- | --- |
| done | where the code or a record carries it | anywhere — a check anyone runs |
| obsolete | the reason it no longer holds | anywhere — a check anyone runs |
| carried | the record that takes it | an open retro only |
| backlog | the condition that brings it back | an open retro only |

The done and obsolete payloads record the check against the code that precedes the judgment.
