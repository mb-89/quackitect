---
kind: [[example]]
title: The listing shows the open work
keywords: ["branch", "list", "group", "open"]
interface: ["branch"]
---

A hand lists the work branches, and every open group stands in a row.

```sh
./RUNME.sh branch list
# expect: exit 0
# expect: says "work/g"
# expect: quiet "Nothing stands open"
```
