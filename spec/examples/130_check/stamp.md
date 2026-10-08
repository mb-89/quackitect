---
kind: [[example]]
title: A fresh build answers its stamp fresh
keywords: ["stamp", "fresh", "index", "build"]
interface: ["stamp"]
---

The install asks the stamp beside the index binary whether it holds the hash of the source. Where it does not, the install builds the index again.

```sh
./RUNME.sh stamp fresh se-index
# expect: exit 0
./RUNME.sh stamp
# expect: exit 2
# expect: says "stamp answers fresh or write, over se-index."
```
