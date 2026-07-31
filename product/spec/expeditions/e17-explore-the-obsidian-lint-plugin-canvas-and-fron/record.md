---
id: e17-explore-the-obsidian-lint-plugin-canvas-and-fron
kind: explore
status: open
opened: 2026-07-28T12:27:49.834Z
goal: "The Obsidian lint plugin: canvas and frontmatter problems surface as squigglies and badges INSIDE Obsidian, with the explanation on hover. The se server grows a diagnostics endpoint on the HTTP (human) channel serving frontmatter-schema, canvas-compile, and voice findings; a thin vault plugin renders them — canvas badges first, CodeMirror squigglies for markdown after; graceful absence when the server is down. Prior art: v1 SCHEMA-<type>.md field schemas (adr-schema-format), v2 ruling q-table-interact (a vault plugin may use libraries). Seeded 2026-07-28 at the desk; do not start before its own session."
---

# e17-explore-the-obsidian-lint-plugin-canvas-and-fron

## Not pursued — the premise moved to VS Code

Owner decision, 2026-07-31. This expedition closes without being started.

### What it was for

Canvas and frontmatter problems were to surface inside Obsidian. The server
would grow a diagnostics endpoint serving frontmatter-schema, canvas-compile
and voice findings. A thin vault plugin would render them as badges and
squigglies.

### Why it stops

The host changed, not the goal. The system is going into VS Code as its own
extension, which is e26's work. Writing a VS Code plugin was not on the table
when this was seeded, because Obsidian was the focus at the time.

So the diagnostics idea is not cancelled. Its home is.

- Obsidian stays SUPPORTED, never targeted. A machine is still a `.canvas`
  file a person edits in Obsidian, and that is owner law.
- The lint surface moves to VS Code, where diagnostics are a first-class API
  and a squiggly costs nothing to draw.
- A vault plugin is a plugin we maintain forever. VS Code reaches the same
  result through an interface it already owns.

### What was built here

Nothing. HEAD is the opening commit. There is no work to carry and no code to
land, so closing costs nothing.

### Where the thinking went instead

The session that closed this one designed the VS Code details surface. Those
decisions belong to e26 and are deferred there:

- The frame buffer: one buffer per view, and whatever fills it declares the
  format. A popped-out view stops following the walk, which is intended.
- Native renderers by default, selected through `workbench.editorAssociations`.
  Our own custom editor handles the interactive case.
- Notes gain a title and a MoSCoW priority, so the survey can list what stands
  open instead of dumping it.
