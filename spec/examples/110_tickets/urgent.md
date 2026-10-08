---
kind: [[example]]
title: An urgent mark flips on and off
keywords: ["ticket", "urgent", "mark", "flip"]
interface: ["ticket urgent"]
---

A hand marks a ticket urgent where a break stops work, so the pull hands it out first.

```sh
./RUNME.sh ticket urgent alpha
# expect: exit 0
# expect: field alpha urgent true
```

The same call takes the mark off again.

```sh
./RUNME.sh ticket urgent alpha
# expect: exit 0
# expect: quiet "urgent: true"
```
