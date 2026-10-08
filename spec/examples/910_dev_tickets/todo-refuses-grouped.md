---
kind: [[example]]
title: A todo refuses a ticket a group carries
keywords: ["ticket", "todo", "group"]
interface: ["ticket todo"]
edge: a ticket riding a group
---

A ticket riding a group moves with its branch, so a todo on it refuses.

```sh
./RUNME.sh ticket todo alpha
# expect: exit 2
# expect: says "rides g, and that branch speaks for it already"
```
