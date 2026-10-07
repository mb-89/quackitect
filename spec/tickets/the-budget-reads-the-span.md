---
kind: [[ticket]]
state: closed
group: the-check-runs-beside
depends_on: [the-parts-start-at-once]
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
step: do
record:
  - step: do
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: 6925bd9745af0217918cf250cd0ee14d2ba58a57
    hash_after: 1bc4473dca325a6c085adf4073899bf6a5772e1c
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/settings passes
      - name: check
        exit: 0
        said: "   96.2  in all"
    inputs:
      - name: ask
        hash: 2a6c87fb96da7541
        size: 483
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The check's budget under `battery.budget` stands honest once the parts run beside each other: a clean check on a cloud box lands under it, and a check grown past its slowest part warns.

- gain: the warning past the budget fires when the check grows, and stays quiet on a clean run
- breaks: a budget sized for the serial check never warns once the check runs beside, so a part that doubles slips by
- done_when: `./RUNME.sh check` exits 0 and prints no budget warning on a clean run

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/settings/settings_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The built-in of battery.budget moves to a fifth over a clean check, since every part now starts at once. On a cloud box of four cores, steady checks spanned just past the old budget, so each warned. The cores bound the span there, and the first check after a Go change runs past the new budget, since the Go part rebuilds its cache, so the warning names a check that grew. The value stands once in the settings module, and the schema and the config command are generated from it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a clean check lands under the budget with no warning, and a cold one past it warns
- the cleanup it reveals: the schema is generated, so its help moves with the declaration alone
- the number stands once, as batteryBudget in src/modules/settings/settings.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
