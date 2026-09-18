---
kind: [[handover]]
status: todo
urgency: now
---

# Where it stands

The group [[spec/tickets/the-warnings-feed-a-refactorer]] stands part way. Its
design leaves move, and its implement leaves wait.

`./RUNME.sh check` answers 0 on this commit. The check asks the server, so run
`./RUNME.sh serve` before it.

| child | step |
|---|---|
| [[spec/tickets/the-runtime-files-stand-apart]] | implement/tests-red, and its design stands |
| [[spec/tickets/a-rule-carries-its-side]] | design/draft |
| [[spec/tickets/the-hook-spawns-a-refactorer]] | design/draft |
| [[spec/tickets/the-panel-draws-every-file]] | design/draft |
| [[spec/tickets/a-pointer-names-its-heading]] | closed, and a question carries it |
| [[spec/tickets/a-write-meets-its-hash]] | closed, and a question carries it |

# What waits

| what | who does it |
|---|---|
| write the tests for the runtime split, then make the change | the next hand |
| draft the approach on the three children at design/draft | the next hand |
| answer [[spec/tickets/the-rule-shares-one-slug]] | a person |
| answer [[spec/tickets/apply-lane-carries-a-hand]] | a person |

Two children return twice at design/review, so the engine parks a person step on
each. Both leave the group as a question ticket, and each carries its findings
under its discussion.

# What the reviews find

Two faults stand whatever the group does next, and a reader acts on each:

- one stamp a path, shared across hands, lets a stale write land, so the stamp keys on the hand
- the apply lane builds its own event and drops the hand, so a batch edit reads as unstamped

The heading rule draws findings over ten notes. Each one holds a pointer naming
a heading that stands nowhere.

# The scripts this box writes

| script | what it answers |
|---|---|
| `.se/scripts/heading-scan.js` | every pointer naming a heading standing nowhere, by note |
| `.se/scripts/anchor-scan.js` | the same question, from a reviewing hand |

Both take the slug that stands in `test/contract/vocabulary.test.js`. It drops a
tick and a quote, then dashes the rest.

# The retro

What goes well:

- the design review catches two design faults, and the code bears each one out
- a ticket returning twice parks on a person, and the group lands without it
- the write door names the rule and the line, so each fix takes one pass

What goes badly:

- the first heading scan carries the wrong slug, so it draws a note that resolves clean
- the first approach puts the rule under the per-file check, which the lint calls nowhere
- three children stand at their first step, because each review round costs a hand of its own

How each stops happening:

- read the slug that stands in `test/contract/vocabulary.test.js` before writing one
- read which branch `checks` takes in `src/lsp/main.go` before naming a place for a rule
- hand a draft to a reviewing hand early, because a draft coming back costs more

# What the box meets

- the write door refuses a bold verdict, a long sentence, and a run of paragraphs past three
- a shell heredoc writing a tracked file comes back refused, so Edit and Write are the way in
- the check wants the server up, and it answers 1 where nothing listens