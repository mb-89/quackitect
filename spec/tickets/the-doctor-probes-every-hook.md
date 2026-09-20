---
kind: [[ticket]]
state: closed
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
        evidence:
          - name: tests
            form: command
            expects: green
            says: the same tests pass
          - name: check
            form: command
            expects: 0
            says: the check is green on the commit
          - name: says
            form: text
            says: what changes and why, for a reader who was not there
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
group: the-bridge-keeps-transport
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: verdict
record:
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 8db360a439c2b09c473fbbed07d6c3197c77eae5
    hash_after: 8db360a439c2b09c473fbbed07d6c3197c77eae5
  - step: design/review
    hand: box fa49097ce66c · claude-code-remote · helper-2
    hash_before: cf62081cf9b6de8857cadddb6a32c462e3a8e464
    hash_after: cf62081cf9b6de8857cadddb6a32c462e3a8e464
  - step: implement/tests-red
    hand: box fa49097ce66c · claude-code-remote
    hash_before: cdf6f749a37cfd50ad577b707e9a3047a5c681fd
    hash_after: cdf6f749a37cfd50ad577b707e9a3047a5c681fd
    answered:
      - name: tests
        exit: 1
        said: assertion, 8 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 4e674422989775cf1135c5fa4d26af76490e4c9f
    hash_after: 4e674422989775cf1135c5fa4d26af76490e4c9f
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 72fd21b31e86705bf5e92bba0a245b8e355efd61
    hash_after: 72fd21b31e86705bf5e92bba0a245b8e355efd61
    answered:
      - name: tests
        exit: 0
        said: green, 409 test(s) pass in 37 file(s); green, src/engine/swap passes
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box fa49097ce66c · claude-code-remote · helper-7
    hash_before: 8448d4f19d68a9476dad9e9d275687dbd652a3c4
    hash_after: 8448d4f19d68a9476dad9e9d275687dbd652a3c4
reason: done
---

# Ask

A hook that answers nothing shows up in the first minute, where a hand can act on it.

A dead hook writes a failure on every event, and the session runs blind to it.

- `./RUNME.sh doctor` probes every hook URL the settings files name.
- The doctor reports a hook that answers nothing as a warn line.
- The entry at `127.0.0.1:36368` leaves `.claude/settings.local.json`.
- `./RUNME.sh test` covers a hook answering nothing.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

- one reader collecting every hook address the settings name
- one probe a hook, beside the probe the server already takes
- one row a hook in the doctor, and the third line of the ask off this tree

**What stands.** `doctor` in `src/scripts/cli-check.js` prints a row a thing,
and `serverLine` probes the one address it knows. Nothing there reads a
settings file, and nothing probes a hook.

| what the doctor names today | where it comes from |
|---|---|
| every tool the survey found | `.se/.runtime/tools.json` |
| the editor, the sidebar, the commit hook | the tree |
| the server | one health call |

**The reader.** A settings file holds its hooks under one key, and an address
there stands as a string. The reader walks the three files the client reads,
takes every string under `hooks` that parses as a URL, and keeps where it came
from.

| the file | who writes it | does git track it |
|---|---|---|
| `.claude/settings.json` | this tree | yes |
| `.claude/settings.local.json` | the box | no |
| the settings under the home of the box | the box | no |

**The probe.** Each address takes the same shape the server probe takes: one
call, a short wait, and an answer read as a row.

| what the probe meets | the row |
|---|---|
| an answer | `stands at <the address>` |
| nothing, inside the wait | a `warn` row naming the address and the file |
| an address no reader parses | a `warn` row naming the string |

The wait stands in one place beside the server's own, so a slow box moves both
together. A file standing nowhere reads as no hooks, and the doctor says
nothing of it.

**The cases.** Each drives the reader and the probe over fakes.

- the reader takes an address out of each of the three files
- the reader passes a settings file holding no hooks
- the probe answers a row a hook, over a fake wire
- a hook answering nothing reads as a warn row naming its file

**The third line.** The ask names an entry at a port in
`.claude/settings.local.json`. That file stands in `.gitignore`, and nothing in
this tree reads or writes it. So a hand on the box it belongs to takes that
line, and the doctor is what shows them the entry.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass. The approach answers the four lines of the ask, and the findings below
stand for the implement step to settle.

| what the review asks | what stands |
|---|---|
| the approach against the ask | the reader answers line one, the warn row line two, the argument under **The third line** line three, the cases line four |
| what the branch touches beyond the brief | this ticket carries no hunk yet |
| `./RUNME.sh check` | exit 0, on `cf62081c` |
| a retro in the handback | none stands |
| a test proving the rule fires | the cases feed a dead hook and read the warn row off it |

Findings, one a line:

- The branch answers line three of the ask with the doctor's row and no hunk,
  because git ignores that file. Carry that call into the verdict step.
- `warn` names a log level and a printed row in this tree. Say which one the
  doctor writes.
- Read `.claude/settings.json` off `SETTINGS` in
  `.claude/skills/level0/lib/vehicle.js`, and name the box's two files beside
  it, so one place owns each path.
- `new URL()` takes a Windows command path, so a command hook reads as an
  address. Keep `http:` and `https:` alone.
- Say what a hook's row label holds, because `doctor` pads a label to
  `COL.tool` and two files carry two hooks of one name.
- Probe the addresses together, so a box naming several dead hooks answers
  inside the first minute.
- `HEALTH_WAIT` stands twice, in `src/scripts/cli-doors.js` and
  `src/scripts/serve.js`. Point the probe at the first, and add no third.
- Say whether a reply carrying a failing status stands or warns, because the
  fake in the test answers one.
- Commit or drop the modification standing in
  `test/level0/start-road.test.js`, which the branch's last ticket left.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The run answers 1, and most cases fail on their own assertion.

| what the case asks | what the stub answers |
|---|---|
| the reader takes an address out of each settings file | an empty list |
| a command path stands outside the addresses | an empty list |
| two files naming one address read as one row | an empty list |
| a hook answering reads a row naming the address | an empty list |
| a hook answering nothing opens its row on `warn` | an empty list |
| a hook answering a failing status stands | an empty list |
| the probe asks the addresses together | no call on the wire |
| the rows come back in reading order | an empty list |

An import of a name standing nowhere kills the whole file, so the run reads one
red line and says nothing of the cases. So `cli-check.js` takes a stub a
function, each one answering an empty list, and every case fails where a reader
sees which claim breaks.

Some cases pass off the stub, because each asks for an empty answer. The list
holds a settings file with no hooks, a file standing nowhere, a file holding
torn json, and a box naming no hook. The change step keeps them honest, because
a reader filling the list breaks them where the guard goes missing.

**What surprises me.** The draft's table gives an address no reader parses a
`warn` row of its own. The review then asks for `http:` and `https:` alone,
which leaves a command path out of the list entirely. A row for a string the
box means as a command reads as a fault in the doctor. So the cases carry the
review's call, and the change step says so in the chapter.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `test/level0/doctor-hooks.test.js` and two stubs in `src/scripts/cli-check.js`
- the reader drives a fake disk from `src/doors/fake`, and the probe drives a wire the case holds
- the head comment names the approach, and each stub carries the line saying what it answers

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `cli-check.js`, `vehicle.js`, the level zero chapter and the cases, which the ask's four lines call for
- `hooksNamed` takes the disk as an argument, and `hookRows` takes the wire, so a case drives each over a fake
- the chapter at `[[spec/design_output/level0#the-doctor-probes-every-hook]]` holds the approach, and each function points at it

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`./RUNME.sh doctor` reads the hook addresses the settings files name, and says
which one answers. A hook standing dead reads as a row opening on `warn`.

| what lands | where |
|---|---|
| the reader and the probe | `src/scripts/cli-check.js` |
| the name of the box's own settings file | `.claude/skills/level0/lib/vehicle.js` |
| the chapter saying why | [[spec/design_output/level0#the-doctor-probes-every-hook]] |
| the cases | `test/level0/doctor-hooks.test.js` |

The reader holds `http:` and `https:` alone, because a command hook holds a
path and `new URL` takes a Windows path. The probe runs its calls together, and
waits the span `HEALTH_WAIT` holds. So a box naming several dead hooks answers
inside the first minute.

A reply carrying a failing status stands, because a box answering a status
listens there. The entry the ask names lives in a file git ignores, so this row
is what shows a hand the line to take out.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `cli-check.js`, `vehicle.js`, the level zero chapter and the cases
- `hooksNamed` takes the disk as an argument, and `hookRows` takes the wire, so each runs over a fake
- the chapter holds the approach, and each function points at it

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- .claude/settings.json
- .claude/skills/level0/lib/vehicle.js
- spec/design_output/level0.md
- spec/guidance/review/reviewing.md
- spec/tickets/the-bridge-says-it-falls.md
- spec/tickets/the-doctor-probes-every-hook.md
- src/scripts/cli-check.js
- src/scripts/cli-doors.js
- src/scripts/serve.js
- test/level0/doctor-hooks.test.js
- test/level0/start-road.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass

- line one of the ask lands: `hooksNamed` reads the three settings files and keeps `http:` and `https:` alone
- line two lands: a dead hook reads as `warn: answers nothing at <the address>, off <the file>`
- line three lands as an argument, because `.gitignore` holds that file and no hunk reaches it
- this box carries no `.claude/settings.local.json`, so the row a hand acts on is all the tree gives
- line four lands: `test/level0/doctor-hooks.test.js` holds 12 cases, and one feeds a hook answering nothing
- `./RUNME.sh check` answers 0 on `8448d4f1`, 1292 cases green and 2 skipped
- `./RUNME.sh branch review` reads the retro as absent from the handback
- a mutant dropping the scheme guard turns the command case red, 1 against 11
- a mutant giving a dead hook the standing row turns two cases red, 2 against 10
- the nine findings of design/review each land, and the chapter carries the call on line three
- the diff reaches six files, and every one serves the four lines of the ask
- the line in `test/level0/start-road.test.js` settles the last ticket's own minor finding, which counts trivial
- the label takes `URL.host`, so an address on a default port carries no port
- the chapter reads that label as `hook <host>:<port>`, which stands minor
- `HEALTH_WAIT` stands twice still, in `src/scripts/cli-doors.js` and `src/scripts/serve.js`, and this branch adds no third

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the chapter at [[spec/design_output/level0#the-doctor-probes-every-hook]] holds the approach, and each function points at it. `vehicle.js` owns the two settings names, and `cli-doors.js` owns the wait.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
