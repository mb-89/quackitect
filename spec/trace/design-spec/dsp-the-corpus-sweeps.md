---
minted_in: i44-the-corpus-resolves-duplicate-headings-a
id: dsp-the-corpus-sweeps
type: "[[design-spec]]"
statement: five pure classifiers over one node's text and one over the whole pool, each answering with the findings of its own class and nothing else, called from the corpus sweep rather than owning a pass of their own
realizes:
  - el-method-compiler
  - el-front-desk
files:
  - deliverable/engine/corpus-sweeps.ts
  - deliverable/engine/guard.ts
  - deliverable/engine/sweep.ts
  - deliverable/tests/corpus-sweeps.test.ts
---

## The shape

EACH CLASSIFIER IS A PURE FUNCTION over text, and the sweep is what walks
files. That split is the whole design: a classifier can be tested against a
string, and none of them opens a file except where its question is about the
tree.

| classifier | what it takes | what it answers |
| --- | --- | --- |
| duplicateHeadings | one node's text | the headings appearing more than once |
| staleCitations | the root and one node's text | the cited paths the tree does not hold |
| deadLaneVerbs | the root and one node's text | the lane verbs the tool surface does not define |
| unreferencedTokens | the root | the work tokens no node points at |

THE REFERENCE SWEEP IS NOT NEW CODE. `danglingReferences` already stands in
`guard.ts` over ten keys. The work is widening that list and running it from
the corpus sweep rather than only at the write.

## Why these live outside guard.ts

GUARD.TS ANSWERS A WRITE. It is called with the content a caller is about to
land, and its job is to refuse or to report on that one node.

THESE ANSWER A CORPUS. Three of the four are per-node and could live either
side, but the token report is a whole-pool anti-join and has no write to hang
off.

SO THEY GO TOGETHER, in one module the sweep imports, and guard.ts keeps its
one job.

## What each one deliberately does not do

- The heading check compares text after trimming, at the same level only. Two
  headings at different levels are different headings.
- The citation check reads the file path and never the line number. A line
  number moves on every edit above it.
- The dead-verb check reads the tool surface as the authority on what a verb
  is, so it cannot go stale against a rename.
- The token report reports and never refuses. A token standing alone is not a
  defect by itself.
