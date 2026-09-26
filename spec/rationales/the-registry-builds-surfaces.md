---
kind: [[rationale]]
---

# Why

The owner decided this for the model, and the decision is final. A module was
one file that registered itself. The registry built every surface: the command
line, HTTP, MCP, the hooks, the editor and the window. An agent reads
this note before it asks again.

## 1. What it measured

Adding a tool cost a verb, a tool spec and a handler, and each surface wrote its
own copy. The copies differed, as
[[spec/design_output/migration#the-duplications]] lists. One registration
reaching every surface removed the copies.

## 2. What it gave up

A surface could not special-case a name, so a screen needing a tweak for one
value declared it through `q.Show`. A surface's author worked through the
registry's shapes and wrote no handler.

## 3. What would make it wrong

A surface whose users needed a shape the registry could not declare, often
enough that the declarations grew into a second language. The registry then
cost more than the handlers it replaced.
