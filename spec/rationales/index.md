---
kind: [[rationale]]
explains: [[spec/design_output/index]]
---

# Why

## 1. Why a session asks first

A walk over this tree costs what the tree holds, and it grows with the work. A
question to the index costs one lookup, because the rows carry the size, the
hash, the frontmatter and every line already.

## 2. What the index buys

| the question | the walk it replaces |
|---|---|
| what word stands where | a grep over every file |
| what reaches this note | a grep for the name, over every file |
| what reaches nothing | the same grep, once per note |
| what file matches this one | a read of every file, and a hash of each |

## 3. The files stay the truth

An index that answers as the truth is a second truth, and two truths drift. So
a reader meeting a stale index or none reads the files. The index earns its
place by answering faster, and it holds no authority beyond that.
