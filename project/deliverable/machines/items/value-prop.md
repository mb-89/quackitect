---
template: item-value-prop
artifact: node
id_prefix: vp-
folder: project/spec/trace/value-prop
sections:
  - Success criteria
  - Unlike
applies_rigor:
  - systematic
applies_type:
  - default
---

# value-prop — one proposition the product makes to one audience

Lives in `project/spec/trace/value-prop/`. It is a STANDING ARTIFACT: it
outlives the iteration that authored it, lands on trunk when that record
closes, and a later record may change it.

Value props are what v1 called NEEDS. They are the top of the design trace:
the vision is their parent, and stories, use cases and requirements hang
below them. `frame-delta` authors them and passes REFERENCES as its
evidence; `gate-motivation` follows each reference and reviews the artifact
itself.

## A VALUE PROP IS HIGH-LEVEL, NEVER A MECHANISM

Owner ruling 2026-08-19. A value prop is a product-level promise, in a form
suitable for marketing to show a customer who has never read the engine.

It is NOT:

- a technical quality
- a mechanism
- a runtime behavior
- a portability fix
- a recovery loop
- an implementation capability

THE TEST: could this sentence appear on a product page unchanged, and mean
something to someone who has never read the engine? A sentence naming a
hook, a transport, a diagnostic, or any other mechanism fails the test.

THAT DETAIL BELONGS BELOW an existing value prop instead — as a story, a use
case, a requirement, or a quality row under one of the nine ISO/IEC
25010:2023 characteristics. It is never a value prop of its own, however
important the detail is.

## The template

A new value prop is seeded from this fence. Replace every comment with the
real content.

```skeleton
---
# The engine writes id and the type link. id is vp- plus a slug, unique
# across the whole trace corpus; two files claiming one id is a refusal.
#
# refines is normally absent. A value prop's parent is the vision, and that
# edge is implicit in the type.
#
# source_refs is optional: a list of ref- ids, the reference notes this
# proposition rests on. External links live only in reference notes.
#
# The proposition in the audience's own words, one sentence, shaped
# "As a <role> I need <X>". Not a feature, and not a solution.
statement: TODO — as a <role> I need <X>
#
# The stk- id of the stakeholder this proposition serves. A proposition with
# no audience is a wish.
audience: stk-TODO
#
# What becomes true for that audience, one sentence. THIS IS WHAT GETS
# VALIDATED — the success criteria measure it.
outcome: TODO — what becomes true for that audience
#
# MoSCoW: must, should or could. Most value props are must; the field earns
# its keep when one is not.
priority: must
---

## Success criteria

<!-- One bullet per criterion, each naming its Metric and its Target. A
criterion nothing will ever check is not a criterion. -->

## Unlike

<!-- The alternative, and what makes this different. Prose, and not
load-bearing. -->

## Notes (not load-bearing)

<!-- Optional. Anything a reader would otherwise re-derive. -->
```
