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
| a copy carries an identity | `.se/copy.json` in the method tree |
| a project names the copy driving it | `.se/project.json` in the work tree |
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
| its contract tests | 73 of 73, out of its own folder |
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
| `project/spec/tickets/`, `project/spec/guidance/`, `project/src/` | one `.gitkeep`, so the empty folder travels with git |
| `vehicle.json` | the record below |
| `RUNME.sh` | the shim, with its run bit |
| `.claude/settings.json` | the vehicle's tracked settings, key by key, with none of its comments |
| `.claude/skills/bridgehead/` | the bridgehead plugin: its manifest, its hooks file and one module |

## The record names the vehicle

| field | reads off |
|---|---|
| `vehicle` | the identity in `.se/copy.json`, made where it stands unmade |
| `name` | the folder the vehicle stands in, which is the brand |
| `upstream` | `git remote get-url origin` in the vehicle, or what `--upstream` names |
| `version` | the vehicle's `package.json` |
| `made` | the clock |

A vehicle with no remote has no upstream a cloud box can clone, so the verb
refuses until `--upstream` names one. A vehicle the button made has no git
yet, and this is where that shows.

## Two roads to the vehicle

The shim and the bridgehead both read `vehicle.json` beside them, and take
the same two roads in this order:

| road | answers |
|---|---|
| `SE_VEHICLE` in the environment | that folder |
| `~/.se/vehicles/<name>` | the folder a cloud box clones the upstream into |

A shim finding the vehicle sets `SE_WORK` to the stub. It then hands every
argument to the vehicle's `RUNME.sh`. A shim finding none says so and exits
one. The bridgehead imports the vehicle's `level0` and `level1` hook modules
from the folder it finds, and registers every hook they carry under its own.
Where it finds none, the session starts with no cage, and the log says why.

Two groups stand on this one. The register road of the shim belongs to
`the-shim-resolves-the-vehicle`, and the import at session start to
`the-bridgehead-imports-its-vehicle`. Until they land, the shim and the
bridgehead carry the roads above and nothing more.

## Nothing of the method travels

`test/contract/stub.test.js` produces a stub into a folder it makes, reads
every file back, and walks the whole folder. Every path it meets stands in
the list the pure module names, and none of the method's files stands beside
them. A refused vehicle leaves the folder as it stands.
