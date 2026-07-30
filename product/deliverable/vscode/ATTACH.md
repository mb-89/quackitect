# $PRODUCT$ in VS Code

The $PRODUCT$ button in the left bar opens the mirror. The mirror is the
live picture of the project: the machine drawing, the log, and the details
pane. Clicking a record in it opens the real file in the editor.

## What is running

- The se server started with this window. It stops when VS Code closes.
- It serves everything on your machine only. Nothing leaves localhost.
- Restarting VS Code is safe. The state lives on disk, and the next start
  picks up where things stand.

## Connect your assistant

The connection files are already in place. The extension writes them every
time it starts.

- Claude Code: open the integrated terminal, go to the `workspace` folder,
  and run `claude`. It finds the running server through `.mcp.json`.
- Copilot agent mode in this window: it finds the same server through
  `.vscode/mcp.json`. Its built-in tools stay visible — tell it to follow
  `workspace/AGENTS.md`, which says to use only the se tools.

One assistant at a time, please. Two assistants on the same machine at
once is not supported.

## If something is stuck

- Command palette → "$PRODUCT$: Restart the se Server".
- The server's own words: Output panel → "$PRODUCT$ Server".
