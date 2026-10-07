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
| git's writes | `src/modules/git/repo.go` | `FakeRepo` | `src/modules/git/repo_contract_test.go` |
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
| a spawned process | `src/proc/proc.go` | `FakeRunner` | `src/proc/proc_contract_test.go` |
| the vehicle's shim | `src/vehicle` | none | `src/vehicle/shim_contract_test.go` |
| the branch verbs' git, process and disk | `src/branches/doors.go` | `FakeRepo`, `FakeRunner` and `FakeDisk` | the git, process and disk suites above |
| the quack landing and ticket verbs' git | `src/quack/ticket_doors.go` | `FakeRepo` over the case's folder | the git suite above |
| the box and check doors of quack | `src/quack` | none | none |
| the viewer's frame over the network | `src/tui/frame` | none | none |

A test outside these suites reaching a real door stands in a family, and each
family carries its fate:

| family | files | fate |
|---|---|---|
| the placements over real processes | `src/index/placements_test.go`, `src/quack/placements_test.go`, `src/quack/io_test.go`, `src/quack/split_test.go` | door tests of a placed process, whose waits run on a fake timer and a fake clock |
| the standing file over a real bus | `src/index/standing_test.go` | door test of the bus |
| a planted tree each case builds | `src/imports/imports_test.go`, `src/imports/analyzers_test.go` | builds once a package run |
| the quack binary each case builds | `src/quack/manager_test.go` | builds once a package run |
| the quack verbs spawning through a verb | `src/quack/registry_test.go`, `src/quack/person_run_test.go`, `src/quack/voice_verb_test.go` | moved onto the process door's fake |
| the index suite running the fake beside the real door | `test/contract/index.test.js` | door tests, each case run on the fake and the real door wherever the fake gives that answer |
| the twins and goldens over the real tree | `src/quack/check_twins_test.go`, `src/quack/codec_test.go`, `src/quack/golden_test.go` | door tests of the tree the Go and the JavaScript both read |
| the index door over a real listener | `src/index/door_test.go`, `src/index/reach_test.go`, `src/index/actions_test.go`, `src/index/failed_start_test.go`, `src/index/watch_test.go`, `src/quack/cli_test.go`, `src/quack/dump_test.go`, `src/quack/main_test.go` | door tests of the index door |
| the index's own reads of git | `src/index/files_test.go`, `src/index/sweep_test.go` | door tests of the index's git read |
| a real file watch stopped mid-add | `src/watcher/watcher_test.go`, `src/watcher/watchertest/watchertest_test.go`, `src/modules/files/watch_stop_test.go` | door tests of the file watch |
| a child ended whole, and a door standing apart from its starter | `src/quack/ending_test.go`, `src/quack/ending_windows_test.go`, `src/index/detach_test.go`, `src/index/detach_windows_test.go` | door tests of a spawned process's group and tree, each waiting on a pipe's end |
| the dispatcher's fix ask through vale itself | `src/branches/dispatch_vale_test.go` | door test of vale, and the branch guard leaves it out by name |
| the git hooks and the boot word over real git and sh | `src/quack/githooks_exe_test.go`, `src/quack/hook_verb_test.go`, `src/quack/hooks_folder_test.go`, `src/quack/session_start_test.go` | door tests of the shell entry points, each over a real repository or a copy of the script under a temporary folder |

The check reads every code span naming a test file in these tables, and names a Go test that sleeps or spawns a process outside them. [[spec/guidance/code/testing]]

The one state a module holds is `namePatterns` in
`src/modules/check/private.go`, a memo of a pure compile, and it stands as the
named exception.

# The git door carries writes

`FakeGit` holds four reads. The branch verbs, the quack verbs and the pull run
git's whole command line, writes among it, so a test of them spawns git. One
door carrying the writes, with a fake and one contract suite, moves those cases
into memory. [[spec/tickets/unfaked-doors-take-fakes]]

| part | what it holds |
|---|---|
| `Repo` in `src/modules/git` | the typed operations below, each one git command line in the real door |
| `FakeRepo` beside it | commits keyed by the hash of their content, the refs, `HEAD`, the index, a merge's stages, the worktrees, the hooks a case sets, and the work tree on a `FakeDisk` or a real folder, and the four reads of `Git` answered off them, so `FakeGit` leaves once its cases move |
| an origin | a second `FakeRepo`, which push and fetch move commits and refs between |
| `src/modules/git/repo_contract_test.go` | each case run against `FakeRepo` and a real repository under a temporary folder, the one door test of git's writes |

The operations the three packages run:

| kind | operations |
|---|---|
| reads | the head and its branch, a ref resolved, a file at a ref or at a merge's stage, many files at refs in one ask, the files at a ref under a folder, the paths two refs differ in, the patch or its stat between two refs, the commits one ref stands ahead and behind, the commits a ref carries whose patch another lacks, the merge base, the first-parent line, the work tree's status, the log over a range, the refs under a prefix, the refs under a prefix a ref holds, the second a commit was made, a config key, a commit's signature, the paths the ignore file holds out, whether the index tracks a path, the unmerged paths, the index's changes against `HEAD`, the lines the index adds, the log of one path, the branches origin holds, the refs origin holds under a prefix with their commits |
| writes to the work tree | add, reset of paths or to a ref, a reset that keeps or drops local changes, a path restored from `HEAD`, commit, an amend, switch with or without a new branch, a worktree added and removed |
| writes across refs | merge under a message of its own or with no fast-forward, naming the paths that conflict, rebase onto a ref, a fast-forward, update or delete of a ref, a commit off a ref's tree or off files written over it that moves no ref, push with a lease, push of a commit to a branch, a branch deleted on origin, fetch of a branch or of every branch with prune, a shallow clone fetched whole |

The fake merges three ways a path at a time. A path both sides change
differently conflicts whole, where git merges hunks apart. A case needing a
merge of lines stays a door test, and the contract suite holds one case proving
the two agree on a path one side alone changes.

The probe's clone and apply stay on the real door, because the probe measures a
cold box.

## The process door

The quack verbs, the branch verbs and the pull's shell each spawn a process in
place. One door takes a command, its folder, its env and its input, and answers
its output, its errors and its exit code. The lsp module's tool runs take it,
with the halt and the wait they need.

| part | what it holds |
|---|---|
| `Runner` in `src/proc` | the door, a function the real one fills with `exec`, outside `src/modules`, since it registers no ports |
| `Halting` beside it | a real `Runner` and its halt: the halt ends every run in flight, and a run after it never starts |
| `Wait` on a command | the span past which a run ends with a fault, and zero sets no limit |
| `Streams` on a command | the caller's input and output streams, which a run reads and writes in place of `Stdin` and the buffers, so a viewer or a tool hands the terminal straight through |
| `Signalled` | the code a run a signal ends answers, apart from `NotStarted` |
| `FakeRunner` beside it | a table from a program's name to a handler, which answers a fault on a program nobody taught it, as `src/doors/fake/proc.js` does, and its own `Halt`, `Ends` and `After` for the halt and the wait |
| `src/proc/proc_contract_test.go` | each case run against both: output, errors, an exit code, input, env, the streams, a signal's end, a program that never starts, the halt and the wait |

The branch verbs' `rawEnv`, the pull's shell, and every spawn in the quack
verbs outside the box and check doors take the `Runner`. Each quack spawn
keeps its name as a binding over `Real`, beside an `Over` form a case hands a
`FakeRunner`. A case teaching the fake quack binary hands it a handler that
answers the child road.

## The moves

Each move narrows its row in the family table, and the real-wait guard holds
the narrowing.

| order | ticket | the door it takes |
|---|---|---|
| 1 | [[spec/tickets/pull-meets-fake-git]] | `Repo`, and the `Runner` for the shell |
| 2 | [[spec/tickets/quack-repos-meet-fake-git]] | `Repo` |
| 3 | [[spec/tickets/quack-spawns-meet-fake-process]] | the `Runner` |
| 4 | [[spec/tickets/branch-verbs-meet-fake-git]] | `Repo`, the `Runner`, and the `FakeDisk` the repository's work tree stands on |
| 5 | [[spec/tickets/lsp-tools-take-the-runner]] | the `Runner`, with the halt and the wait its tool runs take |

The pull goes first, because its git already stands behind one `Run`. The
branch verbs go last of the git moves, because their disk moves with their git.
The lsp move touches no git, so it stands apart from that order.

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
