---
kind: [[rationale]]
title: tokens are notes in two folders
explains:
  - src/engine/store.go
---

## decided

A token is a markdown note. Its frontmatter is what the engine reads. Its body is prose. A token lives under .se/work when it is private, and under doc/work when it travels. The minter decides which, and nothing moves it afterwards.

## why

The alternative was a record only a program can open. Somebody comes back to a piece of work months later and has to read it. So the body is prose and the file is markdown, and version control carries the tracked half for nothing.

Two folders rather than one field. What travels and what does not is the difference that matters here. A folder shows it to anyone listing the tree, and it cannot drift. A field saying the same thing would be a second answer, free to disagree with the first.

Neither folder is taken whole. The frontmatter is what makes a note a token. So somebody may keep their own notes beside them, and the engine reads none of those as work.

## costs

Moving a file between the folders changes what the engine believes about it, and nothing warns the person doing it. Two folders are two places to look when a token is missing. A tracked token is in git, so anything private written into one leaves the box.

## revisit when

- a third kind of token appears that is neither private nor tracked
- the record outgrows what one folder listing can be read at a glance
- private material is wanted inside a tracked token, which the folders cannot express
