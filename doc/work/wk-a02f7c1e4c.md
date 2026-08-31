---
id: wk-a02f7c1e4c
seq: "18"
type: work
title: answer before anything
status: submitted
assignee: main
scope: single-step
traced: true
disposition: done
rounds: "1"
minted_by: main
---

## detail

The engine can force the order rather than asking the agent to remember it. It writes the log, so it knows when the newest prompt has no answer after it. While that is true, the guard refuses every call and says: answer them first. This makes the order mechanical, which is the whole point: a rule the agent keeps is a rule the agent can forget.

## evidence: checked

source/engine/owed_test.go: TestAnObligationBelongsToOneAgent asserts a message to main is not owed by the reviewer, that the reviewer answering does not clear main's obligation, and that two agents can owe at once and each is told what it was told. TestOnlyTheEngineAnsweringEscapesTheRefusal runs four answering commands and six that answer nobody, including grep -rn '--answer', a heredoc carrying se_answer in its text, a commit message naming the flag, and se --said quoting it.

## evidence: checks

go test -count=1 ./... passes in source/engine (24.2s).

## evidence: proved red

I made TheyAsked write one key for everybody and TestAnObligationBelongsToOneAgent failed with 'a message to main is owed by the reviewer'. I put strings.Contains back into isAnswering and TestOnlyTheEngineAnsweringEscapesTheRefusal failed. Both restored, whole suite green.

## evidence: round 1 finding 1, the obligation was global

The finding was right. .se/owed.json held one flag for the whole project, so one message blocked every agent and any of them could clear it by answering. The reviewer showed the effect: one owner message blocked general-purpose-7 and main and drew three answers.

## evidence: round 1 finding 2, the escape was a substring

The finding was right: strings.Contains opened the guard for any command that merely mentioned the words, so grep -rn '--answer' source/ walked straight through. It now requires the program to be the engine and the flag to be an argument of its own. isTheEngine strips quotes and directories and matches se or se.exe. runsTheEngineWith looks for the flag among the words after the program, and accepts --answer=value as well as --answer value.

## evidence: scoped to the actor

source/engine/owed.go: Owed is now a map from actor to what was said. TheyAsked, TheyWereAnswered and AnswerOwed all take an actor. The guard passes the actor it already computes at hook.go:187. heard.go passes the actor whose call surfaced the message. The said and answer verbs take --actor, default main.

## evidence: the check goes where the defect is

My first version of that test called runsTheEngineWith directly, and it stayed green when I put the substring match back into isAnswering. That is exactly the rule the reviewing guidance now carries. It calls isAnswering with a hookIn, and with the substring version restored it fails on the first case.

## finding 1 · round 1 · It writes the log, so it knows when the newest prompt has no answer after it. While that is true, the guard refuses every call and says: answer them first. · by reviewer

**wrong:** THE OBLIGATION IS GLOBAL AND THE AGENTS ARE NOT. .se/owed.json holds one flag for the whole project. The Owed struct in owed.go is a single Said string with no actor, owedPath is r.Private("owed.json") with nothing per agent, and AnswerOwed(r Roots) takes no actor. So one message blocks every agent, and any agent answering clears it for all of them.

**satisfies:** SCOPE THE FLAG TO THE AGENT. Make .se/owed.json a map from actor to what was said, key it with the actor the guard already computes at hook.go:187, and have AnswerOwed take that actor. Then a message blocks the agent it was given to and nobody else, and only that agent answering releases it.

## finding 2 · round 1 · While that is true, the guard refuses every call and says: answer them first. · by reviewer

**wrong:** THE ESCAPE IS A SUBSTRING MATCH, so the guard opens for any command that merely mentions the words. hook.go:104 is `return containsAny(ti.Command, "--answer", "se_answer")`, and containsAny at hook.go:107-110 is strings.Contains. It does not parse the command, does not check the program being run, and does not require the token to be an argument.

**satisfies:** MATCH THE COMMAND, NOT THE TEXT. Require the answering call to actually be the engine answering: the tool name se_answer, or a command whose program is the se binary and whose argument list contains --answer as its own word. Splitting on whitespace and looking for an exact --answer argument is enough and is a small change from strings.Contains.

