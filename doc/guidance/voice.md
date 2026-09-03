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
10. Mark an estimate as an estimate. Say "I do not know" when you do not know.
11. Follow the technical English rules. For details, see [[doc/guidance/ASD-STE-100]].
12. DRY: do not repeat yourself. SPOT: single point of truth for every datum.
13. Private data: names, datetimes and unfiltered notes. They do not go into git.
14. Do not put history in the current surface. It goes into git commit messages.
15. A number about the tree is the command that answers it, never the answer. *

# Discussion

## 3. Lists

A paragraph that names seven things to do and two to decide is two lists
wearing prose.
The reader has to count, and cannot tell at a glance which item has which
status.
So parallel items go one to a line, with what stands against each: done, owed,
or needing a decision.
This binds a chat answer as much as a note, because the reader is the same.

## 8. Absences

Strunk and White: make definite assertions, and use "not" for denial, never
for evasion.
A negative is worth writing only where the reader would otherwise act on the
opposite.
Those places are a refusal, a limit and a warning.

## 9. Authority, Links and provenance

Hunt and Thomas: every piece of knowledge has one authoritative
representation.
Larman: the class that holds the information states it.
Page-Jones: values that must change together are bound to each other, and a
document sits a long way from the code it repeats.
A test decides how many steps it runs.
A folder decides what is in it.
A document that repeats one of those makes a decision it does not own.

A case earns its place by teaching the reader something.
The token it happened on teaches nothing.
It goes stale when that token is retired, and it is a second copy of a record
that nothing keeps in step.

A value in double brackets is a link.
The brackets are how it is shown and walked, and the name inside is the value,
so `kind: [[guidance]]` and `kind: guidance` are one thing.
A link resolves as a path first and then as a note name, so both
[[src/schemas/guidance.schema.yaml]] and [[voice]] reach what they name.

## 15. Standing counts

A count of files, tests, checks or tokens is true on the day it is written and
wrong soon after, and nothing tells the reader which day that was.
So the prose names the command: `ls`, `go test`, `se ask`, or the check that
counts.
The reader runs it and gets today's number.
A measurement that argues a decision belongs in the commit or the retro, which
are dated, and not on the surface.