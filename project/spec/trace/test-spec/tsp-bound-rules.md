---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: tsp-bound-rules
type: "[[test-spec]]"
statement: A rule written beside the thing it governs enforces itself with no engine file changed, and a rule that can never fire is reported as unbound rather than passing green.
method: "test"
verifies:
  - "req-a-check-binds-without-engine-code"
  - "req-an-unbound-rule-is-reported"
files:
  - "tests/boundrules.test.ts"
---

## Scope

The binding half. Where a rule LIVES, and whether it can be told apart
from a rule that never ran.

## Approach

COMPONENT LEVEL, AND THE ASSERTION IS PARTLY ABOUT THE REPOSITORY. The
no-engine-code claim cannot be made by inspecting behaviour alone, so the
case takes a `git status` over `project/deliverable/engine` before and
after arming a rule, and demands they match.

THE FALSIFIABLE FORM IS THE SECOND CHECK, NOT THE FIRST. Anybody can
build one check by writing engine code for it. These cases arm a rule
from a node that the fixture itself writes, which is the second check by
construction — the engine ships knowing nothing about it.

THE UNBOUND CASE NEEDS TWO RULES, not one. A single unbound rule proves
only that something was reported. Two rules — one bound and satisfied,
one bound to nothing — prove the report tells them apart, which is the
whole demand.

## Steps

Every case in the referenced file is one step; the case name states its
claim. The load-bearing steps:

- A RULE WRITTEN INTO A NODE FIRES ON THE NEXT WRITE. The fixture arms
  it, breaks it, and the break is refused.
- NO ENGINE FILE CHANGED. `git status` over the engine folder is
  byte-identical before and after.
- THE REFUSAL NAMES THE NODE THE RULE CAME FROM, so a reader can go and
  argue with the rule rather than with the engine.
- A RULE BINDING TO A MISSING NODE IS REPORTED AS UNBOUND, by the sweep,
  naming what it bound to.
- EXACTLY ONE OF TWO RULES READS AS UNBOUND. The satisfied one does not,
  and a green that cannot separate never-violated from never-ran is the
  defect this row exists for.

## What the cases assume about shape

THE RULE'S SHAPE IN FRONTMATTER IS THE FIXTURE'S GUESS — a `rules:` list
with `key`, `allows`, `binds` and `on_break`. The requirement demands
that a rule binds to a named node without engine code; it does not
demand these key names.

IF THE BUILD PICKS A DIFFERENT SHAPE, these cases change with it and the
claims do not. That is stated here so a later reader does not read the
fixture as the specification.
