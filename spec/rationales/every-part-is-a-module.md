---
kind: [[rationale]]
---

# Why

The owner decided this for the model, and the decision is final. The index core
stayed dumb. Every part became a module: the ones that computed, the IO modules,
the config and the index's own management. A module flagged `io` alone
reached the outside world, one file each with its fake inside. An agent reads
this note before it asks again.

## 1. What it bought

| what the ruling gave | why |
|---|---|
| one way to register | every module registered its inputs, its outputs and its config alike |
| a core with nothing to know | it resolved, stored, handed out a snapshot, pushed and answered built-in values |
| config nobody listed by hand | the schema, the built-in values and the help came off the registrations |
| a test in memory | an IO module's fake answered, so a case touched no disk and no network |
| a new adapter as one more file | the index and the other modules stood as they were |

The input layer and `q.Given` left the core. An IO module wrote the names of
what came in the way any module wrote its outputs. So the core needed no second
path for them.

## 2. Why two passes

Modules loaded in any order, so a read named a name no module had registered
yet. A second pass, once every module had registered, closed those reads. A read
open after it was a bug, and the start refused loudly. A writer that registered and ran nowhere left no read open. A crash then showed
as a built-in value marked `not provided`, and no start failed for it.

## 3. What it gave up

A module could not reach the outside in one line, so a quick read of a file went
through `files/` or a request. A fake cost code a person kept in step. Its
contract suite paid for that, per [[spec/rationales/testing#13-a-fake-keeps-a-contract]].
State and debug stood in the contract before any code built them.

## 4. What would make it wrong

A name whose meaning the core had to know to store or hand it out, such as a
value too large to hand out whole. The core then learned that one thing, and the
ruling bent there.
