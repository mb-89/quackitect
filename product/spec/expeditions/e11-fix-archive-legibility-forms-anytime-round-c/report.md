---
form: expedition-leave
status: done
by: agent
files:
---

# e11 — archive legibility + forms anytime

## What was the goal

Make the expedition archive legible (the owner wants to understand old
expeditions from it) and evidence forms viewable at any time. Plus two
engine leads from the e10 notes: strict patch op fields, and the se_run
self-mirror deadlock documented.

## What was done

- Archive freshness: a closed expedition's record now reads from the
  MERGED main-tree copy first — retro flips (report: approved |
  dismissed) show; the frozen branch copy is only the fallback. The
  session cache keeps only branch reads; the main-tree read is fresh
  every open.
- Backfilled records for e1–e3 (pre-record era): honest goals
  reconstructed from the branch ids, marked backfilled: true.
- Forms anytime: a `forms` button in the machine head lists every form
  template; clicking one opens the form modal. With no expedition bound
  it renders a read-only TEMPLATE PREVIEW (fields, requiredness,
  descriptions — no save/done). With one bound, the live instance as
  before.
- se_file_patch refuses unknown op fields BY NAME and maps the common
  aliases (find → old_string, replace → new_string). Before, a mistyped
  field read as "0 occurrences" and cost a round of misdiagnosis.
- se_run's description now warns: an HTTP call against this session's
  own mirror self-deadlocks (the run blocks the server's event loop).

## What settled it

68/68 selftests green. New coverage: archive reads the merged copy fresh
(amended goal shows on regenerate), formGet unbound returns the template
preview, se_file_patch names unknown fields with alias remedies. Browser
verification on a worktree mirror: the forms button lists and previews
read-only; the archive view shows e1–e3 goals and the e4–e8 dismissed
flips.

## What was not done

- The e11 worktree needed a manual npm install — the deps auto-install
  fix from e10 is merged but the RUNNING server predates it; the restart
  cures this permanently.
- The owner-led retro (four pending notes) — interactive, waits for the
  owner.
- The tool-retirement lead and the post-retro backlog note — owner
  judgment, untouched.
