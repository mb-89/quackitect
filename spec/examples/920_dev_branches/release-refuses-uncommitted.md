---
kind: [[example]]
title: A release refuses a tree with uncommitted work
keywords: ["branch", "release", "uncommitted"]
interface: ["branch", "ticket set"]
edge: an uncommitted change on the branch a release names
---

A change no commit carries stops every move of a branch, so the release refuses.

```sh
./RUNME.sh ticket set alpha urgent true
# expect: exit 0
./RUNME.sh branch release
# expect: exit 2
# expect: says "carries uncommitted changes"
```
