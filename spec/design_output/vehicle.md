---
kind: [[design_output]]
refines: ["[[spec/design_input/a-stub-takes-its-vehicle]]"]
---

# Scope

`src/scripts/vehicle.js` carries this tooling into another project. This note
covers the copy, the project it drives, and the roots between them. For the
argument, see [[spec/rationales/vehicle]].

# A copy and its project

This tooling exists to work on projects that are other than itself. That needs
two roots, and a copy that knows which project it drives.

| root | what it is |
|---|---|
| method | where this copy of the tooling stands: the rules and the guidance |
| work | the folder under the agent's hands |

## Three things a copy needs

| what | where it lives |
|---|---|
| a copy carries an identity | `.se/.runtime/copy.json` in the method tree |
| a project names the copy driving it | `.se/.runtime/project.json` in the work tree |
| a register turns an identity into a place | `~/.se/registry.json` |

A path alone does none of this. It goes stale the moment either tree moves,
and the pair then names a place that holds something else.

The identity lives in the method tree, so a produced copy makes its own and a
moved tree keeps the one it has.

## A marker names the root

The walk goes up from the folder in hand, looking for the one file a method
tree carries: `.claude/skills/level0/.claude-plugin/plugin.json`.

Deriving a root from where a program sits answers a folder with the same
confidence whatever folder it is. A rule read out of that guess names files
that stand nowhere near the work.

## One tree drives itself

This tree carries the marker, so the walk finds it at once and both roots name
the same folder. `./RUNME.sh vehicle` says so:

    method  /home/user/quackitect
    work    /home/user/quackitect
    copy    d425a54ca0335  (this tree drives itself)

Where the two agree, every path stays as it reads. Where they differ, the
method root carries the rules, the guidance and the judged styles. The files
under the agent's hands stay in the work root.

## The work root inherits

A copy hands its rules down, and the work root takes them the way a class takes
what it extends. The unit is the file.

| what the work root does | what stands |
|---|---|
| stays silent | the method's file comes down as it is |
| names a file again | the work root's file replaces that one |
| names a file nobody else holds | it joins the set |

So a project adds its own guidance note beside the ones it inherits, and
replaces one whole where it disagrees. Every folder the rules live in works
this way: the guidance, the stop rules, and the judged styles.

The config joins key by key, because a key is its unit. The method's values
stand and the work root's values beat them. A project names only what it
changes, and `./RUNME.sh config` says which layer answers a key.

A projection declaration joins the same way where it is JSON. Its targets land
in the work root, because that is the tree a person opens.

## A vehicle stands alone

A vehicle carries the whole method and answers for itself. It reaches back to
its origin for nothing at all. A corporate machine holds the vehicle, and the
tree behind it stands outside every wall that machine sits inside.

Proven against a real copy, in `test/contract/vehicle.test.js`:

| what stands | what the copy answers |
|---|---|
| its identity | its own, and other than its origin's |
| its roots | itself as method and as work |
| its contract tests | every one green, out of its own folder |
| its answer to `vehicle` | no path naming its origin |

A fresh copy takes two steps that any fresh clone takes: `git init`, and one
run of `RUNME`, which surveys the tools and builds what it needs.

The run bit travels with the scripts. A copy whose `RUNME.sh` arrives
a file nobody can run answers `Permission denied`, and the vehicle stands there unable to
take its own first step.

## A project names its driver

`attach` writes the identity into the work tree, and `detach` takes it out so
the next start asks again. An identity the register cannot place is a fact
about this machine: the copy stands somewhere else.

## The register places an identity

Every copy writes itself into `~/.se/registry.json`, or into each folder
`SE_REGISTRY` names. The reader drops an entry whose method root holds no
marker. A folder that holds something else now answers about that something.

## The register holds the port

One vehicle, one port. The register's entry for a vehicle carries the port
it blocks. A vehicle with none takes the lowest free one from `PORT_BASE` in
`lib/vehicle.js` up on its first start. So two vehicles on one box stand on two ports, and a project
reaches the right one.

A project points at its vehicle in `.se/.runtime/vehicle.json`: the method root and
the port. A folder with no pointer that carries the marker and the server is
a vehicle, and points at itself. A folder with neither becomes a project on
the first press of the hook. It gets the one hook under `.claude/skills/level0`
and the pointer, and nothing else of the vehicle. The bridgehead reads the
port off the pointer at session start. `.se` stays off git, so a clone gets
the pointer back from the same press.

## One copy is no question

A project naming no driver, on a machine holding exactly one copy, takes that
copy. Two copies make a question, and the project answers it with `attach`.

## What travels into a copy

`produce` walks the method tree and leaves four things behind:

| left behind | why |
|---|---|
| `.git` | the tooling's own record of itself |
| `.se` | private material, the built programs, and the identity |
| `node_modules` | what a package manager writes |
| `_to_delete` | what somebody means to remove |

A copy lands in a new folder. `vehicle into <folder>` writes into one that
stands already, which is how a folder becomes a vehicle where it sits.

# A stub takes its vehicle

A stub is a bare project the method drives from outside. `./RUNME.sh stub into
<folder>` writes it out of the vehicle it runs in, and copies nothing. The
stub's files and who writes each stand in
[[spec/design_input/a-stub-takes-its-vehicle#the-stubs-files]]. This chapter
says what the verb puts into each.

| file | the verb puts |
|---|---|
| the folders `stubFolders` names, under the stub's own name | one `.gitkeep`, so the empty folder travels with git |
| `vehicle.json` | the record below |
| `RUNME.sh` | the shim, with its run bit |
| `.claude/settings.json` | the vehicle's tracked settings, key by key, with none of its comments |
| `.claude/skills/level0/` | the bridgehead plugin: its manifest, its hooks file and one module. The folder names the plugin, so a tool in a stub answers to `mcp__level0__`, and the attach writes level zero itself over it |

## The record names the vehicle

| field | reads off |
|---|---|
| `vehicle` | the identity in `.se/.runtime/copy.json`, made where it stands unmade |
| `name` | the folder the vehicle stands in, which is the brand |
| `upstream` | `git remote get-url origin` in the vehicle, or what `--upstream` names |
| `version` | the vehicle's `package.json` |
| `made` | the clock |

A vehicle with no remote has no upstream a cloud box can clone, so the verb
refuses until `--upstream` names one. A vehicle the button made has no git
yet, and this is where that shows.

## The brand a vehicle stamps

The brand is the slug of the vehicle's folder name. A marketplace name takes no
dot and no space. So `brandOf` lowers the case, turns each run of characters
outside `a-z0-9` into a hyphen, and cuts a hyphen off each end.

| the folder | the brand |
|---|---|
| `quackitect` | `quackitect` |
| `my.app` | `my-app` |
| `Acme Tools` | `acme-tools` |
| `.hidden` | `hidden` |
| `...` | the empty brand, which the stamp refuses |

The brand reaches three names. The plugin name stands at `level0`, so every
`mcp__level0` tool keeps the name it carries:

| what reads the brand | who writes it |
|---|---|
| the marketplace name and its owner | the install script, ahead of every verb |
| the plugin's author | the same |
| the stub's enabled id, `level0@<brand>` | the shim |

`brandedJson` carries the rule for the two files. A file carrying an `owner` is
a marketplace, so its `name` and its owner's name take the brand. A file
carrying an `author` is a plugin, so its author takes the brand and its own
name stands. A file carrying neither comes back as it stands.

The extension's icon reads the brand folder. `spec/config/brand/icon.svg` is
the mark a vehicle draws, and the install script writes it to the path
`src/extension/package.json` names. Git ignores that target, so one icon
stands. Two vehicles wear two marks, and nothing holds those two in step.

## Two roads to the vehicle

The shim and the bridgehead both read `vehicle.json` beside them. The shim
takes three roads in this order, and the bridgehead the first and the last:

| road | answers | who takes it |
|---|---|---|
| `SE_VEHICLE` in the environment | that folder | the shim, the bridgehead |
| the register, by the `vehicle` id | the entry's `method_root` | the shim |
| `~/.se/vehicles/<name>` | the folder a cloud box clones the upstream into | the shim, the bridgehead |

The shim stays POSIX sh, because a stub holds no node before it finds the
vehicle. So it reads its two records the plain way:

- the register stands in every folder `SE_REGISTRY` names, with `;` between them, and in `~/.se` where it names none
- sed reads a field out of `vehicle.json` and out of the register, one key a line
- a path in the register holds backslashes as JSON writes them, and the shim turns each into a slash

A shim finding the vehicle sets `SE_WORK_ROOT` to the stub. It then hands
every argument to the vehicle's `RUNME.sh`, and `rootsHere` in the command
line takes that root as the work. So `./RUNME.sh vehicle` inside a stub names
the vehicle as method and the stub as work. A shim finding none prints one
line naming the vehicle, its upstream and the cloned road, and exits one.

`test/contract/stub.test.js` drives the shim over a fixture: a fake vehicle
whose `RUNME.sh` echoes its argv and its work root, a register naming it, and
a stub. It reads both, then empties the register and reads the refusal line.
The bridgehead takes the same three roads and attaches through the vehicle's
own verb. The next section says how.

## The bridgehead installs the upstream

The bridgehead runs the vehicle's code through the vehicle's own `RUNME.sh`.
It imports none of it, because the client refuses a hook module importing
past its folder. For details, see
[[spec/design_output/level0#the-bridgehead-and-the-server]]. At session
start it takes one road, in this order:

| the stub holds | the bridgehead does |
|---|---|
| the pointer `.se/.runtime/vehicle.json` | nothing. The hook the attach writes carries the session. |
| a vehicle on one of the three roads | attaches to it |
| no vehicle, and a record naming an upstream | clones the upstream into `~/.se/vehicles/<name>`, then attaches |
| no vehicle, and a record naming no upstream | stops, and the log names the clone |

The attach is one command: `env SE_WORK_ROOT=<stub> sh <vehicle>/RUNME.sh
vehicle attach`. The RUNME installs first. The verb then reads `SE_WORK_ROOT`
as the work root and writes the driver into `.se/.runtime/project.json`. Then it
settles the stub the way the sidebar's hook button does:

| the verb writes | where |
|---|---|
| the register entry with its port | `~/.se/registry.json` |
| the pointer | `.se/.runtime/vehicle.json` in the stub |
| the vehicle's hook and its two manifests | `.claude/skills/level0` in the stub |

So the bridgehead rewrites the plugin folder beside its own. The client loads
that hook at the next start, because it scans plugins once. The road then
ends in three steps:

| step | what happens |
|---|---|
| the server | where the pointer's port answers nothing, the last command starts the vehicle's server detached |
| the line | the bridgehead writes one line to the stub's session log, and says it |
| the block | one context block asks the session to say the vehicle stands and end the turn |

A command failing stops the road, and the log line names the step and the
command's last line.

`test/level0/bridgehead.test.js` drives the hook over a fake git and a fake
disk. The fakes behave: the clone writes the vehicle's RUNME, and the attach
writes the driver. `test/contract/stub.test.js` clones this tree as the
upstream into a temp home under `SE_SLOW`. It reads the register, the
pointer, the driver and the hook back.

One routine run against a stub repo proves the road on a cloud box, read off
the run's log. It takes three things:

- a stub repo
- an environment carrying the trust setup the level zero chapter names
- a routine whose prompt is `./RUNME.sh ticket pull`

Nothing on a desk stands in for it.

## Nothing of the method travels

`test/contract/stub.test.js` produces a stub into a folder it makes, reads
every file back, and walks the whole folder. Every path it meets stands in
the list the pure module names, and none of the method's files stands beside
them. A refused vehicle leaves the folder as it stands.
