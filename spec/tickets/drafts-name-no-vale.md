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
    hand: box 612227244607 · claude-code-remote
    hash_before: 695318403296ddbc85b76dc368d1bbf968f163fb
    hash_after: 9334a73584bf5608087a49f04763ea0fc5647e50
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/drafts passes
      - name: check
        exit: 0
        said: "   56.0  in all"
    inputs:
      - name: ask
        hash: c1321b92260232a6
        size: 440
    def: de390de1cd0f296a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the drafts module still names Vale in what it answers (noVale and valeUnread in src/modules/drafts/answer.go, unranWhy in src/modules/drafts/prose.go) though the Go rules run the lint, and spec/design_output/level0.md and spec/design_output/pull.md still describe `vale fix --apply` and voiceOver handing Vale a file. Word each for the Go rules, and keep the VoiceVale style name and the marker spelling that go-rules-rename-voicevale keeps

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/drafts/drafts_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The drafts module answers a box with no rules and a lint that read nothing in the words of the Go rules, and the write door names the rules where a lint answers nothing. The drafts tests fake a lint in place of Vale, and a new case holds the reason a silent lint gives. spec/design_output/pull.md names voiceFaults and the Voice reader as the road a ticket takes, and spec/design_output/level0.md says the fixer applies the replace action through rules.Apply. The VoiceVale style name and the marker spelling stay, as go-rules-rename-voicevale decides.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: each spot the accept point names reads the Go rules now, and the style name and marker stay as the ask says
the cleanup the change reveals is in the change: the drafts tests named their fake Vale, and they fake a lint now, and the fixer note dropped four actions the Go rules never carried
every fact stands in one place: the notes point at voiceFaults and rules.Apply in place of restating their roads

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
