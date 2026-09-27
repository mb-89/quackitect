---
kind: [[rationale]]
---

# Why

The owner decided this for the model, and the decision is final. A provider or
an action declared its inputs as a struct, took one snapshot, ran pure, and
answered one commit. An agent reads this note before it asks again.

## 1. What it bought

Declared inputs made the wiring known before anything ran, so `quack why`
answered a name's provider, inputs and readers off the registrations. A pure run
tested with a struct and no index. One snapshot meant a run read every input at one
revision.

## 2. What it gave up

A provider could not ask for a value it learned it needed halfway. It declared
every input up front, and a run read inputs it sometimes ignored. A change
during a run cost the next run.

## 3. What would make it wrong

A provider whose inputs depended on the values of its inputs, so the struct had
to name everything reachable. The snapshot then grew past what one round trip
carried. A lazy read at that point beat a pure run.
