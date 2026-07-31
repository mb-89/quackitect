# $PRODUCT$ in VS Code

Click the $PRODUCT$ button in the left bar. The sidebar opens with three
groups.

## Features

One row per thing you can do, each with its keyboard shortcut beside it.

- **What this is** — the system explained, in the details group below.
- **Start the agent** — starts the engine if it is not running, opens a
  terminal, and sends the opening prompt for you.
- **One row per card** — the state machine, the log, and any other card the
  project declares.
- **Restart the engine** — stop it and start it again on the current files.

Change any shortcut in the Keyboard Shortcuts editor.

## Controls

This is where you steer the walk.

- **Autonomy** — how much the agent does on its own. It enters only steps
  at or below this level. At 0 nothing moves without you.
- **Shutdown** — what happens once there is nothing left to do.

The short words under each slider are the named levels, each sitting at the
place it actually means. Click one to jump there.

Clicking a slider's name, or any level, explains the whole scale in the
details group.

Under them, one line says where the walk stands and which record is open.

## Details

Whatever you click anywhere explains itself here. It stays at the bottom of
the sidebar so it is always in reach.

The button in its title bar opens the same details as a full editor window,
for when a line is too long to read in a narrow pane.

## Build the layout you want

Cards other than details open as EDITOR WINDOWS, the same as a file you
open. So every editing arrangement works on them. Split one left or right.
Drag it to the bottom. Move it into a second window. Put four side by side.

There is no fixed control panel. You build the one you want.

VS Code remembers the arrangement for this folder. Close it, open it again,
and the windows come back where you left them.

## The log lives at the bottom

The log is a tab in the bottom panel, beside Terminal and Problems. It stays
there. Clicking it in Features reveals it down there rather than opening it
somewhere else.

The button in its title bar opens it as a full editor window, for when you
want it large or beside something.

Starting the agent opens its terminal where terminals go, in that same
panel. It does not take over whichever card you were looking at.

## The state machine

Its drawing carries the breadcrumbs along the top. They navigate between
machines — click one to look at a different machine without moving the
walk.

**Escape to idle** is there too, and only there. It leaves the machine
standing and returns to idle, asks why, and records the reason. It acts on
the walk the drawing shows, so it belongs with the drawing.

The sliders are not there. They steer the whole walk rather than that one
card, so they live in the sidebar where they are always reachable.

## What is running

- The engine started with this window. It stops when VS Code closes.
- It runs on your computer only. Nothing leaves it.
- Restarting VS Code is safe. The state lives in files, and the next start
  picks up where things stand. Your card windows come back too.

## Connect your assistant

The connection files are already in place. The extension writes them every
time it starts.

- The start row does this for you.
- By hand instead: open a terminal in the `workspace` folder and run
  `claude`. It finds the running engine through `.mcp.json`.
- Copilot agent mode in this window: it finds the same engine through
  `.vscode/mcp.json`. Its built-in tools stay visible — tell it to follow
  `workspace/AGENTS.md`, which says to use only the se tools.

Several assistants may attach at once. They share the one engine and the
one walk. A move made from a stale position is refused, so nobody silently
overwrites anybody. Still, give the wheel to ONE assistant at a time and
let the others watch — two drivers make a noisy log.

## If something is stuck

- Click the restart row in the features group.
- The engine's own words: Output panel → "$PRODUCT$ Engine".
