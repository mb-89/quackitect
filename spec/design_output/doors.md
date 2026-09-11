---
kind: [[design_output]]
---

# Scope

`src/doors` holds every reach outside this tree. This note covers the doors,
the fakes beside them, and the contract tests over both.

# One door per outside thing

A door is the one place this tree reaches a thing outside it. There are five,
each a function answering an object of verbs:

| door | reaches | file |
|---|---|---|
| `proc` | a program | `src/doors/proc.js` |
| `disk` | the filesystem | `src/doors/disk.js` |
| `git` | a repository | `src/doors/git.js` |
| `clock` | the time now | `src/doors/clock.js` |
| `log` | the log every door writes | `src/doors/log.js` |

Everything above a door takes it as an argument. The command line builds all
five once and hands them on, so a caller names what it reaches and a test hands
in something else.

Vale holds the line: `DoorsOnly` refuses a `node:` import, a `Date.now`, a
`new Date()` and a `Math.random` anywhere but `src/doors`. Five modules pass,
because they reach nothing: `node:path`, `node:url`, `node:test`,
`node:assert` and `node:assert/strict`.

# A door standing on another

Git runs a program, and the log writes a file, so each takes the door beneath it
and builds on that. A fake of the door beneath therefore stands in for the one
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

Two more contract tests stand there, because they drive a real thing as well.
`vale.test.js` runs the rules through Vale itself, and `tree.test.js` reads the
files this tree tracks.
