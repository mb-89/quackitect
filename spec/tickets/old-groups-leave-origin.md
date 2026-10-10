---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: does the work the ask names, and says what came back
    by: person
    to: engine
    input: ask
    evidence:
      - name: result
        form: text
        says: what came back, which the step behind this one reads
  - name: follow
    does: carries the result into the tree, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: result
    needs: ["branch test"]
    checklist: ["the change follows the result, or the discussion says why it departs", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/person]]
process_hash: 781b200dbb69dec3
step: do
---

# Ask

<!-- work, as text: what the person does, why no box can do it, and the ticket the work comes from -->
<!-- commands, as list: every command the person runs, one a line, in order -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The old group branches on origin predate the rewrite of main, so git reads each as thousands of commits ahead, with no merge base. The close verb deletes a branch git counts merged, so it finds none, and the order that asked for the close forbids deleting a branch carrying unmerged commits. Each group below stands closed done on main, so its work landed before the rewrite. The owner decides the delete. The work comes from `merged-work-branches-close`.

- `git push origin --delete work/the-ticket-answers-the-editor work/the-gates-read-the-state work/each-thing-stands-in-place work/the-owners-word-reaches-work work/the-servers-and-views-hold work/the-migration-writes-its-specs work/the-verbs-land-whole work/the-foundation-lands-unchanged work/open-tasks-land-in-shadow work/open-tasks-switch-over work/the-engine-holds-the-route work/guidance-rides-each-step work/the-process-stays-editable work/the-foundation-closes-its-gaps work/phase2-switch-turns-on work/phase3-switch-turns-on work/fix-verbs-shadow-yours work/phase4-switch-turns-on work/phase5-switch-turns-on work/sidebar-fake-imports-url work/window-keeps-the-index work/phase6-switch-turns-on work/phase8-switch-turns-on work/check-sweep-reads-tracked work/phase7-switch-turns-on`
- `git ls-remote origin refs/heads/work/shadow-evidence-5-6`, then a delete of it alone where its work stands elsewhere, since no ticket of its name stands on main

- `git ls-remote origin 'refs/heads/work/*'` names none of the branches the first command deletes

# do

<!-- does the work the ask names, and says what came back -->

## result

<!-- what came back, which the step behind this one reads -->

<!-- the form is text -->

# follow

<!-- carries the result into the tree, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The tip of each branch, so `git push origin <tip>:refs/heads/work/<name>` restores one while GitHub keeps the commit:

| branch | tip |
|---|---|
| the-ticket-answers-the-editor | 48aef2e5f |
| the-gates-read-the-state | b2eb8169b |
| each-thing-stands-in-place | af40b6cec |
| the-owners-word-reaches-work | ae8579a82 |
| the-servers-and-views-hold | 26c7e240d |
| the-migration-writes-its-specs | 665b9efd5 |
| the-verbs-land-whole | f0c6afa5b |
| the-foundation-lands-unchanged | 519f0ea6c |
| open-tasks-land-in-shadow | 430047714 |
| open-tasks-switch-over | b400b44e9 |
| the-engine-holds-the-route | 41ea7a6e0 |
| guidance-rides-each-step | 904886448 |
| the-process-stays-editable | 7b258ca3d |
| the-foundation-closes-its-gaps | 67d71d4ea |
| phase2-switch-turns-on | 138e40f1f |
| phase3-switch-turns-on | b1d88fe0a |
| fix-verbs-shadow-yours | e7efceb74 |
| phase4-switch-turns-on | 9967208c7 |
| shadow-evidence-5-6 | 773681289 |
| phase5-switch-turns-on | 578b0457e |
| sidebar-fake-imports-url | f71fa89f2 |
| window-keeps-the-index | 3d080f267 |
| phase6-switch-turns-on | ec3f29d1a |
| phase8-switch-turns-on | 71ba2f181 |
| check-sweep-reads-tracked | 11f6dd574 |
| phase7-switch-turns-on | 97526a98e |
