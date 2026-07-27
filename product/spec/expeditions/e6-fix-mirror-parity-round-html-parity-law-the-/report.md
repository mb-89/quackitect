---
form: expedition-leave
status: done
by: agent
files:
---

# e6 — mirror parity round

## What was the goal

The HTML-parity law made real: the human can run the machine alone, without an LLM. Plus the small visibility items and two engine bugs.

## What was done

- The MODAL: one surface over the grayed page. Human-callable tools of the current state render as clickable buttons (se_exp_new, se_exp_list, se_exp_open, se_exp_close); the modal takes arguments and shows the result in place, through the same state gate the agent faces.
- Escape affordance: an escape button appears while a sub-machine (not boot) is walked; the modal takes the reason; the record is the same as the agent's escape.
- The evidence form now opens editable in the modal; a rejection (e.g. no expedition bound) renders as plain words, never raw JSON.
- Human note input on the log pane: Enter captures a stray to the inbox, hand-stamped (by: human); it joins the feed like any act.
- Log newest-on-top with top-pinned scroll. Filter and note inputs surface their help in the details pane on focus.
- Locked ▶ tooltips name exactly what is missing: unmet condition keys and each unread doc by path — served per edge by the engine.
- Scale: killer anchor moved to 0.9; ideation added at 1.0 as a labeled notch (behavior ships later); machines.md anchors updated.
- Engine bugs fixed: se_run cwd resolved against the root (a relative cwd once made spawn fail silently — now a typed refusal on spawn errors), and single-file se_file_search starved by ripgrep omitting filenames (--with-filename).

## What settled it

59/59 selftests green. New coverage: single-file search finds matches; the human note lands hand-stamped in the feed over HTTP; a /tool call is refused by the state gate as JSON; the page ships the modal, the note input, and the 0.9 killer notch.

## What was not done

- The ideation BEHAVIOR (1.0): label only; the idle-work loop is a design round with the owner.
- Tool modals cover the expedition tools only; further tools join the registry as states need them.
- Decision-graph ops for the human: consciously excluded — narration, not needed to run the machine.
- This session's server predates the build; everything lands on the next restart/reconnect.

## Files

Verification is the selftest suite in-tree; no separate evidence files.
