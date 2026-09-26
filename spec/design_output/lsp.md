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

The panel draws the list `se-lsp check` answers, and a finding standing there
holds a push. The server runs every source itself, so a rule reaches the
editor the way it reaches the check:

| source | draws an open file | draws a closed file |
|---|---|---|
| this server's own checks | this server | this server |
| Vale, through the tense reader | this server, off the buffer | this server |
| the code faults and the exemption markers | this server, off the buffer | this server |
| Biome | the Biome extension, while a person types | this server |

For how the server runs each tool, see [[spec/design_output/lsp#the-server-runs-the-tools]].

The Vale extension runs raw Vale, which knows no tense reader. So the
workspace settings hand it a filter no rule passes, and it draws nothing.

A file redraws on the roads below:

| road | what redraws |
|---|---|
| the server starts | every file, off this server's sweep, then off Vale and Biome over the tree |
| the editor opens a file | that file, off the buffer |
| a person types in a file | that file off the buffer, and Vale again after the quiet span |
| the editor saves a file | that file, and Vale and Biome over it at once |
| the editor closes a file | that file off the disk, and Vale and Biome over it again |
| anything changes a file on disk | that file, off the index once it sweeps, and Vale and Biome over it at once |
| a file the tools read changes | every file, off Vale and Biome over the tree |

## One checker every front asks

The fronts below ask for a reading, and each reaches one rule set:

| the front | what it asks |
|---|---|
| the editor's panel | this server's own sweep, and Vale and Biome beside it |
| the port | the list the panel holds |
| a person, at `se-lsp check` | the same sweep, fresh |
| `./RUNME.sh lint` | `se-lsp check`, and `findingsOver` in `src/bridge/findings.js` beside it |

`Whole` in `src/lsp/check.go` holds the sweep every front reads: this server's
own rules, and the tools beside them. The tree readers and the schema readers
in `src/scripts/cli-read.js` stand behind `se-lsp check`, for a box carrying no
server.

`test/contract/one-reading.test.js` holds the fronts against each other over
one file.

## The lint ends on findings

`./RUNME.sh lint` prints the count a rule first, then the sum, then the
finding lines. A long run scrolls its head away, and the eye lands on the
last lines. So the lines a hand fixes stand last. `lintRows` in
`src/scripts/cli-read.js` owns the order, and the warning note stands between
the count and the findings.

# The server reads the index

Every front reads the tree off the index door, and no file of the tree off the
disk. Vale and Biome read a file no editor holds off the disk themselves, and a
buffer reaches Vale on its input. `indexDisk` in `src/lsp/indexed.go` holds what it pulls: each path, its
hash, whether git tracks it, and its text. For the verbs it asks, see
[[spec/design_output/index#a-reader-takes-the-tree]].

| the front | when it pulls |
|---|---|
| the editor's panel | once at its start, then on every tick the door's `changes` answers |
| `se-lsp check` | once, after the door sweeps, so the check reads the disk as it stands |
| the loopback door | before every answer |

A door standing nowhere gets started through its binary, the way every caller
starts one. A door that answers nothing stops the server, and the error names
`./RUNME.sh`, which builds the index. The tree has no second road.

`Tree.Paths` answers the paths git tracks, off the index. The cases read a
folder they write, through a disk standing in the cases alone.
`TestTheBinaryReadsTheTreeThroughTheIndexAlone` holds the binary to one reader.

The config layers stand partly outside the tree, so the server reads them once
at its start, through the config reader. [[spec/design_output/config#the-go-reader]]

# The panel follows the index

The server holds no watch of its own. It asks the door's `changes`, which
answers once a sweep lands, and pulls again. So a file redraws whoever writes
it: an agent, git, or a script.

| what the pull names | what the panel does |
|---|---|
| a tracked file whose hash moves | redraws it off the index, and runs Vale and Biome over it at once |
| a tracked file the index drops | takes its row with it, and no rule reads it |
| a file git tracks nowhere | nothing, because no rule reads it |
| a file a pointer names, where the file moves or goes | redraws the file carrying the pointer too, off this server's own rules, so a heading that lands clears the dead anchor on it |
| a file the tools read, which `toolInputs` in `src/lsp/outside.go` names | runs Vale and Biome over the whole tree again |

One run of the tools goes at a time. A file named while one runs waits for the
next, so the rows that land read the newest text.

An open file follows the editor's buffer. A write on disk reaches the panel
once the index moves the rows the write names.

# The panel lints as typed

A change to an open file waits the quiet span `lintQuiet` names in
`src/lsp/panel.go`, and every change inside that span joins one run. The run
hands each buffer as it stands to Vale on its input.

| what reads the buffer | how |
|---|---|
| Vale | on its input, at the buffer's own path, so the config sections match |
| the tense reader | over the buffer's text |
| the code faults and the exemption markers | over the buffer's text |
| Biome | nowhere, because its own server draws an open file |

So a Vale finding leaves as a person fixes the line, and no source waits for a
save. A file the editor closes inside the span reads off the disk again, because
its buffer stands no more.

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

# The server runs the tools

The server runs both binaries the way `findingsOver` in
`src/bridge/findings.js` runs them for the lint, so both lists name the same
rows. `Outside` in `src/lsp/outside.go` holds the runs:

| what | where the server reads it |
|---|---|
| each binary, and node | `.se/.runtime/tools.json`, else the runtime binary folder |
| the Vale config | `.vale.ini` at the root, else the one the assembly writes under `.se/vale` |
| the folders Vale skips | `PARKED` in `src/bridge/findings.js` |
| the Biome config | `CONFIG_DIR` in `.claude/skills/level0/lib/code.js` |
| a past tense row | the tense reader in `src/engine/tense.js`, run through node |
| the code ceilings | `code.functionLines` and `code.fileLines`, through the config reader |

`src/lsp/textfaults.go` reads the code faults and the exemption markers the
way the lint reads them, over the files the lint walks. `SKIP` in
`src/bridge/findings.js` names the folders that walk passes.

Each row names its source, so the panel leaves an open file's Biome rows to the
Biome extension:

| the rows | the source |
|---|---|
| Vale's | `vale` |
| Biome's | `biome` |
| the code faults and the exemption markers | `tree` |

| the box | what the server draws |
|---|---|
| a row names a file the index holds nowhere, or a draft | nothing |
| Vale answers a fault, or stands nowhere | `ValeRuns` on the config, in Vale's own words, so a broken rule stands in the panel |
| no node, or no tense reader | every past tense row |
| no Biome | no Biome row |

`StopFolderIsData` and `GridHolds` read JavaScript modules, so this server
draws neither.

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
| `initialize` | names itself, asks for the whole text on every change, and offers completion on `:`, a space, `#` and `[` |
| `initialized` | sweeps the tree, and follows the index |
| a document opens or changes | holds that buffer in the tree in place of the disk, an empty one too, and draws it |
| a document saves | draws the buffer the tree holds |
| `textDocument/documentLink` | answers every pointer as a link |
| `textDocument/completion` | answers what the schema allows at the cursor |
| a document closes | drops the buffer, so the disk answers again |
| `shutdown`, then `exit` | answers, and ends |

The answers and the panel share one pipe. `writes` holds a lock for each
frame, and `wire` in `src/lsp/wire.go` holds the buffer under the pipe, so the
swap watcher's flush lands between frames.

The language client is the extension's one dependency, pinned in its manifest.
The installer links it beside the extension, so no copy travels.

## A finding is a diagnostic

`drawsAs` turns one finding into one diagnostic. The rule is the code, and the
message is the text. Each severity draws at the Language Server Protocol's
level of the same name: an error, a warning, or a hint. A hint draws as a
faint mark under the text alone, and the Problems panel holds no row for it.
The range runs from the column to the end of the line. A finding counts its
line and column from one and the editor from zero, so the draw takes one off
each.

A finding counts its column in bytes, and the editor in UTF-16 units. So
`unitsTo` in `src/lsp/columns.go` turns the column, and a line carrying `ä` or
an emoji draws under the right characters.

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

# A port serves the list

While the editor speaks to the server over stdio, the server also listens on the
loopback address. It writes where it stands into `.se/.runtime/panel.json`, the
way the bridge writes `vehicle.json`:

| the field | what it says |
|---|---|
| `port` | where the server listens |
| `pid` | the process holding it |
| `root` | the tree it reads |

`GET /findings` answers the list the panel holds. Each `path` in the query
keeps the rows on that file or under that folder, and a query naming none keeps
every row. The answer waits until every run of the tools lands, up to the span
`settleWait` names in `src/lsp/port.go`:

| the key | what it holds |
|---|---|
| `ok` | true |
| `settled` | whether every run lands before the answer |
| `open` | the paths an editor holds, whose rows read the buffer |
| `found` | each finding: `file`, `line`, `column`, `rule`, `severity`, `message`, and `source` where a tool draws it |

The list carries an open file's Biome rows too, read off the disk, which the
panel leaves to the Biome extension. The server drops the file as it exits,
where the file still names its own process. A file naming a process that
answers nothing stands stale.

`se-lsp check` runs the same sweep with no server standing, so a caller with no
editor reads the same list. `TestThePortAnswersWhatTheCheckAnswers` in
`src/lsp/port_test.go` holds the two against each other.

# A closed ticket is history

A closed ticket records the tree at its close. A note or a name it points at
leaves later, and the record stands as it is. So no rule reads a ticket
under `spec/tickets` whose frontmatter says `state: closed`:

| the front | where it drops the rows |
|---|---|
| the server | `isHistory` in `src/lsp/history.go`, in the checker's four entry points |
| the lint | `pastHistory` in `src/bridge/findings.js` |

An open ticket keeps every row.

# The build beside the index

The server is pure Go, so it needs no compiler and no network. It shares no
step with the index, which is C and waits on a compiler. A binary built off
other source lints against rules the tree no longer carries.

`lsp_here` and `index_here` in `src/scripts/install.sh` ask
`src/scripts/go-source.js` whether the stamp beside the binary holds the hash of
its source. The hash reads the binary's folder and every local folder its
`go.mod` replaces, through `sourceHash` in `src/scripts/tui-build.js`. A test
file moves nothing. The build writes the stamp.

# The client starts it again

A rebuild swaps the binary, and the running server ends itself once it sees the
swap. The language client's own handler stops at a cap of starts again, which
`DefaultErrorHandler` in `vscode-languageclient` holds. So `clientOf` in
`src/extension/lib/lsp.js`
hands the client a handler starting `se-lsp` again on every close, after a
pause of a second. A server falling at its start then loops once a second.

# The doctor probes the server

`doctor` prints a `se-lsp lsp` row off `lspProbe` in `src/scripts/cli-check.js`.
The probe starts `se-lsp lsp` in the tree, writes `initialize`, a `didOpen` of
a note under `spec/tickets` carrying no frontmatter, `shutdown` and `exit`, and
reads what comes back.

| the server | the row |
|---|---|
| answers a publish | `answers`, with each diagnostic code it draws |
| exits, or answers no publish | `warn`, with the exit and the first line it writes |
| stands nowhere | `missing, run ./RUNME.sh` |

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
further. For the order, see [[spec/design_output/index#a-note-and-its-links]].
A chapter after `#` names a
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

# The completion reads the schema

`offers` in `src/lsp/complete.go` reads the line up to the cursor, off the
buffer the tree holds. It reads the schema through the readers the checker
reads, so the offer and the check name one shape:

| the cursor stands | the server offers |
|---|---|
| on a frontmatter key | each property the schema names and the note lacks, with its description |
| after `key:` | the `const` and the `enum` of that property, in brackets where it names a link, or `true` and `false` |
| on a note naming no kind | `kind: [[x]]`, for the schema governing the path, or else every kind |
| on a heading at the schema's level | each chapter the schema wants and the note lacks, a step's chapter too |
| after `[[` | every path the tree tracks, a note without its ending |
| after `[[note#` | the slug of every heading that note holds |

The editor counts the cursor in UTF-16 units, so `byteAt` in
`src/lsp/columns.go` turns it into a byte first. Every item replaces what the
line holds from the colon, the hashes or the brackets up to the cursor. A
pointer closes its brackets where the line holds none.

# The hover shows a term

`hoverAt` in `src/lsp/hover.go` reads the word under the cursor and answers the
line the dictionary holds for it:

| the cursor stands on | the hover shows |
|---|---|
| a term, or an ending or a prefix on one | the term and its `means` line |
| a word of a term of several words | the whole term, the longest that covers the cursor |
| a term carrying `source` | the line, then the address |
| a core word or no word | nothing |

The server reads `terms.yml` and the table of endings on each ask, off the
paths the vocabulary layer names. The extension sends no buffer of the list, so
a save reaches the next hover. For the table, see
[[spec/design_output/vocabulary#the-rule-matches-a-stem]].

# An engine field warns

A property carrying `x-engine: true` belongs to the verbs. For who writes each
one, see [[spec/design_output/schema#the-verbs-own-their-fields]].

`engineFaults` in `src/lsp/owned.go` reads an open buffer against the file the
index holds. Where the value of such a key differs, it draws
`EngineOwnsField` at hint, on the line of that key. `hint` in
`src/lsp/finding.go` owns the level, and
[[spec/design_output/lsp#a-finding-is-a-diagnostic]] says what it draws as.

| the buffer | what draws |
|---|---|
| an engine key standing as the file holds it | nothing |
| an engine key the buffer changes | a hint naming the verbs, because the next pull writes over the edit |
| an engine key the buffer drops | a hint, on the frontmatter's first line |
| a file no editor holds | nothing, so the sweep and the check draw nothing |

A person edits what they like, so the hint refuses nothing, and stands off
the Problems panel.
