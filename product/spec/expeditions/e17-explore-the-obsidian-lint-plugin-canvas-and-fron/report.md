---
form: expedition-leave
status: draft
files: []
---

# e17 — expedition leave

Every section below is an AGENT PREFILL, written commented out. Uncomment
what you agree with, correct what you do not, then set `status: done`.

## What was the goal

<!--
Surface canvas and frontmatter problems inside Obsidian. The server would
grow a diagnostics endpoint serving frontmatter-schema, canvas-compile and
voice findings. A thin vault plugin would draw badges on canvases first, then
CodeMirror squigglies for markdown, and would degrade quietly when the server
was down.
-->

## What was done

<!--
Nothing was built. The expedition was seeded on 2026-07-28 with the explicit
instruction not to start before its own session, and that session never came.
HEAD in the bound worktree is still the opening commit.

The only act recorded here is this closure and the reasoning behind it.
-->

## What settled it

<!--
An owner decision on 2026-07-31, during a front-desk discussion about the VS
Code plugin.

The reasoning: the host changed, not the goal. Writing a VS Code plugin was
not on the table when this was seeded, because Obsidian was the focus at the
time. VS Code gives diagnostics as a first-class API, so squigglies and hover
explanations cost nothing to draw. A vault plugin would be a plugin we
maintain forever to reach the same place.

Obsidian stays supported and never becomes the target. A machine is still a
.canvas file a person edits in Obsidian, which is owner law and unaffected.

The evidence that closing is free: the worktree carries no commits, so there
is no work to carry forward and no code to land.
-->

## What was not done

<!--
The diagnostics endpoint, the vault plugin, the canvas badges and the
markdown squigglies. None were started.

The lint idea itself is NOT dismissed. It moves to VS Code and becomes part
of the extension work in e26.

Three designs from the closing session are deferred to e26 rather than lost:

- The frame buffer for the details surface. One buffer per view, and whatever
  fills it declares its format. A popped-out view stops following the walk.
- Native renderers chosen by file type through workbench.editorAssociations,
  with our own custom editor for the interactive case.
- Notes gain a title and a MoSCoW priority, so the survey lists what stands
  open rather than dumping every body in full.
-->
