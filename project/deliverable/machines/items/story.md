---
template: item-story
artifact: node
id_prefix: sty-
folder: project/spec/trace/story
sections:
  - Deck
applies_rigor:
  - systematic
applies_type:
  - default
---

# story — one concrete pass through the product, told as a deck

Lives in `project/spec/trace/story/`. It is a STANDING ARTIFACT: it outlives
the iteration that authored it, lands on trunk when that record closes, and a
later record may change it.

A story is the concrete anchor of the trace. A value prop says what the
product promises; a story shows one named actor getting it, once, end to end.
Several stories may serve one value prop, and use cases generalise them later.

THE STORY IS THE DECK. Its body is markdown slides, the shape Obsidian uses:
one slide per `---`, and each slide split by `|||` into a STATEMENT on the
left and its EVIDENCE on the right.

THE EVIDENCE SIDE IS EMPTY UNTIL VALIDATION. It fills at M8, and an empty
right side before then is correct rather than missing. That is what makes the
story its own validation container: the same artifact that says what should
happen ends up carrying the proof it did.

How to write one is [[meth-story-slideshow]].

## The template

A new story is seeded from this fence. Replace every comment with the real
content.

```skeleton
---
# The engine writes id and the type link. id is sty- plus a slug, unique
# across the whole trace corpus.
#
# The story in one line, as a JOB story: when a situation arises, what the
# actor wants, and what it lets them do. A job story leads with the SITUATION
# rather than the role, which is what a concrete pass actually starts from.
statement: TODO — when <situation>, I want <motivation>, so I can <outcome>
#
# The stk- id of the role who lives this pass. One actor, one goal.
actor: TODO — the stk- id whose story this is
#
# The vp- id this story realizes. This is the edge the trace graph draws, so
# a story with none hangs off nothing and never appears under a proposition.
refines:
  - TODO — the vp- id this story realizes
#
# Does the product die without this pass working? A killer story is
# demonstrated end to end at M8; the rest are checked more cheaply.
killer: false
---

## Deck

<!-- ONE SLIDE PER `---`, and every slide is split by `|||`: the claim on the
left, what proves it on the right. Keep the arc below and nothing else. -->

<!-- THE PROBLEM. What the actor cannot do today, in one sentence. This is
the "before", and the result slide mirrors it. -->
|||
<!-- Empty until M8. -->

---

<!-- THE STARTING STATE. Where the actor stands before they begin. Concrete:
what is open, what exists, what does not. -->
|||
<!-- Empty until M8. -->

---

<!-- ONE STEP. What the actor does, and what the product does back. Six step
slides at most: past that the story is two stories. -->
|||
<!-- Empty until M8. -->

---

<!-- THE RESULT. This is how it was solved, answering the problem slide in
its own words. -->
|||
<!-- Empty until M8. -->
```
