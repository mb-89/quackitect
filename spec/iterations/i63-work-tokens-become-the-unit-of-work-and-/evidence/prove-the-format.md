---
form: prove-the-format
by: agent
signed_off: 2026-08-26T15:13:17.701Z
authors: agent
files:
---

# Evidence form / prove-the-format

## current_situation

The compiler was built and nothing was marked. So it had never read a real card, only invented text in its own test.

The owner's ruling sets the order: build the system, mark a FEW cards, check it works, then mark all of them. This is the middle step.

### The two cards that disagree

They were picked by measuring all 74 method cards rather than from memory. A script counted headings, top-level numbered items and top-level bullets on each.

The heading-stepped card is `deliverable/machines/methods/meth-decompose-structure.md`. It carries 10 headings and no numbered list.

The list-stepped card is `guidance/method/retro.md`. Its twelve steps are numbered list items under one heading, and it is the case that widened the mark beyond headings in the first place.

### One card was deliberately not picked

`meth-gate-review.md` has 17 headings and would have been the obvious choice. It is disqualified because this same session wrote 8 of them hours earlier.

Ruling on text you wrote in the same pass is the rule that card itself carries. Picking it would have proved the format against my own handwriting.

## built

TWO CARDS MARKED, 17 pieces of work between them, and the format holds on both shapes.

### The retro card: 12 pieces, all list items

Every one of the twelve numbered steps now carries the mark. Each body is bounded exactly where markdown bounds it.

The first step runs 2,644 characters and stops at the second. The eighth runs 5,289 and stops at the ninth. The twelfth stops at the heading below it.

Nested content stays inside its item. Step 3 carries a sub-list of four homes and step 1 carries a bullet list of five acts, and neither leaked out or minted anything of its own.

### The method card: 5 pieces, all headings, at two levels

Three are level-3 headings and two are level-2. Depth does not decide, and this is that claim measured on real text rather than invented text.

THE LEVEL-2 PARENT WAS LEFT UNMARKED ON PURPOSE. `## The three acts, in a loop` is framing prose that introduces the three level-3 acts. Marking it would have swallowed all three into one piece of work.

That is the format's most important property shown working: a parent stays prose while its children are work.

### The safety property, measured again

Of 74 method cards, exactly 1 yields work. The other 73 yield zero.

Nothing fell back to inference. An unmarked card reports nothing.

### What the format needed, and it was not obvious before

A MARKED LIST ITEM NEEDS A SHORT NAME ON ITS OPENING LINE. The retro's steps opened mid-sentence, so the first line was a wrapped fragment.

"MARK THE BOUNDARY, before anything else. Run se_log_query with" is not the name of a piece of work. It is the first 60 characters of one.

So marking a list item means rewriting its opening line. The name goes on the marked line and the rest moves into the body. The twelve steps now read as twelve names.

A HEADING ALREADY HAS THIS PROPERTY, which is why the problem showed up only on the list shape.

THE COMPILER DOES NOT ENFORCE IT. A long title compiles fine; it is simply a bad name. This is a rule for the hand doing the corpus pass, and it is written into the design spec rather than into a check.

### Where the evidence is

`scratchpad/shape-of-every-card.mjs` picked the two cards by measurement.

`scratchpad/prove-the-format.ts` runs the compiler over both and prints every piece with its line, shape, slug, title and body size. It also re-counts how many of the 74 cards yield anything.

## follow_up

The format is proven and the corpus pass is unblocked. Nothing here needs a decision.

### The bulk pass now has a rule it did not have

Marking a list item means rewriting its opening line into a short name. That is extra work per item, and it was not known when the chunks were sized.

It only bites on list-shaped cards. Of 74 method cards, 7 carry five or more top-level numbered items.

### The next chunk is the work store

`mark-a-card` and `prove-the-format` are both done, so the engine strand continues at the work store. The surface strand can start alongside it.

### Two reds still stand at HEAD

Neither is caused by this build and both are recorded with their measurements. They belong to `fix-findings`.

- The comment ratchet sits 3 above its ceiling in the tests tree.
- The read-once guard fails on a ceiling that scales with the filler count while the cost scales with the claimful state count.

## anything_else

THE SUITE IS UNCHANGED BY THE MARKING, and that is worth stating because it is the check a reader would ask for.

The battery was run before the two cards were marked and again after. Both runs report 1877 cases, 1875 pass, 2 fail, and the two failures are the same two with the same numbers: 207 against a ceiling of 204, and 898 against a ceiling of 800.

So marking real cards moved nothing that was already standing.

### One risk was checked rather than assumed

Editing anything under `guidance/` can make the prompt layer stale, and preflight goes red at the next verdict when it does.

`deliverable/engine/promptlayer.ts` line 14 names `guidance/method/lane.md` as the method card it projects. The retro card is not projected, so no repair is owed. Preflight is green in the run above.
