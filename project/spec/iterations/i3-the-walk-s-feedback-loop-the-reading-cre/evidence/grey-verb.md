---
form: grey-verb
by: agent
signed_off: 2026-08-13T12:15:58.702Z
authors: agent
files:
---

# Evidence form / grey-verb

## current_situation

A grey state had no verb that said why. The walk computes every condition on a step to decide whether it opens, throws the FIRST one that fails, and discards the rest — so the answer existed for a microsecond and then had to be rebuilt by hand from files the lane was already holding. The third of the three defects i3 was opened for.

## built

session.ts and tools.ts.

- `stateBlockers(stateId)` COLLECTS what the walk used to throw: form incomplete, unsubmitted, unsigned feeder, unblessed gate. Each carries the clause, what was expected, what is there, and an executable remedy — the same payload the refusal would have carried, because it IS that payload.
- `assertStateFormMet` now throws `stateBlockers(id)[0]`. The walk refuses exactly where it refused before, with the same clause and the same remedy.
- `whyGrey(state?)` is the verb's answer: the state, whether it stands, the blockers, and one plain sentence saying which of the two cases you are in. No argument means where the walk stands.
- `se_why` in the lane, and in ALWAYS_LEGAL.

ONE MECHANISM, TWO CALLERS. A second copy would drift, and the drift would be invisible: the verb would explain a state by rules the walk no longer judges it by. That is worse than no verb, because it is confidently wrong. A test asserts neither side grows its own checks.

THE DIAL IS DELIBERATELY NOT A BLOCKER. It governs the HOP, not the state. A step above the dial is not grey, it is waiting for a person, and reporting it here would send somebody to fix a claim that is already fine.

ITS OWN FIRST TEST CAUGHT A DESIGN FLAW. The verb was written gated by state and was refused at boot/read_contract — precisely the kind of place somebody asks why they are stuck. A diagnostic callable only from where nothing is stuck is useless at the one moment it exists for. That is why it is always legal.

Cases: tests/feedback-loop.test.ts — two, covering the verb's answers and the single blocker list.

## follow_up

IT COULD NOT BE USED IN THE SESSION THAT BUILT IT, and that is the finding worth carrying. An MCP client learns its tool list once at handshake, and reloading the engine behind the same socket never makes it ask again. The engine has the verb; the harness does not.

So a verb shipped mid-session is unreachable to the session that shipped it. Its tests pass, because they stand their own server in-process and see the fresh list. Only the live lane is stale — everything green and the thing still unusable.

This iteration then spent an afternoon on a stuck state that se_why exists to explain, holding a fix it could not reach. Noted, with the likely remedy: the protocol has a tools/list_changed notification for exactly this, so the question is whether the host acts on it.

## anything_else

