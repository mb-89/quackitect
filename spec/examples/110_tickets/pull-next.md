---
kind: [[example]]
title: A hand-back leaves a next line for the next hand
keywords: ["ticket", "pull", "next", "baton"]
interface: ["ticket pull"]
---

A box takes the leaf of alpha.

```sh
./RUNME.sh ticket pull
# expect: exit 0
# expect: says "alpha at do, leaf 1 of 1"
```

The box hands the leaf back with a line for a stranger. The leaf stays open, and the answer hands it out again with the line under it.

```sh
./RUNME.sh ticket pull alpha --fail "the parser half stands" --fields '{"tests": "echo green", "says": "the parser half"}' --next "the lexer waits"
# expect: exit 0
# expect: says "alpha at do, leaf 1 of 1"
# expect: says "The hand before left: the lexer waits"
```
