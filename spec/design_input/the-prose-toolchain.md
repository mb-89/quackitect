# The prose toolchain

What to buy, what to build, and what to leave.

This note surveys the tools that could hold the rules in
[[spec/design_input/prose-under-control]], and proposes one shape for them.

## Two tools are called Vale

This matters before anything else, because the two are unrelated.

| name | what it is |
|---|---|
| `vale-cli/vale`, formerly errata-ai | the markup-aware prose linter, Go, twelve extension points, style packages |
| `stuffbucket/vale` | a pure-Go ASD-STE100 linter with an MCP server and an LSP, MIT |

The group's token wk-f2b58d1c04 names the first, and that is the one to take.
The owner ruled that no MCP server is wanted and that the language server shows
every error. The second tool's draw was its MCP server and its own LSP, so that
ruling settles it. What is left of it here is its seven rules as a specification
and its OpenSTE wordset.

## The five jobs

| job | who does it today | who could |
|---|---|---|
| fix mechanically | `se format`, Go alone | a formatter and a fixer action |
| find mechanically | the write path, four patterns | a linter with a rule set |
| judge semantically | nobody | a model, per span |
| refuse | the write path and the guard | a function hook |
| measure | `theVoiceOf`, read by nobody | the retro, once it exists |

## What exists

| tool | language | what it holds | verdict |
|---|---|---|---|
| `vale-cli/vale` | Go, a binary and never a library | twelve extension points, part-of-speech sequences, `vale fix --apply`, style packages | take, as one more program the verbs run |
| `openste/openste` | JSON, MIT | the approved wordset, openly licensed | take, as the vocabulary |
| `stuffbucket/vale` | pure Go, MIT | seven STE rules, the OpenSTE wordset, an MCP server, `--fix` through a model endpoint | read as a specification |
| `golangci-lint` | Go | fourteen of the fifteen `writing-go` rules | take, it is on the box already |
| `jscpd` | JavaScript, 224 formats | copy-paste detection, markdown among them, JSON and SARIF out | take, for the repetition rule |
| `typos` | Rust | spelling in code, with `--write-changes` | take, with the two-line config below |
| `lychee` | Rust, one binary | link checking over markdown, anchors included | leave, it knows none of the five namespaces |
| Harper | Rust, `harper-ls`, `harper-core` | grammar in 10ms, offline, understands code-like syntax | leave for now |
| LanguageTool | Java | grammar, 650ms a document | leave |

## The OpenSTE wordset settles the licence

ASD-STE100 Issue 9 is free to obtain and restricted to redistribute.
That is why wk-f60b47a1c9 says the wording has to be this project's own.

OpenSTE is a community wordset for the same job, published as JSON under MIT.
`stuffbucket/vale` already vendors it.

So the approved vocabulary can ship in this tree, and the rule that needed a
person to reword it becomes a rule a program holds.

## The shape: one rule set, four callers

The rules live in one style folder. Four things read it.

| caller | when | what it does with a finding |
|---|---|---|
| `se format` | before the commit, and on demand | runs `vale fix --apply` |
| `se lint` | after format, and in the battery | reads `--output=JSON --counts` |
| the language server | as the person types | publishes a diagnostic, and the `Action` as a code action |
| the function hook | at the write | refuses, naming the span and the replacement |

The gate is the same runner called from a different place.
So the work is one linter and four callers.

## Where the model sits

Three places, and they are not interchangeable.

**A span judge, in the hook.** `$.model.classify` answers one label for one
span, on the session's own client and the small fast model. This is the gate
for the rules no pattern holds. It refuses.

**A rewriter, in `se format`.** `stuffbucket/vale --fix` sends the text and the
findings to a model endpoint and prints the corrected document. This is worth
copying for the rules a regular expression finds and cannot fix, such as a
sentence over the word limit.

**A tool the agent calls.** `vale mcp` serves `lint_text`, `fix_text`,
`list_rules` and `update_vocabulary`. The owner ruled in September 2026 that no
MCP server is wanted, because the language server shows every error. So this
place stays empty. A tool the agent chooses to call is a tool the agent skips,
and the hook is the gate.

## What to leave, and why

**Harper.** It is a grammar checker and these are style rules. Its 10ms
budget beats an LSP round trip through Vale, so it earns a second look if the
panel feels slow. It holds none of the fourteen rules this project wrote.

**LanguageTool.** 650ms a document, and a Java runtime on every box.

**An MCP-only gate.** See above.

**The ASD dictionary.** OpenSTE reaches the same place with no licence to read.

## Measured on this box

Spiked in September 2026 under `.se/scratchpad/spike`. Every line below is a
run rather than a search result.

**The module moved.** `github.com/errata-ai/vale/v3` refuses to install and
names its own path as `github.com/vale-cli/vale/v3`. The version is 3.20.0.
It installs with `go install`, and the build compiles tree-sitter parsers.

**It lints a Go comment and leaves a string alone.** One fixture carried the
same shouted sentence twice, once in a comment and once in a string literal.
Vale reported the comment at lines 3 and 5 and said nothing about the string
at line 8. So wk-c40e28b6d1 is answered and the reach comes with the tool.

**A paragraph limit is seven lines of YAML.** `extends: occurrence` with
`scope: paragraph`, `max: 6` and a sentence token caught a paragraph of seven
and passed one of two. That is voice rule 2, whole. See wk-f58c31d0b7.

**It fixes in batch, through a hidden subcommand.** `--help` lists no fixer and
`--fix` does not exist. `vale fix --apply <path>` writes every unambiguous fix
to disk and answers `applied 2, skipped 0`. A mixed line lost its `utilise` and
kept its shout and its passive, which is the right cut. So `se format` runs one
command and wk-b1e83f60d7 needs no fix applier of its own.

**The fix is also data, for the panel.** `--output=JSON` carries `Action` with a
name and parameters, beside the span, the line and the match. One rule answered
`{"Name":"replace","Params":["use"]}` with `"Span":[4,10]`. The language server
offers that as a code action.

**`--counts` answers the retro.** It puts per-check counts in the JSON, zeros
included, so the number per rule is one command.

**It is a binary and never a library.** `github.com/vale-cli/vale/v3` carries
only `cmd` and `internal`, so Go refuses the import from another module. The
importable `lint` package belongs to version 1. So the shape is a subprocess,
which is what `se format` and `se lint` already do for gofmt, go vet and
golangci-lint. Vale is one more row in that table, and wk-bb6d003644 is the
token that adds rows.

**Useful flags:** `--filter` selects rules by an expression, `--glob` narrows
paths, `--minAlertLevel` sets the floor, and `--ext` with `--path` lints stdin.

**Part of speech works, and it is the reason to take this tool.** A `sequence`
rule of two tokens, a be-verb then a `VBN`, caught `was written`, `is granted`
and `are read`. It passed `The engine writes the file` and a sentence with no
participle. That is voice rule 5 in eight lines, and no pattern reaches it.

**The reach into code is partial.** One Go file carried a passive sentence and
seven sentences in one comment. Vale reported neither. The same line in a
markdown file reported both. So `existence` rules read a Go comment, and
`sequence` and `occurrence` with `scope: paragraph` do not. The word limit and
the paragraph limit stay with the engine for code, and Vale holds them for
prose. wk-c40e28b6d1 keeps a job after all.

**Five draft rules over this tree**, at warning and above:

| tree | findings | files | worst rule |
|---|---|---|---|
| `spec/guidance` | 227 | 13 | passive, 180 |
| `spec/rationale` | 332 | 42 | passive, 265 |
| `src/engine` | 4913 | 419 | a shouted opening, 3889 |

The rules were a shouted opening, a contraction, the antithesis phrases, a
paragraph limit and the passive. Two of the five never fired in `src/engine`,
which is the partial reach above.

**stuffbucket/vale is 0.15.0 and did not install.** The module resolves and
carries no package at its root or at `cmd/vale`. Its value here is its seven
rules as a specification and its OpenSTE wordset, so the path matters less.

## typos needs two lines of config to be useful

Version 1.50.1, one static binary from the release page.

Over `spec`, `src` and `util` it reported 42 findings, and most were hex inside
a token id. `wk-70dde20ba7` gave `ba`, and `wk-808abd40a4` gave `abd`.

With `extend-ignore-re` for `wk-[0-9a-f]{10}` and a hex run, the count falls to
24 and the survivors are real: `Boxs`, `Archiv`, `unparseable`.

So it earns a place, and the config is part of taking it.

## jscpd answers the repetition rule

It reaches one line with `--min-lines 1`, and voice rule 1 already puts one
sentence on one line. So a repeated sentence is a repeated line here.

Run over this tree:

| tree | clones | duplicated lines |
|---|---|---|
| `spec/work` | 655 | 6603, 29.94 percent |
| `spec/guidance` | 17 | 25, 1.42 percent |
| `spec/rationale` | 0 | 0 |

That localises the fault. The guidance and the rationales are clean, and the
repetition is the token template. So wk-a6e9720c48 needs no hash of its own.

## lychee is the wrong tool for a link here

A wiki link in this tree resolves through four namespaces: a path, a note name,
a process or schema kind, and the archive.

Measured: 1187 wiki links, and a resolver knowing only paths and note names
calls 368 of them broken. Most are `[[trivial]]`, `[[standard]]` and
`[[rationale]]`, which reach `spec/processes` and `spec/schemas` by kind.

lychee reads markdown link syntax and HTTP. It knows none of the four. So the
engine keeps this check, and lychee earns a place only where a real URL appears.

The same run found breaks that are real. `[[spec/guidance/ASD-STE-100]]` and
`[[spec/guidance/stakeholders]]` reach nothing, which wk-f60b47a1c9 already
carries. `[[src/schemas/guidance.schema.yaml]]` names the folder before the
move. Four links name a token that is not in `spec/work`, so a link into the
archive is a fifth namespace the check has to know.

## A guard bug found on the way

The delete guard refused to remove a file this session had just written under
`.se/scratchpad`, which its own message names as an exception. The command ran
with `cd` into that folder and named the file relatively. So the guard resolves
a relative path against the work root rather than the folder the command runs
in. This wants a token of its own.

## What this changes in the group

| token | change |
|---|---|
| wk-f2b58d1c04 | names `vale-cli/vale`, and the spike above decides the comment reach |
| wk-f60b47a1c9 | takes the OpenSTE wordset, so the vocabulary ships |
| wk-a6e9720c48 | takes `jscpd` at `--min-lines 1` and writes no hash |
| wk-a04e6c8b53 | stays in the engine, and knows five namespaces rather than one |
| wk-b1e83f60d7 | applies the `Action` the JSON carries, and gains `typos --write-changes` |
| wk-c40e28b6d1 | answered by the tool, which reads a Go comment and skips a string |
| wk-f58c31d0b7 | is seven lines of YAML under `extends: occurrence` |
| wk-c1d8306e57 | unchanged |

Sources: `vale-cli/vale`, `openste/openste`, `stuffbucket/vale`,
`Automattic/harper`, `kucherenko/jscpd`, `lycheeverse/lychee`, `crate-ci/typos`.
