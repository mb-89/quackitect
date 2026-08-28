---
id: pointing-keys
statement: Which node type each pointing key is allowed to name, drawn from what the corpus already does.
---

# pointing-keys — what each key is allowed to point at

## What this file is for

A NODE POINTS AT OTHER NODES THROUGH A SMALL SET OF KEYS. `satisfies` names a
requirement. `probes` names a raid entry. `cluster` names a cluster.

NOTHING CHECKED THAT UNTIL NOW. A key could name any node of any type, and the
only guard was that the target existed at all. So `satisfies: sty-something`
resolved, passed, and meant nothing.

THIS FILE IS THE MAP, and the conformance sweep reads it. A key naming a type
the map does not allow becomes a finding, so the rule is met through a refusal
rather than by browsing.

IT IS THE FIRST PIECE OF THE TEMPLATE SCHEMA. The node types themselves are
declared one per file in this folder. How they connect had no home, and this
is it.

## Where the map came from

IT WAS MEASURED, NEVER INVENTED. Every pointing key in `spec/` was counted
against the type of what it resolves to, over 2117 typed nodes.

NINE OF TWELVE KEYS WERE ALREADY UNIFORM. They point at one type, or at a
small named set, with no exceptions at all. Those rows are the corpus stating
its own rule, and the map only writes it down.

THE COUNTS ARE IN EACH ROW so a reader can weigh the rule. A row resting on
eight uses is weaker evidence than one resting on 427, and the map says which
is which rather than presenting both as settled.

## How to read a row

    - <key>: <type>, <type> — <what the count was>

`any` IN PLACE OF A TYPE LIST MEANS THE KEY IS DELIBERATELY GENERAL. It is
checked for existence and never for type.

A KEY WITH NO ROW IS NOT CHECKED. That is the safe default: a new key starts
unchecked and earns its row when somebody measures it.

## How to change one

MEASURE FIRST. The claim in a row is about the corpus, so it is falsifiable,
and re-running the count is the way to falsify it.

WIDENING A ROW IS CHEAP AND NARROWING IT IS NOT. Adding a type the corpus
already uses fixes a false finding. Removing one turns real nodes red, so it
belongs in a record that also repairs them.

## The rules

TWO ROWS REST ON TOO LITTLE TO RULE, and they say so rather than pretending.
`weighs_against` has five uses across two types, and `picks` has eight. Both
allow what the corpus does today.

ONE KEY POINTS AT NOTHING TYPED AT ALL. `depends_on` resolved to zero corpus
nodes in the count, because it names states and files rather than nodes. It
gets no row and stays unchecked.

<!-- rules below this line -->
- refines: use-case, story, value-prop — 432 use-cases, 77 stories, 65 value-props, no other type.
- satisfies: requirement — 427 uses, every one of them a requirement.
- verifies: requirement — 367 uses, every one of them a requirement.
- cluster: cluster — 167 uses, every one of them a cluster.
- realizes: interface, element — 89 interfaces and 63 elements, no other type.
- implements: function — 80 uses, every one of them a function.
- probes: raid — 49 uses, every one of them a raid entry.
- demonstrates: story — 47 uses, every one of them a story.
- weighs_with: raid, requirement — 17 raid entries and 1 requirement, which is the outlier rather than the rule.
- picks: option — 8 uses, every one of them an option, and eight is thin evidence.
- weighs_against: requirement, raid — 3 requirements and 2 raid entries, too few to draw a rule from.
- source_refs: any — 1306 uses across 18 types. It is the general provenance key and takes anything.
