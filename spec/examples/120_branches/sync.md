---
kind: [[example]]
title: A sync takes main into the work branch
keywords: ["branch", "sync", "main", "merge"]
interface: ["branch"]
---

A box takes `main` in before it works, so a late conflict costs nothing.

```sh
./RUNME.sh branch sync
# expect: exit 0
# expect: says "took 1 commit(s) from main"
```

A second sync finds nothing left to take.

```sh
./RUNME.sh branch sync
# expect: exit 0
# expect: says "already carries every commit on main"
```
