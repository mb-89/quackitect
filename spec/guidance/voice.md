---
kind: [[guidance]]
scope: ["all output, agents and people"]
out_of_scope: ["the mechanical rules, which the style folder holds"]
depends_on: [[[spec/guidance/guidance]]]
---

# Motivation

Agents tend to write slop.
The audience are non-native speakers and their patience runs short.
So the prose stays terse and the vocabulary stays settled.

This file holds the rules that need judgement.
A rule a program can hold belongs to that program, so it leaves this file.
For the mechanical rules, see [[spec/config/styles/VoiceQuackitect]].

# Actionables

1. Three or more parallel things are a list, each with its status, in a chat answer as in a file. *
2. Bottom line up front. The detail comes later, at the reader's discretion.
3. State a fact only if you own it. Otherwise name where it lives: "For details, see [[link]]". *
4. Use the same word for the same thing every time.
5. Write what the audience needs and leak no internals.
6. Say a thing once. A repetition in a spec, a finding or an answer is a defect. *
7. History belongs in the commit message and stays off the current surface.
8. A number something else answers stays out of the prose. The tree's count is the command that answers it. *
9. A compression against a cap lists what it cut, each sentence surviving elsewhere or cut on purpose.
10. Vale holds the mechanical rules and refuses at the write door. Read its message and hold that rule for the turn.

# Discussion

## 1. Lists

A paragraph naming seven things to do and two to decide is two lists wearing prose.
The reader has to count, and cannot tell at a glance which item has which status.
So parallel items go one to a line, with what stands against each: done, owed, or needing a decision.
This binds a chat answer as much as a note, because the reader is the same.

## 3. Authority and provenance

Every piece of knowledge has one authoritative representation.
The thing that holds the information is the thing that states it.
A test decides how many steps it runs, and a folder decides what is in it.
A document repeating one of those makes a decision it does not own.

A value in double brackets is a link.
The brackets say how a reader sees it and how the engine walks it, and the name inside carries the value.
A link resolves as a path first and then as a note name.

## 6. Say it once

A reader who meets the same sentence twice reads neither.
So a thing is said once, where the reader needs it, and a second copy is a defect.

The copies drift.
Somebody corrected a measurement in the copy a finding quoted, and left the other copy alone.
The two totals then disagreed and named different worst cases.

A constant moved into config is the same: the prose pinning the number is a second copy.
So the paragraph states the rule and the literal appears only in the config file.
A second mention names the first.

## 8. Counts

A count of files, tests or rules holds on the day somebody writes it and rots soon after.
Nothing tells the reader which day that was.
So the prose names the command and the reader runs it.

A count of a list is the same fault and needs no time to go wrong.
A sentence saying four regions above a list of six hands the reader two answers.
The list cannot drift, because it is the items themselves.

## 10. Why the mechanical rules left this file

Fourteen rules stood here once and a program could hold half of them.
An agent reading fourteen rules gives each less attention than it would give ten.
A rule the write door already refuses teaches nothing by standing here too.

So each rule a pattern can hold moved to the style folder, where Vale holds it.
What remains needs a person or a model, and that is the whole of this chapter.
