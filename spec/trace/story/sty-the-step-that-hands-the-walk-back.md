---
minted_in: i51
id: sty-the-step-that-hands-the-walk-back
type: "[[story]]"
statement: When I leave a state whose leaving condition runs a long program, I want the call to answer at once and the verdict to arrive later, so my only verb is never held and I am never told the work failed while it was still moving.
actor: stk-agent
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

THE PROBLEM. A step whose leaving condition runs a program holds the agent's
only verb until the program finishes, and the harness may give up first.
|||
MEASURED AT SIXTY-EIGHT SECONDS, with two calls expiring at the tool boundary.
One of those had already landed, so the caller was told the work failed while
the work had moved. Recorded in
wt-a-step-whose-leaving-condition-runs-a-long-program-should-no.

---

THE STARTING STATE. The walk stands on a state with an exit script. The agent
holds one verb, `se_pull`. Nothing else it can call moves the walk.
|||
THE INLINE AWAIT IS AT deliverable/engine/session.ts line 3686:
`if (from.exit?.script !== undefined && !escaping) await
this.scripts.scriptRun(from.id)`. The engine's own kill timer for that script
is 600,000 ms, at deliverable/engine/sessionscript.ts line 87.

---

STEP ONE. The agent pulls. Today: nothing returns until the script does. After:
the pull answers inside a second, saying the leaving check has started and
naming what to ask.
|||
EMPTY UNTIL M8.

---

STEP TWO. The agent does other work. Today: there is no other work, because the
verb it would use is the one that is blocked. After: it writes the next file
and patches the next module.
|||
EMPTY UNTIL M8.

---

STEP THREE. The agent asks what is still running. Today: no call answers that.
After: one call names the leaving check and how much longer it needs.
|||
EMPTY UNTIL M8.

---

STEP FOUR. The agent pulls again. Today: not reached. After: the verdict is
waiting, and the walk moves or the refusal names what the script found.
|||
EMPTY UNTIL M8.

---

THE RESULT. A long leaving condition costs the walk its duration and never its
verb. The agent is never told a call failed while the work behind it landed.
|||
EMPTY UNTIL M8.
