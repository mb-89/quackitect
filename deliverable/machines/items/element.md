---
template: item-element
artifact: node
id_prefix: el-
folder: spec/trace/element
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: kind
    one_of:
      - existing
      - new
  - field: realization
    one_of:
      - make
      - reuse
      - buy
  - field: statement
    ban_words:
      - appropriate
      - adequate
      - sufficient
      - robust
      - reasonable
      - probably
      - maybe
    hint: a weasel word cannot be built against
  - field: statement
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
  - field: implements
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: an element that implements no function is gold-plating — name what it exists for
---

# element — one building block of the architecture

Lives in `spec/trace/element/`. A STANDING ARTIFACT: it outlives the
iteration that named it, and the build fills it.

An element is a black box first: what it does, what crosses its boundary,
and how it is realized. The grey-box detail belongs to the build.

## Where elements come from

Three sources, per [[meth-decompose-structure]]:

- the winner's picks — each mechanism becomes one or more elements
- the standing system — brownfield joins as it is
- the grouping judgment — substrate several picks share becomes its own
  element

## Fields

- `id` — `el-<slug>`.
- `type` — `"[[element]]"`.
- `statement` — what this element does, in one sentence.
- `kind` — existing (it stands today) or new (the winner demands it).
- `realization` — make, reuse or buy.
- `group` — the grouping this element belongs to. The same node-borne
  mechanism the function clusters use; the DSM editor writes it.
- `implements` — the function ids this element implements.
  - THE ALLOCATION EDGE, and it points the same way `refines` does on a
    requirement: the newer artifact names what it derives from.
  - NOT ONE TO ONE: several elements may implement one function. Software
    tends to one-to-one, systems spread, and the spread is what the DSM
    makes visible.
  - WHAT IS CHECKED: every function implemented by at least one element or
    interface, and no element implementing nothing.
  - Requirements reach the structure through this chain. A requirement is
    served by functions, and its functions are implemented here.
- `satisfies` — requirement ids this element answers DIRECTLY, used only
  where no function carries the requirement: a structural quality the
  shape answers (modularity, replaceability), an imposed constraint
  binding this choice. The transitive path through `implements` covers
  everything else; the union must reach every requirement.
- `source_refs` — the pick, decision or standing part it derives from.

## The body is the black box

- What it does — behavior and states, briefly.
- What crosses its boundary — by reference to its interface nodes.
- The realization concept — enough for the build to estimate against.

## Skeleton

```
---
id: el-{{slug}}
type: "[[element]]"
statement: {{what this element does, in one sentence}}
kind: {{existing | new}}
realization: {{make | reuse | buy}}
group: {{the group it belongs to — the DSM editor may rewrite this}}
implements:
  - {{fn-... — the functions this element realizes}}
satisfies:
  - {{req-... — only what no function carries; remove the key otherwise}}
source_refs:
  - {{the pick or standing part it derives from}}
---

{{the black box: behavior and states, the boundary by interface refs, the
realization concept}}
```
