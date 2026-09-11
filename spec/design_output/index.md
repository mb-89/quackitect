---
kind: [[design_output]]
describes: [[src/index]]
---

# The index is warm

`src/index` is a Go program holding a SQLite database over this tree. The files
stay the truth, and the walk builds every row out of them. A reader meeting a
stale index or none reads the files, which is what every reader here does.

| piece | file |
|---|---|
| the shape, the walk and the rows | `index.go` |
| the frontmatter and the links | `front.go` |
| the questions | `find.go` |
| the resident process | `door.go` |
| the watch under it | `watch.go` |
| the command line over it | `main.go` |

It lives at `.se/index.db`, which stays on the box it stands on. The version
and the root ride in a `meta` row, and either one disagreeing drops the file
whole. The tree fills it again in seconds, and a half-migrated index answers
out of a shape two writers disagree about.

## The door owns the database

One process owns the file, keeps the tree and the rows in step, and answers
every question, so one writer stands however many people ask. It listens on
loopback on a port the machine picks, and writes where it stands into
`.se/index.json`.

    { "port": 53124, "pid": 8123, "root": "/home/user/quackitect" }

A caller reads that file. v4 rules against working a port out of the folder
path, because a clone carries the path and answers on another port.

| what a caller does | what happens |
|---|---|
| asks, with a door standing | the answer comes off the warm rows |
| asks, with none | one starts, walks the tree once, and answers |
| asks a method nobody declares | the name comes back in the error |

## The watcher keeps it warm

The watch is what holds the rows level with the tree. It watches every folder
the walk covers, and a write anywhere marks the rows dirty. One sweep answers a
burst, so a build touching a thousand files costs one walk.

A box where no watch stands still answers, out of the walk the door makes on
the way up.

## The questions it answers

Each one is a walk the tree used to take:

| verb | asks |
|---|---|
| `find` | every line carrying the words, through FTS5 |
| `links` | what reaches a note, which is what a person asks before moving one |
| `dangling` | every link naming nothing this tree holds |
| `same` | every file carrying the size and hash of another |
| `reindex` | the walk again, now |
| `standing` | the root the door holds, and how many files it counts |

## A note and its links

A note is a markdown file carrying frontmatter between two rulers. Its keys
land in `note`, its body lands in the full-text table, and every `[[name]]` in
the frontmatter or the body lands in `link`. A link names the note whose `id`
matches, or the file at that path, and one naming neither keeps a null. That
null is what `dangling` reads.

## The compiler it needs

SQLite arrives through cgo, because the C build carries FTS5 and answers faster
than a walk. So a build needs a C compiler, and this tree takes them in order:

| what stands | what the build uses |
|---|---|
| the pinned Zig | `CC=<zig> cc`, one download and no system compiler |
| a working `cc`, `gcc` or `clang` | that one |
| neither | no index, and every verb says so |

The pin is Zig 0.16.0. The installer compiles a probe file, because a name on
the PATH answers `--version` from a wrapper carrying no backend. Such a wrapper
fails on the first translation unit, deep inside the SQLite build, where the
fault reads as anything but a missing compiler.

`GOFLAGS=-tags=sqlite_fts5` rides with the compiler in one place. The driver
compiles the full-text module in only when asked, so a build carrying the one
carries the other.
