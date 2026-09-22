---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-battery-earns-its-time
step: do
record:
  - step: do
    hand: box 14d41de46d55 · claude-code-remote
    hash_before: f38c0828681c45c23780794246eae466caf02289
    hash_after: f38c0828681c45c23780794246eae466caf02289
    answered:
      - name: tests
        exit: 0
        said: green, 87 test(s) pass in 10 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
Vale and Biome are doors. One contract case each drives the real binary, and every other case takes the fake. The battery then spawns each program a handful of times, and a case proves a rule off a fixture in memory.

<!-- breaks, as text: what breaks if it is never done -->
About two hundred Vale spawns run across seven test files at once. The load alone turns a green case red, and a red under load names no cause.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `test/contract/vale.test.js` and `test/contract/biome.test.js` each hold one case driving the real binary, and the rest of the file drives the fake
- no other test file under `test/contract` spawns Vale or Biome, which `grep -l 'vale\|biome' test/contract/*.test.js` decides
- `./RUNME.sh check` is green, and the stamp's slowest ten hold no case over two seconds

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test

## check

    ./RUNME.sh check

## says

The rule tests reach Vale through one helper, `test/contract/ruled.js`. A file declares each case with its texts at the top. The first case runs Vale once over every text, each written under the path it names in a folder of its own. Each case then reads its findings by key. A file proving the fixer takes two rounds more over the same folder. The chapter A rule test spawns once, under `spec/design_output/doors.md`, carries the shape.

| file | Vale spawns a run |
|---|---|
| `vale.test.js` | 2 |
| `paragraph.test.js` | 1 |
| `outside-in-doors.test.js` | 1 |
| `shape.test.js` | 1 |
| `schema.test.js` | 1 |
| `vale-fix.test.js` | 3 |
| `vale-paths.test.js` | 7 |

`vale.test.js` holds one case driving the door against the binary, and the fake, taught by that run, answers the same. Its cases proving a paragraph rule twice move into `paragraph.test.js`. `biome.test.js` holds one case the same way, and the magic number proof rides it. The case with no binary takes the fake disk and the fake process.

`outside-in-doors.test.js` reads the config's own sections for every path standing off the rule, with Vale's glob, and spawns once to prove the rule fires. `one-reading.test.js` reads one file, and the language server reads it once for both fronts. That case alone stood past the bound the third line names. `readingFor` takes the server's list where a caller holds one.

A fresh clone carried no plugin manifest, because git ignores both manifests and the stamp wrote only over one standing. So the check ran red on this box before any change. The stamp now reads both from `spec/config/brand`, beside the icon, and writes each target a clone lacks.

## checked

- the change follows the ask, and the discussion names each departure
- the cleanup it reveals is in the change: the manifest sources, and the twins
- the doors note holds the helper's shape, the vehicle note the brand's sources

# Discussion

The ask says every case past the door case takes the fake. No fake evaluates a rule, so a rule case takes the findings of the one run this file makes, off a fixture in memory. That is what the helper holds.

The grep the second line names answers these files past the two door tests:

| file | why the word stands there | spawns |
|---|---|---|
| `candidate-check.test.js` | the candidate check runs through the real Biome | one |
| `one-reading.test.js` | it names the reader's function | none of its own |
| `tree.test.js` | its fixtures name the settings key | none |
| `vale-fix.test.js` | a fixture carries the exemption marker | through the helper |
| `vale-paths.test.js` | it drives the door over two roots and the workspace config | seven |
| `stub.test.js`, `vehicle.test.js` | the install's skip list | the sibling ticket on the vehicle case moves it |

The go part of the check downloaded its modules on this box, and took most of the check's time. The retro reads that.
