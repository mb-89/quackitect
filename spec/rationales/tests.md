---
kind: [[rationale]]
explains: [[spec/guidance/code/tests]]
---

# Why

A test audit of the Go and JavaScript suites found the same pile three ways. Parity golden files held the live code to code nobody ran. One registers test stood for each verb, and one wiring test for each topic. Tests of dead code kept running in every check. A group then deleted them, and these rules keep the next box from writing them again.

## 1. A behavior tested once

A second test of one behavior failed on the same edit as the first. The branches native tests and the port suites asserted the same verbs over the same real clones, so every change to a verb paid twice. The command line is the outermost interface a user meets, so an example there teaches and checks at once. For the examples, see [[spec/guidance/code/examples]]. An edge the command line cannot reach takes the module's ports, which keeps rule 15 of [[spec/guidance/code/testing]] whole.

The strongest objection: a test at the command line runs slower than one at a module. The answer is that one test at the command line replaces several below it, and the module keeps the edges alone.

## 2. One layer, one language

The draft cases ran in full at the module and again through the wired quack. The review cases ran in Go and again in JavaScript. Each pair failed together, and a fix to one copy left the other stale. The contract suite stays the one table that runs twice, because it holds a fake to the real thing.

## 3. Tests leave with code

The JavaScript audit found whole test files over modules no entry loaded. They passed over code nobody ran, and a reader took them as proof the code mattered.

## 4. Comparisons leave at switches

Every migration phase stood switched on, and the twin goldens, the shadow rows and the removal guards still ran. Phase three's done-when said no JavaScript twin of a Go check stands, and the twins stood anyway. A rule over every phase holds where a done-when line slipped.

## 5. Golden files pin behavior

| the golden file | what it held | what it cost |
|---|---|---|
| `size.golden.json` | each file past the line ceiling with its count | most of its commits changed it and at most one other file, a hand counting again |
| `tree.golden.json` | the Ask and the standing of every ticket on disk | two tickets of its own, and noise in every search of an Ask |
| the other twin golden files | each Go check beside its JavaScript twin | the only test several Go rules had |

A golden file holding incidental output failed on an unrelated edit. The file ceiling covers code files alone, so a prose file growing no longer moves a test.

## 6. Tests stay under code

The window package held ten lines of test for each line of code, because the root package tested its subpackages. Fixtures count, since a frozen copy of the tree costs a reader as much as a test does. A module past the ceiling holds copies of one behavior. The ceiling stays a reading for the retro audit until a command answers it.

What would make these rules wrong: a module whose edges outnumber its lines, such as a parser, which needs more test than code. Its retro finding then names the edges, and the ceiling bends for it.
