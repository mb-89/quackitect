---
kind: [[guidance]]
scope: ["all output, agents and people"]
out_of_scope: []
depends_on: []
---

# Motivation

Agents tend to write slop.
The target audience are non-native speakers.
Their patience is limited.
Therefore, we need rules for terse prose.
Also, the vocabulary should be well defined.

This file contains rules that need judgement.
For mechanical rules, see [[util/voice-rules.json]].

# Actionables

1. One sentence, one idea. At most 25 words, preferably shorter. End lines on sentence ends. Avoid endlines within sentences.
2. One paragraph, one idea. At most 6 sentences. One newline between paragraphs.
3. Three or more parallel things are a list, each with its status, in a chat answer as in a file. *
4. BLUF: bottom line upfront, progressive disclosure: details come later, at the discretion of the reader.
5. Active voice. Name who acts. Present tense for everything except discussions. Past tense is allowed there.
6. Stakeholder-specific communication: do not leak internals, write what is relevant to the audience. For details, see [[doc/guidance/stakeholders]].
7. Use the same word for the same thing every time. For details, see [[doc/glossary]].
8. In general, with few exceptions: say what is. Do not say what is not, the list is endless. *
9. State a fact only if you own it. Otherwise name where it lives, via "For details, see [[link]]". *
10. Follow the technical English rules. For details, see [[doc/guidance/ASD-STE-100]].
11. DRY: do not repeat yourself. SPOT: single point of truth for every datum. A repetition in a spec, finding or answer is a defect. *
12. Do not put history in the current surface. It goes into git commit messages.
13. A number something else answers is never written down. The tree's count is the command that answers it. A list's count is the list. *

# Discussion

## 3. Lists

A paragraph that names seven things to do and two to decide is two lists wearing prose.
The reader has to count, and cannot tell at a glance which item has which status.
So parallel items go one to a line, with what stands against each: done, owed, or needing a decision.
This binds a chat answer as much as a note, because the reader is the same.

## 8. Absences

Strunk and White: make definite assertions, and use "not" for denial, never for evasion.
A negative is worth writing only where the reader would otherwise act on the opposite.
Those places are a refusal, a limit and a warning.

## 9. Authority, Links and provenance

Hunt and Thomas: every piece of knowledge has one authoritative representation.
Larman: the class that holds the information states it.
Page-Jones: values that must change together are bound to each other, and a document sits a long way from the code it repeats.
A test decides how many steps it runs.
A folder decides what is in it.
A document that repeats one of those makes a decision it does not own.

A case earns its place by teaching the reader something.
The token it happened on teaches nothing.
It goes stale when that token is retired, and it is a second copy of a record that nothing keeps in step.

A value in double brackets is a link.
The brackets are how it is shown and walked, and the name inside is the value, so `kind: [[guidance]]` and `kind: guidance` are one thing.
A link resolves as a path first and then as a note name, so both [[src/schemas/guidance.schema.yaml]] and [[voice]] reach what they name.

## 11. Say it once

No human writes walls of text, and a reader who meets the same sentence twice reads neither.
So a thing is said once, where the reader needs it, and a second copy is a defect rather than emphasis.
The copies drift.
A measurement written twice on one note was corrected in the copy a finding quoted.
The two totals then disagreed and named different worst cases.

A constant moved into config is the same: the prose that pins the number is a second copy.
So the paragraph states the rule, and the literal appears only in the config file.
A detail carries a word bound the schema enforces, so the judgement left here is what to cut, not how long to run.
Where a second mention is wanted, it names the first rather than restating it.

## 13. Counts

A count of files, tests, checks or tokens is true on the day it is written and wrong soon after.
Nothing tells the reader which day that was.
So the prose names the command: `ls`, `go test`, or the check that counts.
The reader runs it and gets today's number.
A measurement that argues a decision belongs in the commit or the retro, which are dated, and not on the surface.

A count of a list is the same fault, and it needs no time to go wrong.
A sentence saying four regions above a list of six hands the reader two answers.
The list is the one that cannot drift, because it is the items themselves.
So the sentence introduces the list, and the list says how many.