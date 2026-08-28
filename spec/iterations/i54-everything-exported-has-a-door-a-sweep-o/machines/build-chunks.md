---
steps:
  - id: the-rule-states-a-conversation-once
    statement: One module holds each conversation's rule and answers three questions about it - does this text reach the capability, which modules reach it, and which are recorded as departures with their reasons
    depends_on: []
    realization: code
  - id: the-departure-list-exists-and-can-be-read
    statement: A departure list stands as a file a person edits, its shape says path then dash then reason, and a line with no reason means nothing is exempt
    depends_on: []
    realization: document
  - id: a-reach-nobody-declared-is-refused
    statement: A write that turns a quiet module into one reaching a governed conversation is refused, the refusal names the file and hands back the patch that declares it, and a file that already reaches stays writable
    depends_on:
      - the-rule-states-a-conversation-once
    realization: code
  - id: a-departure-with-no-reason-is-refused
    statement: A write adding a departure line that carries a path and no reason is refused, naming the file, the line and the offending path, with whitespace counting as no reason
    depends_on:
      - the-rule-states-a-conversation-once
    realization: code
  - id: the-entry-points-are-counted-from-the-source
    statement: Every file a person can run is enumerated by walking the tree, the hand-written list of six stops being the answer, and each entry point no surface reaches is named
    depends_on:
      - the-rule-states-a-conversation-once
    realization: code
  - id: the-sweep-reports-every-undeclared-reach
    statement: The whole-tree sweep asks the rule module the same questions the write guard asks and reports every module reaching a conversation without a declared departure
    depends_on:
      - the-rule-states-a-conversation-once
    realization: code
  - id: the-write-path-calls-both-refusals
    statement: The lane's own write path calls both guards, with no condition of its own around them, so nothing in the caller can turn a rule off
    depends_on:
      - a-reach-nobody-declared-is-refused
    realization: code
---

# The build drawing

Seven chunks in two strands. They fan out where nothing connects them, and the join waits for every one.

## Which lenses shaped the order

TWO, AND THEY DISAGREE ABOUT WHAT COMES FIRST. Both are recorded rather than one being tidied away.

### Risk first says the reason refusal

The reason demanded per departure is the whole differentiator. Six systems were compared and none of them does it, so it is the one part that cannot be bought.

It is not first, because it cannot be. It reads the rule module, and a refusal with nothing to refuse against is not a chunk.

### Spine first wins, and it wins on a measurement

`exp-does-one-rule-fit-all-four-conversations` probed whether one rule governs four conversations at all. It holds by 8 modules out of 178, which is thin.

A rule module that turns out not to fit would make every later chunk wrong. So the thinnest slice that proves the shape goes first, and the differentiator goes second.

### Parallel flow shapes the rest

The departure list is a markdown file a person edits. It leans on nothing, so it runs beside strand one from the start.

After the rule module, four chunks each lean on exactly ONE earlier chunk. That is the shape the card asks for rather than a chain queueing behind itself.

Only the write-path wiring leans on a second-level chunk, and it leans on one.

## What flows across each edge

The check the card asks for, per edge. An edge carrying nothing is dropped.

- Rule module to each refusal: the predicate, the departure list reader, and the door lookup.
- Rule module to the entry-point count: the tree walker and the root parameter.
- Rule module to the sweep: the same three answers, asked of the whole tree instead of one file.
- The reach refusal to the write path: one function with the signature `files.ts` already calls for the widget guard.

## What is NOT in this drawing, and why

THE OUTWARD DOOR. The sixth kickoff goal asks for a central door for reaching outward, with guidance for a search and a place results are kept.

The prototype gate logged that as its second dissent: that goal is served by a count of 17 modules and nothing else, with no spike aimed at it. Seeding chunks for a design nobody probed would build on the same kind of premise this record has already had to correct four times.

It waits for the owner's word, and the gate says so.

THE RATCHET. 81 modules reach the disk conversation today and nothing here moves them in stages. That is registered, and the register entry names the specific trap of answering it by folding a frozen set into the departure list.

## What the first chunk must NOT do

It refuses nothing. `el-door-rule` states that in as many words, and the two refusals are separate chunks for that reason.

The worked example does not have this split. `deliverable/engine/widgets.ts` holds its guard beside the rule it reads, and this drawing improves on it there.
