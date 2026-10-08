---
kind: [[example]]
title: Urgent names the ticket it fails to find
keywords: ["ticket", "urgent"]
interface: ["ticket urgent"]
edge: a ticket name that stands nowhere
---

An urgent naming no ticket refuses, and shows the call it needs.

```sh
./RUNME.sh ticket urgent
# expect: exit 2
# expect: says "ticket urgent names no ticket: ./RUNME.sh ticket urgent slow-lint"
```

An urgent naming a ticket that stands nowhere refuses the same way.

```sh
./RUNME.sh ticket urgent nowhere
# expect: exit 2
# expect: says "nowhere names no ticket: ./RUNME.sh ticket urgent slow-lint"
```
