---
form: expedition-leave
status: done
by: agent
files:
---

# e10 — mirror bugfix round

## What was the goal

Fix the mirror bugs the owner hit while driving it live. The expedition
was kept open as the session's bugfix bucket (owner ruling). It then grew
by owner grant into the v1 retro port.

## What was done

- Log pane stuck on "loading…": a broken arrow function in the feed
  renderer (`.map((r) =` for `.map((r) =>`) made every render throw.
  One character. The feed polls fine; it now renders and updates live.
- Legal tools in the details pane: now a `legal tools` row inside the
  state's kv table, like `pulled`. One line per tool, deduplicated.
  Human-callable tools stay links; "all" keeps its collapsible expansion.
- Archive wiring: start reaches every closed expedition; each runs to end
  (alternative join — one visit completes); empty archive runs start
  straight to end. Generated states inherit the wiring automatically.
- Archive states are human-only: priority 1.5, above the whole slider
  (owner ruling — there is nothing for an agent to do in there).
- Archive speed: closed records load in ONE `git cat-file --batch` call
  and are cached for the session (closed branches never move). Was one
  `git show` spawn per record on every double-click. Measured ~70 ms cold,
  ~30 ms warm for 10 records.
- Modal ✕ button dead (found via the escape dialog): the ✕ carried the
  `.expand` class, so the widget-expand handler swallowed the click with
  `stopPropagation`. The expand listener now binds only to
  `.expand[data-widget]`.
- Fresh worktrees were born broken: no `product/deliverable/node_modules`,
  so search and selftests failed there. `expNew` now installs the deps
  into the new worktree when they are missing.
- The v1 retro port (owner grant): retro.md carries v1's homes and
  separation — retro emits, the drain routes, planning adopts.
  - New `backlog` disposition parks a note; its `where` is REQUIRED as
    the "ready when …" re-entry condition.
  - Migration is a re-drain: the retro walks parked notes and keeps,
    pulls (carried), or drops (obsolete) each one.
  - `se_log_query` accepts `since: "last_retro"` — the newest drain call
    marks the previous retro, so mining scopes to the current period.
    The raw log stays (owner ruling: forever-until-1GB, GC later).
- Mirror polish (owner rulings): filter and note inputs share one row,
  half each; the filter's focus help lists one example per filter kind.

## What settled it

66/66 selftests green: the archive wiring (1.5 priority, empty case),
the backlog home (required ready-when, parking, migration re-drain), and
the last_retro log scoping each carry a new test. The log pane and the
modal ✕ were verified in a live mirror served from this worktree. The
archive speed was measured cold and warm against the real repo.

## What was not done

- The live mirror shows the fixes only after this branch merges and the
  server restarts — this close delivers the merge.
- The patch-tool lead stays open as a pending note: unknown op fields
  (`find`/`replace`) report "0 occurrences" instead of naming the field.
- The self-deadlock lead stays open as a pending note: se_run against the
  session's own mirror blocks the event loop until the timeout.
- The owner-led retro (field feedback first) was not run; four pending
  notes wait for it, drainable with the new backlog machinery.
