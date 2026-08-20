---
template: item-use-case
artifact: node
id_prefix: uc-
folder: project/spec/trace/use-case
sections:
  - Main scenario
  - Extensions
checks:
  - field: kind
    one_of:
      - interaction
      - quality-area
    hint: an interaction is told from the user's side; a quality-area is one of the nine ISO 25010 characteristics
applies_rigor:
  - systematic
applies_type:
  - default
---

# use case — one actor, one goal, every pass

Lives in `project/spec/trace/use-case/`. It is a STANDING ARTIFACT: it outlives
the iteration that authored it, lands on trunk when that record closes, and a
later record may change it.

## THE LEVEL CARRIES TWO KINDS (owner ruling 2026-08-07)

`kind: interaction` is the original: one actor, one goal, every pass.

`kind: quality-area` is one of the nine ISO/IEC 25010:2023 characteristics.
It is not an interaction, and it is not told from anybody's side. It is the
umbrella the non-functional requirements hang under.

The two sit at one level because both are what requirements refine. The facet
is there so a reader is never surprised, and so the register can be filtered
to either set.

A QUALITY-AREA'S SECTIONS READ DIFFERENTLY. Its Main scenario says what the
characteristic means for this product. Its Extensions say where the product
deliberately accepts less, and why.

## THE NINE QUALITY-AREAS ARE A CLOSED LIST

Owner ruling 2026-08-19. The `quality-area` use cases are the nine
characteristics of ISO/IEC 25010:2023, and nothing else.
[[sty-what-a-quality-is]] is the ONLY story that refines `vp-qualities`
directly — a second one is a value-prop-level promise wearing a story's
clothes, and it belongs downstream instead (see project/deliverable/machines/items/value-prop.md).

DO NOT INVENT A TENTH quality-area use case. If a genuinely missing
ISO/IEC 25010:2023 characteristic turns up, add that real characteristic —
never a project-specific substitute standing at this level.

PROJECT-SPECIFIC QUALITY BEHAVIOR BEGINS BELOW THE NINE, as a `kind: quality`
requirement that `refines` the one characteristic it protects
([[meth-quality-scenarios]]). A quality demand with no requirement under a
characteristic is a promise nobody wrote down.

A STORY IS ONE PASS. A USE CASE IS EVERY PASS. The story says this person, this
Tuesday, these clicks. The use case says the same goal told once, with the
branches that can happen on the way. The story is the example; this is the
general form.

SO IT REFINES STORIES, one or more. That edge is what the trace graph draws,
and it is what makes the general form checkable — a use case with no story
under it is a capability nobody has walked.

NO UI MECHANICS. A use case survives a rewrite of every screen it touches. Say
what the actor achieves, never which button they press.

M3 DERIVES THE REQUIREMENTS from the steps and extensions here. A step no
requirement covers is a hole, and the coverage matrix shows it.

How to write one is [[meth-cockburn-use-case]].

## The template

A new use case is seeded from this fence. Replace every comment with the real
content.

```skeleton
---
# The engine writes id and the type link. id is uc- plus a slug, unique
# across the whole trace corpus.
#
# The goal in one line: VERB plus OBJECT, from the actor's side. What they
# achieve, not what the system does for them.
statement: TODO — <verb> <object>, the goal this use case achieves
#
# The stk- id of the role who acts. One actor, one goal. A second goal is a
# second use case.
actor: TODO — the stk- id who acts
#
# What starts it. One phrase, an event or a decision, never a screen.
trigger: TODO — what starts this
#
# What must already be true. Write `none` where nothing is owed.
precondition: TODO — what must hold before this can start
#
# What is true when it succeeds. This is the promise the steps have to keep.
guarantee: TODO — what holds after it succeeds
#
# The sty- ids this generalizes. Every use case needs at least one: the story
# is the concrete pass that proves the general form is real.
refines:
  - TODO — the sty- id this generalizes
#
# MoSCoW, the house scale: must | should | could — the same grade the
# whole chain carries, value prop to requirement. The demo duty lives on
# the STORIES: a must story is demonstrated end to end at M8.
priority: TODO — must | should | could
---

## Main scenario

<!-- THREE TO NINE NUMBERED STEPS, and no more. Past nine it is two use cases.
Each step is one exchange: the actor does something, or the system does. Write
them as plain sentences, numbered, in the only order they can happen in. -->

## Extensions

<!-- EACH ONE BRANCHES FROM A NUMBERED STEP, and its label says which: 3a, 3b,
5a. Name the condition, then what happens instead. An extension that branches
from no step is a step nobody wrote down. -->

<!-- Write `none` where the goal genuinely has one path. That is rare and it
is a claim, so make it deliberately. -->
```
