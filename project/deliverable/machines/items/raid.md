---
template: item-raid
artifact: node
id_prefix: raid-
folder: project/spec/trace/raid
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: kind
    one_of:
      - risk
      - assumption
      - issue
      - dependency
  - field: status
    one_of:
      - open
      - probed
      - mitigated
      - accepted
      - closed
  - field: owner
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: an entry nobody owns is an entry nobody watches
  - field: trigger
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: the trigger is what brings it back — without one it is filed and forgotten
  - field: statement
    ban_words:
      - appropriate
      - adequate
      - sufficient
      - robust
      - reasonable
      - probably
      - maybe
    hint: a weasel word cannot be probed
  - field: statement
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
  - field: kind
    equals: assumption
    require_section: Probe
    hint: an assumption carries how it would be checked, written when it is identified rather than when it is probed
---

# raid — one risk, assumption, issue, or dependency

Lives in `project/spec/trace/raid/`. A STANDING ARTIFACT, exactly like a
requirement: it outlives the iteration that recorded it, lands on trunk when
that record closes, and a later record may change its status.

THE REGISTER IS A VIEW over these nodes, never their home. Filtering the same
folder by kind is how one source serves the project chapter and the
design-input chapter at once.

## The four kinds, and how to tell them apart

| kind | what it is | the tell |
| --- | --- | --- |
| risk | something that MIGHT happen and would hurt | it has not happened |
| assumption | something you are TREATING as true without establishing it | you are already relying on it |
| issue | something that HAS happened and is hurting now | it is present tense |
| dependency | something outside your control that you need | somebody else owns it |

A FALSIFIED ASSUMPTION BECOMES AN ISSUE, not a risk — it has already
happened. Change the kind, keep the id, and say so in the body.

## THE TITLE STATES THE CLAIM, NOT THE TOPIC (owner ruling 2026-08-07)

An entry's id and statement say the THING HELD TRUE, phrased so it could be
falsified. Not the subject area, not the test status, not the name of a gap.

The test is one question: could somebody disagree with the title? If not, it
is a topic and it needs rewriting.

| written as | reads as | what it should say |
| --- | --- | --- |
| `raid-experimental-type-stripping` | a topic | the flag keeps behaving as it does today |
| `raid-posix-untested` | a test status | the lane works the same on POSIX |
| `raid-adjudication-provenance-gap` | a thing | no vendor ships adjudication provenance |
| `raid-corpus-stays-small` | A CLAIM — correct | — |

All four were written on one day. Only the last one can be argued with, which
is exactly what makes it the only one a reader can act on.

WHY IT MATTERS MORE FOR AN ASSUMPTION THAN FOR THE OTHER KINDS. An assumption
is a claim you are RELYING ON without having established it. If the title does
not state the claim, the register lists subjects nobody can check, and the
probe has nothing to aim at. A risk can survive a vague name because its body
carries the worry; an assumption cannot, because the title IS the thing under
test.

## Fields

- `id` — `raid-<slug>`.
- `type` — `"[[raid]]"`.
- `kind` — risk, assumption, issue or dependency.
- `statement` — one sentence, plainly. What is at stake, not how you feel
  about it.
- `owner` — a ROLE, never a person. Who watches it.
- `trigger` — the event that brings it back for a look. This is the field that
  makes the register live rather than a graveyard.
- `status` — open, probed, mitigated, accepted, closed.
- `impact` — what it costs if it bites. A sentence, not a score.
- `source_refs` — what it came from and what leans on it: requirement ids,
  decisions, use cases, field evidence.
- `probed` — ISO date of the last probe, on assumptions. Absent means never.

## The Probe section, on every assumption

An assumption declares HOW IT WOULD BE CHECKED at the moment it is
identified, not at the moment somebody gets round to probing it. Writing the
check is what separates an assumption from a feeling, and an assumption whose
check cannot be written is not yet an assumption — it is a worry, and it goes
in the body of a risk.

The probe method is [[meth-assumption-probing]]. The register method is
[[meth-raid]].

## A PROBE RESULT DECAYS

An assumption probed green in i1 is not thereby green in i7. The `probed`
date is what makes staleness visible. Nothing enforces a re-probe interval
today; the date is recorded from the first probe so that rule can be added
later without a migration.

## Skeleton

```
---
id: raid-{{slug}}
type: "[[raid]]"
kind: assumption
statement: {{the thing, plainly, in one sentence}}
owner: {{role}}
trigger: {{the event that brings it back}}
status: open
impact: {{what it costs if it bites}}
source_refs:
  - {{what leans on it}}
---

## Probe

{{how this would be checked — the real channel, not the datasheet}}
```
