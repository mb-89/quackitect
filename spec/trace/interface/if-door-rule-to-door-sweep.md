---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: if-door-rule-to-door-sweep
type: "[[interface]]"
statement: The sweep asks the rule module what the rule is and what it governs, and is handed both as values it may read but never change.
source: el-door-rule
destination: el-door-sweep
carries:
  - flow-the-stated-rule
  - flow-the-governed-set
form: a call - three exported functions returning a predicate, a registry set and a departure set, all in process and all pure reads
bound: inherited — an in-process crossing has no clock of its own and is paid for by the sweep run that reached it
source_refs:
  - "[[raid-dec-one-rule-module-is-read-by-a-write-time-guard-and-a-sweep]]"
  - deliverable/engine/widgets.ts — surfaceFiles, exempted and emitters, the same three reads standing today
---

## Direction and cadence

ONE WAY. The sweep asks and the rule answers. The rule never calls back and
holds no reference to its callers.

ONCE PER SWEEP RUN. The predicate is then applied by the sweep across every
module in the governed set, so the crossing itself is cheap and the work after
it is not.

## What the sweep may do with what it gets

READ IT, AND NOTHING ELSE. The registry set and the departure set are handed
over as values. A caller that mutated either would change what the write guard
sees on its next call, and the two would then disagree about one rule.

## The bound, and why it is inherited

This crossing has no clock of its own. What has a clock is the sweep run around
it, and that has no bound today.

THAT IS RECORDED RATHER THAN HIDDEN.
[[raid-risk-the-sweep-s-own-runtime-has-no-criterion-watching-it]] carries it,
with two measurements: 974 ms over 3053 nodes, and 1075 ms over 3092.

## Failure behaviour

THE RULE CANNOT PARTLY ANSWER. Either it hands over a rule and both lists, or
the read of the departure file failed and the sweep is told so.

A SWEEP THAT CANNOT READ THE LISTS REPORTS ITSELF UNCHECKED rather than
reporting zero findings. Zero findings and no lists look identical from the
outside, and [[req-sweep-covers-every-drift-class]] is what forbids the second
one passing as the first.
