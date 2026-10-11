---
kind: [[example]]
title: Small work takes the light route and knows when to stop
keywords: ["ticket", "pull", "trivial", "light", "stop"]
interface: ["ticket pull", "mint"]
---

A ticket minted with no `--process` takes the trivial route. Alpha names it on an old hash, so the pull takes the shipped route in and keeps the step.

```sh
./RUNME.sh ticket pull
# expect: exit 0
# expect: says "alpha at do, leaf 1 of 1"
# expect: says "stop when the tests cover every rule of the ask and pass, and leave working code alone"
```
