---
form: guard-refuses-a-wrong-word
by: agent
signed_off: 2026-08-16T16:59:38.093Z
authors: agent
files:
---

# Evidence form / guard-refuses-a-wrong-word

## current_situation

THE CHECK THAT WOULD HAVE CAUGHT THE ELEVEN-CALL TRAP IS BUILT AND GREEN.

`se_test` over `tests/writeguard.test.ts`: 9 total, 6 pass, 3 fail. The vocabulary case moved from red to green and the five that already passed still pass.

THE THREE REMAINING REDS BELONG TO CHUNKS FOUR, FIVE AND EIGHT, and every one is assertion-red.

## built

### The code

- `project/deliverable/engine/vocabulary.ts` — NEW. It reads the item templates under `machines/items/`, extracts every `checks:` entry carrying `one_of`, and maps a path to its governing template by the template's own declared `folder`. The longest folder wins, so a nested type is not governed by its parent's list.
- `project/deliverable/engine/guard.ts` — the second question, asked only once the parse succeeds. A node that does not parse never reaches it.
- `project/deliverable/engine/files.ts` — the guard now takes `root`, because the templates live in the tree.

### Where the list comes from, and why that is the whole point

THE VOCABULARY WAS ALREADY DATA. `machines/items/raid.md` declares it in frontmatter:

    checks:
      - field: status
        one_of: [open, probed, mitigated, accepted, deferred, closed, decided, superseded]

SO THE GUARD READS THE SAME SOURCE THE SUBMIT CHECK READS. A guard with its own copy is a guard that can disagree with the reader it is protecting — `raid-asm-one-parser-decides-what-parses`, one level up from syntax.

AND ADDING A KEY'S VOCABULARY COSTS NO ENGINE CODE. One edit to an item template. That is `req-a-check-binds-without-engine-code` satisfied for this class, ahead of the chunk that owns it generally.

### What the refusal carries

THREE THINGS, and the third is what makes it a remedy.

- THE KEY — which field.
- THE VALUE IT GOT — quoted back.
- THE WHOLE ALLOWED LIST — never the nearest match. A reader picking from eight words needs the eight words, and a suggestion that guesses wrong sends them to a second wrong value.

THE CASE ASSERTS ALL EIGHT WORDS INDIVIDUALLY, so a refusal naming a count or a subset fails it.

### The run

9 total, 6 pass, 3 fail. Question recorded: does the vocabulary check refuse a value outside its key's list and name the whole list, without breaking the five cases that already passed.

BOTH HALVES ANSWERED YES.

## follow_up

CHUNK FOUR IS NEXT — `the-sweep`. Its case already names the gap precisely: `se_lint` refuses a directory with SE-C-046 expecting a prose file, while its own description promises a pass over everything.

THE THREE REDS AND THEIR CHUNKS.

- the whole-repo sweep — chunk four
- the report-versus-refuse seam — chunk five, which depends on four
- the way-forward demand — chunk eight

NOTHING IS BLOCKED.

## anything_else

### A key the node does not carry is not checked here

WHETHER A FIELD IS REQUIRED IS A DIFFERENT QUESTION from whether its value is legal, and conflating them would make this guard refuse half-written nodes mid-authoring.

SO AN ABSENT KEY PASSES. An empty string passes. Only a present, non-empty value outside its list refuses.

### The templates are stat-keyed, not timed

SAME RULE AS THE CORPUS AND THE BRANCH LISTING: recompute when the input moves rather than when a clock says so.

A WRITE HAPPENS OFTEN AND THE TEMPLATES CHANGE RARELY, so re-reading the whole items folder per write would be the exact cost `raid-asm-a-bound-check-runs-inside-the-write-budget` warns about. The cache is keyed to the folder's own stat.

THE BUDGET CASE STILL PASSES with the vocabulary check armed, which is the number that matters.

### What this chunk quietly proved about chunk six

CHUNK SIX ASKS WHETHER A RULE CAN BIND FROM THE CORPUS WITH NO ENGINE CODE, and treats it as an open architectural question.

THIS CHUNK ANSWERED IT FOR ONE CLASS. The vocabulary rules bind from `machines/items/*.md`, the engine holds no list, and a new one costs a template edit.

THAT IS NOT THE WHOLE OF CHUNK SIX — a rule that binds to an `el-` element and fires on ITS node is a wider mechanism. But the falsifiable half is now partly answered rather than wholly open, and it answered in the constraint's favour.
