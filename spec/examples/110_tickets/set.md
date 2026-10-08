---
kind: [[example]]
title: A set writes one field of a ticket
keywords: ["ticket", "set", "field", "front"]
interface: ["ticket set"]
---

A hand writes one field of a ticket's front, and the schema weighs the value first.

```sh
./RUNME.sh ticket set alpha urgent true
# expect: exit 0
# expect: says "carries urgent: true"
# expect: field alpha urgent true
```
