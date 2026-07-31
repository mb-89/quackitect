---
form: expedition-leave
status: done
files: []
---

# e17 — expedition leave

Written by the agent and confirmed by the owner on 2026-07-31, who waived a
line-by-line review and authorised the fill.

## What was the goal

Surface canvas and frontmatter problems inside Obsidian. The server would
grow a diagnostics endpoint serving frontmatter-schema, canvas-compile and
voice findings. A thin vault plugin would draw badges on canvases first, then
CodeMirror squigglies for markdown, and would degrade quietly when the server
was down.

## What was done

The expedition was seeded on 2026-07-28 and never started. It was entered on
2026-07-31 to close it, and the owner then routed the session's work here
rather than open a second record. Its worktree was three days stale and was
synced first, taking 261 commits from trunk.

TWO THINGS HAPPENED.

First, the pivot was recorded: the lint surface moves from Obsidian to VS Code.

Second, the survey was rebuilt, because it had become unusable. A full survey
answered 85,343 characters and overflowed the host's payload limit, so the
front desk could not sweep before advising. Three of its four lists carried
full text and only one could be windowed. Forty-five parked backlog notes were
roughly ninety percent of it.

What changed:

- A note carries its own title and a MoSCoW priority. An unmarked note is a
  could, so the sort still means something.
- se_note takes both, and a title alone is now a legal note.
- The survey lists title and priority, highest first. A body rides only on
  detail: full, and any note reads whole with se_log_query {ref}.
- A record's goal lists as a 200-character headline, cut at a word boundary.
- An eleven-line comment in survey.ts asserting an owner ruling of 2026-07-29
  was deleted. No such ruling exists in guidance, and it had been quoted back
  to the owner as though it were theirs.

## What settled it

THE PIVOT was an owner decision on 2026-07-31, during a front-desk discussion
about the VS Code plugin.

The reasoning: the host changed, not the goal. Writing a VS Code plugin was
not on the table when this was seeded, because Obsidian was the focus at the
time. VS Code gives diagnostics as a first-class API, so squigglies and hover
explanations cost nothing to draw. A vault plugin would be a plugin we
maintain forever to reach the same place.

Obsidian stays supported and never becomes the target. A machine is still a
.canvas file a person edits in Obsidian, which is owner law and unaffected.

The evidence that the pivot cost nothing: HEAD was still the opening commit
when this was entered, so no Obsidian work was abandoned.

THE SURVEY REBUILD was settled by measurement rather than argument. Three
survey calls were made and their sizes compared: 85,343 chars in full, 75,698
with detail brief, and 75,767 with brief plus a limit. The third is LARGER
than the second, which proves the paging arguments reach only the notes list
while the bulk sits in goals and backlog.

The suite then ran 260 tests with 258 passing. The three failures caused by
this change were tests guarding the old contract, and each was rewritten to
guard the same underlying complaint — no mid-word cut, no lost substance —
rather than deleted.

## What was not done

The diagnostics endpoint, the vault plugin, the canvas badges and the
markdown squigglies. None were started.

The lint idea itself is NOT dismissed. It moves to VS Code and becomes part
of the extension work in e26.

THE NEW PAYLOAD WAS NEVER MEASURED. The running server is the old build, so
the rebuilt survey could not be called through the lane. The estimate of
roughly 7,000 characters is arithmetic, not a reading. Measure it once this
lands and the server reloads.

Two tests fail in this worktree and neither was investigated further: the
component library and the pty host. Both need node_modules, which a freshly
synced worktree does not have. Neither touches notes or the survey.

Two designs from the closing session are deferred to e26 rather than lost:

- The frame buffer for the details surface. One buffer per view, and whatever
  fills it declares its format. A popped-out view stops following the walk.
- Native renderers chosen by file type through workbench.editorAssociations,
  with our own custom editor for the interactive case.

The agent's chat surface was discussed and NOT settled. The owner's question
was misread, and it carries forward to the front desk.
