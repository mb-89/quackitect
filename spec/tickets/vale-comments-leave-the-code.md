---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: lint-without-vale/accept
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: lint-without-vale
parent: lint-without-vale
record:
  - step: do
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: f8ae620783f7608a10a7eb86f3d01ed931248d6c
    hash_after: 8086ae4eeaa48b7e4e83c174ff0959aa303d1729
    answered:
      - name: tests
        exit: 0
        said: green, 3 test(s) pass in 1 file(s); green, src/quack passes; green, src/modules/hooks/brief passes; green, src/projectio
      - name: check
        exit: 0
        said: "   46.9  in all"
    inputs:
      - name: ask
        hash: fa7ccef6287e3983
        size: 709
    def: de390de1cd0f296a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

comments and names still describe Vale where the Go rules run. These are the doc comments of commitVoice, heard, valeHeard, heardOver and heardIn in src/quack/command.go, with valeHeard renamed. They also take the header and the faultIn message of .claude/skills/level0/lib/vale.js, and TestCommitVoiceReadsNothingWhereNoValeStands in src/quack/commit_voice_test.go. The layer's opening says Vale holds the mechanical rules, in src/modules/hooks/brief/layer.go, src/projection/style.go and lib/guidance.js, and the projection writes it again. Since main took the readers out, src/doors/vale.js and teachRules in test/level0/quack-doors.js stand with no caller past their own contract tests, so they leave too.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/commit_voice_test.go src/modules/hooks/brief/brief_test.go src/projection/projection_test.go test/level0/vale-lib.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The comments and names around the commit's voice read the Go rules, and valeHeard is now rulesHeard. The lib's header and its fault message describe the JSON the rules-over verb writes. The layer's opening says the Go rules hold the mechanical ones. Main's merge took the readers out, so the vale door and teachRules lost every caller and leave, and the rule contract cases run the rules-over verb through the process door.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, and departs once: the replay cases carry no generator, so one patch rewrites their opening
the cleanup the change reveals stands for the retro: the VoiceVale style name, the vale log kind and a few comments outside this ask
every fact stands in one place: the layer's opening changes at its sources, and the projection writes the output style

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
