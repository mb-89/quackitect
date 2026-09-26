---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-index-holds-the-model]]
  - [[spec/design_input/the-migration-runs-in-slices]]
---

# Scope

What today's tree holds against the model, folder by folder, and what each
piece becomes. A box working a phase reads its slice here before it ports it.
The order of the phases stands in
[[spec/design_input/the-migration-runs-in-slices]].

The page beside this note carries the inventory as tables:
[the-migration-inventory.html](../pages/the-migration-inventory.html).

`wc -l` over a folder answers its size, so this note carries none.

# Where each folder goes

| today | becomes | fate |
|---|---|---|
| `src/index` | the index process: the model, supervision, `files/`, SQLite | grows |
| `src/lsp` | the LSP door keeps the protocol, and the checks and schema rules become the check module | splits |
| `src/tui` | `quack tui`: `frame` becomes the generic shell and `tree` the base-view renderer, and the log and the work become declared views | reshaped |
| `src/config`, `src/yaml`, `src/pointer`, `src/engine/swap` | the index's `cfg/` topic, and process supervision | merged |
| `src/scripts` | the module processes, such as work, pull, retro and vehicle, and a Go command line in place of `cli.js` | ported, topic by topic |
| `src/bridge` | the hooks door, and modules for the write, bash, stop, answer and handover rules | ported |
| `src/engine`, `src/doors` | modules, such as retro, projection and group, and the outbound doors | ported |
| `.claude/skills/level0/lib` | modules, apart from what the hook module imports itself | ported |
| `src/extension` | a generic renderer for the sidebar and its forms, beside the route drawing, the lens and the inset | shrinks |
| the level zero hook module | forwards events, registers the tools the index lists, and spawns agents | shrinks |
| `copilot.js`, `precommit.js`, `prepush.js` | calls into the hooks door, `quack hook <event>` | ported |
| `spec/config/level0.schema.json` | generated from the `q.Cfg` and `q.Show` declarations | generated |

| area | what goes with no successor | what moves to Go | what stays |
|---|---|---|---|
| `src/scripts`: work, pull, ticket | the JSON hops over standard output, the check spawns in `cli.js`, the git read on every call, the dispatch and the usage | the pull, the queue and the outline, `work-answer.js`, the branch standing, the route walk, the ticket writes | nothing |
| `src/scripts`: the command line, check, retro, install | the verb routing in `cli.js`, `cli-doors.js`, `cli-served.js`, `serve.js` and `tui-build.js`, and most of `install.sh` | the battery and the stamp, the commit and the push, the log read, the retro, the vehicle and the stub, the styles | the editor link, trust, brand, browser and bundle |
| `src/bridge`, `src/doors`, `src/engine` | the server's lifecycle, reload and self-test. The caches, the index spawn per search, and the state a restart carries over | every cage rule, the tools as actions, the doors as Go doors with fakes, the retro | nothing |
| `.claude/skills/level0` | the start road, the pull's process hop and the search relay. The Copilot copy of the cage, the standing files, and the JavaScript twins of Go checks | config layering, guidance, the answer gate, voice, the bash guard, tickets, apply and undo, projections | the hook module, cut to a thin forwarder |
| `src/index`, `src/lsp`, config, yaml, pointer | the standing-file protocol, written twice, three self-spawn loops, the LSP's index client, the findings port, the long poll and the hash caches | the LSP rules and the schema checker, tickets, config | the index core, the LSP protocol and features, yaml |
| `src/tui` | its own index client, its spawn of `branch list --json` and `--count`, its own writes of `plan.json` and ticket fronts | the place, edit and flip logic, as plan and tickets actions | `frame`, `draw` and `tree`, and the log view |
| `src/extension` | the bridge process control, the verb spawns and their parsing. Its own log reader, its own config layering, and its runtime imports of the tree's JavaScript | the lens and field-mark logic, as pull and tickets names | the generic sidebar renderer, the route drawing, the lens and inset UI |

# What goes with no successor

| the kind | what stands there today |
|---|---|
| process lifecycle | the bridge server's start, takeover, reload, self-test and respawn. Four standing files with ports, and `show-panel`. Three ways to start the server and three to probe it. Two ways to swap a binary, and two to call it stale |
| verb plumbing | the dispatch table in `cli.js`, its usage texts and its flag parsing. The JSON over standard output of `branch list --json`, `ticket yours`, route, fill and `--judge`. The spawn text the hook parses. The sidebar count's chain of four processes |
| caches and change detectors | four detectors reading the modified time and size, and `caches.js`. The checks that call a projection or a Vale rule stale. The LSP's parse cache, and the hash caches in the LSP and the window over a long poll |
| code a restart asks for | the marks file, the canary debt rebuilt from the log, `fillsBox`, and the cache fields on the box |
| the second cage | `copilot-runtime.js`, which writes the write door, the trunk refusal, the stop checks and the handover again for Copilot |
| the twins | the JavaScript checks whose Go twins run in `src/lsp`: tree rules, schema, size, magic, names, paths, private, slug, and the Vale and Biome parsers. Every constant Go spells again |
| `install.sh` | the three Go builds, which become one, and the Zig download, per [[spec/rationales/the-index-drops-cgo]] |

# The duplications

Each row is one fact the model gives one owner. The cell names where the copies
already differ.

| the fact | the copies | what already differs |
|---|---|---|
| config resolution | `lib/config.js`, `src/config`, `src/bridge/config.js`, `src/extension/lib/widgets.js`, `src/lsp/config.go` | two readers skip the environment, and JavaScript alone merges the method and work roots. For details, see [[spec/tickets/config-reads-differ-by-reader]] |
| frontmatter parse and write | parsers in `index/front.go`, `index/ticket.go`, `lsp/note.go`, `schema-read.js` and `group.js`, and three writers | Go quotes a value, and JavaScript leaves it bare |
| the Ask chapter | `group.js`, `pull-chapter.js`, `index/ticket.go` | `group.js` keeps comments and the other two drop them, so the queue's text and the index's differ |
| held and group standing | `group.js`, `work-stands.js`, `index/ticket.go`, and the window's `Placed` | the window overrides it again |
| the current leaf of a route | `group.js`, `pull-route.js`, `ticket.js`, `lsp/group.go`, the extension's `lens.js` | a fixture test exists only to keep two of them in step |
| the hold folder readers | `guidance-hand.js`, `ephemeral.js`, `named.js`, `lens.js` | `folders.test.js` checks only that the copies agree |
| session log rows | `lib/log.js`, `tui/log/record.go`, the extension's `rows.js` | the level ladder stands twice |
| the index client | `lsp/indexed.go`, `tui/work/workindex.go`, `src/doors/index.js`, `lib/index.js` | each asks its own way |
| cloud detection | `cloud.js`, the hook's start script, `copilot.js`, the Copilot runtime | `cloud.js` reads `0` as off, and the start script reads any value as on |
| walk skip lists and globs | four skip lists, three glob translators | the two Go translators take different features |
| runtime paths, the port, `se-index`, `plan.json`, `tools.json` | Go, JavaScript, shell, and the stub hook | each spells them again |

# The gaps and their answers

| the gap | the answer | the phase it meets |
|---|---|---|
| session values reduce over events, and no file holds them | a third provider kind, `q.Fold`, over `session/`, with one owner | 0 specifies it, 5 builds it |
| git refs, contents by ref and merge bases move on fetch and commit, out of the watcher's sight | git is live input nowhere, per [[spec/rationales/git-stays-the-archive]] | 2 |
| a hand-back writes, stages, commits, pushes and runs the check | an action's output is an ordered list of door calls with an undo each. One writing action runs at a time, and git hooks read names alone | 0 specifies it, 4 builds it |
| the LSP checks unsaved buffers | a `buffers/` input the LSP door owns, and a check reads a buffer where one stands open | 7 |
| stale claims read the clock, and the hand reads the caller's box | a `clock/minute` input from the clock door, a session id on every inbound call, and per-session names under `session/<id>/` | 0 specifies it |
| the tense, sentence and vocabulary vetoes run on wink, in JavaScript | the prose checks move to Go, with wink as the reference | 3, and 10 drops wink |
| the hook answers more than forward, register and spawn: streaming, context fill, transcript rows, clear and resubmit, `model.classify`, `ui.log` | the answer protocol gets a spec, and the build writes the tool list into a file the hook reads at session start | 0 specifies it, 5 builds it |
| git hooks run with no index, a fresh clone carries no binary, and Copilot's command hooks time out | one `quack` binary, and `quack hook` starts the index where none answers | 1 |
| frontmatter rewrites and the generated Vale rules must stay byte for byte | Go becomes the one writer after one commit rewriting every ticket, and CI compares the Vale output byte for byte | 1 |
| twins differ in pointer resolution, env naming, skip lists and the schema subset | golden files per twin, and the owner reads each difference at the merge | 3 |
| `DoorsOnly`, `FakeDoorsInTest` and `OutsideInDoors` scan JavaScript imports | a `go/analysis` check over the import rules | 1 |

# The bugs on the way

The inventory names these, and each stands on a ticket of its own:

- [[spec/tickets/the-judge-reads-every-layer]], which carries its fix
- [[spec/tickets/the-sidebar-log-appends]], which carries its fix
- [[spec/tickets/config-reads-differ-by-reader]]
- [[spec/tickets/one-reader-names-the-home]]
- [[spec/tickets/the-lsp-folds-drive-letters]]
- [[spec/tickets/the-need-list-lacks-verbs]]
- [[spec/tickets/window-links-reach-private-tickets]]
- [[spec/tickets/vehicles-take-the-window-port]]
- [[spec/tickets/the-dead-exports-leave]]
- [[spec/tickets/the-hook-log-loses-lines]]

A phase porting one of these folders takes the ticket's fix with it, or closes
the ticket as answered by its own.

# The tests after the move

| the bucket | its fate |
|---|---|
| plumbing: servers, the start road, swaps, standing files, command-line glue, install, folders | deleted |
| event to decision through the bridge | replaced by a replay of session logs into the hooks door, asserting the same decisions. The logs record at `debug` |
| business logic: pull, work, ticket, retro, schema, stop, bash, apply | ported to Go module tests over door fakes |
| the Vale and prose rules | they stay, behind the Vale door |
| the extension and its UI | they stay in JavaScript, and the generic renderer cuts them down |
| door contracts | ported one to one, the real door against its fake |
| the generic contract tests | new: every registered name carries a default, a type and a doc, reaches the command line, HTTP and MCP, and every fake matches its door |
