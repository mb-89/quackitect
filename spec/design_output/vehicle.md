---
kind: [[design_output]]
describes: [[src/scripts/vehicle.js]]
rationale: [[spec/rationales/vehicle]]
---

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
