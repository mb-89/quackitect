---
id: template-rank-cut
statement: "A settled ranking with a line drawn across it. One row is the last that still counts."
editor: rank-cut
resolves: artifact
line_pattern: "^\\d+\\. \\[\\["
line_help: "one numbered line per row, in rank order"
---

# rank-cut

The rows arrive ALREADY ORDERED. Something upstream settled the ranking, so
the question here is not what order they go in — it is where the line falls.

## What the field declares

```
- name: cuts
  template: rank-cut
  items:
    - $criterion_axes
  page_size: 10
```

- `items` — where the rows come from, in their settled order.
- `page_size` — rows per page. The pager reads the whole list either way.

## Three marks, and they mean different things

- **The cutoff.** Exactly one row carries it: the last row that is still in.
  Everything below it is out by POSITION, and owes no reason of its own —
  the cutoff is the reason. Pressing it on another row moves it rather than
  adding a second.
- **A cut.** One row struck on its own merits, with a reason in the same
  cell. Filling the reason is what cuts it.
- **A move.** Up or down, one place per click. Both rows involved are marked
  as moved, and a moved row owes a rationale.

## Why the cutoff is one mark and not a column

A per-row band column asks the same question once per row. Over ninety rows
that is ninety answers free to disagree with each other, and nothing reads
them as one line.

One mark cannot disagree with itself. It is also the only number the gate has
to look at: how deep the cut went.

## Why a move owes a rationale

The order was settled BLIND — before any candidate existed, which is what
keeps it honest. Moving a row past another jumps that ordering.

It is the one edit that can be aimed at a favourite, so it is the one edit
that has to say why. The submit refuses while a moved row has no reason.

## A struck row stays on the page

Struck through, dimmed, and still there.

An option that disappears gets re-proposed next iteration by somebody who had
no way to know it was considered. The whole list, including what was ruled
out, is the artifact.

## Stored form

One numbered line per row, in rank order, so the file reads as the ranking it
is.

```
1. [[req-call-answers-in-one-second]]
2. [[req-walk-resumes-from-repo]] [cutoff]
3. [[req-tour-speaks-plainly]] [cut: every candidate meets it identically]
4. [[req-archive-read-only]] [moved: it outranks the two above on the same evidence]
```

The numbers ARE the order. Reordering the lines by hand reorders the list.
