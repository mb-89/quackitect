---
template: item-value-prop
artifact: node
id_prefix: vp-
folder: project/spec/trace/value-prop
sections:
  - Success criteria
  - Unlike
applies_rigor: [systematic]
applies_type: [default]
---

# value-prop — one proposition the product makes to one audience

Lives in `project/spec/trace/value-prop/`. It is a STANDING ARTIFACT: it
outlives the iteration that authored it, lands on trunk when that record
closes, and a later record may change it.

Value props are what v1 called NEEDS. They are the top of the design trace:
the vision is their parent, and stories, use cases and requirements hang
below them. `frame-delta` authors them and passes REFERENCES as its
evidence; `gate-motivation` follows each reference and reviews the artifact
itself.

Id prefix `vp-`.

## Fields

Every field carries its name, its semantics and its value range. A field
that cannot be filled honestly is left out, never guessed.

- `id` (`vp-<slug>`): unique across the whole trace corpus. Two files
  claiming one id is a refusal, not a warning — see the duplicate check.
- `type` (`"[[value-prop]]"`): a LINK to this template, which is what makes a
  node typed. It puts the node on the first ring, and it is what a reference
  field checks when it asks for value props. A bare `value-prop` reads the
  same; the link is the form a reader can follow.
- `statement` (one sentence, "As a ⟨role⟩ I need ⟨X⟩"): the proposition in
  the audience's own words. Not a feature, and not a solution.
- `audience` (a `stk-` id): the stakeholder this proposition serves. A
  proposition with no audience is a wish.
- `outcome` (one sentence): what becomes true for that audience. THIS IS
  WHAT GETS VALIDATED — the success criteria measure it.
- `priority` (must | should | could): MoSCoW. Most value props are must; the
  field earns its keep when one is not.
- `source_refs` (list of `ref-` ids, optional): the reference notes the
  proposition rests on. External links live only in reference notes.
- `refines` (list, optional): normally absent. A value prop's parent is the
  vision, and that edge is implicit in the type.

## Body

Three sections, in this order.

- `## Success criteria` — one bullet per criterion, each naming its Metric
  and its Target. A criterion nothing will ever check is not a criterion.
- `## Unlike` — the alternative, and what makes this different. Prose, and
  not load-bearing.
- `## Notes (not load-bearing)` — anything a reader would otherwise
  re-derive.

## Example

```
---
id: vp-{{slug}}
type: "[[value-prop]]"
statement: As a {{role}}, I need {{the need}}.
audience: stk-{{stakeholder}}
outcome: {{what becomes true for them}}
priority: must
source_refs:
  - ref-{{slug}}
---

## Success criteria

- {{the checkable claim}}.
  Metric: {{what is measured}}. Target: {{the target}}.

## Unlike

{{the alternative}}. The difference is {{what sets this apart}}.

## Notes (not load-bearing)

{{context a reader would otherwise re-derive}}
```

## Mint skeleton

A new value prop is seeded from this fence verbatim. The engine owns `id`
and `type`; everything else starts as a TODO the author must answer.

```skeleton
statement: TODO — as a ⟨role⟩ I need ⟨X⟩
audience: stk-TODO
outcome: TODO — what becomes true for that audience
priority: must
```
