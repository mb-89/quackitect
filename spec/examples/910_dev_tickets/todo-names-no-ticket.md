---
kind: [[example]]
title: A todo takes a ticket, and names the one it fails to find
keywords: ["ticket", "todo"]
interface: ["ticket todo"]
edge: a todo naming no ticket, or one that stands nowhere
---

A todo naming no ticket refuses, and shows the call it needs.

```sh
./RUNME.sh ticket todo
# expect: exit 2
# expect: says "ticket todo needs a ticket: ./RUNME.sh ticket todo slow-lint"
```

A todo naming a ticket that stands nowhere names both folders it reads.

```sh
./RUNME.sh ticket todo nothing-here
# expect: exit 2
# expect: says "nothing-here names no ticket under .se/tickets or spec/tickets."
```
