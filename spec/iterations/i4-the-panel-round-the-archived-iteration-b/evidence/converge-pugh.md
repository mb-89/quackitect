---
form: converge-pugh
by: agent
signed_off: 2026-08-23T17:52:11.451Z
authors: agent
files: null
---

# Evidence form / converge-pugh

## current_situation

THE FRONT HOLDS THREE NAMES AND TWO REAL RIVALS. The host-first surface loses every axis it can be compared on and stays only through two unscorable cells.

THE TWO REAL RIVALS TRADE. Neither dominates, so the count is expected to be close and the tie-break is where the work is.

## matrix_runs

| run | datum | candidate | better | same | worse | net |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | cand-the-repeater-surface | cand-the-guarded-collapse | 2 | 0 | 2 | 0 |
| 1 | cand-the-repeater-surface | cand-the-host-first-surface | 0 | 0 | 3 | -3 |
| 2 | cand-the-repeater-surface | cand-the-guarded-collapse | 2 | 0 | 2 | 0 |

RUN 1 ELIMINATES THE HOST-FIRST SURFACE. Against the repeater it is worse on showing the machine, worse on controls drawing from their spec, and worse on the filter. Its other two cells are unscorable and compare to nothing.

RUN 2 REPEATS WITH THE LOSER GONE and the count does not move. The guarded collapse is better on catching a wrong act and on latency; the repeater is better on showing the machine and on controls. Two against two.

THE COUNT TIES, so the arithmetic does not decide this and nothing here pretends otherwise.

## follow_up

THE TIE BREAKS ON SEVERITY, and the axes carry it in their own frontmatter rather than in anybody's preference.

- req-a-wrong-act-never-passes-silently is FATAL, and the guarded collapse wins it 4 to 3.
- req-panel-shows-the-machine is CRIPPLING, and the repeater wins it 5 to 4.
- req-surface-answers-in-one-second and req-controls-draw-from-their-spec are both CORROSIVE, and they split one each.

SO THE GUARDED COLLAPSE EDGES IT, on the one axis whose loss is fatal rather than crippling. That is a thin win and it is honest to say how thin.

THREE THINGS COULD OVERTURN IT, and each is cheap to name.

- THE LATENCY CELLS REST ON NO MEASUREMENT. If the repeater's round trip is fast enough, it takes that axis and the count goes 3 to 1 the other way.
- THE FATAL AXIS IS THE CLOSEST CALL IN THE TABLE. The guarded collapse scores 4 because its refusal is typed; the repeater scores 3 because it names the leak and no detector. But the repeater prevents a whole class of wrong act by construction, which the scorer credited in prose and not in the number.
- THE TWO ARE NOT EXCLUSIVE. Nothing stops a repeater surface carrying the guard as well, and the box treated them as separate rows only because they answer different questions.

THAT LAST POINT IS THE ONE THE ADRs MUST CARRY. The honest reading of this matrix is not that one candidate beat another. It is that the two winners compose, and the tie is the machine telling us the space was drawn as a choice when it was a pair.

## anything_else

