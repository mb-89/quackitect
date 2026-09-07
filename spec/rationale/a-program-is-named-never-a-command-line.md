---
kind: [[rationale]]
title: a program is named, never a command line
explains:
  - src/engine/tools.go
  - src/engine/claim.go
---

## decided

A program is run by naming it and listing its arguments. A command line for a shell is never built. Where a line of text is unavoidable, the shell is named rather than assumed, and the escaping is written for that one. A path is never concatenated into a string something else will parse.

## why

Building a command line puts a parser between the intention and the act, and that parser differs from shell to shell.

An argument list arrives as written. Nothing splits it, nothing strips a quote, and nothing holds an opinion about a character in a path. Every path with a space, a quote or a drive letter breaks the moment something else gets to read it first.

The shells disagree, and quoting harder does not fix that. A PowerShell line beginning with a quoted path reads as a string rather than as a command. It needs a call operator no other shell wants. Quoting correctly for all of them at once is not a thing that exists.

A path concatenated into a string is the same rule one level down, and it is where the failure usually starts. By the time something parses that string the path is already broken, so the quoting was correct and the answer was still wrong.

## costs

Some interfaces take only a line, so those places carry escaping written for one named shell. That escaping is a thing somebody has to keep right. Naming a program also means the caller knows which program, so nothing can be assembled at run time out of text a person typed.

## revisit when

- an interface appears that takes only a line and cannot name its shell
- a program has to be chosen at run time from something a person typed
