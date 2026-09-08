---
kind: [[handover]]
status: done
urgency: soon
depends_on: doors-and-fakes
---

# The tree writes a log, and one viewer reads it

Every part of the brief stands. `./RUNME.sh check` passes: 119 tests, five doors
each held by a contract test, and the rules clean over the tree.

| the brief asks | where it stands |
|---|---|
| a session writes JSON lines under `.se/log/` | done, and a test parses every line |
| `./RUNME.sh check` passes | done |
| the prune drops past either cap, against the fake | done, in `src/level0/test/log.test.js` |
| lnav draws the rows once the format lands | done, and the detail line opens |
| `./RUNME.sh log` answers with lnav absent | done, as plain rows |

# What lands

| file | holds |
|---|---|
| `src/level0/lib/log.js` | the line, the file name, the prune decision, the plain row |
| `src/doors/log.js` | the door over the disk and the clock, and `prune` |
| `src/doors/fake/log.js` | the same door over the fake disk |
| `src/scripts/prune.js` | the prune as a program, which `session.start` runs |
| `spec/config/lnav/quackitect.json` | the format lnav reads |
| `spec/design_output/log.md` | why each of those stands where it does |

`./RUNME.sh log` opens the newest session file, and `--all` hands lnav the whole
folder. Two tests hold the shape: `test/contract/log.test.js` drives the real
disk beside the fake, and `test/contract/tree.test.js` holds the lnav format to
the fields the door writes.

# Which doors say what

| door | says |
|---|---|
| `level0` | the session starts, with the branch, Vale and what the prune drops |
| `write` | the code door refuses a write, with the file and the rule |
| `vale` | the prose rules refuse a write, and how long a `lint` takes |
| `judge` | a model refuses a write |
| `bash` | a commit or a push aims at trunk |
| `work` | a branch verb answers, with the branch it stands on |

Two callers stay quiet, and a later branch may open them: the `fix` verb, and
the `doctor` verb. Both answer a person who is watching, so a line adds little.

# What one line costs

One line writes the whole file again, so the cost of a line grows with the
lines already standing.

| lines in the session | median line | the whole run |
|---|---|---|
| 10 | 0.15 ms | 1.8 ms |
| 100 | 0.11 ms | 14.5 ms |
| 500 | 0.24 ms | 122 ms |
| 2000 | 0.77 ms | 1.6 s |

A flush per line holds to about 500 lines, which is far above what a session
says today. A buffer earns its place past a thousand, and the cheaper answer
first is a second file once one file passes 500 lines. Leave both until a
session says enough to feel it.

# What surprises me

1. The fake disk answers `exists` false for a folder `makeDir` adds. The real
   disk answers true, so the prune meets the divergence at once. The fake reads
   its folders, and `test/contract/disk.test.js` holds that.
2. The plugin folder is `src/level0`, so the hook reaches no file outside it.
   The line shaping therefore stands in `src/level0/lib/log.js`, and the door
   above it reads that lib. The hook writes through `$.fs` itself.
3. lnav 0.14.1 ships Linux and Windows zips alone. The brief names a macOS
   build, and the release carries none, so brew answers there.
4. The Windows zip carries `bin/lnav.exe` beside `msys-2.0.dll`, and the Linux
   zip carries a bare `lnav`. Both installers take that difference.
5. The `file-pattern` in the brief is not valid JSON. A single backslash opens
   an escape, so the committed format doubles each one.
6. One command line run is one session, so a working hour of `./RUNME.sh lint`
   leaves a dozen small files. The caps hold the folder, and a reader opens the
   folder with `--all` where a single file says too little.
7. `work` verbs return a number that tests assert on. The log line therefore
   rides a promise only where a log door stands, so the fake-driven tests keep
   reading a number.

# What a later branch may take

- Wire the remaining verbs, once a person wants a line from them.
- Let the door open a second file past 500 lines, in place of a buffer.
- Read `.se/log` from a test that drives lnav itself, once a headless run earns
  the 80 MB the binary costs.
