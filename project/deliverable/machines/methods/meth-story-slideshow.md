---
kind: method
statement: "The user story as a slideshow: slides from starting situation to recap, each slide claim left, evidence right - the story doubles as the validation container."
---

## Situation
Stories are the concrete anchor of the trace: each realizes a value prop; use cases generalize them. Written at M2; their evidence side fills at M8 - an empty right side before validation is by design.

## A STORY IS A JOURNEY

Owner ruling, 2026-08-06, after a whole set was written the wrong way.

A story follows a PERSON THROUGH THE PRODUCT, start to finish. They arrive somewhere. They click something. Something answers. They arrive somewhere else. It has an ORDER, and that order is why it draws as slides.

WHAT IT IS NOT: a capability statement. "When a new engine version arrives, I want my own method to survive untouched." "When I point the agent at building, I want the machine to refuse until the input is earned." Both were written as stories and neither is one. Nothing HAPPENS in them. They name a property of the system and then describe it.

The test is mechanical. If the text has no order - if any two sentences could swap without loss - it is not a story. It is a use case wearing a story's frontmatter, and it belongs at generalize-use-cases.

THE FIRST STORY IS ALWAYS THE RAMP-UP: an empty machine, nothing installed, and the person has to reach the first screen. Installing, booting and every click on the way belong in that one story. Every other story starts where the ramp-up ends.

STORIES ARE A DESIGN INSTRUMENT, and this is the part most easily lost. Writing one forces the screens to exist. A story that cannot be told without inventing a control has found a hole in the design, and that is the point of writing it. A capability statement can never do this, because it describes what is already decided.

## Form
- Slide 1: the starting situation. Last slide: the recap - what was achieved.
- Every slide: STATEMENT on the left (one claim of what happens), EVIDENCE on the right (empty until validation; then a reference to the run record, demo, or measurement that shows it).
- Story fields: actor, want, why; realizes -> value prop.

## Procedure
- Write stories as concrete examples - a named actor doing one real pass, not an abstraction.
- Checks: 3C (card, conversation, confirmation) and INVEST as quality gates on each story; story mapping to find the missing ones.
- The killer stories (the ones the product dies without) are marked - M8 demonstrates exactly those end-to-end.

## AND THE COVERAGE IS MECHANICAL, both ways

A story refining no proposition is work nobody asked for. A proposition no story refines is a promise nothing shows. The step refuses to close while either stands, so neither waits for a reviewer to spot it.
