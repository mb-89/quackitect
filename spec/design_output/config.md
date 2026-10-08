---
kind: [[design_output]]
---

# Scope

`src/q/layers.go` and `src/modules/config` answer every number and switch this
tree holds. This note covers the layers they read and the verb over them.

# What the resolver is

One place answers every number and every switch this tree holds. Code asks for
a key and takes what comes back, and the way the value arrives stays the
resolver's business.

The hooks module, at `session.start`, and the command line, at module load,
each open `spec/config/level0.json` without it. Each one keeps what it reads
for the life of its process, so one number stands cached wherever a reader
keeps it.

# The layers

| layer | who writes it | when a reader reads it |
|---|---|---|
| built-in, the schema's `default` | the key's Go declaration | once, at the first ask |
| `spec/config/level0.json` | the team, tracked in git | once, at the first ask |
| `.se/.runtime/config.json` | `./RUNME.sh config`, per box, git ignores it | on every ask |
| the environment | whoever launches the box | once, at the first ask |

A later layer beats an earlier one, so the environment beats the per-box file
and the per-box file beats the tracked file. A shared key reads the tracked
file alone. [[spec/design_output/model#a-keys-layers]] owns the order, and
`q.AtRest` holds it for every Go reader.

These things follow:

- Each key's built-in stands in its Go declaration, and the tracked file holds
  a value off its built-in alone. A key no file sets reads its built-in, under
  the layer `built-in`.
- A key standing only in the per-box file resolves as well. The merge takes
  every key it meets, whichever layer names it.

The environment answers the keys the tracked file and the schema name, because
the resolver asks the box for those names once. A key only the per-box file
carries reaches the code from that file.

# One ask costs nothing

The per-box file is the state, so the resolver reads it on every ask. The write
door asks on every Write and Edit, which makes that the ask worth timing:

| what | cost | rounds |
|---|---|---|
| one ask, reading the file | 0.0056 ms | 10000 |
| `stat` alone, the check a cache needs | 0.0017 ms | 10000 |
| Vale over one write | 88 ms | 1 |
| Biome over one write | 101 ms | 1 |

The handover on this branch carries the script. One ask costs one part in
sixteen thousand of the cheapest door the write path already pays. So this tree holds
no cache and no `mtimeMs` check.
Measure again where the per-box file grows past a few keys.

# A key names a path

`leavesOf` in `src/modules/config/keys.go` reads the nested JSON into
`stop.mostInARow` and its value. A key named `comment` carries the words a
person reads, so the reading drops it and no verb lists it.

`settingAt` in `src/quack/verb_config.go` writes the path back, which is how a
write lands in the per-box file as the same shape the tracked file holds.

# A variable names a key

`stop.mostInARow` reads `SE_STOP_MOST_IN_A_ROW`. `q.EnvOf` in
`src/q/layers.go` kebabs each segment, joins the parts with `_`, and shouts the
result behind `SE_`. So the camel and the kebab spelling of a leaf name one
variable. `TestEveryShippedKeyNamesAVariableOfItsOwn` in
`src/quack/verb_config_test.go` holds every shipped key to a variable of its
own.

# The schema says the type

`go run ./src/quack schema --write` writes `spec/config/level0.schema.json` off
the keys the modules declare, one object a section. Each key's member holds
its type, its built-in as `default`, its help, its unit and its options. So the
schema says what the code declares, and nobody edits it by hand.
`src/modules/settings/settings.go` declares each section no module of its own
owns.

`q.Settled` answers each `default`, and `configFaults` in
`src/quack/verb_config.go` names a key carrying another type. A session start
writes one `warn` line per fault, door `config`, and `./RUNME.sh config` says
the same on the way out.

## The schema says the drawing

A key carries `help` and `unit` beside its type, and the sidebar hovers the one
and prints the other. The generator lays `spec/config/draws.json` over each
entry it names, drawn sections first in its order. A key drawing as a control
carries more:
[[spec/design_output/extension#one-declaration-draws-it]] names every field.
`entriesIn` in the extension answers the whole entry.

## The editor draws the schema

VS Code carries a JSON language service already, so `json.schemas` in
`.vscode/settings.json` points the tracked file at the schema beside it. A
person editing that file meets a wrong type and an unknown option as they type,
and `.vscode/extensions.json` names the extensions this tree recommends.

# The resolver holds the layers

`Rows` in `src/modules/config/keys.go` takes the declared keys, both files and
the environment, and answers each key with its value and its layer.
`q.Settled` answers one key the same way. `projection.Inherits` in
`src/projection/tree.go` lays the work root over the method root.

## A caller hands it in

A module holding a number holds a second copy of the config. So the caller asks
the resolver and hands the value in:

| what asks | who hands it in |
|---|---|
| `overLong` in `src/modules/check/names.go` | the command line, out of `names.words` |
| `AtTurnEnd` in `src/modules/hooks/stop/vote.go` | the write door at each turn end, out of `stop.mostInARow` |

The tooth reads its cap at each turn end, so a write to the per-box file
mid-session reaches the turn after it.

## The Go reader

`src/config` is the shared package answering the same layers off the disk, and
every Go program in the tree calls it:

| what it answers | what it reads |
|---|---|
| `Value(root, key)` | the layers at rest through `q.Settled`, with the built-in and the shared mark off the schema |
| `Map(root, path, key)` | the map a named file holds at a key, off that file alone |
| `List(root, path, key)` | the list a named file holds at a key, in the file's own order |
| `EnvOf(key)` | the variable a key reads: each segment kebabs first, then the key upper-cases under `SE_` |

`Value` walks a key written with dots, so `names.words` reads the `words` of
the `names` object. A named file takes no layer, because a person setting a
colour sets it in one place. The window reads its colours that way, as
[[spec/design_output/tui#colours]] says.

The window imports it, so the window's stamp reads it and a move here rebuilds
the window. For details, see [[spec/rationales/go-stands-as-one-module]].

# The verb names the layer

`./RUNME.sh config` prints every key, its value, and the layer answering it:

    stop.enabled           true      spec/config/level0.json
    stop.hold              finish    .se/.runtime/config.json
    stop.mostInARow        3         spec/config/level0.json
    log.level              warn      SE_LOG_LEVEL

`git config --show-origin` is the shape this copies. The layers above leave a
person guessing which one answers, since nothing points it out directly.
Naming one key prints that row alone.

## The verb writes one layer

`./RUNME.sh config <key> <value>` writes `.se/.runtime/config.json`, making `.se` where
that folder stands missing. A command line hands over text, so the verb reads
the type out of the schema and coerces to it. `stop.mostInARow 5` lands as the
number `5`, which keeps `"5" > 3` a bug nobody files.

Where the schema knows no such key, the text lands as given. A key only the
local file names resolves, and nothing knows its type.

`./RUNME.sh config <key> <value> --tracked` writes `spec/config/level0.json`
instead. The write keeps the comment member and the key order. The printed
line and the log row name the layer the write lands in.

# The engine controls

`engine.binding` says how tightly the queue holds a session. This chapter is the
one place naming what each value means. The schema holds the enum, the sidebar
draws the toggle, and the stop hook reads the field, and each of those points
here.

| value | where the work comes from | what the stop hook refuses |
|---|---|---|
| `queue` | the queue hands out the next leaf, and hands another the moment one closes | a stop while the ticket stands open, and a stop while the queue holds anything at all |
| `unbound` | a person names the ticket, and the pull hands out nothing on its own | a stop while the ticket stands open |
| `god` | a person, and the engine stands aside | nothing |

**`queue` is an endless loop.** A cloud box runs here, because it works with
nobody beside it. It pulls until the queue holds nothing for it, and a finished
ticket brings the next one. The stop hook refuses a stop where the ticket
stands open, or where the queue holds more work.

Under `queue` the hook takes a stop on a helper's wait:

- A helper running beside a ticket in hand ends the turn, and its answer wakes the session.
- The same holds beside a group in hand, and beside a waiting queue.
- A named pull from an agent refuses, save the ticket a verb mints for this session.
- A person's named pull passes, and so does one under `--owner-says`.
- `retro new` runs in Go and pulls the retro it writes through a child `ticket pull`. `SE_MINTED` names that retro in the child's env. The pull lets the ticket `SE_MINTED` names pass the queue.
- The cost: a hand that sets `SE_MINTED` itself passes the queue too. The bless guard holds the line: it refuses a command an agent types that sets, exports or unsets `SE_MINTED`.
- A refusal names the binding and who sets it: [[spec/design_output/stop#a-refusal-names-the-binding]].

**`unbound` is the mode a person talks in.** A session here takes the one ticket
a person names, and skips the chain behind it. The stop hook still refuses a
stop while that ticket stands open. Once the ticket closes, the queue hands out
nothing, and the session stops. Every other rule holds: a session works under a
ticket, reads and writes through the doors, and keeps the voice rules.

**`god` is the engine standing aside.** It stands where killing the hooks
stands, with the tree still running. A person reaches into something broken and
fixes it, and no hook argues. [[spec/design_output/stop]] holds what the hook
does on the other two.

# The magic numbers take names

A number that carries a meaning stands in one place, and code reads it by name.
`spec/config/biome.json` holds `noMagicNumbers` on, so the check refuses a bare
number in JavaScript. An override keeps the rule off the tests, because a case
names its numbers out loud.

| the number | where it lives |
|---|---|
| one a person sets | a key under `spec/config/level0.json`, with its entry in the schema |
| one the module owns | the constants block at the top of that module |
| one a formula or a format fixes | the same block, under a name saying what it is |

The rule takes no options in Biome 2.5.12, so what it lets through stands bare:

| what passes | why |
|---|---|
| `0`, `1`, `2`, `10`, `24` and `60` | the values Biome reads as plain |
| an array index | a position, and no value |
| an initial value in a declaration, and a default in a parameter | the declaration is the name |

Biome reads no Go, so `magicIn` in `src/modules/check/textfaults.go` reads every Go file under the check with
the same rule, and `./RUNME.sh check` names what it finds as a warning. A number
a module holds twice for a technical reason says so beside the second copy.
[[spec/design_output/schema#warning-now-and-error-later]]
