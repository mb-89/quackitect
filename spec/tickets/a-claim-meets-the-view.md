---
kind: [[ticket]]
state: open
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
group: the-tree-names-its-things
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/draft
record:
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: d25806695a0da7af29c9e5bc9f2d245bb0a673d7
    hash_after: d25806695a0da7af29c9e5bc9f2d245bb0a673d7
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-2
    hash_before: 12daafca92339622360654afc74b1cc19f9c11c9
    hash_after: 12daafca92339622360654afc74b1cc19f9c11c9
    returns: 1
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | partly, the rule and the sweep hold, the table of doors does not |; | is what the draft touches beyond the ask trivial | yes, the draft writes this ticket alone |; | what does `./RUNME.sh check` answer | 0 on this commit, with the server standing |; | does every rule the approach adds carry a case | yes, one case drives the sweep under both door sets |; | does every claim carry a proof | no, the root row and the tools row read against the code |; TL;DR:; The rule and the sweep stand as drafted.; The table of doors names what parts the two callers wrong, and leaves out what bites.; Redraw that table off the code, and say how the case reaches the count the check prints.; The findings, one a line:; Both callers hand the method root, so neither one reads a tree the other leaves alone.; `lint` takes its root from `cli-doors`, and `findingsFor` takes `box.method`.; `rootsHere` reads the method root off the marker above that module, so no caller hands the work root.; The tools row reads against the code, because `cli-doors` names each tool through `whereIs` over the same survey.; The parting that stands is the Biome guard. `lint` hands an empty path where no binary stands.; `findingsFor` hands the bare name there, so the panel runs a Biome the check skips.; `lint` also adds `serverFaults` past the sweep, and the tree and schema readers where the server binary is missing.; A case asserting one count over one door set turns red there. Say which side owns each of those three.; The case drives two door sets over a fake tree, and reads nothing the check prints.; The ask wants the case red where its count differs from the check's. Say how the case reaches that count."
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 3326ed8aab7dff8859dd685e7a4a324431996eed
    hash_after: 3326ed8aab7dff8859dd685e7a4a324431996eed
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-4
    hash_before: 0a4186598075cc5987b5e7256a856d45bb4f8c87
    hash_after: 0a4186598075cc5987b5e7256a856d45bb4f8c87
    returns: 2
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | partly, the rule, the sweep and the case hold, one row stands unowned |; | is what the draft touches beyond the ask trivial | yes, the draft writes this ticket alone |; | what does `./RUNME.sh check` answer | 0 on this commit |; | does every rule the approach adds carry a case | yes, one case reads both fronts over the real tree |; | does every claim carry a proof | the root row and the tools row read with the code now, the third row past it |; TL;DR:; The redraw answers the root fault and the tools fault the last round named.; The table names three ways the two fronts part, and the change list owns two.; Say which front owns the server's own rows, and what becomes of the switch under them.; The findings, one a line:; `lint` runs the tree reader and the schema reader only where `serverFaults` answers nothing.; An empty list from the server counts as an answer there, so both readers stand off.; `se-lsp check .` answers an empty list at exit 0 on this box.; So the check counts neither reader today, and `readingOf` turns both on for it.; Row three says `lint` adds both over a whole sweep, which reads past that switch.; Redraw row three with the switch, and say what the check counts after the change.; Say whether `lint` keeps `serverFaults` once `readingOf` stands, and which front owns those rows.; The server draws its own checks itself, so the panel holds them outside the findings route.; A case asserting one count turns red where those rows stand on one side alone.; The chapter the approach links stands nowhere in that note, so the change writes it.; The rest holds: the Biome guard, the case under `test/contract`, and the rule's home."
---

# Ask

The owner reads a claim of done that their own screen carries out.

The agent reports green while the owner's panel draws a screen full of findings.

- A rule in `spec/guidance/working.md` asks for a claim read in the owner's view first.
- A battery case sweeps every tracked file the way the panel does.
- The case turns red where its count differs from `./RUNME.sh check`.
- `./RUNME.sh check` holds that case green.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

One reading answers the panel and the check, and a case holds their counts equal.

`findingsOver` in `src/bridge/findings.js` stands as the shared sweep, and both callers reach it. Three things part what each caller ends with:

| what parts them | `lint` in `cli-read.js` | `findingsFor` in `findings.js` |
|---|---|---|
| the Biome guard | hands the empty string where no binary stands | hands the name `whereIs` answers, standing or not |
| the server's own findings | adds what `serverFaults` answers | adds none |
| the tree rules and the schema rules | adds both over a whole sweep | adds none |

The roots agree, and the earlier draft read them apart. `root` in `cli-doors.js` and `box.method` both name the tree the module stands in. The tools agree too, because each caller reads the same survey file.

| what changes | how |
|---|---|
| `src/bridge/findings.js` | answers `readingOf`, which runs the sweep and then the readers its doors name |
| `src/scripts/cli-read.js` | takes `readingOf`, and prints what it answers |
| `src/bridge/server.js` | the box takes a git door, which the tree reader wants |
| `test/contract/one-reading.test.js` | takes the case under this table |
| `spec/guidance/working.md` | takes the rule under that |
| [[spec/design_output/lsp#one-checker-every-front-asks]] | says one reading answers both fronts |

**The doors.** `readingOf` takes its readers from the caller, so `findings.js` reaches no command line door. The Biome guard moves into it, so one rule answers both fronts.

**The case.** It stands under `test/contract`, because it drives the real tools over the real tree. It asks the panel's reader and the check's reader for the whole tree, and asserts one count. Where the two part it names the file each side holds alone. `./RUNME.sh check` runs it in the battery, so a claim of green carries the count the owner's panel draws.

**The rule.** It reads: read a claim of done in the owner's own view before you make it. It lands in the Actionables of `spec/guidance/working`, beside the rules on what a session owes the owner.

## review

<!-- reads the approach against the ask -->

### verdict

fail

| the question reviewing asks | the answer |
|---|---|
| does the approach answer the ask | partly, the rule, the sweep and the case hold, one row stands unowned |
| is what the draft touches beyond the ask trivial | yes, the draft writes this ticket alone |
| what does `./RUNME.sh check` answer | 0 on this commit |
| does every rule the approach adds carry a case | yes, one case reads both fronts over the real tree |
| does every claim carry a proof | the root row and the tools row read with the code now, the third row past it |

TL;DR:

- The redraw answers the root fault and the tools fault the last round named.
- The table names three ways the two fronts part, and the change list owns two.
- Say which front owns the server's own rows, and what becomes of the switch under them.

The findings, one a line:

- `lint` runs the tree reader and the schema reader only where `serverFaults` answers nothing.
- An empty list from the server counts as an answer there, so both readers stand off.
- `se-lsp check .` answers an empty list at exit 0 on this box.
- So the check counts neither reader today, and `readingOf` turns both on for it.
- Row three says `lint` adds both over a whole sweep, which reads past that switch.
- Redraw row three with the switch, and say what the check counts after the change.
- Say whether `lint` keeps `serverFaults` once `readingOf` stands, and which front owns those rows.
- The server draws its own checks itself, so the panel holds them outside the findings route.
- A case asserting one count turns red where those rows stand on one side alone.
- The chapter the approach links stands nowhere in that note, so the change writes it.
- The rest holds: the Biome guard, the case under `test/contract`, and the rule's home.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
