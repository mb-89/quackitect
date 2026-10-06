---
kind: [[design_output]]
---

# Scope

`src/doors` holds every reach outside this tree. This note covers the doors,
the fakes beside them, and the contract tests over both.

# One door per outside thing

A door is the one place this tree reaches a thing outside it. Each is a
function answering an object of verbs, and `./RUNME.sh doors` names every one:

| door | reaches | file |
|---|---|---|
| `proc` | a program | `src/doors/proc.js` |
| `disk` | the filesystem | `src/doors/disk.js` |
| `git` | a repository | `src/doors/git.js` |
| `clock` | the time now | `src/doors/clock.js` |
| `log` | the log every door writes | `src/doors/log.js` |
| `http` | a server over the network | `src/doors/http.js` |

Everything above a door takes it as an argument. The command line builds every
door once and hands them on, so a caller names what it reaches and a test hands
in something else.

Vale holds the line: `DoorsOnly` refuses a `node:` import, a `Date.now`, a
`new Date()` and a `Math.random` anywhere but `src/doors`. The modules reaching
nothing pass, and `spec/config/styles/VoiceVale/DoorsOnly.yml` names them.

# A door reads the outside

`OutsideInDoors` holds the reads a `node:` import misses:

| what the rule refuses | what a module takes |
|---|---|
| `process.env` and `process.argv` | `it.env` or `box.env`, off the hand a root builds |
| `process.platform` | a `windows` argument the root reads once |
| `process.pid` | `it.pid`, off the hand a root builds, so an identity replays |
| `process.version` | the root alone reads it, for the survey |
| `process.execPath` | `it.node` or `box.node`, off the root |
| the Go import running a command | a call into the package's `door.go` |
| the Go import of `os`, or a package under it | a call into the package's `door.go`, which names each read once, and the lsp IO module reads the box through its own `door.go` |

A root stands off the rule, because it builds the hand every module past it
reads. `.vale.ini` names each one in a section, beside the doors and their
fakes. Each rule takes its own switch, because a file standing off one wants
the other.

`test/contract/outside-in-doors.test.js` drives Vale over the name of each
file, so a section a hand writes meets its case.

# A raw run keeps bytes

`proc.run` answers text. A caller passing `raw` gets a character a byte, so a
length the program declares matches what the string holds.

A caller reading a git object out of a batch needs that. The object carries a
size in bytes, and a name beside bytes no reader reads as text. Such a caller
turns each payload back into text itself, and a caller wanting text passes
nothing.

# A door standing on another

Git runs a program, and the log writes a file, so each takes the door beneath it
and builds on that. A fake of the door beneath then stands in for the one
above, and one file holds each pairing under one name.

| door | stands on | its fake |
|---|---|---|
| `git` | `proc` | `src/doors/fake/git.js`, over the fake process |
| `log` | `disk` and `clock` | `src/doors/fake/log.js`, over the fake disk |

The fake git answers `ran`, the commands it takes, in order. The fake log
answers `files`, the fake disk holding what it writes. For what one log line
holds, see [[spec/design_output/log]].

# A fake behaves

Each door has a fake beside it in `src/doors/fake`. A fake behaves: a test
writes to the fake disk and reads the same bytes back. The fake process answers
from a table and throws on any command outside it. A test scripting the answers
tests its own script, so no door here has a mock.

The fake clock stands still until a test moves it with `tick`, so a case that
reads the time replays.

| the call | the real disk and the fake |
|---|---|
| a list of a file | throw `ENOTDIR` |
| a list of an empty folder | answer an empty list |

A fake that answers where the real door throws hides the fault until the first
real box.

A fake keys a path the same way on every platform. The disk's maps key through
`norm`, and the process table keys a command with forward slashes on both sides.
So a test reading a map, or teaching a command by a posix path, reads the same on
the desk and on a cloud box. A branch green on one stays green on the other.

`behaves` stands beside the fakes as the guard they share. It wraps a fake, and
a call the fake holds no answer for throws with the door's name. So a test
driving a door through a fake asserts on something.

# The bridgehead stands under hooks

The bridgehead is a door: it sits in the agent's path, and it is the outside
thing a test of the server fakes. It stands under `.claude/skills/level0/hooks`
and in no `src/doors`, because the client loads a hooks module from that
folder alone. Its fake, `src/doors/fake/bridgehead.js`, raises an event
straight into `decide`, so a test drives the server with no client, no wire
and no port. For details, see
[[spec/design_output/level0#the-bridgehead-and-the-server]].

# The folders, and their cost

| folder | what stands there | what it touches |
|---|---|---|
| `test/level0` | every normal test | memory |
| `test/contract` | the tests driving the real thing | a binary, the disk, git |

`FakeDoorsInTest` refuses a real door inside `test/level0`, so a test
landing in the wrong folder says so at once.

# A script guards its main

A script that dispatches at import runs its main under the test importing it,
and the exit there ends the run. The runner then reports the file as one
passing case holding none, so the test-first door reads a pass that proves
nothing. So a script with a main runs it behind `runsHere` in
`lib/paths.js`, which answers true where node runs that file itself. The
command line and the server read it there. A test importing the command
line's verbs registers its cases, and a failing case turns the run red.

# One contract test per door

A fake with nothing behind it drifts from the thing it stands for. So each door
carries one test in `test/contract` under its own name, driving the real thing
and asserting the fake answers the same.

No pattern holds a rule spanning both folders, so the command line holds this
one. `./RUNME.sh doors` reads both folders and names every door standing
without a contract test. `check` runs it after the tests, before the rules.

Other contract tests stand there too, because they drive a real thing as well.
`vale.test.js` runs the rules through Vale itself, and `tree.test.js` reads the
files this tree tracks.

| door | real | fake | contract suite |
|---|---|---|---|
| `proc` | `src/doors/proc.js` | `src/doors/fake/proc.js` | `test/contract/proc.test.js` |
| `disk` | `src/doors/disk.js` | `src/doors/fake/disk.js` | `test/contract/disk.test.js` |
| `git` | `src/doors/git.js` | `src/doors/fake/git.js` | `test/contract/git.test.js` |
| `clock` | `src/doors/clock.js` | `src/doors/fake/clock.js` | `test/contract/clock.test.js` |
| `log` | `src/doors/log.js` | `src/doors/fake/log.js` | `test/contract/log.test.js` |
| `http` | `src/doors/http.js` | `src/doors/fake/http.js` | `test/contract/http.test.js` |
| `index` | `src/doors/index.js` | `src/doors/fake/index.js` | `test/contract/index.test.js` |
| `awake` | `src/doors/awake.js` | `src/doors/fake/awake.js` | `test/contract/awake.test.js` |
| `front` | `src/doors/front.js` | `src/doors/fake/front.js` | `test/contract/front.test.js` |
| `session` | `src/doors/session.js` | `src/doors/fake/session.js` | `test/contract/session.test.js` |
| `vale` | `src/doors/vale.js` | none | `test/contract/vale.test.js` |
| `biome` | `src/doors/biome.js` | none | `test/contract/biome.test.js` |
| `wire` | `src/doors/wire.js` | none | `test/contract/wire.test.js` |

The contract suite is the one test that drives the real door, and every other
test runs on the fake. A door with no fake stands on its contract suite alone.
The Go doors keep the same shape, a fake in the door's own file and a suite
running both. [[spec/design_output/model#the-fake-keeps-a-contract]]

| door | real | fake | contract suite |
|---|---|---|---|
| git | `src/modules/git/git.go` | `FakeGit` | `src/modules/git/git_contract_test.go` |
| env | `src/modules/env/env.go` | `FakeEnv` | `src/modules/env/env_contract_test.go` |
| disk | `src/modules/files/disk.go` | `FakeDisk` | `src/modules/files/disk_contract_test.go` |
| watch | `src/modules/files/watch.go` | `FakeWatch` | `src/modules/files/watch_contract_test.go` |
| clock | `src/modules/clock/clock.go` | `FakeClock` | `src/modules/clock/clock_contract_test.go` |
| the pull's disk | `src/pull/door.go` | `FakeDisk` | `src/pull/disk_contract_test.go` |
| the viewer's caller | `src/tui/registry` | `Fake` | `src/tui/registry/call_contract_test.go` |
| the viewer's catalog | `src/tui/registry` | `Fake` | `src/tui/registry/catalog_contract_test.go` |
| index | `src/index` | `src/q/qtest` | `src/index/contract_test.go` |
| bus | `src/index/bus.go` | none | `src/index/bus_test.go` |
| a placed process | `src/index/procs.go` | none | `src/index/procs_test.go` |
| a tool's process | `src/modules/lsp` | none | `src/modules/lsp/door_test.go` |
| the vehicle's shim | `src/vehicle` | none | `src/vehicle/shim_contract_test.go` |
| the pull's git and shell | `src/pull` | none | none |
| the branch verbs' git, disk and env | `src/branches` | none | none |
| the box and check doors of quack | `src/quack` | none | none |
| the viewer's frame over the network | `src/tui/frame` | none | none |

A test outside these suites reaching a real door stands in a family, and each
family carries its fate:

| family | files | fate |
|---|---|---|
| the placements over real processes | `src/index/placements_test.go`, `src/quack/placements_test.go`, `src/quack/io_test.go` | door tests of a placed process, whose waits run on a fake timer and a fake clock |
| the standing file over a real bus | `src/index/standing_test.go` | door test of the bus |
| a planted tree each case builds | `src/imports/imports_test.go`, `src/imports/analyzers_test.go` | builds once a package run |
| the quack binary each case builds | `src/quack/manager_test.go` | builds once a package run |
| the branch verbs over a bare origin and a clone a case | `src/branches/tree_test.go`, `src/branches/dispatch_test.go`, `src/branches/dispatch_write_test.go` | moves onto `FakeGit` and a fake process, under a child ticket |
| the quack verbs spawning git or the binary | `src/quack/*_test.go` reaching `exec.Command` or `os.Args[0]` | moves onto the process door's fake, under a child ticket |
| the index and session suites driving the real door alone | `test/contract/index.test.js`, `test/contract/session.test.js` | run the fake beside the real door, under a child ticket |
| the twins and goldens over the real tree | `src/quack/check_twins_test.go`, `src/quack/golden_test.go` | door tests of the tree the Go and the JavaScript both read |
| the index door over a real listener | `src/index/door_test.go`, `src/index/reach_test.go` | door tests of the index door |
| the quack verbs over a repository a case | `src/quack/commit_test.go` and the ticket verbs' cases | move onto `FakeGit`, under a child ticket |
| the index's own reads of git | `src/index/files_test.go`, `src/index/sweep_test.go` | door tests of the index's git read |
| the pull over a real repository | `src/pull/pull_test.go` | moves onto `FakeGit`, under a child ticket |

The one state a module holds is `namePatterns` in
`src/modules/check/private.go`, a memo of a pure compile, and it stands as the
named exception.

# A rule test spawns once

A rule asserted against a stub is a rule nobody runs, so a case proving a
rule reaches Vale. A case spawning the binary a line costs the battery a
minute under load, and a red under that load names no cause. So one helper,
`test/contract/ruled.js`, is the one place a rule test reaches Vale:

| what a file does | what the helper does |
|---|---|
| hands the runner a case body the helper builds over the case's texts, at the top | writes every text under the path it names, each in a folder of its own |
| reads the findings a text by key inside the case | runs Vale once over the folder, on the first case |
| asks for the fixer | runs the fixer twice more over the folder, and reads each text back after each round |

So a file spawns Vale once, and again for each round where it proves the
fixer. A case proves its rule off findings in memory. A text declared inside a case
comes after that run, so the helper runs again for it.

The helper reads the config's own sections too, with Vale's glob, where a star
spans a slash. So a case proving a path stands off a rule reads the section
that switches it off, and spawns nothing.
