---
kind: [[design_output]]
---

# Scope

`src/index` holds the index over this tree. This note covers the database, the
watcher keeping it warm, and the questions it answers. For the argument, see
[[spec/rationales/index]].

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

## The rows the walk writes

One walk fills four tables and two full-text ones. It writes them in a single
transaction, so a reader meets the whole answer or the one before it.

| table | what it holds |
|---|---|
| `meta` | the version and the root, which decide whether the file lives |
| `file` | every path, its size, its time, its hash, and its text |
| `note` | every markdown file carrying frontmatter |
| `link` | every `[[name]]`, and the path it resolves to |
| `note_text` | the bodies, for ranking |
| `line_text` | every line, for the word question |

Four folders stay outside the walk: `.git`, `.se`, `node_modules` and
`.claude-plugin`. The first two hold the machinery, and the rest hold what a
tool writes on its own.

The file opens in WAL mode with a busy timeout, so a reader waits on no
writer. The door writes while a verb reads, and the two meet on one file
without either one blocking.

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

## A door comes back

Every part here goes down and comes back with no session restarting. A caller
asks the door on every question, so nothing caches a decision made at start.

| what happens | what the next question does |
|---|---|
| the door takes a kill | the stale standing file goes, and a fresh door stands |
| the binary rebuilds | the old door takes a stop, and the new build answers |
| a door stands over another tree | the same, because the root rides in the file |
| no binary stands yet | the disk answers, and the index joins the moment it builds |

The standing file carries a stamp: the build's own time and size. A caller
whose stamp disagrees asks that door to stop, drops the file, and starts one of
its own. So fixing a bug in the index costs a rebuild and the next question.

A cold build of the index takes about seventy seconds, because cgo compiles
SQLite. It runs as a want. So a session starts with the disk answering, and
picks the index up on the first question after the build lands.

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
| `notes` | the notes the words belong to, ranked by name and body |
| `grep` | every line one pattern matches, with its neighbours |
| `glob` | every path one glob names, the newest first |
| `links` | what reaches a note, which is what a person asks before moving one |
| `dangling` | every link naming nothing this tree holds |
| `same` | every file carrying the size and hash of another |
| `reindex` | the walk again, now |
| `standing` | the root the door holds, and how many files it counts |

## The rank is BM25

FTS5 ranks with BM25, and `ORDER BY rank` takes it. Both word questions carry
the score back, so a caller sees how far the first answer stands above the
second.

`notes` weights the columns: a note whose name carries the word scores ten
times what a body mention scores. So asking for `index` answers the two notes
about the index, ahead of every note that mentions one.

`find` reads `line_text`, whose one indexed column leaves nothing to weight.
It ranks by how rare the words are and how short the line is.

## The search reads the rows

Every text file keeps its whole body in `file.text`, so a pattern meets the
tree in one warm process. The `grep` question compiles the pattern with Go's
regexp engine, which is the engine ripgrep uses, and walks the bodies in path
order. It answers each file, how many lines it carries, and those lines with
the ones the caller asks for around them.

| question | asks |
|---|---|
| `grep` | every line one pattern matches, with its neighbours |
| `glob` | every path one glob names, the newest first |

The write door hands these two answers back to the agent in place of the tools
that walk a disk. Where a search asks for something these rows hold no answer
for, the door says so and the disk answers instead.

A question arriving after the watcher sees the tree move sweeps first. So a
search after a write reads the write, and a caller meets one truth.

## The door answers the tools

The write door takes a `Grep` or a `Glob` before it runs and asks the index
instead. The agent reads the same shape it always reads, and learns nothing
about which side answers. So a session searches this tree hundreds of
times and walks the disk none of them.

The hook reaches the door the way every caller reaches it, through the binary
in `.se/bin`. A generic `call` verb carries the question as JSON, so the hook
holds no second copy of the protocol. The session's start puts the door up
without waiting, which leaves the first question warm.

## Where the disk still answers

The index answers where it answers faithfully, and stands aside everywhere
else. These send the question back to the tool:

| what stands | why the disk answers |
|---|---|
| a path outside this tree | the rows hold this tree alone |
| a `type` this tree maps nowhere | a guess at what it means answers wrong |
| a `type` and a `glob` together | the rows take one filter at a time |
| a pattern Go declines to compile | a wrong answer costs more than a walk |
| no index stands here | a tree with no door still works |
| any error from the door | the same reason |

Everything else the tools take reaches the rows:

| what a caller asks for | where it answers |
|---|---|
| a match spanning lines | the whole body, in one question |
| a `type` filter | the glob that type names |
| the match alone, an offset, a limit | the same rows |
| the lines around a hit, a case-blind read | the same rows |

A single-file `Read` goes to the disk always. A search reading a file a moment
late costs a repeat; an edit built on text a moment late costs the edit.

## A match may span lines

Every text file keeps its whole body, so a pattern crossing a line break is one
question over one string. The rows answer it the way they answer any other: the
hit names the line it starts on, and carries every line it covers.

The same body answers the match alone, where a caller asks for that, and an
offset over the files a sweep already counted.

## A type is a glob

A `type` names a family of files, and this tree holds the twenty families the
tools ask for. Each one turns into a glob before the question leaves.

| type | the files it names |
|---|---|
| `js`, `ts` | `*.{js,jsx,mjs,cjs}`, `*.{ts,tsx,mts,cts}` |
| `go`, `rust`, `py` | `*.go`, `*.rs`, `*.{py,pyi}` |
| `md`, `json`, `yaml` | `*.{md,markdown}`, `*.json`, `*.{yaml,yml}` |

A name outside the table sends the question to the disk, because a guess at
what a caller means answers the wrong files.

## A glob becomes a pattern

The tools hand patterns like `**/*.js`, and the rows hold paths with
slashes. One translation turns a glob into an anchored regexp:

| shape | what it means |
|---|---|
| `**/` | any run of folders, or none |
| `*` | anything inside one name |
| `?` | one character inside a name |
| `{a,b}` | either one |

A glob carrying no slash reads as a name at any depth, which is what ripgrep
answers for the same pattern.

## A note and its links

A note is a markdown file carrying frontmatter between two rulers. Its keys
land in `note`, its body lands in the full-text table, and every bracketed name
in the frontmatter or the body lands in `link`.

A link resolves against four things, in this order. The file at that exact
path comes first, then the same path with `.md` on the end. Then the note whose
`id` matches, and last the folder of that name. An anchor after a `#` drops
before any of it.

Two kinds of bracket stay out of `link`. The `kind` key names a taxonomy and no
file, and a target carrying `<` or `>` is a shape a document spells out. Both
would read as broken links forever, which costs `dangling` its meaning.

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
