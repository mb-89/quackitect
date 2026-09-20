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
| the Go import running a command | a call into the package's `door.go` |

A root stands off the rule, because it builds the hand every module past it
reads. `.vale.ini` names each one in a section, beside the doors and their
fakes. The two rules take two switches, because a file standing off one wants
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

# Two folders, and their cost

| folder | what stands there | what it touches |
|---|---|---|
| `test/level0` | every normal test | memory |
| `test/contract` | the tests driving the real thing | a binary, the disk, git |

`FakeDoorsInTest` refuses a real door inside `test/level0`, so a test
landing in the wrong folder says so at once.

# One contract test per door

A fake with nothing behind it drifts from the thing it stands for. So each door
carries one test in `test/contract` under its own name, driving the real thing
and asserting the fake answers the same.

No pattern holds a rule spanning two folders, so the command line holds this
one. `./RUNME.sh doors` reads both folders and names every door standing
without a contract test. `check` runs it after the tests, before the rules.

Other contract tests stand there too, because they drive a real thing as well.
`vale.test.js` runs the rules through Vale itself, and `tree.test.js` reads the
files this tree tracks.

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

So a file spawns Vale once, or three times where it proves the fixer, and a
case proves its rule off findings in memory. A text declared inside a case
comes after that run, so the helper runs again for it.

The helper reads the config's own sections too, with Vale's glob, where a star
spans a slash. So a case proving a path stands off a rule reads the section
that switches it off, and spawns nothing.
