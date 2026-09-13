---
kind: [[design_input]]
---

# Scope

The owner rules three things on top of [[spec/funnel/a-button-makes-a-vehicle]]. This note takes the steps that follow, each with its proof, and the branches an agent works.

| ruling | what it settles |
|---|---|
| a vehicle's source stays in the vehicle | the method half holds the plugin, the doors, the verbs and the tools, and a stub reaches them by resolution and by no copy |
| the folders are `method/` and `project/` | a project holds its spec and its source; a vehicle holds both halves in one tree and works on its own method |
| the stub's link carries the vehicle's upstream repo | a cloud box with no vehicle clones that repo, installs it, and attaches to it |

This note stops at the steps and the branches. The design output of each branch says how to build its step.

# The stub's files

A stub is a bare folder plus the bridgehead. Every file in it travels with git, so a cloud clone carries the bridgehead on its first session.

| file | holds | who writes it |
|---|---|---|
| `project/spec/tickets/`, `project/spec/guidance/` | the project's tickets, and a guidance note of its own or one it replaces | the stub verb once, then the project |
| `project/src/` | the product, which runs with no method beside it | the project |
| `vehicle.json` | the vehicle's identity, its brand, and its upstream repo | the stub verb, off the vehicle's register entry and its git remote |
| `RUNME.sh` | a shim: resolves the vehicle and hands every argument to the vehicle's `RUNME.sh`, with the work root set to this folder | the stub verb, and the vehicle at an update |
| `.claude/settings.json` | the cage's settings, the same on every box | the stub verb |
| `.claude/skills/bridgehead/` | a plugin of its own, small, that resolves the vehicle at session start and hands every hook to it | the stub verb, and the vehicle at an update |

The client adopts a plugin from the folder it opens alone, so the stub carries its own plugin folder, and that plugin is the bridgehead.

# The bridgehead step by step

The bridgehead resolves the vehicle in four steps on a desk, and installs it in five on a cloud box. Every step carries its own proof.

On a desk:

| step | does | proves it |
|---|---|---|
| 1 | `session.start` reads `vehicle.json` | a fixture stub with a fake register answers the vehicle's path |
| 2 | asks the register for the vehicle's method root | the register test that stands, over a stub |
| 3 | imports the copy of the vehicle's hooks inside its own folder | a probe session in a stub answers the canary through the bridgehead |
| 4 | every later event reaches the vehicle's hook with the work root set to the stub | the write door refuses a bad write in the stub, and the ticket verbs read the stub's tickets |

On a cloud box:

| step | does | proves it |
|---|---|---|
| 5 | the register holds no such vehicle | a fixture with an empty register takes this road |
| 6 | clones the upstream repo into `~/.se/vehicles/<brand>` | a fake git records the clone with the URL from `vehicle.json` |
| 7 | runs the vehicle's `RUNME`, which surveys the tools and builds what it needs | the install test that stands, in the clone |
| 8 | the vehicle registers itself and attaches to the stub | `.se/project.json` in the stub names the vehicle, and step 3 follows |
| 9 | the routine's first session ends on the install, and the cage holds the second | a routine run against a stub repo, read off its log |

The bridgehead carries a copy of the vehicle's hooks and lib. The client loads a hooks module from inside the plugin's folder alone, and an update refreshes the copy. For details, see [[spec/design_output/level0#a-bridgehead-imports-a-copy]].

# The branches

One group per step that stands alone, in the order their proofs build on one another. A box takes the first two at once, and the rest wait as the table says.

| group | ask | waits for |
|---|---|---|
| `the-bridgehead-imports-its-vehicle` | the probe: a plugin that imports a hooks module from a path it reads at session start, and forwards every event | nothing |
| `the-stub-takes-shape` | `./RUNME.sh stub into <folder>` writes the files above, and a contract test produces a stub and reads them back | nothing |
| `the-shim-resolves-the-vehicle` | the stub's `RUNME.sh` finds the vehicle through the register and runs its verbs over the stub | `the-stub-takes-shape` |
| `the-verbs-read-two-roots` | the ticket verbs, the pull and the doors read tickets and guidance off the work root, and rules off the method root | `the-shim-resolves-the-vehicle` |
| `the-bridgehead-installs-upstream` | a cloud box clones the upstream, runs its `RUNME`, registers and attaches | `the-bridgehead-imports-its-vehicle`, `the-stub-takes-shape` |
| `the-sidebar-makes-both` | two buttons beside the engine marks: one makes a vehicle, one makes a stub, each asking for a folder | `the-stub-takes-shape` |
| `the-brand-reads-the-folder` | the extension id, the view id and the icon read the folder name, so two brands stand side by side | nothing |

# What it needs beside

- The upstream of a vehicle. A vehicle the button makes has no git yet. So the stub verb refuses until the vehicle has a remote, or takes the URL as an argument.
- The register on a cloud box: fresh and empty, so the install road writes the first entry.
- The routine's environment: the cloud box holds no vehicle, so the routine's prompt names the stub repo and nothing else.
- A cloud test: one routine run against a stub repo, read off its log, is the proof of step 9. Nothing on a desk stands in for it.
- The work root in every door. Today the method root carries the rules and the work root the files. The stub is the first tree where the two differ for real.
