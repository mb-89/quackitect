---
kind: [[example]]
title: The tests-green hand-out names the ask and the floor
keywords: ["ticket", "pull", "tests-green", "ask", "floor"]
interface: ["ticket pull"]
---

A box takes the leaf of alpha.

```sh
./RUNME.sh ticket pull
# expect: exit 0
# expect: says "alpha at do, leaf 1 of 1"
```

The box passes alpha, and the answer hands out beta at tests-green. The leaf makes the change the ask names, and reads the red tests as its floor.

```sh
./RUNME.sh ticket pull alpha --pass --fields '{"tests": "echo green", "says": "the change"}'
# expect: exit 0
# expect: says "beta at implement/tests-green"
# expect: says "makes the change the ask names, with the red tests as its floor"
```
