---
kind: [[handover]]
status: todo
urgency: whenever
depends_on: [the-agent-pulls-a-ticket, a-step-changes-hands]
---

# Where it stands

The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and its chapter The retro says what this branch builds. The
two routes stand in the tree already: `spec/processes/retro.yaml` and
`chapter.yaml`, beside `group.yaml`, whose retro phase shares the notes
command with this branch.

A retro is a ticket. Its readers are its children, one per chapter of the
window, and the retro's own hand mines the rest leaf by leaf. The report is
the ticket's own evidence, in git.

| what stands today | where |
|---|---|
| the pull, the record, the hold and the spawn | the pull branch and the hands branch |
| the log, one row per tool call, prompt and refusal under the plugin | `.se/log/session.jsonl`, through `lib/log.js` |
| the harness transcripts, with the thoughts as `thinking` blocks | the harness's own project folder, one JSONL per session |
| v4's retro verb, which rotates, drains, copies and refuses | `origin/v4:src/engine/retro.go`, as prior art and no more |
| the routes | `spec/processes/retro.yaml`, `chapter.yaml` |

Read v4's verb before you write this one. It settles what drains and what
copies, and why a retro refuses while anyone holds work.

# What waits

| the piece | where | proves it |
|---|---|---|
| `work collect` | `src/scripts/work.js` | it rotates the log, drains `.se/log`, `.se/scripts` and the scratchpad, copies the transcripts, and refuses while a hand holds a ticket |
| the manifest | `.se/retro/<stamp>/manifest.jsonl` | one line per thing taken, with its origin and its fate |
| the window | `work collect` | from the last retro's close commit to now, and from the first commit where none stands |
| the chapters | `work collect` | six hours that hold activity, off the timestamps, one private `chapter` ticket each with its counts as the ask |
| the counts | `work collect` | prompts, tool calls, shell commands, refusals by kind, errors, tickets that move, notes that appear, the median length of a thought |
| the files the mine leaves read | `work collect` | the shell commands grouped by the job with a count and an example, the refusals by rule, the records of the closed tickets, and the counts per chapter |
| `by: helper` | the pull | a reader goes to a hand the engine spawns for it, and to nobody else |
| `work retro notes` | `work.js` | it passes when `.se/tickets/` holds no note, and the group's retro phase runs the same command |
| `work retro score` | `work.js` | it prints how many of the last retro's improvements stand in the tree |
| the lists in the folder | `work collect` | the tickets that close in the window with their records, the retro leaves of the groups that merge in it, and the earlier retros |
| `work.retroCap` | the config | it reads, default 7 |
| the first retro | a desk, with the owner | one retro of this project runs end to end, and its report stands as a closed ticket |

# The rules to hold

- A retro is blameless. It repairs the generator of a bad output, and the finding is the generator.
- The drain has no undo. So the verb refuses while a hand holds a ticket, and the manifest names every file.
- The transcripts are another program's files. Copy them, and delete none.
- Nothing under `.se/retro` reaches git. The ticket's evidence is what travels.
- A chapter's reader is a fresh hand. The retro's own hand reads no chapter.
- The window's first retro is long, and that is the point: the project holds no earlier one.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Head the retro `What surprises me`, and name every dead end
   you walk into.
4. Run `./RUNME.sh work sync` again, so main comes in last too.
   Run `./RUNME.sh check` after it, and answer whatever the merge turns red.
5. Run `./RUNME.sh work done`, which sets the status and pushes.
6. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
7. Run `./RUNME.sh work merge <name>` from main to take it in, then
   `work close`. A cloud box stops at step 4, because the harness holds
   main shut there and a cloud box opens no pull request.
