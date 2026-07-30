# Quackitect in VS Code

Click the duck in the left bar. A narrow strip of icons opens.

The strip is icons only, on purpose. It stays out of your way. What an
icon means shows up in the details pane when you click it, so nothing has
to be labelled.

## The icons, in order

- **?** — what this system is. The explanation appears in the details pane.
- **▶** — start the agent. It starts the engine first if it is not running,
  opens a terminal, and sends the opening prompt for you.
- **Panel** — the control panel: every card on one surface.
- **One icon per card** — the state machine, the log, the details, and any
  other card the project declares.
- **Restart** — stop the engine and start it again on the current files.

Every icon also has a keyboard shortcut. Cards are `ctrl+alt+` their
number, the control panel is `ctrl+alt+q`, and this help is `ctrl+alt+/`.
Change any of them in the Keyboard Shortcuts editor.

## Put the panes where you want them

Each card opens as its own pane. Drag it anywhere: the right side, the
bottom, beside your code. VS Code remembers where you put it.

Prefer the whole thing on the right? Drag the duck icon into the right
side bar once. VS Code remembers that too. No setting can preset it; the
drag is the way.

## What is running

- The engine started with this window. It stops when VS Code closes.
- It runs on your computer only. Nothing leaves it.
- Restarting VS Code is safe. The state lives in files, and the next start
  picks up where things stand.

## Connect your assistant

The connection files are already in place. The extension writes them every
time it starts.

- The ▶ icon does this for you.
- By hand instead: open a terminal in the `workspace` folder and run
  `claude`. It finds the running engine through `.mcp.json`.
- Copilot agent mode in this window: it finds the same engine through
  `.vscode/mcp.json`. Its built-in tools stay visible — tell it to follow
  `workspace/AGENTS.md`, which says to use only the se tools.

Several assistants may attach at once. They share the one engine and the
one walk. A move made from a stale position is refused, so nobody
silently overwrites anybody. Still, give the wheel to ONE assistant at a
time and let the others watch — two drivers make a noisy log.

## If something is stuck

- Click the restart icon in the strip.
- The engine's own words: Output panel → "Quackitect Engine".
