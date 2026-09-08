---
kind: [[design_output]]
describes: [[src/doors]]
---

# One door per outside thing

A door is the one place this tree reaches a thing outside it. There are four,
each a function answering an object of verbs:

| door | reaches | file |
|---|---|---|
| `proc` | a program | `src/doors/proc.js` |
| `disk` | the filesystem | `src/doors/disk.js` |
| `git` | a repository | `src/doors/git.js` |
| `clock` | the time now | `src/doors/clock.js` |

Everything above a door takes it as an argument. The command line builds all
four once and hands them on, so a caller names what it reaches and a test hands
in something else.

Vale holds the line: `DoorsOnly` refuses a `node:` import, a `Date.now`, a
`new Date()` and a `Math.random` anywhere but `src/doors`. Five modules pass,
because they reach nothing: `node:path`, `node:url`, `node:test`,
`node:assert` and `node:assert/strict`.

# Git is a door of its own

Git runs a program, so the git door takes the process door and builds on it. A
fake process therefore fakes git, and `src/doors/fake/git.js` is that pairing
under one name. It answers `ran`, the commands it takes, in order.

# A fake behaves

Each door has a fake beside it in `src/doors/fake`. A fake behaves: a test
writes to the fake disk and reads the same bytes back. The fake process answers
from a table and throws on any command outside it. A test scripting the answers
tests its own script, so no door here has a mock.

The fake clock stands still until a test moves it with `tick`, so a case that
reads the time replays.

# Two folders, and what each one costs

| folder | what stands there | what it touches |
|---|---|---|
| `src/level0/test` | every normal test | memory |
| `test/contract` | the tests driving the real thing | a binary, the disk, git |

`FakeDoorsInTest` refuses a real door inside `src/level0/test`, so a test
landing in the wrong folder says so at once.

# Every door has exactly one contract test

A fake with nothing behind it drifts from the thing it stands for. So each door
carries one test in `test/contract` under its own name, driving the real thing
and asserting the fake answers the same.

No pattern holds a rule spanning two folders, so the command line holds this
one. `./RUNME.sh doors` reads both folders and names every door standing
without a contract test. `check` runs it after the tests, before the rules.

Two more contract tests stand there, because they drive a real thing as well.
`vale.test.js` runs the rules through Vale itself, and `tree.test.js` reads the
files this tree tracks.
