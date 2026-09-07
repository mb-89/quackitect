---
kind: [[rationale]]
title: a section may name a prefix
explains:
  - src/engine/schema.go
---

## decided

A schema section names either a whole heading or the prefix a family of headings shares.
A prefixed section matches every chapter whose heading starts with it, and each matched chapter is held to that one section's bounds.

## why

The work token carried one evidence chapter per activity of its process.
There was evidence: write, evidence: decide, and as many more as the process declared.
A schema naming each heading whole would have named them all, once per process, and again whenever a process gained an activity.
A schema that has to be edited when a process changes is one that falls behind the process.

The part that varied was the process's, and the part that did not was the schema's.
So the schema names the part that does not vary, and the reader matches on it.
The token store weighs its chapters the same way, so a refusal at the save and a finding in the editor name the same section.

## costs

A prefix matches a heading nobody meant, so a chapter whose heading merely starts with evidence is read as evidence.
Strict order sees every matched chapter under one section, so a family of chapters may not be split by another chapter.

## revisit when

- the schema can read a process's activities and write one section for each, so a prefix is no longer needed
- a heading that starts with a prefix and means something else is found in the corpus
