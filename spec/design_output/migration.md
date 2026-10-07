---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-index-holds-the-model]]
  - [[spec/design_input/the-migration-runs-in-slices]]
---

# Scope

What today's tree holds against the model, folder by folder, and what each
piece becomes. A box working a phase reads its slice here before it ports it.
The graph of the phases stands in
[[spec/design_input/the-migration-runs-in-slices]].

`wc -l` over a folder answers its size, so this note carries none.

# The argument for each ruling

A box reads the argument here before it asks about a ruling:

| the ruling | the argument |
|---|---|
| one provider and a built-in value per name, a catalog fixed at start | [[spec/rationales/one-owner-holds-each-name]] |
| a struct naming the inputs, one snapshot in, a pure run, one commit out | [[spec/rationales/a-provider-runs-pure]] |
| a dumb core, every part a module, and a module flagged `io` alone reaching the outside, with its fake inside | [[spec/rationales/every-part-is-a-module]] |
| a module is one file, and the registry builds every surface | [[spec/rationales/the-registry-builds-surfaces]] |
| a file declares each view, and one renderer draws them | [[spec/rationales/views-are-declarations]] |
| every call takes a record and a wait its caller sets, and one writer runs per tree | [[spec/rationales/a-caller-sets-its-wait]] |
| every part holds a lease | [[spec/rationales/every-part-holds-a-lease]] |
| the IO process, the index and the placements of module instances run as processes | [[spec/rationales/modules-run-apart]] |
| Go holds the core, and Linux and Windows behave the same | [[spec/rationales/go-holds-the-core]] |
| the pure Go driver for SQLite | [[spec/rationales/the-index-drops-cgo]] |
| one Go module | [[spec/rationales/go-stands-as-one-module]] |
| git as the archive and the transport | [[spec/rationales/git-stays-the-archive]] |
| the cage refusing while the index stands down | [[spec/rationales/the-cage-refuses-while-down]] |
| every step on `main`, slices in shadow, a switch per phase | [[spec/rationales/the-migration-runs-beside]] |
| golden files per twin, Go alone writing frontmatter, the prose checks in Go | [[spec/rationales/one-implementation-survives]] |
| `files/` mirrors the disk, and each structured file is a projection with a codec | [[spec/rationales/the-disk-is-one-mirror]] |
| config as a flag on a topic, its layers, contexts and the config module | [[spec/rationales/config-comes-in-layers]] |
| local ports in each module, and one wiring file binding them | [[spec/rationales/modules-stay-local]] |
| a change settling as one wave, in the order the start fixes | [[spec/rationales/changes-settle-in-waves]] |

# Where each folder goes

| today | becomes | fate |
|---|---|---|
| `src/index` | the index process: the core's store, SQLite and the bus. Supervision moves to the index manager, and `files/` to the `watch` IO module | splits |
| `src/q` | the model's core: names, providers, the store and the catalog check, which the index and every module import | new |
| `src/lsp` | the `lsp` IO module keeps the protocol, and the checks and schema rules become the check module | splits |
| `src/tui` | `quack tui`: `frame` becomes the generic shell and `tree` the base-view renderer, and the log and the work become declared views | reshaped |
| `src/config`, `src/yaml`, `src/pointer`, `src/index/swap` | the config module and every `<instance>/config/` subtopic, and the index manager's supervision | merged |
| `src/scripts` | the module processes, such as work, pull, retro and vehicle, and a Go command line in place of `cli.js` | ported, topic by topic |
| `src/bridge` | the `hooks` IO module, and modules for the write, bash, stop, answer and handover rules | ported |
| `src/engine`, `src/doors` | modules, such as retro, projection and group, and the outbound IO modules | ported |
| `.claude/skills/level0/lib` | modules, apart from what the hook module imports itself | ported |
| `src/extension` | a generic renderer for the sidebar and its forms, beside the route drawing, the lens and the inset | shrinks |
| the level zero hook module | forwards events, registers the tools the index lists, and spawns agents | shrinks |
| `copilot.js` | calls into the `hooks` IO module, `quack hook <event>` | ported |
| the git hooks | `quack hook pre-commit` and `quack hook pre-push`, over the `hooks` IO module | ported |
| `spec/config/level0.schema.json` | generated from the `q.Cfg` and `q.Show` declarations | generated |

| area | what goes with no successor | what moves to Go | what stays |
|---|---|---|---|
| `src/scripts`: work, pull, ticket | the JSON hops over standard output, the check spawns in `cli.js`, the git read on every call, the dispatch and the usage | the pull, the queue and the outline, `work-answer.js`, the branch standing, the route walk, the ticket writes | nothing |
| `src/scripts`: the command line, check, retro, install | the verb routing in `cli.js`, `cli-doors.js`, `cli-served.js`, `serve.js` and `tui-build.js`, and most of `install.sh` | the battery and the stamp, the commit and the push, the log read, the retro, the vehicle and the stub, the styles, the browser and the bundle | the editor link, brand, and the battery's reporter under `test` |
| `src/bridge`, `src/doors`, `src/engine` | the server's lifecycle, reload and self-test. The caches, the index spawn per search, and the state a restart carries over | every cage rule, the tools as actions, the doors as Go IO modules with fakes, the retro | nothing |
| `.claude/skills/level0` | the start road, the pull's process hop and the search relay. The Copilot copy of the cage, the standing files, and the JavaScript twins of Go checks | config layering, guidance, the answer gate, voice, the bash guard, tickets, apply and undo, projections | the hook module, cut to a thin forwarder |
| `src/index`, `src/lsp`, config, yaml, pointer | the standing-file protocol, written twice, three self-spawn loops, the LSP's index client, the findings port, the long poll and the hash caches | the LSP rules and the schema checker, tickets, config | the index core, the LSP protocol and features, yaml |
| `src/tui` | its own index client, its spawn of `branch list --json` and `--count`, its own writes of `plan.json` and ticket fronts | the place, edit and flip logic, as plan and tickets actions | `frame`, `draw` and `tree`, and the log view |
| `src/extension` | the bridge process control, the verb spawns and their parsing. Its own log reader, its own config layering, and its runtime imports of the tree's JavaScript | the lens and field-mark logic, as pull and tickets names | the generic sidebar renderer, the route drawing, the lens and inset UI |

# What goes with no successor

| the kind | what stands there today |
|---|---|
| long-running processes | five, four of them with a loopback port of their own, in two languages, and three of them parsing tickets on their own |
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
| frontmatter parse and write | parsers in `index/front.go`, `index/ticket.go`, `lsp/note.go`, `schema-read.js` and `branches/group.go`, and three writers | Go quotes a value, and JavaScript leaves it bare |
| the Ask chapter | `branches/group.go`, `pull-chapter.js`, `index/ticket.go` | `branches/group.go` keeps comments and the other two drop them, so the queue's text and the index's differ |
| held and group standing | `branches/group.go`, `work-stands.js`, `index/ticket.go`, and the window's `Placed` | the window overrides it again |
| the current leaf of a route | `branches/group.go`, `pull-route.js`, `ticket.js`, `lsp/group.go`, the extension's `lens.js` | a fixture test exists only to keep two of them in step |
| the hold folder readers | `guidance-hand.js`, `ephemeral.js`, `command/ticket.go`, `lens.js` | `folders.test.js` checks only that the copies agree |
| session log rows | `lib/log.js`, `tui/log/record.go`, the extension's `rows.js` | the level ladder stands twice |
| the index client | `lsp/indexed.go`, `tui/work/workindex.go`, `lib/index.js` | each asks its own way |
| cloud detection | `InCloud` in `src/modules/hooks/command/cloud.go`, the hook's start script, `copilot.js`, the Copilot runtime | `InCloud` reads `0` as off, and the start script reads any value as on |
| walk skip lists and globs | four skip lists, three glob translators | the two Go translators take different features |
| runtime paths, the port, `se-index`, `plan.json`, `tools.json` | Go, JavaScript, shell, and the stub hook | each spells them again |

# The gaps and their answers

| the gap | the answer | the phase it meets |
|---|---|---|
| session values reduce over events, and no file holds them | `q.Fold`, per [[spec/design_output/model#a-fold-keeps-its-state]] | 0 specifies it, 5 builds it |
| git refs, contents by ref and merge bases move on fetch and commit, out of the watcher's sight | git is live input nowhere, per [[spec/rationales/git-stays-the-archive]] | 2 |
| a hand-back writes, stages, commits, pushes and runs the check | the requests of [[spec/design_output/model#an-action-lists-requests]], and git hooks reading names alone | 0 specifies it, 4 builds it |
| the LSP checks unsaved buffers | `buffers/`, per [[spec/design_output/model#the-topics-and-their-writers]] | 7 |
| stale claims read the clock, and the hand reads the caller's box | `clock/minute` and the names under `session/<id>/`, per [[spec/design_output/model#the-index-manager]] | 0 specifies it |
| the tense, sentence and vocabulary vetoes run on wink, in JavaScript | the prose checks move to Go on golem, an exception list and the domain words, with wink as the reference. Golem agrees with wink on 97 to 99 percent of the decisions compared | 3, and 10 drops wink |
| the hook answers more than forward, register and spawn: streaming, context fill, transcript rows, clear and resubmit, `model.classify`, `ui.log` | [[spec/design_output/model#the-hook-protocol]] | 0 specifies it, 5 builds it |
| git hooks run with no index, a fresh clone carries no binary, and Copilot's command hooks time out | one `quack` binary, and `quack hook` starts the index where none answers | 1 |
| frontmatter rewrites and the generated Vale rules must stay byte for byte | Go becomes the one writer after one commit rewriting every ticket, and CI compares the Vale output byte for byte | 1 |
| twins differ in pointer resolution, env naming, skip lists and the schema subset | golden files per twin, and the owner reads each difference at the merge | 3 |
| `DoorsOnly`, `FakeDoorsInTest` and `OutsideInDoors` scan JavaScript imports | the analyzers of [[spec/design_output/model#the-build-checks-imports]] | 1 |

# The bugs on the way

The inventory names these, each on a ticket of its own. A bug a later phase
carries names the ticket that carries it:

| the bug | where it stands |
|---|---|
| [[spec/tickets/the-judge-reads-every-layer]] | fixed, and the judge stands in the code no more |
| [[spec/tickets/the-sidebar-log-appends]] | fixed |
| [[spec/tickets/one-reader-names-the-home]] | fixed |
| [[spec/tickets/the-lsp-folds-drive-letters]] | fixed |
| [[spec/tickets/window-links-reach-private-tickets]] | fixed |
| [[spec/tickets/vehicles-take-the-window-port]] | fixed |
| [[spec/tickets/config-reads-differ-by-reader]] | [[spec/tickets/cfg-topic-holds-one-resolver]] |
| [[spec/tickets/the-hook-log-loses-lines]] | [[spec/tickets/a-down-index-refuses-calls]] |
| [[spec/tickets/the-need-list-lacks-verbs]] | [[spec/tickets/pull-verbs-become-actions]] |
| [[spec/tickets/the-dead-exports-leave]] | each row leaves with its file, as phases 4 and 7 port the folder |

# The tests after the move

| the bucket | its fate |
|---|---|
| plumbing: servers, the start road, swaps, standing files, command-line glue, install, folders | deleted |
| event to decision through the bridge | replaced by a replay of session logs into the `hooks` IO module, asserting the same decisions. The logs record at `debug` |
| business logic: pull, work, ticket, retro, schema, stop, bash, apply | ported to Go module tests over `q/qtest` |
| the Vale and prose rules | they stay, behind the `vale` IO module |
| the extension and its UI | they stay in JavaScript, and the generic renderer cuts them down |
| door contracts | ported one to one, as the contract suite of each IO module's fake |
| the generic contract tests | new: every name the catalog registers carries a built-in value, a type and a doc. It reaches the command line, HTTP and MCP with one text, and every fake runs its contract suite |
