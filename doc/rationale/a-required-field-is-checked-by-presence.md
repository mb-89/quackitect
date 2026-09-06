---
kind: [[rationale]]
title: a required field is checked by presence
explains:
  - src/engine/schema.go
---

## decided

A required field is satisfied when the frontmatter gives it, whatever shape the value has.
The check asks whether the key is given, and never asks a list for its string.
The shape is checked separately, where the property's type says what it is.

## why

The required check read each key as text.
A list answered nothing as text, so every required list was reported missing.
Measured: every rationale in this tree was reported as having no explains while carrying one, because explains is an array.
A required array could not be satisfied at all.
So the schema promised a field that nothing written could supply, and the lint went red on every note that obeyed it.

The cure was to separate the two questions.
Whether the key is given is one question, answered by presence.
Whether the value has the declared shape is another, answered by the property's type.
Each question has one place, and a field that is a list passes the first as easily as a string does.

## costs

A required field that is given and empty passes this check, and its emptiness is somebody else's finding.
A required list written as a string is reported as the wrong shape rather than as missing, which reads as a different fault.

## revisit when

- the frontmatter reader answers one typed value per key, so presence and shape can be asked in one call
- a required field is allowed to be empty by the schema, so emptiness needs a rule of its own
