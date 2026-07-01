# contract — the binding rules of the loop

<!-- design: method-contract-delivery  implements: req-confirm-back, req-active-imperative, req-copilot-instructions :: The contract reaches the agent through each harness's native, auto-loaded channel (AGENTS.md; .github/copilot-instructions.md for Copilot) with an ACTIVE first-action imperative — read this file in full, paraphrase its specifics back, confirm you will obey — never a passive pointer, which thin harnesses ignore. The paraphrase is the detectable proof the rules loaded. -->
You are bound by these rules the moment you act on this project. They are not
advice. They override your defaults.

**Your FIRST action on this project — before anything else — is to read this
contract in full, paraphrase its specifics back to the human (name rule 3's
`actor=agent` exception, to prove you actually read it), and confirm you will
obey.** No paraphrase means the rules never loaded, and the human should stop
you. Re-read this at the start of every `engage`.
<!-- enddesign -->

## 1. engage is the only door
Every request to move the work — "finish i5", "continue", "fix this check",
"keep going" — runs through `/engage`. You may not read, reason about, or
change the ledger any other way. If you are about to act without an `engage`
command in hand, stop. Route through the loop.

## 2. Walk only the check in your hand
`quack next` gives you one check. Do exactly what it asks. Produce its
evidence. Move on. Do not look ahead. Do not refactor. Do not "improve" code
the check did not name. Do not check `status`, `lint`, or `selftest` between
steps. The engine does the checking.

<!-- design: method-adjudication  implements: req-bless-y-console, req-contract-killer-relax :: Rule 3, adjudication: FILL vs ADJUDICATE; the agent may bless a killer only on the human's explicit, gate-specific authorization (actor=agent); a human "y" to a presented handover pager IS that authorization, recorded actor=human as a console bless. -->
## 3. The human adjudicates the gates
You FILL. The human ADJUDICATES. By default, do not run `bless` on a killer
gate for the human — ALWAYS present the handover pager (`quack progress --pager
<gate>`) and wait. Every killer or milestone hand-off shows the pager, never a
bare prose ask. The exception: if the human explicitly tells you to
bless a specific killer gate, you may, stamped `actor=agent`. Explicit means a
direct instruction naming that bless; a blanket "keep going" or "continue" is
not permission to bless a killer.

A human **"y" / "yes" / "bless"** in reply to a presented handover pager IS an
explicit bless of that gate — run it stamped `actor=human` (as if they typed it
at the console). Any ambiguous reply is not a bless; the gate stays open.

You may bless a non-killer review yourself, stamped `actor=agent`.
<!-- enddesign -->

## 4. Capture strays, do not chase them
An idea, a bug, a better way — it goes to `/note` and you keep walking. You do
not leave the check in your hand to chase it.

## 5. Confirm before you compose
At `start`, confirm the project type and the rigor with the human. Do not
assume either. A wrong floor poisons the whole checklist.

## 6. Do not argue with the process while you walk it
Walk the loop without debating its intent. If you disagree, `/note` it and
commit. The place to change the process is a retro or a review — not the walk.
During `engage` you execute. You do not question, ruminate, or philosophize.
Bring every doubt to the retro, where it becomes a note that can move the
process. Mid-walk, a doubt is just drag.
