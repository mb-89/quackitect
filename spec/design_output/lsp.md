---
kind: [[design_output]]
refines: ["[[spec/design_input/one-server-holds-the-shape]]"]
---

# Scope

`src/lsp` holds a language server of this tree's own. It stands beside Biome,
and draws every finding the battery reads. This note covers the shape a
finding takes, the checker under every front, the fronts, the port, and
the build.

For the ask, see [[spec/design_input/one-server-holds-the-shape]].

# The panel reads the battery

The panel draws the list `./RUNME.sh check` reads, and a finding standing there
holds a push. The server asks the bridge for that list, so a rule reaches the
editor the way it reaches the check:

| source | draws an open file | draws a closed file |
|---|---|---|
| this server's own checks | this server | this server |
| Vale, through the tense reader | this server | this server |
| Biome | the Biome extension, while a person types | this server |

The Vale extension runs raw Vale, which knows no tense reader. So the
workspace settings hand it a filter no rule passes, and it draws nothing.

A file redraws on the roads below:

| road | what redraws |
|---|---|
| the server starts | every file, off this server's sweep and one ask to the bridge |
| the editor opens a file | that file, off the buffer |
| a person types in a file | that file off the buffer, and the bridge again after the quiet span |
| the editor saves or closes a file | that file, and a save asks the bridge again |
| anything changes a file on disk | that file, off the disk and the bridge |

## One checker every front asks

The fronts below ask for a reading, and each reaches one rule set:

| the front | what it asks |
|---|---|
| the editor's panel | this server's own sweep, and the bridge beside it |
| `./RUNME.sh check` | the bridge's sweep, and `se-lsp check` over that same sweep |
| a person, at `se-lsp check` | the sweep alone |

`Checker` in `src/lsp/check.go` holds this server's half, and `findingsOver` in
`src/bridge/findings.js` holds the bridge's. The tree readers and the schema
readers in `src/scripts/cli-read.js` stand behind `se-lsp check`, for a box
carrying no server.

One guard names each tool for both fronts. `biomeFor` in the bridge hands the
empty string where no binary stands, so a box carrying no Biome reads one list.
`test/contract/one-reading.test.js` holds the fronts against each other
over the whole tree.

# The panel follows the disk

At its start the server asks the editor to watch every file under the root.
The editor then names each file that changes on disk, whoever changes it: an
agent, git, or a script. The server reads the type each change carries.

| the change | what the panel does |
|---|---|
| a new or a changed file | redraws it off the disk, drops the bridge's rows on it, and asks the bridge again until one answers |
| a deleted file | takes its row with it, and no rule reads it |
| a folder, on either side | stands for every file under it |

So a finding leaves once its file passes, and a moved folder leaves no row
behind. An open file follows the editor's buffer, and a change under a folder
the battery skips redraws nothing.

# The panel lints as typed

A change to an open file waits the quiet span `lintQuiet` names in
`src/lsp/bridge.go`, and every change inside that span joins one ask. The ask
carries each buffer as it stands to `POST /findings`, and `heldOver` in
`src/bridge/findings.js` reads it there.

| what reads the buffer | how |
|---|---|
| Vale | through the Vale door, at the buffer's own path, so the config sections match |
| the tense reader | over the buffer's text |
| the code faults | over the buffer's text |
| Biome | nowhere, because its own server draws an open file |

So a Vale finding leaves as a person fixes the line, and no source waits for a
save. A file the editor closes inside the span asks nothing, because its buffer stands no
more.

## A change reads one note

A change to a buffer re-parses the note it changes, and reads every other note
from what the tree holds. `parsed` in `src/lsp/parsed.go` keeps each note's
headings, their slugs and a guidance note's rule lines, keyed by the text they
come from:

| what the tree holds | made again when |
|---|---|
| a note's parse | its text differs from the one the parse reads |
| the pairs of guidance rules | a guidance note's text changes |
| the list of paths | a buffer names a path the list lacks |

# The config reads absolute paths

Vale matches a section of `.vale.ini` against the path it receives, and an
editor hands it an absolute one. So every section naming a folder opens on
`**/`, and a contract test holds that.

# A second copy draws

`src/lsp/restated.go` holds the rules below over a second copy of a fact. One
measure answers both: the longest run of words the places share.

| the rule | what it weighs | the bound it reads |
|---|---|---|
| `RestatedPointer` | a heading, against the heading its pointer names | `restated.pointer` |
| `RestatedRule` | a numbered rule, against the same rule in another guidance note | `restated.rule` |

A bound of nothing holds its rule off, the way the name cap reads its own. So a
tree carrying no `restated` block draws neither rule, and a person turns one off
by writing zero.

The pass reads every note, so the tree holds its findings and each front pays it
once. A buffer the editor changes drops them, and the next ask pays again.
`Over` hands one file its own share, and the sweep hands back the whole list.

Vale carries the third rule of the set, over a line beside a table. For how it
lands, see [[spec/design_output/projection#a-layer-writes-two-files]].

# A pointer reaches a heading

A pointer names a note and a chapter, as `[[note#anchor]]`. `anchorFaults` in
`src/lsp/anchor.go` reads every pointer a tracked file carries. It resolves the
note the way the restated rule does, and reads the anchor against the note's
headings through `headingNamed`. A note that stands and holds no such heading
draws `DeadAnchor` on the pointer's line, and the message names the anchor.

| the pointer | what draws |
|---|---|
| a note the tree lacks | nothing here, because the link check owns it |
| a heading the note holds | nothing |
| a heading the note lacks | `DeadAnchor`, with the file, the line and the anchor |

`Over` reads the one file the front names, and `Sweep` reads every tracked
file, so the panel and `./RUNME.sh lint` draw the same finding. A heading
renamed takes every pointer at the old name down at once, and the sweep names
each one.

# A marked rule wants argument

A guidance note marks the rules wanting an argument, and the rationale beside it
carries a chapter for each. `src/lsp/marked.go` reads the pair, off the schema
key `matches`. [[spec/design_output/schema#a-finding-names-the-section]]

| what it reads | where it comes from |
|---|---|
| the key naming the note | `matches` under `subsections` in the schema |
| the note itself | the frontmatter key that names it, as a link |
| the marked items there | a numbered line closing on a star |
| the chapters here | the numbered headings under the chapter the schema names |

A marked item with no chapter of its number draws, at the chapter holding them.
A chapter past the marked items stands, because a note arguing more than it must
costs a reader nothing.

The reading takes the note and its rationale, so it stands where the tree
stands. `checkNoteIn`
takes the tree and `checkNote` reads the one buffer beside it, which is what the
write door hands in.

# A marker carries old news

`spec/config/styles/VoiceVale/History.yml` refuses the words placing a claim in
a tree that stands no more. The past tense rule reads a verb, and these markers
read in the present, so they pass it and carry the history anyway.

The rationales argue a change, so `.vale.ini` switches this rule off there, the
way it switches the past tense off.

# The editor speaks over stdio

The extension starts `se-lsp` over the language server protocol, on the binary
under the runtime folder. A box carrying no binary keeps the sidebar and loses
the server. `serverAsk` in `src/extension/lib/lsp.js` says what the client
runs, and `Speaks` in `src/lsp/lsp.go` answers it:

| the editor sends | the server does |
|---|---|
| `initialize` | names itself, and asks for the whole text on every change |
| `initialized` | sweeps the tree, and watches the files the tree rules read |
| a document opens, changes or saves | holds that buffer in the tree in place of the disk, and draws it |
| a document closes | drops the buffer, so the disk answers again |
| `shutdown`, then `exit` | answers, and ends |

The language client is the extension's one dependency, pinned in its manifest.
The installer links it beside the extension, so no copy travels.

## A finding is a diagnostic

`drawsAs` turns one finding into one diagnostic. The rule is the code, the
message is the text. The range runs from the column to the end of the line. A
finding counts its line and column from one and the editor from zero, so the
draw takes one off each.

# The standing file

`se-lsp serve` holds a resident server on a loopback port, so a caller pays the
start once. `Serve` in `src/lsp/serve.go` writes where it stands into
`.se/.runtime/lsp.json`, the way the index door writes its own:

| the field | what it says |
|---|---|
| `port` | where the server listens |
| `pid` | the process holding it |
| `root` | the tree it reads |
| `stamp` | the binary's own time and size |

`reaches` in `src/lsp/main.go` reads that file first. A server answering on
that port with the same root and stamp takes the call. It tells a stale one to stop, drops the file, and starts a
fresh server, as many times as `tries` there allows.

# The build beside the index

The server is pure Go, so it needs no compiler and no network. It shares no
step with the index, which is C and waits on a compiler. `lsp_here` in
`src/scripts/install.sh` builds again where a source file stands newer than the
binary. A binary older than its source lints against rules the tree no longer
carries.

# Every pointer resolves

`EveryPointerResolves` in `src/lsp/pointer.go` follows every pointer a tracked
file writes, and names each one landing nowhere as an error. So the check
refuses it, and the panel draws it under the line.

| what it reads | where |
|---|---|
| a note's frontmatter | every key but `kind`, which names a taxonomy and no file |
| a note's body | every line outside a code span, a fenced block and an indented block |
| a yaml file | every line outside a code span, because a `reads` line and a checklist item there are pointers a reader follows |
| any other text file | the comment on a line, from where it opens |

A target carrying `<` or `>` is a shape a document spells out, and one carrying
a quote or a bracket is a script guarding the shape. Neither reads as a pointer.

A pointer resolves the way the index resolves a link, and then one step
further. The file is the exact path, the path with `.md`, `.yaml` or `.yml` on
the end, a note's id, or a folder, in that order. The index tries `.md`
alone, and a ticket names its process with the ending off, so this rule tries
the two a process file wears. A chapter after `#` names a
heading of that note by its slug. A chapter of a file holding no headings
resolves nowhere. For the slug, see [[spec/design_output/vocabulary#the-slug-reads-one-source]].

In a code file the rule reads a comment alone. A pointer in a string is a
fixture a test writes, and this tree holds such fixtures. `./RUNME.sh links`
reads the notes off the index and answers what reaches nothing. This rule reads
every file, and reaches into the chapter.

# A pointer opens its target

The server answers `textDocument/documentLink`, so an editor draws every
pointer a file writes as a link, and a click opens what it names. `linksIn` in
`src/lsp/links.go` reads the pointers `pointersIn` reads, and resolves each one
the way the resolve rule does. For the order, see
[[spec/design_output/lsp#every-pointer-resolves]].

| the pointer | where the click lands |
|---|---|
| a file, a path without its ending, or a note's id | the file |
| a chapter after `#` | the heading of that chapter, on its line |
| a folder | nowhere, because an editor opens no folder from a link |
| a target landing nowhere | nowhere, and the resolve rule draws it |

The link spans the brackets whole, so the text a reader clicks is the text the
rule names. A column counts UTF-16 units, the unit the protocol reads by default.
