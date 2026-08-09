---
template: item-option
artifact: node
id_prefix: opt-
folder: project/spec/trace/option
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: found_by
    one_of:
      - prior-art
      - contradiction
      - analogy
      - without
      - heuristic
      - transform
      - probe
    hint: which finder turned this up — seven lenses, and the chart counts them
  - field: statement
    ban_markers:
      - TBD
      - TBC
      - TBR
      - "???"
    hint: an unnamed option fills no cell
  - field: source
    ban_markers:
      - TBD
      - TBC
      - TBR
      - "???"
    hint: an idea with a source is checkable; one without is a rumour
sections:
  - Mechanism
---

# option — one way of realising one function cluster

Lives in `project/spec/trace/option/`.

Written at M4 enumerate-space, by the finders. Each one fills a CELL in the
morphological chart, and a combination of them across every cluster is a
candidate.

## AN OPTION IS NOT A CANDIDATE

The distinction carries the whole method, and losing it collapses the chart.

- An OPTION is one way of serving ONE cluster.
- A CANDIDATE is one option per cluster, combined into a whole architecture.

Five options across three clusters is 125 possible candidates. That gap is
the design space, and it only exists because the two are different things.

## IT NAMES A MECHANISM, NEVER A PRODUCT

"Postgres" is not an option. "Keep the position in a transactional store"
is, and Postgres is one way to do it.

THE TEST IS ONE QUESTION. Could two honestly different products both realise
this? If only one could, a decision has been made early and unrecorded, and
the chart has a cell with one occupant.

## EVERY OPTION CARRIES ITS SOURCE

An idea with a source is checkable. One without is a rumour, and at the gate
nobody can tell them apart afterwards.

`found_by` says which of the seven finders turned it up. That is not
bookkeeping: a chart where every option came from one finder means six
searches did not happen, and the chart shows it.

ONE VALUE MEANS SOMETHING DIFFERENT FROM THE REST. `probe` is the only
source that was RUN rather than read, so its option carries evidence the
other six cannot produce — and the probe that produced it names what it
faked.

## Fields

- `id` — `opt-<slug>`.
- `type` — `"[[option]]"`.
- `statement` — the mechanism, in one line, solution-neutral about products.
- `cluster` — the [[cluster]] this option serves.
- `found_by` — prior-art, contradiction, analogy, without, heuristic,
  transform or probe. `shipped` was a value until 2026-08-08; a shipped
  product is prior art, so it folded into that one.
- `source` — where it came from. A citation, a product, a principle number,
  a domain. Never empty.
- `pruned_because` — why it is out of the chart, or absent while it stands.

## The Mechanism section

One short paragraph. How it works, and what it would cost here.

An option nobody can describe in a paragraph is not understood well enough
to score later.

## Skeleton

```
---
id: opt-{{slug}}
type: "[[option]]"
statement: {{the mechanism, in one line}}
cluster: {{the cluster id it serves}}
found_by: prior-art
source: {{citation, product, principle or domain}}
---

## Mechanism

{{how it works, and what it would cost here}}
```

## Sources

- Zwicky's morphological box, via [[meth-morphological-analysis]]. The cell
  is the unit, and this is the cell.
- The SyA corpus at @ai/sya_kb, chapter 01: solution variants fed by five
  input sources.
