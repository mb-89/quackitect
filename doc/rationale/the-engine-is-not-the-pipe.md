---
kind: [[rationale]]
title: the engine is not the pipe
explains:
  - src/engine/gate.go
---

## decided

A command that is only the engine goes through the write gate.
A pipe, a redirection, a second command or a substitution takes it back out.
The refusal says which of those did it, and names the flags that replace a pipe.

## why

The exception this gate always meant to have was written and wired to one caller.
So a pull at a shell was refused, and a pull is how an agent gets the id the refusal demands.
It only bit with no lane up.
With the lane, the same verbs are lane tools and never reach a shell.
A cloud box clones, and whatever lane file the clone carries is the lane for that whole session.
Get it wrong once and the agent has no first move at all, which is where this was measured.

The refusal also answered the wrong question.
A help command piped into head came back talking about naming a token.
A cloud agent read that as the engine itself being refused, and spent several calls on that reading.
The engine was not refused. The pipe was, because a pipe can write.

What disqualified a command is read off the same walk the exception reads.
One function answers both readings of the command, so a second parse cannot disagree with the first.

Two verbs once took their payload on standard input.
The only form of them a session knew was the form the guard refuses.
A lane failure then cost that session every write rather than some convenience, so each has a flag now.

## costs

A command that runs the engine and nothing else is trusted on the strength of its first word.
The quoting is read twice, once for the walk and once for the message.
An agent still cannot pipe the engine's output, which is the shell's most ordinary move.

## revisit when

- the engine can say what a command writes, so a pipe stops being a reason to refuse
- another verb needs its payload on standard input, and a flag stops being enough
