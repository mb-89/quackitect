---
kind: [[design_output]]
---

# Scope

Every failure the tree raises takes a registered name, the way a log call takes a level. This note covers the failure node, the registry, the door that raises one, the check over both, the sentinel and the agent's verbs.

# A failure is a node

A failure is one markdown note under `spec/failures`, and its file name is its id. `spec/schemas/failure.schema.yaml` governs the folder.

| field | holds | required |
|---|---|---|
| `kind` | `failure` | yes |
| `level` | a level off the log ladder | yes |
| `remedies` | one remedy a line, each a thing the reader does next | yes, one at least |
| `reaction` | a `./RUNME.sh` verb line the engine runs when the failure fires | no |
| `watch` | the event the sentinel fires the failure on | no |

The body says when the failure fires. For the ladder, see [[spec/design_output/log#what-a-box-writes]].

# The registry reads the nodes

`src/failure` holds the registry. `Load` reads every node under `spec/failures` through the package's `door.go`, and answers a `Registry` keyed by id. `Fake` answers a registry off nodes a case hands in. Every module past the door takes a `Registry`, so a case hands in the fake.

# One door raises a failure

`failure.Raise(registry, id, said...)` answers a `Raised`: the id, the level, the message and the remedies. Its `Lines` prints them in this order:

    <the message>
    failure <id> at <level>
    remedy: <a remedy>

An id the registry lacks still prints its message, and names the id as unregistered. The check refuses that id first.

`Raised.Row` answers the log row: kind `failure`, the level, the message, and a `failure` field holding the id. So `./RUNME.sh failure count` reads the log, and counts each failure by id.

`src/doors/failure.js` is the twin. `failure(disk, log)` answers `raise(id, said)`, reads the same nodes, prints the same lines and writes the same row. `src/doors/fake/failure.js` answers off nodes a case hands in, and keeps every raised id.

# The check holds the registry

Cases under `src/failure` read the tree, and the check runs them:

- a node naming no remedy fails
- an id a `Raise` or a `raise` names, with no node beside it, fails
- a refusal written past the door in a moved file fails

`Moved` in `src/failure` names each moved file, and the refusal call it held before the move. Each move adds its files there, so the check reaches each file the day it moves.

# The sentinel fires a watch

A `watch` names an event kind, a pattern the event's text matches, and a quiet span in minutes:

    watch:
      event: tool
      match: "branch take"
      quiet: 30

- With no quiet span, the sentinel fires the failure on each event that matches.
- With a quiet span, it fires the failure once the span passes with no matching event.

`failure.NewSentinel` takes the registry, the clock door, a hand it fires through and a `Runner`, the process door. `Hear` takes one event. A quiet watch arms `After` on the clock door, and each matching event arms it again. So the sentinel reads the time through the clock door, and polls nothing.

The hooks door hears every post the bridge sends, and hands each to the sentinel. A fired failure writes its row. The sentinel then runs its `reaction` through the `Runner`, and raises `failure-reaction-fails` where the reaction exits nonzero or runs nowhere.

# An agent raises by verb

| verb | does |
|---|---|
| `./RUNME.sh failure raise <id> [said]` | raises the failure through the door, and prints its lines |
| `./RUNME.sh failure new <id> --level=<level> --remedy=<line> --when=<line>` | writes the node, and refuses an id off the shape, an id a node carries, a level off the ladder, no remedy and no when |
| `./RUNME.sh failure count` | counts each failure id in the session log |

An agent meeting a failure with no id runs `failure new` first, then `failure raise`.

# The refusals move onto nodes

The pull, the take and the mint raise their refusals through the door first. Each refusal takes a node, and the site keeps building its message. The door adds the id and the remedies.

| place | the refusals that move |
|---|---|
| `src/pull` | every refusal the pull says, `stillHeld` among them |
| `src/branches/take.go` | each refusal of the open and the take, and the git output under one stays its detail |
| `src/quack/verb_mint.go` | each refusal the mint verb prints, the message its builders answer among them |

The JavaScript twins of these verbs keep their text until their Go twin replaces them, and `Moved` names the Go files alone. `go test ./src/pull/` reads the ids the fake door keeps.
