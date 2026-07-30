# Quackitect in VS Code

The Quackitect button in the left bar opens the mirror. The mirror is the
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

- The ▶ button on the Mirror view starts your agent for you: it finds
  Claude Code (or Copilot CLI), opens the integrated terminal, and sends
  the start command with the opening prompt.
- By hand instead: open the integrated terminal in the `workspace` folder
  and run `claude`. It finds the running server through `.mcp.json`.
- Copilot agent mode in this window: it finds the same server through
  `.vscode/mcp.json`. Its built-in tools stay visible — tell it to follow
  `workspace/AGENTS.md`, which says to use only the se tools.

Several assistants may attach at once. They share the one server and the
one walk. The machine arbitrates the hands: a move made from a stale
position is refused, so nobody silently overwrites anybody. Still, give
the wheel to ONE assistant at a time and let the others watch or advise —
two drivers make a noisy log.

## If something is stuck

- Command palette → "Quackitect: Restart the se Server".
- The server's own words: Output panel → "Quackitect Server".
