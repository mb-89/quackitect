---
kind: [[example]]
title: A set refuses a field the verbs own
keywords: ["ticket", "set", "state", "engine"]
interface: ["ticket set"]
edge: a field the schema marks for the engine
---

The state of a ticket moves through the pull alone, so a set naming it refuses.

```sh
./RUNME.sh ticket set alpha state closed
# expect: exit 2
# expect: says "state is the verbs' to write"
# expect: field alpha state open
```
