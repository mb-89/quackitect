---
kind: [[rationale]]
title: every token names its closer
explains:
  - src/processes/standard.process.yaml
  - src/engine/pull.go
---

## decided

A token names who closes it. Work steps close themselves, the human's tokens close themselves, and everything else defaults to the reviewer. Four eyes come from the field rather than from a rule anybody has to remember.

## why

Four eyes had to be structural. A rule saying somebody else should review is a rule an agent under pressure reads past. So the closer became a field with three cases: a named role, self for a work step, and the default for everything else.

The human's tokens close themselves because there is no higher authority to close them. That is what terminates the chain, and without it every closer needs a closer.

The reviewer may not reject the human's answer. A reviewer holds delegated authority over quality and the human holds original authority. An agent overruling the owner would be overruling the source of its own mandate. It may open a new token asking for clarification. That has the same practical effect and the honest semantics: the record shows a question rather than a repudiation.

Rejections are typed, and findings accumulate on the token across rounds. A fresh reviewer reads the token rather than a colleague's memory, so each round cannot reject for a new reason forever.

## costs

The closer is decided at minting, so work that turns out to need a second pair of eyes has already been given self. Bounded rounds mean a disagreement that deserved another round gets escalated instead. And an agent that cannot reject the owner can only stop, which is a blunt move where a conversation would serve.

## revisit when

- a work step is found that should not have closed itself
- escalation fires often enough that the round bound is the wrong number
- stopping is used where a reviewer should have been able to push back
