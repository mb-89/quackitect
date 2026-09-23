---
kind: [[design_output]]
---

# Scope

`src/index` holds the index over this tree. This note covers the database, the
watcher keeping it warm, and the questions it answers. For the argument, see
[[spec/rationales/index]].

# The index is warm

`src/index` is a Go program holding a SQLite database over this tree. The files
stay the truth, and the walk builds every row out of them. A reader meeting no
door starts one, and reads the tree off it. The tool door is the one reader
standing aside, and the chapter Where the disk still answers says where. The
header of each file under `src/index` says which piece it holds.

It lives at `.se/.runtime/index.db`, which stays on the box it stands on. The version
and the root ride in a `meta` row, and either one disagreeing drops the file
whole. The tree fills it again in seconds, and a half-migrated index answers
out of a shape differing writers disagree about.

## The rows the walk writes

Every move of the rows lands in a single transaction, so a reader meets the
whole answer or the one before it.

| table | what it holds |
|---|---|
| `meta` | the version and the root, which decide whether the file lives |
| `file` | every path, its size, its time, its hash, its text, and whether git tracks it |
| `note` | every markdown file carrying frontmatter |
| `link` | every `[[name]]`, and the path it resolves to |
| `note_text` | the bodies, for ranking |
| `line_text` | every line, for the word question |

`index.go` names the folders standing outside the walk. Each holds the
machinery, or what a tool writes on its own. `machinery` there holds the rule
under `.se`, and the walk, a change and the watch all ask it:

| folder | the walk and the watch |
|---|---|
| a dot folder under `.se`, as `.se/.runtime`, `.se/.retro`, `.se/.log` | stand outside |
| any other folder under `.se`, as `.se/tickets`, `.se/notes` | stand inside, though git ignores it |
| `.git`, `node_modules` | stand outside |
| a plugin folder | stands inside, because it holds a tracked manifest |

The walk asks git for its list once, and marks each row git tracks. A root git
holds nowhere tracks every file the walk reads.

The file opens in WAL mode with a busy timeout, so a reader waits on no
writer. The door writes while a verb reads, and the two meet on one file
without either one blocking.

## A reader takes the tree

A reader holding the whole tree asks the verbs below, and keeps what they answer:

| verb | answers |
|---|---|
| `files` | every path, with its hash and whether git tracks it |
| `texts` | the text of each path it names, or of every path where it names none |

So a reader asks every text once, then the list on each tick `changes` answers,
and the texts of the paths whose hash moves. The language server reads the tree
this way. For how, see [[spec/design_output/lsp#the-server-reads-the-index]].

## The door owns the database

One process owns the file, keeps the tree and the rows in step, and answers
every question. One writer stands for any number of readers. It listens on
loopback on a port the machine picks, and writes where it stands into
`.se/.runtime/index.json`.

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

A root takes one spelling where it enters: cleaned, with the drive letter upper
case. A hook hands `c:\` and a shell hands `C:\`, and both name one tree. So
`rooted` in `main.go` answers every compare of one root against another: the
standing file, the `meta` row and the door's own. A caller passing either case
meets the warm door and keeps the file.

A cold build of the index takes about seventy seconds, because cgo compiles
SQLite. It runs as a want. So a session starts with the disk answering, and
picks the index up on the first question after the build lands.

## The watcher keeps it warm

The watch is what holds the rows level with the tree. It watches every folder
the walk covers, and names each path a write reaches. For what the door does
with a path, see [[spec/design_output/index#a-change-moves-its-rows]].

The watch stands off every folder the walk stands off, the log among them. The
log grows a line a door call, so a watch on it moves rows for nothing. A search
of the log reads the file. For how, see
[[spec/design_output/log#one-verb-reads-the-log]].

A box where no watch stands still answers, out of the sweep the door makes on
the way up and on its clock.

## A change moves its rows

Nothing clears the rows. A version or a root disagreeing drops the file whole,
and every other road moves the rows of the paths a change names:

| what moves the rows | what it rewrites |
|---|---|
| a path the watch names, once a burst settles | that file, every row under it where it names a folder, or its rows gone where it stands nowhere |
| git's own index, which the watch names apart | the tracked flag on each row git's list turns |
| the sweep, on the way up, on a clock, and at `reindex` | each file whose size or time differs from its row, and each row whose file stands nowhere |

`sweepEvery` in `src/index/door.go` names the clock. The sweep catches a change
the watch misses, and a still tree costs it a stat a file.

A file that moves drops the rows it holds and writes them again. The links
resolve again after any move, and a link whose target goes reaches nothing.

## The index fires on change

A reader wanting to redraw on a change asks `changes` and names the tick it
holds. The call holds until a move of the rows passes that tick, and answers
the tick then. So a reader calls again with the tick it takes, and each answer is a
change. A reader holding no tick names zero, and the sweep on the way up counts
one.

| what the reader meets | what the call answers |
|---|---|
| a sweep past the tick it names | the tick now, the moment the sweep lands |
| no sweep inside the wait | the tick it holds, so the reader asks again |
| the door going down | the call fails, and the reader starts a door the way every caller does |

The wait holds no guard, so every other call answers past a waiting one. The
sweep settles a burst first, so a change reaches the reader inside a second of
the write. `awaits` in `door.go` holds the call, and a contract case times it.

## The questions it answers

Each one is a walk the tree takes in one call:

| verb | asks |
|---|---|
| `find` | every line carrying the words, through FTS5 |
| `notes` | the notes the words belong to, ranked by name and body |
| `grep` | every line one pattern matches, with its neighbours |
| `glob` | every path one glob names, the newest first |
| `links` | what reaches a note, which is what a person asks before moving one |
| `dangling` | every link naming nothing this tree holds |
| `same` | every file carrying the size and hash of another |
| `tickets` | every ticket with its fields, and the standing its group's branch gives it |
| `changes` | the tick past the one a caller names, once a sweep moves the rows |
| `files` | every path, its hash, and whether git tracks it |
| `texts` | the text of the paths a reader names |
| `reindex` | the sweep, now, so a reader reads the disk as it stands |
| `standing` | the root the door holds, and how many files it counts |

## The index answers the tickets

`tickets` answers every note of kind `ticket`, one row a ticket, and a reader
opens no file and no git for it. `ticket.go` holds it, and
`./RUNME.sh index tickets` prints the rows.

| the key | what it carries |
|---|---|
| `name`, `path` | the note's id, and where it stands |
| `state`, `step`, `group`, `urgent`, `todo` | the fields off the top of the front |
| `route` | the process the ticket rides, as its own name, so `group` marks a group |
| `standing` | what the branch gives it, as the words below |
| `says` | the whole Ask chapter, past the mint's comments, which the tab's details draw |
| `changed` | the time of the file's last change, off the `file` table, so a view sorts the newest done ticket first |

A key nested under `record` or `steps` shadows no field, because the reader
takes the top of the front alone. A branch informs a ticket's standing and
nothing more. A group's standing derives from its own record. For details, see
[[spec/design_output/work#held-derives-from-the-record]]. A ticket naming a
group answers its group's standing, and a ticket in no group carries none.

## A rename reaches a name

`./RUNME.sh rename <from> <to>` moves a name and carries every reach with it.
`src/scripts/rename.js` holds it, and it works in the moves below:

| the move | what it asks | what it catches |
|---|---|---|
| read | `links` above, then a walk of the text files | a note link, then an import, a path and a word in prose |
| write | the folder's move, then a rewrite of each reach | every pointer the read names |
| prove | the rows `links` answers, then `./RUNME.sh check` | a row naming the old name, then every other rule |

The read asks separate readers, because each answers half: `linksIn` in
`src/index/front.go` records a note link alone, and the walk finds the rest.

A reach stands on a word edge, so `renamedText` leaves a longer word alone. The
prove move reads rows, because `links` calls `dangling` and answers a clean exit
over every row it prints. So the verb asserts no row names the old name.

## The rank is BM25

FTS5 ranks with BM25, and `ORDER BY rank` takes it. Both word questions carry
the score back, so a caller sees how far the first answer stands above the
second.

`notes` weights the columns: a note whose name carries the word scores ten
times what a body mention scores. So asking for `index` answers the notes
named for it first, ahead of every note that only mentions one.

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

The write door hands these answers back to the agent in place of the tools
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
in `.se/.runtime/bin`. A generic `call` verb carries the question as JSON, so the hook
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
| the match alone, an offset, a limit, and 250 where the call names none, as `Grep` does | the same rows |
| the lines around a hit, a case-blind read | the same rows |

A single-file `Read` goes to the disk always. A search reading a file a moment
late costs a repeat. An edit built on text a moment late costs the edit.

## A match spans lines

Every text file keeps its whole body, so a pattern crossing a line break is one
question over one string. The rows answer it the way they answer any other: the
hit names the line it starts on, and carries every line it covers.

The same body answers the match alone, where a caller asks for that, and an
offset over the files a sweep already counted.

## A type is a glob

A `type` names a family of files, and this tree holds the families the tools
ask for. Each one turns into a glob before the question leaves.

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

A note is a markdown file carrying frontmatter fenced by rulers. Its keys
land in `note`, its body lands in the full-text table, and every bracketed name
in the frontmatter or the body lands in `link`.

A link resolves against the things below, in this order. The file at that exact
path comes first, then the same path with `.md` on the end. Then the note whose
`id` matches, and last the folder of that name. An anchor after a `#` drops
before any of it.

Some kinds of bracket stay out of `link`. The `kind` key names a taxonomy and no
file, and a target carrying `<` or `>` is a shape a document spells out. Both
read as broken links forever, which costs `dangling` its meaning.

## The compiler it needs

SQLite arrives through cgo, because the C build carries FTS5 and answers faster
than a walk. So a build needs a C compiler, and this tree takes them in order:

| what stands | what the build uses |
|---|---|
| the pinned Zig in `.se/.runtime/bin/zig` | `CC=<zig> cc` |
| a working `cc`, `gcc` or `clang` | that one |
| neither | the installer downloads the pinned Zig, and builds with it |

`src/scripts/install.sh` holds the pin. The installer compiles a probe file, because a name on
the PATH answers `--version` from a wrapper carrying no backend. Such a wrapper
fails on the first translation unit, deep inside the SQLite build, where the
fault reads as anything but a missing compiler.

`GOFLAGS=-tags=sqlite_fts5` rides with the compiler in one place. The driver
compiles the full-text module in only when asked, so a build carrying the one
carries the other.

The battery runs each module's tests, then the Go formatter over that module's
folder. A file the formatter writes another way turns the check red, and the
check names that file. `formatFaults` in `src/scripts/go-tests.js` writes the
findings, and a case drives it. A box carrying no formatter leaves the gate
silent, the way a box carrying no Go leaves the tests unrun.

## A dead index speaks

- Outcome: a session with no working index hears it on turn one, and nothing falls back in silence.
- Check: `session.start` looks for the binary and runs `standing`.
- Log: a missing binary or a failing `standing` writes one `index` line at `warn`.
- Block: every read of the context carries `level0-index`, naming the cause and `./RUNME.sh`.
- Sweep: `replace` refuses on a dead index, and names the same fix.
- Fault: a question the door refuses alone, such as a pattern Go reads as no
  regexp, leaves the index standing. The search reads the disk, and `replace`
  names the fault the door prints.
