---
id: e26-explore-put-the-system-into-vs-code-as-a-private
kind: explore
status: open
opened: 2026-07-30T13:41:15.674Z
goal: "Put the system into VS Code as a private extension (no marketplace; local .vsix). The owner's sketch, 2026-07-30: an activity-bar button on the left; clicking it opens the mirror as a webview view in the right side bar, looking as the mirror does now; clicking a card opens the real file in the main editor; other files open there too; the terminal stays the integrated terminal with the agent CLI in it. Rulings from the desk discussion: (1) the extension shell stays THIN — engine and mirror live outside it, so engine/mirror changes need only a webview refresh, and shell changes only a window reload from a folder install; (2) the se server becomes ONE process serving MCP over HTTP on localhost, spawned on extension activation and stopped on deactivate — it lives and dies with VS Code, state on disk makes restarts safe; (3) both the terminal CLI and Copilot agent mode (.vscode/mcp.json) attach to that same server — same lane, same refusals; write a deliberate one-driver-at-a-time rule for two attached agents; (4) theme inheritance — map the mirror's CSS to --vscode-* theme variables so all chrome follows the user's theme; semantic colors (green pass, red fail, yellow attention) stay ours; (5) every user-facing action is a VS Code command with a default keybinding, remappable in the Keyboard Shortcuts editor — no key handlers buried in the webview. Not in scope: fixing model quality in other harnesses; publishing to the marketplace. Sized by content: smaller than a day — this expedition is the day's bucket for it. Amended at the desk, same day: (6) the extension INSTALLS — on first activation it checks and installs what the system needs (engine npm deps and their kin), so the plugin is the installer; RUNME shrinks toward the one bootstrap step that must exist before VS Code does (get VS Code, get the plugin, launch); (7) a startup page explains how a person attaches their agent to the running se server — shown from the plugin, plain language; (8) ONE agent attached at a time for now — the page says so; nothing is recorded about when that changes."
---

# e26-explore-put-the-system-into-vs-code-as-a-private

## The shipping day — desk rulings, 2026-07-30

The day's aim is a hand-off. The system goes to a colleague as a VS Code
plugin, carrying no quackitect branding and no repository history.

### The export takes a name and an abbreviation

`RUNME.ps1 --export <folder> <Name> <ABC>`. Both arguments are required.

There is no fallback to the quackitect name. A forgotten argument would
ship the owner's branding to somebody else, so the export refuses instead
of guessing.

The abbreviation is two or three letters. It becomes the activity-bar icon
in VS Code.

What already works stays: the export copies the working tree, makes a fresh
repository, commits once, and leaves the history at home.

### VS Code is the default interface

This AMENDS decision d10, which kept the classic path as the default and
put VS Code behind a `--vscode` flag. The default inverts.

Running `RUNME.ps1` with no arguments opens VS Code. It installs whatever
VS Code needs, without being asked and without a flag.

The classic path survives this expedition. It is no longer what a person
gets by default.

### The `.vsix` is out of scope today

The owner does not need it for the hand-off. A folder install carries the
extension well enough.

### The stray process is the settings bug

The reported symptom was a new session starting with the previous day's
autonomy, and with documents still marked as checked.

The settings store is NOT at fault. It restores only when the shim's
session token matches, and both shims mint that token fresh from the
process id and the clock.

The document checks live in an in-memory map and are written to no file. A
restarted process cannot bring them back. They came back, so the process
never restarted.

One old server was still running, and the new session attached to it. That
breaches ruling (2) above, which already requires the server to stop on
deactivate. The classic path needs the same guarantee: a shim must not
outlive the terminal that launched it.

The ruling of 2026-07-28 stands unchanged. Settings survive the ENGINE, not
the SESSION.

### Deferred, not today

- Throwing out the classic server and its browser mirror entirely.
- The project-folder shape: any folder with a git repository becomes a
  project, and the workspace concept retires.

