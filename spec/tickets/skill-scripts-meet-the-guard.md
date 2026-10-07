---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-guard-refuses/gate
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
group: doors-declare-what-they-own
parent: the-guard-refuses
record:
  - step: do
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: 189b348c7dab52c3703a067e3e9e4ff0a573a3b0
    hash_after: 1347cfdd7ac46424db6ccddb47a1de37b030ca94
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes; green, src/quack passes
      - name: check
        exit: 0
        said: "   64.4  in all"
    inputs:
      - name: ask
        hash: f38bb7897ab479dc
        size: 470
    def: 1ba1f1de37804f52
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the guard skips every path holding a .claude part (walkPasses in src/modules/check/textfaults.go, read by walkFaults and by walksOver in src/quack/verb_doors.go), so DoorsOnly alone guards the scripts under .claude/skills today, the level0 lib among them. Retiring it leaves those scripts unguarded, against the owner's word that the JS door rules cover the level0 hooks. Let the doors walk read .claude/skills, and declare what the hooks reach, before the group closes.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/check src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The lint walk passes the agent folder, .claude, so the doors guard never read the scripts under .claude/skills, the level0 lib and hooks among them. DoorsOnly alone held them, and the-guard-refuses retires it. The guard now walks a road of its own: every file the lint walk reaches, and the skills folder past the agent folder. OnSkills in src/owns/owns.go names that road, and doorsWalked in src/modules/check/textfaults.go reads it for the walk rule, the declarations and the doors verb. The size, magic-number and prose rules keep the lint walk, so the agent folder meets none of them. The lib reaches only node:path and node:url, and walks around nothing. The hooks read the clock in place, since the engine hands them $ and $ carries no clock, so .claude/skills/level0/hooks/owns.yaml declares the folder its own outside over Date.now and new Date(), as the page does. The stub template of the hooks makes one such call, and it carries the marker, since a declaration there would ship into every stubbed project. The doors note names the road. TestNoProductionScriptWalksAroundADoor in src/owns now reads the skill scripts and passes; that package stays red on the four tests the implement step of the-guard-refuses turns green.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the doors walk reads .claude/skills, and the hooks declare what they reach
the cleanup it reveals is in the change: the stub hooks meet the same walk, and their one clock call carries the marker; the verb test now plants a file of the agent folder past the skills, which the walk passes
the road stands once, in OnSkills, and the lint, the verb, the tree tests and the doors note read or point at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
