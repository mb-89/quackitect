---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: el-door-sweep
type: "[[element]]"
statement: The caller handed the whole tree, which judges every governed module against the rule and reports both the breaches it found and any class it could not check.
kind: existing
realization: reuse
group: the-door-regime
implements:
  - fn-govern-a-conversation-under-a-stated-rule.judge-each-governed-thing
satisfies:
  - req-sweep-covers-every-drift-class
  - req-first-green-needs-a-red
source_refs:
  - "[[cand-the-narrow-guard]]"
  - "[[raid-dec-one-rule-module-is-read-by-a-write-time-guard-and-a-sweep]]"
  - "[[raid-risk-the-sweep-s-own-runtime-has-no-criterion-watching-it]]"
  - deliverable/engine/bin/sweep.ts:94 — the standing call site
---

## What it does

It reads every module in the governed set, runs the rule's predicate over each,
and subtracts what the registry and the departure list account for. What is left
is the finding.

ITS REACH IS THE TREE, and that is the whole difference from
[[el-door-write-guard]]. Same rule, same lists, different reach.

## It reports coverage, not just breaches

A CLASS IT CANNOT CHECK REPORTS ITSELF UNCHECKED rather than passing in silence.
That is [[req-sweep-covers-every-drift-class]] and it is the axis where a
configured linter cannot follow: a linter lists violations, and a violation list
is not a coverage answer.

## Where it is stricter than the write guard, deliberately

The write guard lets a file through that ALREADY trips the predicate, so an
existing breach stays editable. This element has no such clause and reports
those files.

ONE RULE, ONE LINE OF DIFFERENCE. Permissive at the write, strict at the sweep.
Nothing here is a second rule.

## The red that comes before the green

A fixture module that violates the rule sits in the tree and is asserted to be
reported. That is what stops the rule's first green from resting on nothing.

IT IS AN ASSERTION AND NOT A RECORDED FAILING RUN, which is why the clean-context
scorer put this at 3 rather than higher.

## What crosses its boundary

- From [[el-door-rule]] — the predicate and both lists.
- To the account — the findings, and the classes that went unchecked.

## The cost nobody is watching

Measured twice during this record, on the same machine:

| date | nodes | time |
| --- | --- | --- |
| 2026-08-16 | 3053 | 974 ms |
| 2026-08-26 | 3092 | 1075 ms |

The sweep has crossed the one second the call bound uses as its reference, and
no criterion watches it.
[[raid-risk-the-sweep-s-own-runtime-has-no-criterion-watching-it]] carries that,
and adding a door rule to the sweep is exactly the kind of addition it warns
about.

## The window

A break that arrives without a write is invisible until this runs. The length of
that window is this element's interval, and nothing in this record sets one.
