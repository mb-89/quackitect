---
kind: [[example]]
title: A pull hands out the next leaf
keywords: ["ticket", "pull", "leaf"]
interface: ["ticket pull"]
---

A box pulls, and the engine hands it the first leaf of its group.

```sh
./RUNME.sh ticket pull
# expect: exit 0
# expect: says "alpha at do, leaf 1 of 1"
```
