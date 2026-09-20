---
kind: [[design_output]]
refines: ["[[spec/design_input/one-server-holds-the-shape]]"]
---

# Scope

`src/lsp` holds a language server of this tree's own. It stands beside Biome,
and draws every finding the battery reads. This note covers the shape a
finding takes, the checker under every front, the two fronts, the port, and
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

A file redraws on four roads:

| road | what redraws |
|---|---|
| the server starts | every file, off this server's sweep and one ask to the bridge |
| the editor opens a file | that file, off the buffer |
| a person types in a file | that file off the buffer, and the bridge again after the quiet span |
| the editor saves or closes a file | that file, and a save asks the bridge again |
| anything changes a file on disk | that file, off the disk and the bridge |

## One checker every front asks

Three fronts ask for a reading, and each reaches one rule set:

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
`test/contract/one-reading.test.js` holds the two fronts against each other
over the whole tree.

# The panel follows the disk

At its start the server asks the editor to watch every file under the root.
The editor then names each file that changes on disk, whoever changes it: an
agent, git, or a script. The server reads the type each change carries.

| the change | what the panel does |
|---|---|
| a new or a changed file | redraws it off the disk, and the bridge answers for it again |
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

# The config reads absolute paths

Vale matches a section of `.vale.ini` against the path it receives, and an
editor hands it an absolute one. So every section naming a folder opens on
`**/`, and a contract test holds that.

# A second copy draws

`src/lsp/restated.go` holds two rules over a second copy of a fact. One measure
answers both: the longest run of words two places share.

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

# A marked rule wants argument

A guidance note marks the rules wanting an argument, and the rationale beside it
carries a chapter for each. `src/lsp/marked.go` reads the pair, off the schema
key `matches`. [[spec/design_output/schema#what-each-keyword-draws]]

| what it reads | where it comes from |
|---|---|
| the key naming the note | `matches` under `subsections` in the schema |
| the note itself | the frontmatter key that names it, as a link |
| the marked items there | a numbered line closing on a star |
| the chapters here | the numbered headings under the chapter the schema names |

A marked item with no chapter of its number draws, at the chapter holding them.
A chapter past the marked items stands, because a note arguing more than it must
costs a reader nothing.

The reading takes two notes, so it stands where the tree stands. `checkNoteIn`
takes the tree and `checkNote` reads the one buffer beside it, which is what the
write door hands in.

# A marker carries old news

`spec/config/styles/VoiceVale/History.yml` refuses the words placing a claim in
a tree that stands no more. The past tense rule reads a verb, and these markers
read in the present, so they pass it and carry the history anyway.

The rationales argue a change, so `.vale.ini` switches this rule off there, the
way it switches the past tense off.
