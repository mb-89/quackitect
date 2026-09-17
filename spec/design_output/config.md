---
kind: [[design_output]]
---

# Scope

`.claude/skills/level0/lib/config.js` answers every number and switch this tree
holds. This note covers the layers it reads and the verb over them.

# What the resolver is

One place answers every number and every switch this tree holds. Code asks for
a key and takes what comes back, and the way the value arrives stays the
resolver's business.

Two readers open `spec/config/level0.json` without it: the hooks module at
`session.start`, and the command line at module load. Each one keeps what it
reads for the life of its process, so one number stands in three places.

# The three layers

| layer | who writes it | when a reader reads it |
|---|---|---|
| `spec/config/level0.json` | the team, tracked in git | once, at the first ask |
| the environment | whoever launches the box | once, at the first ask |
| `.se/config.json` | `./RUNME.sh config`, per box, git ignores it | on every ask |

A later layer beats an earlier one, so the per-box file beats the environment
and the environment beats the tracked file.

Two things follow:

- The tracked file is the defaults, so no default stands in code. A key the
  code reads and that file lacks is a fault, and the schema catches it.
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

`flatten` reads the nested JSON into `stop.mostInARow` and its value. A key
named `comment` carries the words a person reads, so the flattening drops it
and no verb lists it.

`nest` writes the path back, which is how a write lands in the per-box file as
the same shape the tracked file holds.

# A variable names a key

One rule, both ways. `stop.mostInARow` reads `SE_STOP_MOST_IN_A_ROW`:

- `varOf` cuts the camel case at each boundary, joins the parts with `_`, and
  shouts the result behind `SE_`.
- `keyOf` drops `SE_`, takes the first part as the section, and camel cases the
  rest into the leaf.

A key holds one section and one leaf, which is what makes the second direction
answer one key. A contract test reads every key this tree ships and holds both
directions over it.

# The schema says the type

`spec/config/level0.schema.json` says the type of each key and which ones a
whole file carries. `keysOf` reads it, `typeOf` answers one key, and `faultsIn`
names a key the tracked file lacks and a key carrying another type.

The `comment` beside each section of the tracked file says what that section is
for. A session start writes one `warn` line per fault, door `config`, and
`./RUNME.sh config` says the same on the way out.

## The schema says the drawing

A key carries `help` and `unit` beside its type, and the sidebar hovers the one
and prints the other. A key drawing as a control carries more:
[[spec/design_output/extension#one-declaration-draws-it]] names every field.
`keysOf` answers the type alone, and `entriesIn` in the extension answers the
whole entry.

## The editor draws the schema

VS Code carries a JSON language service already, so `json.schemas` in
`.vscode/settings.json` points the tracked file at the schema beside it. A
person editing that file meets a missing key and a wrong type as they type,
and `.vscode/extensions.json` names the extensions this tree recommends.

# The resolver holds the layers

`configOf` takes the reads it needs and hands back the asks:

| the caller gives | the caller gets |
|---|---|
| `read`, `write`, `makeDir`, `readEnv` | `ask`, `layerOf`, `all`, `faults`, `write` |

Every ask answers a promise, because the hooks module reaches the disk through
`$.fs` and that door is asynchronous. The command line wraps its own disk door
the same way, and both take the tree root off the caller's hands.

## A caller hands it in

A module holding a number holds a second copy of the config. So the caller asks
the resolver and hands the value in:

| what asks | who hands it in |
|---|---|
| `overLong` in `lib/names.js` | the command line, out of `names.words` |
| `atTurnEnd` in `lib/stop.js` | the write door at each turn end, out of `stop.mostInARow` |

The tooth reads its cap at each turn end, so a write to the per-box file
mid-session reaches the turn after it.

# The verb names the layer

`./RUNME.sh config` prints every key, its value, and the layer answering it:

    stop.enabled           true      spec/config/level0.json
    stop.hold              finish    .se/config.json
    stop.mostInARow        3         spec/config/level0.json
    log.level              warn      SE_LOG_LEVEL

`git config --show-origin` is the shape this copies. Three layers with no way
to ask which one answers leave a person guessing in three places. Naming one
key prints that row alone.

## The verb writes one layer

`./RUNME.sh config <key> <value>` writes `.se/config.json`, making `.se` where
that folder stands missing. A command line hands over text, so the verb reads
the type out of the schema and coerces to it. `stop.mostInARow 5` lands as the
number `5`, which keeps `"5" > 3` a bug nobody files.

Where the schema knows no such key, the text lands as given. A key only the
local file names resolves, and nothing knows its type.

# The engine controls

Two keys under `engine` say how a session takes work and how far it carries it.
This chapter is the one place naming what each value means. The schema holds the
enum, the sidebar draws the toggle, and the hooks read the field, and each of
those points here.

| key | value | what it means | who reads it |
|---|---|---|---|
| `engine.binding` | `queue` | the session takes the next leaf the pull hands out | `queueWaits` in `src/bridge/stop.js` |
| `engine.binding` | `unbound` | the session takes a ticket a person names, and the pull hands out nothing on its own | nobody yet |
| `engine.binding` | `god` | waits for the owner to say | nobody yet |
| `engine.autonomy` | `finish` | waits for the owner to say | nobody yet |
| `engine.autonomy` | `start` | waits for the owner to say | nobody yet |
| `engine.autonomy` | `ideation` | waits for the owner to say | nobody yet |

`engine.binding` stands at `queue` in `spec/config/level0.json`, and `engine.autonomy` carries no value there. So the second key is a promise the schema makes and no code keeps. [[spec/tickets/the-controls-wire-up]] carries the work that keeps it.

A row reading "waits for the owner to say" is a value the enum admits and no note defines. A hand writing code for such a value reads this chapter first, and finds the answer here or nowhere.

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

Biome reads no Go, so `lib/magic.js` reads every Go file under the check with
the same rule, and `./RUNME.sh check` names what it finds as a warning. A number
a module holds twice for a technical reason says so beside the second copy.
[[spec/design_output/schema#warning-now-and-error-later]]
