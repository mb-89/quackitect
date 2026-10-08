---
kind: [[example]]
title: A todo puts a note at the front of the queue
keywords: ["ticket", "todo", "note", "queue"]
interface: ["ticket todo", "ticket note"]
---

A hand parks a note, then flags it, and the next pull hands it back first.

```sh
./RUNME.sh ticket note slow-lint "the lint runs slow on a cold box"
# expect: exit 0
./RUNME.sh ticket todo slow-lint
# expect: exit 0
# expect: says "the next pull hands it back first"
# expect: field slow-lint todo true
```
