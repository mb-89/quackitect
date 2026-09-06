---
kind: [[guidance]]
scope: ["a body of work tokens, and how one is cut out of it"]
out_of_scope: ["what a single token contains and how it is worked"]
depends_on:
  - "[[work-token]]"
  - "[[voice]]"
  - "[[behaviour]]"
---

# Motivation

One token is one piece of work, and the project is a body of them.
What a single token holds and how it is worked is [[work-token]], and this file rests on it.
Here is the other question: where one token ends, what it may rest on, and which group it belongs to.

A backlog nobody cuts becomes a few tokens too large to review and too vague to decide.
A backlog nobody files becomes a queue a person cannot narrow, so an agent cannot be pointed at one thing.
Both are found late, when the work is already in a hand.

The engine's own doors for minting, claiming and pulling are [[driving-the-engine]].
Which token to write, and where it goes, is judgement, and it is here.

# Actionables

1. One token, one piece of work. One command decides one sentence. A done-when needing "and" is usually two tokens. *
2. Number what the detail says the change does and put a criterion against each. Work that moves off takes its criteria with it. *
3. Before a feature, name the basics it stands on. Mint the missing one first. *
4. A small fix is a trivial token. A note needs a decision first. Everything else is tracked or local, and tracked names no local. *
5. A bug found while working a bucket is filed into that bucket, and worked at once where it is trivial. *

# Discussion

## 1. Where one token ends

A done-when joined by and is two sentences, and one command decides neither.
The join is the tell, because a reviewer then has to agree with both halves at once to agree with either.

Splitting early costs a mint.
Splitting late costs the review, and a token that cannot be reviewed is worked twice.

This file is the worked example.
Sixteen rules stood in one chapter against a cap of fifteen, and the answer was two chapters rather than a shorter rule.

## 2. Every item the detail names

On a rewrite, add a delete criterion for every sentence the detail calls the problem.
A scope decision once moved work away in prose while three criteria still asked for it.
Move the criteria first, then write the sentence saying where they went.
A spike closes on its own numbered questions, including those it declines, and a mechanism it turns up is its own token.

## 3. Basics first

The basics look self-evident, so nobody writes them down, and the gap is found after the feature.

## 4. Tracked is claimable

A note is private, because nobody has decided what it is yet.
The minter says which, and there is no default.
Tracked is doc/work, which git carries, so another box can claim it.
Local is .se/work, which nothing else reaches.
The question is who can pick it up, not how big it is.

A cloud box reads the tree out of git, where .se/work is not, so a local id there is a broken link.
A local token naming a tracked one is fine.

## 5. A bug found in the bucket

The finder already holds what the fix needs: the file, the reading, and why it matters.
Filed somewhere tidier, the next hand pays for that reading again.
The bucket a person is draining also loses work that belongs to it.
A token minted with no bucket is invisible to a narrowed queue, so the finder cannot be handed it back.

THE OWNER'S RULING: put it in the bucket you are working, pull it at once, and fix it first.
That is preferred over leaving it for a hand that has to rediscover it.

The bound is triviality.
A fix you can make right away is yours to make.
A big one is filed with everything you learned, and left.
