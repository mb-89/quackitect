---
minted_in: i1
id: dsp-trace-corpus
type: "[[design-spec]]"
statement: the trace read live from node files, carried by one loader with a stat-stamped cache and schema-checked edges
realizes:
  - "el-account"
files:
  - "project/deliverable/engine/trace.ts"
  - "project/deliverable/engine/traceschema.ts"
  - "project/deliverable/engine/frontmatter.ts"
  - "project/deliverable/engine/bin/backfill-minted.ts"
---

## Responsibility

The corpus is the folder of typed nodes; the loader derives the graph
on every look, stamped against file stats so unchanged trees cost
milliseconds. The schema card declares the legal edges and slices; the
edge check refuses what it does not list. Conformance runs the item
templates' declared checks over every node.

## Behavior and constraints

- Every schema key folds into the one drawn slot, or its level goes
  invisible.
- The view derives from files and never mixes sources.

## The frontmatter writer

THE FRONTMATTER WRITER — an auto-formatter, not a splice.

OWNER RULING 2026-08-01, and it is the whole design: take the frontmatter
you have, require it to be valid, and print a properly formatted result.
If the result loses the idiosyncratic spacing or list style somebody typed,
that does not matter — it is the same contract as pressing ctrl-s in a
programming language.

WHY THIS BEATS THE OBVIOUS ALTERNATIVE. The cheap way to write one key is a
SPLICE: find the line `state: draft`, swap that line, touch nothing else.
It preserves everything by construction and it cannot do lists, because a
list is not one line. Measured on this repo: 150 of 1,219 real key edits
refuse under a splice, and those 150 are 100% of `depends_on` and 100% of
`evidence` — exactly the two fields a matrix editor exists to change.

A canonical rewrite has no such class. Every key writes the same way.

WHAT IT COSTS HERE: nothing measurable. A plain re-serialize drops YAML
comments, and this vault has 147 frontmatter blocks with zero comment lines
in them (counted 2026-08-01). If that ever stops being true, yaml's Document
API keeps comments and this is where that swap goes.

THE BODY IS NEVER TOUCHED. Only the block between the fences is reprinted;
everything after the closing fence is carried across byte for byte.

## Every trace node the product declares

Every trace node the product declares.
THE CORPUS IS RE-READ ONLY WHEN IT CHANGED (owner ruling 2026-08-09).

 This is v1's adr-verdict-cache reapplied, and its two rules are the whole
 design: key a computed answer to a HASH OF ITS INPUT plus the build
 identity, and keep the cache OUT OF THE REPO, because "a cache is never
 truth and the repo must stay cache-free".

 WHY IT IS NOT A SECOND SOURCE OF TRUTH, which is the rule this must not
 break. Nothing is stored that cannot be recomputed. Nothing is written
 anywhere. A stale entry cannot survive an edit, because the edit moves the
 mtime and the stamp stops matching. The files remain the only truth; this
 only remembers that it already read them.

 THE STAMP IS STAT, NEVER CONTENT. Hashing 328 files means READING 328
 files, which is exactly the cost being avoided. Size and mtime answer the
 same question for one syscall each, and the directory walk that lists them
 is paid either way.

 BUILD IDENTITY COMES FREE HERE. v1 needed it because its cache lived on
 disk and outlived the engine. This one is in memory, so a reload cannot
 reach a cache built by the code it replaced.

 WHAT IT COST TO NOT HAVE IT: one se_pull took 274,270 ms entering an
 iteration, because every hop of the walk reloaded the whole corpus for
 every machine. The server answers nothing while that runs — the MCP
 endpoint shares the event loop — so the transport gave up and the
 extension had to be restarted.

## The corpuss version

THE CORPUS'S VERSION, from the files themselves.

 IT IS EXPENSIVE AND IT IS CORRECT, in that order of importance. Keying it on
 the model's watcher generation was tried on 2026-08-09 and the suite refused
 it: a corpus that misses an external edit reports a fallen claim as green,
 and that is the one thing this must never do.

 SO THE COST IS NOT FIXED HERE. It is 328 stats per call and it was called
 sixty-six times to enter one record. The sixty-six is the defect; the 328 is
 the price of an honest answer. Collect it ONCE per operation and pass it
 down (software.md, input-process-output).

## One file says what may point at what

THE LEGAL EDGES, read from machines/trace-schema.md (owner ruling
2026-08-07). One file says what may point at what. An edge it does not
list is a defect, and this is what says so.

WHY A FILE AND NOT A CONSTANT. The spine is method, not engine. A product
that vendors this and adds a level edits its own schema; nothing here
knows how many types there are or what they are called.

## No edge crosses between slices

NO EDGE CROSSES BETWEEN SLICES (owner design 2026-08-07). A slice is its
own chain from the requirement outward: design one way, testing the
other. A function pointing at a test definition would tie them back
together, and the drawing could not keep them apart.

THE SPINE IS EXEMPT because it is what both slices see. A function
pointing at a requirement is the division itself, not a crossing.
