---
form: expedition-leave
status: done
by: agent
files:
---

# One screen

## What was the goal

Put the agent and the machine on one screen, and fix what stood in the way.

The owner wanted the agent's terminal inside the mirror. Two things blocked
it. The page reloaded itself on every change, which would wipe a terminal's
scrollback several times a minute. And the machine drawing was sized for
Obsidian, so it left no room for a fourth column.

Everything else settled in the same session was folded in on the owner's
word, so that nothing from the conversation was lost.

## What was done

The mirror updates IN PLACE. The page fetches itself and morphs the result
into the live DOM, so an unchanged node is never replaced. Polling became a
pushed stream, since the walk already woke every held hand.

The machine render COMPACTS. Node geometry is rebuilt from the drawing's
order and never from its magnitudes, so who is above, below, left and right
of whom survives while the empty space does not.

The LAYOUT moved. The feed sits in a new left column with the terminal
beneath it, capped at half the viewport, and details takes the right alone.

The PTY HOST landed as a sibling process. The mirror is the agent's
grandchild and a grandchild cannot own its grandparent's terminal, so RUNME
starts the host and the host starts the agent. It is opt-in behind
--one-screen.

Folded in alongside:

- Settings belong to a session. A reload keeps the sliders; a fresh start
  takes the defaults.
- The survey answers the person too, not only the agent.
- One log colour per role, none shared, none stealing a colour the voice
  already spends.
- Web searches reach the feed through a hook rather than by the agent
  remembering.
- One drawn arrow now means forward and return.
- Idle became a switchboard, and plan and fork became idempotent.
- Two voice rules: write an answer once, and judge dated guidance by what it
  rationed rather than by its age.

## What settled it

The suite went from 106 tests to 116, because every ruling that could become
a check became one rather than a comment. It is green.

The compaction is pinned by four invariants against the real main canvas:
order survives, nothing overlaps, the drawn area more than halves, and a
subtitle earns its extra line. The arrow notation is pinned by two: every
door off idle is still a normal edge out and an alternative back, and a
one-way arrow gains no return. The palette is pinned by a lint.

The PTY host was exercised end to end. The binding loads on Windows, both
xterm assets resolve and serve, alive, resize and input answer, and a child's
output reached a freshly attached stream through the replay buffer. The
web-search hook was fed both a WebSearch payload and a Read payload; it
logged one and ignored the other.

Two things were found by testing rather than by reasoning. Windows cannot
spawn a bare name or an npm shim through a pseudo-terminal, so the command
goes through the shell there. And the web-search deny was never really
fixed: RUNME copies the cage TEMPLATE over the settings on every launch, and
only the copy had been changed, so each launch restored it.

## What was not done

The browser half of the terminal is untried. Nothing here could render xterm
in a real page or run the agent under the host, because that needs a launch
this session cannot perform. It is opt-in for exactly that reason, and plain
RUNME is unchanged.

The expedition is deliberately NOT closed. The owner rules on that.

Left open on purpose, and noted rather than built:

- The handover cannot be written from a bound expedition. The file lane
  resolves into the worktree, which has no .se directory, so the write lands
  where the next session never looks. It fails silently, which is the worst
  kind.
- The terminal takes the free space today. Its widget rules, a maximize that
  matches the others, were named for later by the owner.
- Pruning as a machine, and the fitness functions that wait on architecture
  elements existing at all.
