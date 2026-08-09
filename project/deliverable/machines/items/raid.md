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
- `probe` — the probe RESULT, on assumptions. Say what was checked and what
  came back, starting with the outcome word.
  - holds
  - false
  - unprobed
  - scheduled
  - Absent means never probed.
- `probed` — ISO date of the last probe, on assumptions. Absent means never.
- `weighs_with` — the pool member this shares a decision axis with, and why.
  Written at M4. See [[meth-derive-criteria]].
- `weighs_against` — the pairwise importance judgments. Written at M4.

## A COMMENT IS THE UNANSWERED STATE (owner ruling 2026-08-07)

`probe` and `probed` are minted carrying a markdown comment. The comment says
what belongs there. Replacing it with plain text is what answers the field.

```
probe: <!-- what the check found. Start with holds, false, unprobed or scheduled. -->
probe: holds — ran the battery on macOS, all 859 green
```

A still-commented value counts as UNANSWERED and the submit refuses it by
name. So the prompt lives where the answer will live, and nothing has to
invent a placeholder somewhere else to explain the field.

## A MINTED COMMENT CARRIES NO COLON-SPACE

The comment sits where a YAML value goes, so it obeys YAML. A `: ` inside it
reads as a second key and the whole note stops parsing.

WHAT THAT LOOKS LIKE WHEN IT BITES, and it is why this has its own heading.
The note does not fail a check. It fails to LOAD, so every test that asks for
it reports the node missing. The symptom names the wrong thing entirely, and
the real cause is one character in a prompt nobody was looking at.

Costed 13 red tests on 2026-08-08, all of them reading `req-clean loads`.

Use a dash where a colon wants to go. `one line per pair — a pool id, then >
or =` says the same thing and parses.

This is the same convention the evidence forms already use for prefilled
text: a comment is a suggestion, and confirming it is what makes it a claim.

## `probe` IS THE FORM'S FIELD (owner ruling 2026-08-07)

The probe-assumptions step does not keep its own copy of this. Its `probes`
field is a VIEW: one line per standing assumption, and the answer on each line
IS this frontmatter key.

So there are two ways to write the same thing and they cannot disagree.

- Type the answer in the form. It lands on this node.
- Edit this node and save. The form shows it at the next look.

WHY IT IS HERE AND NOT THERE. A probe result belongs to the assumption, not
to whichever iteration happened to run it. Kept in the form, an entry written
in i1 and probed in i7 would have its result filed under i7 — findable only by
somebody who already knew to look there.

The state stands exactly while every standing assumption carries this field.
Nothing else is counted, so a new assumption turns the state grey the moment
it is written, which is what a standing artifact means.

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
probe: <!-- what the check found. Start with holds, false, unprobed or scheduled. -->
probed: <!-- the date the check ran, as YYYY-MM-DD -->
source_refs:
  - {{what leans on it}}
#
# THE TWO M4 KEYS, exactly as on a requirement. A register entry sits in the
# criterion pool, so it is compared and compounded the same way.
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

## Probe

{{how this would be checked — the real channel, not the datasheet}}
```
