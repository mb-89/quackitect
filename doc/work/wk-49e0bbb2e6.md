---
id: wk-49e0bbb2e6
seq: 1000169
type: work
title: a borrowed counter
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: rev-17
---

## detail

A design that needs a new count reuses an existing field without asking what already reads that field. Found on wk-925ca24643: the ladder counts consecutive failures per half and resets on an accept, reading Token.Rounds. Token.Rounds in src/engine/token.go is incremented in src/engine/pull.go on both rejection paths and never reset, and everyFindingAnswered gates on f.Round != t.Rounds. Resetting or splitting it breaks that gate while every criterion on the token stays green. Before agreeing a sentence that reuses a field, grep every read of it and write down what each reader assumes. Name what the count is per and when it resets before choosing its home, and say in the same sentence why each existing reader survives.
