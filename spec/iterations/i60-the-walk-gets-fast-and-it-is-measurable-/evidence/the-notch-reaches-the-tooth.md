---
form: the-notch-reaches-the-tooth
by: agent
signed_off: 2026-08-24T16:32:22.204Z
authors: agent
files: null
---

# Evidence form / the-notch-reaches-the-tooth

## current_situation

The stop-at control had four notches and three of them did nothing. Setting it changed nothing about when the agent handed back.

The stop hook decided every stop and recorded only its refusals. A stop it permitted and a stop it failed to judge left the same trace: none.

## built

TWO HALVES THAT WERE NEVER JOINED, NOW JOINED.

### The notch reaches the hook

The hook's only ground truth is the call log. It reads the notch off the newest pull.

The engine stamped the notch onto `packet()`, which serves the mirror. Measured across the live log: 338 of 338 pulls carried no `stop_at` at all.

So `notch` always read empty, and the three branches that test it were unreachable. `state end`, `bless` and `blockers only` could not fire.

The notch now rides `head()` in `pull()`, the helper every pull shape spreads — the escape, the gate, the post-sweep and the unroutable wait alike. The mirror keeps its own copy, and the comment there no longer claims to be the hook's.

PROOF ON THE LIVE MACHINE: this session's pulls carry `stop_at`, and the notch the owner set is the one they carry.

### The hook leaves a trail

`LifecycleEvent` in [deliverable/engine/lifecycle.ts](deliverable/engine/lifecycle.ts) gained `stop-pass` and `stop-error` beside the existing `stop-block`.

Every sanctioned exit now records which sanction applied. The swallowed throw records itself too, which is the failure this file already carries a scar from: its root once climbed one directory too far, found no call log, and permitted every stop it exists to refuse.

The notch branches moved into `notchSanction`, because the decision function crossed the complexity ceiling and the rule is to split along the function's own phases.

### The check

[deliverable/tests/stophook.test.ts](deliverable/tests/stophook.test.ts) gained a case that stands up a real session, takes its real pull, and feeds that exact object to the real hook. Green.

## follow_up

THE SUITE HAD NO TEST THAT COULD HAVE CAUGHT THIS, and that is the finding worth carrying.

Every existing hook case hands the hook a pull response written by hand. Both halves were correct in isolation while disconnected, and the suite was green throughout.

Four notes are parked on this, and two are owner rulings: every user story owes an end-to-end test, and "it needs a real machine" is refused as an answer. A mock session that presses the controls is what is owed instead.

## anything_else

