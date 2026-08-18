---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-asm-one-parser-decides-what-parses
type: "[[raid]]"
kind: assumption
statement: The parser that guards a write and the parsers that later read the node agree on what parses, so a write the guard accepts is a node every reader can use.
owner: the driving agent
trigger: any parser or dependency upgrade, and the first reader that throws on a node the guard accepted
status: probed
probed_on: 2026-08-16
probe: Take the node that broke this walk, and any other malformed sample. Feed it to the guard and to every reader that loads corpus frontmatter. Confirm they agree, on each supported platform. Any disagreement falsifies this and names which reader is the odd one.
probed: 2026-08-16, and it HOLDS on the parser while failing on the handling. Four import sites all take the same yaml package — bases.ts:22, frontmatter.ts:25, notes.ts:13, tables.ts:22 — so what parses is one answer. But TWO different functions are named frontmatterOf, at worktree.ts:125 and traceschema.ts:82, with different signatures, and they disagree about failure. One catches, noteOf returns undefined, and something in the chain threw hard enough to stop this walk.
impact: A write passes the guard and a reader throws anyway. The refusal that was meant to keep the corpus sound becomes a false assurance, which is worse than no guard because it is trusted.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - req-a-write-that-breaks-the-corpus-refuses
  - raid-iss-a-write-can-leave-the-corpus-unparseable
  - fn-run-a-governed-walk.guard-a-write
---

## The assumption

`req-a-write-that-breaks-the-corpus-refuses` says a write is refused when
the engine's own reader cannot parse it.

THAT SENTENCE ASSUMES THERE IS ONE READER. If the guard uses one parser
and the pull, the form builder and the trace graph use others, "the
engine's own reader" names a set rather than a thing.

## Why it is plausible

THE FAILURE THAT PROVOKED THIS ITERATION CAME FROM ONE PARSER'S RULE. A
colon followed by a space inside an unquoted scalar is a nested mapping
in YAML. Not every parser, and not every YAML version, treats that
identically.

THE ENGINE READS FRONTMATTER IN SEVERAL PLACES. `frontmatterOf` and
`noteOf` both appear in the corpus readers. Whether they share one
implementation has not been checked, and this row is the checkable form
of that gap.

A LENIENT GUARD IS THE DANGEROUS DIRECTION. A strict guard refuses
something a reader would have accepted, which costs one puzzled author.
A lenient guard admits something a reader will throw on, which is the
original failure with a false assurance on top.

## What closes it

ONE PARSER, USED BY THE GUARD AND EVERY READER, or a demonstrated
agreement between them held by a test.

THE TEST IS CHEAP AND IT IS THE PROBE. A handful of malformed samples,
one call per reader, on each supported platform.

## Falsification

One node the guard accepts and any corpus reader refuses.

## Probe

COLLECT THE SAMPLES FIRST, and one of them already exists. The node that
stopped this walk on 2026-08-16 carried `worse: it` inside an unquoted
scalar. Add a handful more — a tab where spaces are wanted, an unclosed
quote, a duplicate key, a missing closing delimiter.

FEED EACH TO THE GUARD and to every corpus reader the engine uses.
Start from `frontmatterOf` and `noteOf` and follow the callers.

CONFIRM THEY AGREE, sample by sample, on each supported platform.

WHAT EACH RESULT MEANS.

- ALL AGREE. The assumption holds, and the probe doubles as the
  regression test that keeps it holding.
- THE GUARD IS STRICTER than some reader. Survivable. It refuses
  something that would have been read, which costs one puzzled author.
- THE GUARD IS LENIENT where a reader is strict. FALSIFIED, and this is
  the direction that matters. A node passes the guard and a reader
  throws, which is the original failure with a false assurance on top.

THE PROBE IS CHEAP: a handful of strings and one call per reader.
