---
kind: [[ticket]]
state: open
group: misc
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
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/tests-green
record:
  - step: design/draft
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: c5170eec116cc969e27807521797e4d4550064ad
    hash_after: c5170eec116cc969e27807521797e4d4550064ad
  - step: design/review
    hand: box d40a1b367f4d · claude-code-remote · helper-22
    hash_before: aac3088b08ed7c36e94931b663a418d73f43d864
    hash_after: aac3088b08ed7c36e94931b663a418d73f43d864
  - step: implement/tests-red
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 9fba8ef3214e5971821c30fc1ba298ed42beb9d2
    hash_after: 9fba8ef3214e5971821c30fc1ba298ed42beb9d2
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 4dad98b733958f088f295fa60b467713fb5b657b
    hash_after: 4dad98b733958f088f295fa60b467713fb5b657b
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
---

# Ask

A tree at odds with itself costs every reader their trust in it. So one config
stands, and every road reads that one.

The vale door reads the config the assembly writes, and three other roads read
the method's config. So a rule a project alone holds refuses a write and passes
the lint.

- The answer gate, the findings road and the copilot road each call the assembly.
- Each one takes the pair of roots, the way the vale door does.
- A case holds a rule a project alone carries, and asserts each road refuses it.
- `./RUNME.sh check` exits 0.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Each road hands Vale the config the assembly writes, off the pair of roots, and one contract case proves a project's rule refuses on every road.

| road | where | reads today | reads after |
|---|---|---|---|
| the answer gate | `src/bridge/tools.js` | `box.vale.lint`, the door, which assembles already | the same, and the case proves it |
| the findings road | `src/bridge/findings.js` | the method's `.vale.ini` by name | `assemble(it.disk, pair)` over `box.method` and `box.work`, and the config it answers |
| the copilot road | `.claude/skills/level0/lib/copilot-runtime.js` | Vale's default config under the root | `assemble` over the pair `rootsHere` answers in `src/scripts/copilot.js`, handed in as `it.method` and `it.work` |

- `assemble` stands in `src/scripts/styles.js` and takes the pair the vale door builds, so the three roads call it as it stands.
- A contract case in `test/contract/styles.test.js` writes a work root beside this tree holding one rule of its own, refusing a word, and asserts the findings road, the copilot check and the answer gate each name that rule over a text carrying the word.

`./RUNME.sh check` answers 0 once the roads agree.


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
The three roads and the pair each meet a named change, and the contract case feeds a project's rule bad text on every road.
The findings road runs Vale from the method root, so the change runs it from the work root the way the door does.
The copilot root builds no pair today, so the change imports `rootsHere` from the vehicle script and hands the pair in.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh branch test test/contract/one-config.test.js


### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the case writes a work root beside this tree with one rule of its own, and a config naming the method's style beside it
- the answer gate refuses the word, because the door assembles the pair already
- the findings road hands Vale the bare config name from the work root, so Vale stops on a style it finds nowhere, and the case fails on the fault
- the copilot road's check stands unexported, so the case fails before it drives it
- what surprises the hand: the findings road runs from the method root today, so a project's own note reads through the method's rules alone


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the case stands in a contract test of its own, and the change reaches the findings road, the copilot road and the copilot root
- the case drives the real Vale through the door, the findings road and the copilot check, over a work root it writes and removes
- the case's comment names the ticket, and each road's change names the vehicle note's chapter on the assembly


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

./RUNME.sh lint src


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the findings road, the copilot road and its root, and the cases, and the answer gate stands as it is
- each road reaches Vale alone, which the unit cases fake and the contract case drives
- each road's change names the vehicle note's chapter on the assembly


## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test test/contract/one-config.test.js


### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check


### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The findings road hands Vale the config the assembly writes over the pair of roots, and runs from the work root, where a project's notes stand. The copilot root reads the pair the vehicle module answers and hands the road a way to the assembled config, and the road's check takes that config and runs from the work root. The answer gate lints through the door, which assembled the pair already, so it stands as it is. The contract case writes a work root beside this tree holding one rule of its own, and asserts the answer gate, the findings road and the copilot check each refuse the word that rule names.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the findings road, the copilot road and its root, and the cases
- the contract case drives the real Vale over a work root it writes and removes, and the unit cases fake the process
- each road's change names the vehicle note's chapter on the assembly


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
