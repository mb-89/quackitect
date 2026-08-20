---
template: item-stakeholder
artifact: node
id_prefix: stk-
folder: spec/trace/stakeholder
sections:
  - Concerns
applies_rigor:
  - systematic
applies_type:
  - default
---

# stakeholder — one role the product serves or answers to

Lives in `spec/trace/stakeholder/`. A STANDING ARTIFACT, like every
node in the trace: it outlives the iteration that authored it.

ROLES, NEVER PERSONS. This is the privacy rule, and it is not a style
preference — a named person in the spec is personal data in a file that gets
published. "The adjudicator" and "the maintainer" say what a name would say
and stay true when the person changes.

A value prop names its audience here. A stakeholder with no value prop is a
role nobody is building for, which is worth noticing rather than hiding.

How the fields below are decided is [[meth-stakeholder-analysis]].

## The template

A new stakeholder is seeded from this fence. Replace every comment with the
real content.

```skeleton
---
# The engine writes id and the type link. id is stk- plus a slug, unique
# across the whole trace corpus.
#
# Who this role is, in this project. Not a job title — what they are trying
# to get done.
statement: TODO — who this role is, in this project
#
# Which always-on class this role is an instance of, or the word own for a
# role this project carries that no class covers. The register is in the
# method card.
role_class: TODO — acquirer | user | newcomer | communicator | assessor | project-owner | agent | own
#
# What kind of power the role holds, from the DICET set.
#   decider    — formal power, holds the budget
#   influencer — informal power
#   customer   — provides requirements
#   expert     — holds the know-how
#   team       — will work on the thing
dicet: TODO — decider | influencer | customer | expert | team
#
# How the role STANDS toward the effort.
#   ++ wins if you win
#   +  gains something
#   0  neither
#   -  pays something
#   -- loses if you win
# An antagonist gets a root cause recorded in Concerns, never a route around.
disposition: TODO — ++ | + | 0 | - | --
#
# How much the outcome matters to them, 0 to 1.
interest: TODO — 0 to 1
#
# How much they can change the outcome, 0 to 1.
influence: TODO — 0 to 1
#
# The project's own weighting of their concerns, 0 to 1. It is the project's
# judgement, not theirs, and the two may honestly differ.
weight: TODO — 0 to 1
---

## Concerns

<!-- What they need, what they fear, what they will not tolerate. One bullet
each. A value prop serving this role should be traceable to a line here. An
antagonist's root cause belongs here too. -->
```
