---
template: item-stakeholder
artifact: node
id_prefix: stk-
folder: project/spec/trace/stakeholder
applies_rigor: [systematic]
applies_type: [default]
---

# stakeholder — one role the product serves or answers to

Lives in `project/spec/trace/stakeholder/`. A STANDING ARTIFACT, like every
node in the trace: it outlives the iteration that authored it.

ROLES, NEVER PERSONS. This is the privacy rule, and it is not a style
preference — a named person in the spec is personal data in a file that gets
published. "The adjudicator" and "the maintainer" say what a name would say
and stay true when the person changes.

A value prop names its audience here. A stakeholder with no value prop is a
role nobody is building for, which is worth noticing rather than hiding.

Id prefix `stk-`.

## Fields

- `id` (`stk-<slug>`): unique across the whole trace corpus.
- `type` (`stakeholder`): fixed.
- `statement` (one sentence): who this role is, in this project. Not a job
  title — what they are trying to get done.
- `interest` (0..1): how much the outcome matters to them.
- `influence` (0..1): how much they can change the outcome.
- `weight` (0..1): the project's own weighting of their concerns. It is the
  project's judgement, not theirs, and the two may honestly differ.

## Body

Their concerns, as a short list. What they need, what they fear, what they
will not tolerate. A value prop that serves this role should be traceable to
a line here.

## Example

```
---
id: stk-{{slug}}
type: "[[stakeholder]]"
statement: {{who this role is, in this project}}
interest: {{0..1}}
influence: {{0..1}}
weight: {{0..1}}
---

## Concerns

- {{what they need}}
- {{what they fear}}
```

## Mint skeleton

```skeleton
statement: TODO — who this role is, in this project
interest: 0.5
influence: 0.5
weight: 0.5
```
