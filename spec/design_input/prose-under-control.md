# Prose under control

The owner's finding: some files are 70 percent fluff, and the guidance that
forbids it changes nothing.

This note holds the measurement, the ruling, and the shape of the answer.
The work is 26 tokens in `bucket: voice`, on the branch `group/voice`.

## What is wrong

Measured over 813666 words, excluding the `doc` mirror.

| class | count | detector |
|---|---|---|
| paragraphs opening in capitals | 4627 in 635 files | pattern |
| antithesis constructions | 3679 | pattern |
| comment lines as a share of code | 25.8 percent Go, 31.9 percent mjs | count |
| front-matter comments copying a schema description | 1756 in 300 notes | schema lookup |
| sentences standing in two or more files | 681 distinct, 5115 occurrences | hash |
| sentences over 25 words | 770 of 16437 | count |
| paragraphs over six sentences | 370 of 5427 | count |
| words in 17 tooltips | 516 | count |

## Why the rules do not hold

Four mechanisms, largest first.

The tree teaches louder than the prompt.
An agent reads the tree before it writes, and every file demonstrates the shape
the rules forbid.
59 rules stand against 4627 examples.

The gate covers markdown alone.
`isProse` at `src/engine/hook.go` line 1386 answers true for `.md`, `.markdown`
and `.txt`, so every comment in the tree is outside every check.

The rules file holds four patterns.
Voice rules 2, 3, 8, 11 and 13 are checkable and unchecked.

Two rules reach nothing.
Voice rule 10 links to `spec/guidance/ASD-STE-100` and rule 6 links to
`spec/guidance/stakeholders`, and neither file exists.

## The ruling

The owner rules:

- a shouted lead is forbidden everywhere
- code carries a header of two lines and no other comment
- a field whose schema describes it takes no comment
- the surface is present tense, and `spec/rationale` is where the past lives
- a repeated sentence is a defect
- the cost sits at the write path, so the agent learns from the refusal
- a block says how to write it instead
- the judge refuses, and refusing good prose sometimes is the accepted price
- `se format` fixes what a program can fix, and `se lint` reports the rest
- the discussion-to-rule ratio of 3.8 stands, held by the 1000-word cap

## The shape

Four layers, each resting on the one above.

**Doors.** `se format` fixes, `se lint` reports, and the write path refuses.
The rules live in one style folder and every door reads it.
The language server publishes each as a diagnostic, so the problems panel
carries what the battery carries.

**Rules.** Vale holds them, one YAML file per rule, in a style folder.
It reaches what a regular expression cannot: part-of-speech patterns, word
consistency across files, readability metrics and Tengo scripts.
It lifts comments out of source with tree-sitter, so it sees the 22635 comment
lines this tree's own check cannot.
A rule Vale cannot hold goes to the judge, and a rule needing the note's schema
stays in `ValidateNote`.

**Generators.** The engine writes 1756 comment lines and the token template
writes 5115 repeated sentences.
A generator that emits the fault teaches it faster than a rule forbids it.

**The judge.** `$.model.classify` answers one label for one span, on the
session's own client and the engine's small fast model.
It runs after the patterns pass, and it answers with a span, a verdict and the
sentence to write instead.

## The order

| layer | tokens |
|---|---|
| unblock | wk-b3d1f07a92, wk-e5a19c74b3 |
| rules | wk-f2b58d1c04, wk-a8471e3d65, wk-c40e28b6d1, wk-d92a5c1e73, wk-e17b40f9a5, wk-f58c31d0b7, wk-a7c04b1e92, wk-a6e9720c48 |
| generators | wk-b82f16ca30, wk-c05d34e8f1 |
| tense and links | wk-d71a90fb26, wk-e39c58d40a, wk-f60b47a1c9, wk-a04e6c8b53 |
| verbs | wk-b1e83f60d7, wk-c9f251a80b, wk-d3608ae5f1, wk-b60c927fa3 |
| guidance | wk-c1d8306e57, wk-d0f4a2b819 |
| the gate | wk-b5710de2f4, wk-c261f9a708, wk-d8305ea617 |
| surfaces | wk-e4926b0fd8 |

wk-b3d1f07a92 comes first because the installer derives its root two folders up
and now sits three deep, so no cold clone builds an engine.

No token carries `needs_human`.
The Go doc-comment question is settled: the tree carries no golangci
configuration, so no lint asks for one, and nothing outside this tree imports
`quackitect/engine`.

## Left out on purpose

Caveman.
It compresses a chat reply by dropping articles and grammar, which works against
the technical English rules and against a reader whose first language is another.

A retro.
No retro process exists, so `theVoiceOf` at `src/engine/retro.go` line 436
writes `voice.json` and nothing reads it.
The verbs are called by hand until one lands.

## What the guidance is for

`spec/guidance/engine_design_principles/guidance.md` rule 2 rules it already:
a rule a program can check is a check.

Classified over the 161 actionables:

| verdict | count |
|---|---|
| a gate the engine already makes | about 25 |
| a lint or a diagnostic finds it | about 62 |
| a formatter fixes it | about 4 |
| a person decides it | about 70 |

`spec/guidance/driving-the-engine.md` is the clearest case: 12 of its 15 rules
name a refusal the engine already makes.
`spec/guidance/software-development/writing-go.md` is the next: 14 of its 15 are
golangci-lint rules, and the tree carries no golangci configuration.

wk-d0f4a2b819 carries the pass, and wk-c1d8306e57 carries the configuration.

## This note

Every rule above holds here.
No paragraph opens in capitals, no sentence says what is not, no paragraph runs
past six sentences, and no sentence past 25 words.

Writing the tokens broke those rules 14 times before the fixes.
`.se/scratchpad/selfcheck.py` is what found them.
