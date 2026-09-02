---
id: wk-bc3c5ba905
seq: "-6"
type: work
title: a token carries done
status: imp_done
assignee: main
scope: multi-step
traced: true
disposition: done
subs:
  - wk-2d34b2e7f7
  - wk-7f0b46d99f
  - wk-6684401070
  - wk-c22f29af7b
  - wk-5d65092bbb
rounds: 3
minted_by: person
submitted_by: main
evidence:
  - outcome
---

## detail

A token carries the problem and a definition of done before anybody works on it, and a reviewer agrees the draft before the work starts. A token holds the problem, one-line criteria, and for each criterion that can be a command the command, which passes on exit zero. Two states go in front of open, spec and spec_in_review, for everything a person mints and everything an agent mints that is not a sub-token. The engine refuses a token in spec as work, a spec with no criteria, a failing command criterion, and a rejection without a lesson token. Every rejection names the clause, what is wrong, what would satisfy it, and the class with how to avoid it. The reviewer mints the lesson token with se work and names its id in learned, since the engine cannot judge the class.

## evidence: outcome

spec and spec_in_review live in token.go and pull.go routes them, and StartsAt and NeedsSpec in spec.go let a sub-token skip the draft. rejectionIsWhole in src/engine/pull.go refuses three ways with its own words each. KeepLesson in src/engine/lesson.go writes the lesson onto the named token. doc/guidance/specifying.md carries the Prior art section naming Fit, FitNesse, specification by example, the three amigos and behaviour-driven development, and doc/guidance/reviewing.md says who mints the lesson. Tests in src/engine/spec_test.go cover the gates and bash util/checks/battery.sh answers all ok.
