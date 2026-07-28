---
id: e18-fix-one-screen-the-mirror-updates-incrementa
kind: fix
status: closed
closed: 2026-07-28T15:34:22.400Z
ruling: applied
opened: 2026-07-28T14:42:26.680Z
goal: "One screen: the mirror updates incrementally instead of reloading, the machine render compacts to content-sized nodes, and the agent's terminal becomes a left sidebar under the log"
---

# One screen

The owner wants the agent and the machine on one screen. Three changes get
them there, and each is useful even if the next never lands.

## Where this stands

All of it landed, in six commits, with the suite green at 116 tests — ten
more than it started with, because every ruling that could become a check
became one.

- The mirror updates in place. Morphing replaced the full-page reload and
  server-sent events replaced the poll loop.
- The machine render compacts to content-sized nodes.
- The log moved to a new left column with the terminal beneath it.
- The PTY host runs as a sibling of the agent, opt-in behind --one-screen.
- Everything else settled this session went in alongside it.

## What is verified, and what is not

Verified here: the whole suite, the pseudo-terminal binding loading on
Windows, both xterm assets resolving and serving, the host's alive, resize
and input routes answering, a child's output reaching a freshly attached
stream through the replay buffer, and the web-search hook logging a search
while ignoring other tools.

NOT verified, and it needs a real launch: xterm rendering in the browser,
the agent itself running under the host, and the new left-column layout as
it actually looks. Run `.\RUNME.ps1 --one-screen` to try it; plain
`.\RUNME.ps1` is unchanged, so a terminal that will not start cannot cost
anyone their agent.

One bug was found by testing rather than by reasoning: Windows cannot spawn
a bare name or an npm .cmd shim through a pseudo-terminal, so the command
goes through the shell there.

## The layout the owner specified

- LEFT sidebar — the log on top, the terminal beneath it.
- The terminal is capped at half the VIEWPORT height, with an expand
  control that behaves like every other widget, including the new-tab and
  new-window openings.
- The terminal defaults to a hundred columns and gets a draggable divider.
- MIDDLE — the machine.
- RIGHT — details, full viewport height for now.

## The compaction, as ruled

Node sizes come from Obsidian, where you read a note's contents inside the
node. Here a node holds a title and a subtitle, so most of the box is
empty. Because the SVG scales to fit, that emptiness becomes unreadably
small text. Shrinking the boxes makes the text bigger in the same space.

- Derive the ordering from the canvas. Keep who is above, below, left and
  right of whom. Never run a graph-layout algorithm — the hand-placed
  arrangement carries meaning.
- Start and end become the standard small circles.
- A plain state becomes a box around its title and subtitle.
- A SUB-MACHINE keeps a doubled border, the composite-state convention, so
  you can see what you may descend into (owner ruling 2026-07-28).
- Group frames stay around their members.

This deliberately breaks WYSIWYG with Obsidian. The canvas is the SOURCE
and the render is a VIEW; the law binds what the engine must ACCEPT from a
drawing, not what the render must look like.

## The terminal, as designed

The mirror lives in Claude Code's grandchild, and a grandchild cannot own
the terminal its grandparent runs in. So the PTY host is a SIBLING that
RUNME starts, never a descendant. The mirror only renders a client for it.

- The pseudo-terminal and its scrollback live in the host, which never
  reloads. The browser reattaches and replays.
- The terminal's container must carry data-morph-ignore, or a morph reaches
  into the canvas and the session flickers.
- Use a prebuilt-only PTY binding so RUNME's promise of no build step
  anywhere survives.

## Carried in from before the expedition

Two fixes the owner ordered in chat, made at idle before this branch
existed, and re-applied here so they cannot be stranded.

- Idle is a switchboard. Its routing table moved to the front desk's
  method, which deliberately carries no list of doors so it cannot go
  stale.
- Plan and fork are idempotent. An update rides BEFORE the call's verdict,
  and every refusal tells you to repeat the call, so a retried plan used to
  plant its whole checklist again.

## Also folded in, by the owner's word

Everything else settled in this session, so nothing is lost:

- The settings store keyed to a session token, so a reload keeps the
  sliders and a clean end resets them.
- The survey made callable by the person, not only the agent.
- One log colour per kind, none shared.
- The web-search mirroring hook, so the query reaches the feed
  mechanically rather than by the agent remembering.
- The answer-once rule and the dated-guidance test, into the guidance.
- The retro's statement, which today names its input and not its output.
- Bidirectional canvas arrows, so one drawn arrow means forward and return.

## Cautions found while working

- The handover CANNOT be written from a bound expedition. The file lane
  resolves into the worktree, which has no .se directory, so the write
  lands where the next session never looks. Write it after leaving.
