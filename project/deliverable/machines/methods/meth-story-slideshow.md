---
kind: method
statement: "The user story as a deck: one actor, one concrete pass, a claim on every slide and the proof beside it."
---

## Situation

Guidance for M2 write-stories. This is the one card the step draws from.

## What a story is for

A value prop says what the product PROMISES. It is a claim, and a claim is
easy to agree with and impossible to check.

A story shows one named actor getting that promise, once, end to end. It is
the first artifact in the trace that could be wrong in a way anybody would
notice.

It does three jobs, and each is worth the writing on its own.

- IT MAKES THE PROMISE CONCRETE. Nobody can tell whether "rigor without
  paperwork" is delivered. Everybody can tell whether the pass in the deck
  happened.
- IT IS THE VALIDATION CONTAINER. The evidence side fills at M8 with what
  actually ran, so the artifact that said what should happen ends up carrying
  the proof it did. There is no second document.
- IT IS WHERE THE EXAMPLES ARE BORN. Use cases generalise stories, and
  requirements derive from the use cases' steps. A step no story ever walked
  is a step nobody asked for.

SEVERAL STORIES MAY SERVE ONE VALUE PROP, and most do. One prop, one story is
usually a sign the prop was written narrowly rather than that the product is
simple.

AND THE COVERAGE IS MECHANICAL, both ways. A story refining no proposition is
work nobody asked for. A proposition no story refines is a promise nothing
shows. The step refuses to close while either stands, so neither waits for a
reviewer to spot it.

## The story is a deck

The body is markdown slides, the shape Obsidian uses. One slide per `---`.

Every slide is split by `|||` into two halves: the STATEMENT on the left, the
EVIDENCE on the right.

- The left half is ONE CLAIM about what happens. Not a bullet list. A slide
  that needs bullets is two slides.
- The right half is what shows it happened: a run record, a demo, a
  measurement, a rendering. It is EMPTY until M8, and empty is correct before
  then.

This is the assertion-evidence pattern (Michael Alley): one sentence-assertion
carried by evidence beside it, never a list of topics. v1 formalised it as
req-ifu-split-slide and shipped it.

## The arc

A fixed shape, so a reader knows where they are. v1 settled it as
req-ifu-user-stories and the prior art holds it up.

1. THE PROBLEM. What the actor cannot do today.
2. THE STARTING STATE. Where they stand before they begin. Concrete: what is
   open, what exists, what does not.
3. THE STEPS. What they do and what the product does back. Six at most; past
   that it is two stories.
4. THE RESULT. How it was solved, answering the problem slide in its own
   words.

That is Before-After-Bridge, which is how a demo is told: the problem is the
before, the result is the after, the steps are the bridge.

## Writing one

- A JOB STORY, not a role story. "When <situation>, I want <motivation>, so I
  can <outcome>." It leads with the situation, which is what a concrete pass
  actually starts from, and it does not pretend the role explains the want.
- ONE ACTOR, ONE GOAL. A second goal is a second story.
- NAME THINGS. A real command, a real file, a real number. A story written in
  the abstract cannot be validated, and validation is half its job.
- MARK THE KILLERS. A killer story is one the product dies without, and M8
  demonstrates exactly those end to end.
- `refines` NAMES THE VALUE PROP, and that is the edge the trace graph draws.
  A story with none hangs off nothing and never appears under a proposition.

## Finding the ones that are missing

Story mapping: lay the passes side by side in the order a user meets them,
and the gaps show up as columns with nothing in them.

The quality checks are 3C — card, conversation, confirmation — and INVEST,
applied per story rather than to the set.

THE SET IS NEVER COMPLETE, and does not have to be. A missing story surfaces
the same way a missing value prop does: something gets built that no story
covers, or a story cannot be told without a step nobody specified. Add it
then.

## Sources

- Assertion-evidence slides (Michael Alley) — one claim, visual evidence,
  never bullets. Adopted by v1 as req-ifu-split-slide.
- Before-After-Bridge demo storytelling — the arc. Adopted by v1 as
  req-ifu-user-stories.
- Job stories, from Jobs-to-be-Done — the framing, chosen over Connextra
  because a concrete pass starts from a situation.
- v1's deck markdown at ref main (product/quackitect/method/templates/documents/spec/man-deck.md)
  — `---` between slides, `|||` for columns, `Note:` for the aside.
