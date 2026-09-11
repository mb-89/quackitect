---
kind: [[funnel]]
about: what level zero holds at its close, what the older lines and the field put at this layer, and what waits for level one
---

# Scope

Level zero is the layer that holds before anything else does. This note is its
roundup at the close of its build, in four parts:

- what it holds
- what v3 and v4 carry, and what v5 takes or leaves
- what the field puts at this layer
- what stays out for level one

It reads `main` at commit `5861d6c`, with the work branches `./RUNME.sh work
list` names standing open. The owner weighs the last chapter, and tomorrow
level one starts.

# What level zero holds

Every piece below has a design note, a door or a verb, and a test. `./RUNME.sh
help` names the verbs, `./RUNME.sh rules` the mechanical rules, and
`./RUNME.sh doors` the doors and their contract tests.

| piece | what it does | note |
|---|---|---|
| the standing layer | hands the guidance, the brief and the canary to every session, once, and again after a compaction | `level0` |
| the write door | lints a Write and an Edit with Vale, formats code with Biome, weighs a note against its schema, refuses a projection, and asks the judge | `level0`, `schema`, `projection` |
| the Bash door | reads every command, and refuses a shell write past the rules, a long branch name, a bare test run and a push at trunk. It lints a commit message too. | `bash` |
| the tooth | votes at every turn's end over the rules in `spec/config/stop`, re-prompts through `$.prompt.submit`, and takes a claim | `stop` |
| the answer door | refuses the first tool call of a person's turn before a readback | `level0` |
| the judge | asks a model one question per span for the rules no pattern holds | `level0` |
| the tools | `claim_stop`, `review_branch`, `log`, `patch`, `replace` and `undo`, each one a `tool.call` hook | `stop`, `review`, `log`, `apply` |
| the index | answers `Grep` and `Glob` out of warm rows, and holds every link and note | `index` |
| the projections | write a generated file from one source at every session start, and refuse a hand edit to a target | `projection` |
| the config | one resolver over three layers, and a verb naming which layer answers | `config` |
| the log and the viewer | one line per thing a door does, and a terminal window over it with a filter | `log`, `viewer` |
| the work verbs | a brief on a branch, `todo`, `held` and `done`, `take`, `sync`, `done`, `review`, `merge` and `close` | `work`, `review` |
| the doors and the fakes | one door per outside thing, a fake that behaves, and a contract test per door | `doors` |
| the tree rules | the rules over two files, and the names past five words | `tree` |
| the schemas and `mint` | one schema per kind of note, checked at the door and on the sweep | `schema` |
| the vehicle | a copy that drives another project, and the roots between them | `vehicle` |
| the editor | one sidebar, two language servers, and settings that travel | `extension`, `editor` |
| god mode and health | a cage holding nothing says so, and refuses the work until somebody mends it | `level0` |
| the Copilot surface | one level zero over two harnesses, through a runtime of its own | `copilot` |

# What the older lines carry

Nothing in this tree names v2. The harness survey in `spec/design_input` reads
v3 and v4, and the funnel notes carry v4's rulings.

| line | what it carries | what v5 does with it |
|---|---|---|
| v3 | proof of reading, three probes into a document, under the document's hash | out, and the canary is a weaker cousin proving arrival alone |
| v3 | `assertCanSupply`, a criterion refused at compile time where no tool can supply its evidence | out |
| v3 | typed refusals with an executable remedy, and a registry of them | in, as `refuse.js`, and the registry is the log |
| v3 | word-ordered scales in place of numbers | out, and `stop.hold` and `ask.wanted` are the first two scales |
| v3 | a demands ledger, so a moved tree says which criteria move | out |
| v3 | the privacy one-door, a six-word-run check between a digest and its source | out |
| v3 | `se_test` as a question, with polling refused | out, and the Bash door points a test run at one file |
| v3 | controls that only ever stop the engine refusing | the invariant the sidebar's three waiting controls owe |
| v3 | `doors.md` with a written reason per boundary and no off-switch | in, as `DoorsOnly` and the contract tests |
| v3 | a spawn ceiling of zero, from a day of measured loss on delegated writing | open, and the spawn hands a helper the standing text |
| v4 | the cage as an MCP lane, an engine and twelve events over HTTP | out, and the function hooks replace the lane |
| v4 | one protocol, JSON-RPC over loopback, and stdio goes | in shape, on the index's port and the third server's |
| v4 | the index, the projection, the schemas | in |
| v4 | work tokens, processes as data, four processes, the canvas | out, and `a-process-is-data` holds them for level one |
| v4 | the refusal as a menu | in, in every refusal's wording |

# What the field puts here

Two surveys on 2026-09-11 read the harness engineering writeups, the guardrail
frameworks, the Claude Code docs and the plugin ecosystem. The line every
mature system draws is the one this tree draws:

| always holds | shapes the work |
|---|---|
| permissions, allow and deny lists, path scoping | workflow and planning |
| a sandbox, an egress proxy | style and voice |
| deterministic validators, output schemas, tripwires | review judgement, which the client's own review keeps off the merge |
| an audit log, replay, fail-closed | approval specifics |
| lint and structural tests in CI, invariants | anything the model reasons about |

Level zero stands on the left of that table with one exception. The voice
rules are style, which the field keeps in a prompt, and this tree holds them
at the door. The transcripts say why. Three answers in four carry a breach
under the tree's own rules, and the bound sessions score within noise of the
unbound ones. So the prompt fails here as it fails everywhere, and the door is
the answer the field gives for everything else.

Three numbers from the field bound what a door buys and costs:

| the number | where |
|---|---|
| hooks hold a rule in every run, a prompt in about four runs of five | Strands, over six hundred runs each |
| an instruction against gaming leaves most of the gaming in place | METR, on reward hacking |
| hooks cost about half again the input tokens of a prompt | Strands, the same runs |

The client itself now holds pieces this tree builds by hand. Each row says
what to do about it:

| the client holds | level zero holds | what to do |
|---|---|---|
| a Stop hook with a cap of eight blocks, and `/goal` | the tooth, with `mostInARow` | keep the tooth, because it votes over rules as data |
| `PostToolUse` and `FileChanged` hooks | the write door | keep, because the client offers the event and none of the rules |
| deny rules, and a sandbox for the hard guarantee | the Bash door's parse | keep the door for the tree's rules, and take the sandbox for the hard line |
| `InstructionsLoaded`, `/doctor`, `/status` | the canary | keep, because the canary proves a plugin loads on a cloud box, where trust gates it |
| worktrees, which the client holds | the work branch | keep the brief and the handover, and let a worktree hold the isolation |
| the `Concise` output style | `ask.wanted` | keep, because ours is one turn's state and theirs is a session's |
| `security-guidance`, a judge that warns alone | the judge, which refuses | keep the refusal, and read their pattern for the cost |
| managed settings, `allowManagedHooksOnly` | nothing guards the cage's own files | open, below |
| function hooks, on their way as Claude Mods within weeks | the whole module | one migration branch on the day it lands |

The function hooks are the ground level zero stands on, and their author says
the API changes between releases. The contract test in `test/contract/loads`
and the declarations `/plugin-types` writes are the two guards, and a
migration branch is the cost to plan for.

# What closes level zero

| the piece | where it stands |
|---|---|
| the paragraph schema, its projection, the vocabulary, the answer gate, the question and the TL;DR, the judged rows | six work branches, from `a-paragraph-has-a-schema` |
| the third language server, and one verb asking all three | `work/the-server-holds-the-shape` |
| a folder that admits its own kind alone, and `mint_note` writing a note from its fields | `work/the-folder-names-the-kind` |
| the cage guarding its own files | open, below |
| a probe that the standing layer survives a compaction | open, below |

The measurement decides the close. `./RUNME.sh voice measure` over a session's
transcript, once the gate stands, says whether the chat lands under the
ceiling. That number, and a green check, is what done means here.

# What waits for level one

| the thing | why it waits |
|---|---|
| the engine, and its three controls in the sidebar | nothing answers a state, a binding or an autonomy yet |
| processes as data, work items, the orphan check, the canvas | `a-process-is-data` holds them, and the work verb runs one process with the data inside the code |
| proof of reading, the demands ledger, the pin | each one asks a model to prove something, and level zero asks it to obey |
| a cast of helpers, a scribe, a reviewer | v3's measurement stands against delegated writing, and nobody has answered it |
| the token bill, and `$.tool.list` as the lever | a measurement level zero has no number for |
| the retro as a process | the verbs give it rows to read, and the process that reads them is work |

# What stands open

| the question | what hangs on it |
|---|---|
| whether the cage guards its own files | a session can edit `.claude/skills/level0`, `.vale.ini`, the styles and the schemas today, and the field guards that layer first |
| whether the standing layer survives a compaction | `prompt.context` says it fires again, and the client's docs say a compaction summarises hook context, so a probe decides |
| what breaks when Claude Mods lands | the declarations move, and one branch pays the migration |
| whether the canary stays once the client names what loads | `InstructionsLoaded` reads `CLAUDE.md` today, and a plugin's block waits |
| whether proof of reading comes over from v3 | the canary proves arrival, and a probe proves reading, at the cost of a question per document |
| whether the trunk guard reads `git -C <path> push` | the field names it as the road past a text rule |
| where level zero ends | at the seven branches, or at the measurement showing the chat under the ceiling |
