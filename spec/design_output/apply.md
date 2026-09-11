---
kind: [[design_output]]
describes: [[.claude/skills/level0/lib/apply.js]]
rationale: [[spec/rationales/apply]]
---

# The write tools

Level zero registers three tools the agent calls: `patch` edits files,
`replace` sweeps one pattern across the tree, and `undo` puts either one back.

| tool | what it is for |
|---|---|
| `patch` | the scalpel: many ops on paths you hold, one atomic call |
| `replace` | the sweep: one regex over every file a glob reaches |
| `undo` | the way back, out of a journal the apply writes first |

The pure half sits in `lib/apply.js` and `lib/undo.js`, which read no disk. The
hooks module hands them the text and writes what they answer.

## Validate everything, then write

Every op reads the file as the ops before it leave it, so edits to one file
compose in the order they arrive. One failure refuses the whole manifest, and
the tree keeps every byte.

A half-applied change costs more than a refused one. The tree stands in a
state nobody designs, and the agent believes the change lands.

## Bytes in, bytes out

No encoding pass and no line-ending pass. A file arriving with CRLF keeps
CRLF, because an edit names the bytes to replace and this replaces those bytes.

A line-ending mismatch refuses. A correction nobody asks for is a write nobody
asks for, and the agent reads the file to find the bytes it wants.

## The five verbs

| op | what it takes |
|---|---|
| `exact` | `old` and `new`, with `old` standing once unless `replace_all` |
| `create` | `new`, on a path holding no file |
| `write` | `new`, over the whole file |
| `append`, `prepend` | `new`, at one end |
| `regex` | `pattern`, `replacement`, `flags`, `expect_count` |

## A pattern matching nothing

A regex meeting no text is a refusal, and a quiet success stands nowhere. A
sweep answering zero reads as done, and the rename it belongs to goes out half
finished.

`expect_count` refuses unless the total is exactly what the caller says. So an
agent who counts first learns at once when the tree disagrees.

`replace` asks the index which files carry the pattern, and the sweep costs no
walk. It reads those files, keeps the ones a JavaScript regex agrees with, and
hands the rest to the same manifest `patch` runs.

## The journal holds both halves

`.se/undo/<time>.json` holds every file this apply touches: `was`, the text
before, `made`, the text after, and a flag where the apply brings a file into
being.

The journal writes before any file does. A journal refusing to write refuses
the apply, because a bulk edit nobody can take back is the incident these tools
stand against.

Both halves ride in the entry, and no hash stands in for the text. `.se` sits
outside git, so an overwritten file lives in the entry or nowhere.

## An entry says whose apply

An entry carries the `on` its apply names, and an undo walks past every entry
another name writes. So ten agents on one tree each take back their own change.

## The entry names its time

The file name is the stamp, so the newest entry sorts last and nothing holds a
counter.

## Drift refuses the restore

The undo reads every file against what the apply leaves, before anything comes
back. One file moving since refuses the whole restore.

A tree half back costs more than one nobody touches. Nobody tells which half
is which, and the work somebody does in between goes with it.

A file the apply creates comes out, and one already gone passes in silence.
