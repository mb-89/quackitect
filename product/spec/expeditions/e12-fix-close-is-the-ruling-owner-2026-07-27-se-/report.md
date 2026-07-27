---
form: expedition-leave
status: done
by: agent
files:
---

# e12 — close is the ruling, tools retired, the handover lands

## What was the goal

Three owner rulings from the discussion round: (1) the expedition close
IS the ruling — apply or dismiss at close, the retro leaves the
expedition loop, report:pending retired; (2) retire se_exp_open and
se_exp_list; (3) the session handover — read on idle entry when present,
written at session end when needed.

## What was done

- se_exp_close semantics: merge true = APPLY (merge to trunk, then
  archive), merge false = DISMISS (archive unmerged). The record is
  stamped at close: report: applied | dismissed. No pending state.
- The retro's report-adjudication step is gone (method, drain state
  guidance); the retro now handles notes, backlog, and mining only.
- Records translated to the new vocabulary: e4–e11 all read
  report: applied — their changes ARE on trunk. NOTE for the owner:
  retro-1 had ruled e5–e8 "dismissed" under the OLD meaning (report
  read, no follow-up); under the new meaning (dismissed = unmerged)
  that reading would be false, so the records now say applied.
  Overrule if you want the old ruling visible differently.
- se_exp_open and se_exp_list retired: tool definitions removed, the
  mirror's tool links updated, every remedy that pointed at them now
  points at continue_expedition, state notes carry the reduced legal
  lists. se_exp_new and se_exp_close stay.
- THE HANDOVER: if .se/HANDOVER.md exists, entering idle demands it
  proven read — the agent by hash, the human by checkbox (it rides the
  pulled list with source "handover"). Absent: nothing demanded.
  Writing stays a judgment call at session end (idle guidance names it);
  nothing to hand over, nothing to write.

## What settled it

69/69 selftests green. New coverage: a left-behind handover refuses idle
entry until its hash rides the proof, then boots clean; the close stamps
applied on the merged record (boot test updated); the parity refusal
list carries only the surviving tools (threshold test updated).

## What was not done

- The stale .se/HANDOVER.md from the previous session is rewritten
  fresh at this session's end, after this close.
- The four pending notes still wait for the owner-led retro.
- The old feed rows for retired tools still render by their historical
  briefs — kept deliberately so history stays readable.
