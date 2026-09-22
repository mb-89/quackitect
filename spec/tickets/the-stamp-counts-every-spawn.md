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
    hash_before: 65bef1cf34382d0897b099857f6a5fc1e8e0fed7
    hash_after: 65bef1cf34382d0897b099857f6a5fc1e8e0fed7
    answered:
      - name: tests
        exit: 0
        said: green, 111 test(s) pass in 15 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The battery's stamp records what a retro reads for a regression. That is time a test file, and the spawns a run makes with how many are Vale. It is the parts a red run leaves unrun, and the red case's own words.

<!-- breaks, as text: what breaks if it is never done -->
The stamp keys the slowest cases on a name two files share. It holds no spawn count, and hides the other parts' drift on a red run.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the stamp `./RUNME.sh check` writes carries a time a test file, a spawn count and the parts unrun
- `test/level0/battery.test.js` covers each field off a fixture
- the retro report draws the new fields under the battery chapter

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test

## check

    ./RUNME.sh check

## says

The battery's report gains four fields, and the chapter The battery answers first, under `spec/design_output/work.md`, holds the table of every field. Two writers feed them while the tests run. The runner's own reporter, `src/scripts/battery-reporter.js`, writes a line a case. The line holds the file, the time, and the error's first line of a red case. The runner's TAP named no file for a case, so the reporter takes its place. The process door appends the program's name to the tally file `SE_SPAWNS` names, on each spawn, in every process the run starts.

| field | what it holds on this box |
|---|---|
| `files` | a time a test file, the slowest first |
| `spawns` | 115 spawns, 18 of them Vale |
| `unrun` | the parts a red run leaves unrun, and none on a green one |
| `red` | each red case with its words, and none on a green one |

A case in the slowest list carries its file now, and the delta keys on the file and the name together. A report a retro kept before this change keys on the name alone, so its cases read as new once. The retro report draws the spawns against the last retro's, the slowest files against before, the parts left unrun and the red cases.

## checked

- the change follows the ask: a time a file, the spawns naming Vale, the unrun parts, the red words
- the cleanup it reveals is in the change: the TAP gives way to the reporter's lines
- the work note holds the field table, and each module points at it

# Discussion

The tally counts a spawn through the process door alone. A shell script spawning on its own counts nothing, such as the install fetching a binary. Every command line this tree runs counts through the door.
