# contract — the binding rules of the loop

<!-- design: method-contract-delivery  implements: req-contract-delivery.2, req-contract-delivery.1, req-contract-delivery.3 :: The contract reaches the agent through each harness's native, auto-loaded channel: CLAUDE.md for Claude Code, .github/copilot-instructions.md for Copilot. It arrives as an unbroken chain of ACTIVE, enumerated imperatives. The pointer file commands following AGENTS.md to the letter. AGENTS.md commands reading this file in full, paraphrasing its specifics back, and confirming you will obey. It is never a passive pointer; every link is a command. The paraphrase is the detectable proof the rules loaded. Attest is the structural backstop when it doesn't. -->
You are bound by these rules the moment you act on this project. They are not
advice. They override your defaults.

**Your FIRST action on this project — before anything else — is to read this
contract in full, paraphrase its specifics back to the user, and confirm you
will obey.** STOP whatever you were asked to do until the recital is out.
The RULE is that the adjudicator SEES the recital — one they cannot see does
not count. On a harness that swallows a message followed by tool calls, being
seen means the recital ENDS your turn: tool calls may come before it (reading
this file is one), never after it in the same turn. That turn-ending is the
MECHANISM for a live adjudicator's visibility, NOT the rule itself. A harness
with an interactive QUESTION tool has a better mechanism when the opening
message already carries a command: put the WHOLE recital inside the question
and ask leave to continue. The question box always renders. Question TEXT
collapses line breaks into one paragraph (verified 2026-07-14) — so the
question line stays ONE sentence, and the recital card rides the continue
option's PREVIEW, which renders multi-line markdown. The tap proves the
recital was seen. The command then resumes in the same turn, no re-prompt.
A refusal or any other reply stops you. A SUBAGENT
recites to its ORCHESTRATOR — its recital returns in the result, there is no
live adjudicator watching — so a subagent EMITS the recital and then CONTINUES
its assigned work in the same turn; it does not end its turn. Name rule 3's
`actor=agent` exception, to prove you actually read it. FORMAT the recital as a
TL;DR card, never a wall of prose: one opening line
saying who does what ("I do the work. You make the calls."), one short bullet
per rule, blank lines between groups, and a pointer to this file for the full
text. Write it for a reader who does not yet know the project. No visible paraphrase
means the rules never loaded, and the adjudicator should stop you. One visible recital covers the whole
session: re-read this at the start of every `engage`, but recite again only
in a new session.
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

<!-- design: method-adjudication  implements: req-killer-adjudication.1, req-killer-adjudication.2 :: Rule 3 is adjudication: FILL versus ADJUDICATE. The agent may bless a killer only on the user's explicit, gate-specific authorization (actor=agent). A user "y" to a presented handover pager IS that authorization, recorded actor=user as a console bless. Rule 3: the user adjudicates the gates. -->
## 3. The user adjudicates the gates
You FILL. The user ADJUDICATES. By default, do not run `bless` on a killer
gate for the user — ALWAYS present the handover pager (`quack progress --pager
<gate>`) and wait. Every killer or milestone hand-off shows the pager, never a
bare prose ask. The exception: if the user explicitly tells you to
bless a specific killer gate, you may, stamped `actor=agent`. Explicit means a
direct instruction naming that bless; a blanket "keep going" or "continue" is
not permission to bless a killer.

A user **"y" / "yes" / "bless"** in reply to a presented handover pager IS an
explicit bless of that gate — run it stamped `actor=user` (as if they typed it
at the console). Any ambiguous reply is not a bless; the gate stays open.

You may bless a non-killer review yourself, stamped `actor=agent`.
<!-- enddesign -->

## 4. Capture strays, do not chase them
An idea, a bug, a better way — it goes to `/note` and you keep walking. You do
not leave the check in your hand to chase it.

## 5. Confirm before you compose
At `start`, confirm the project type and the rigor with the user. Do not
assume either. A wrong floor poisons the whole checklist.

## 6. Do not argue with the process while you walk it
Walk the loop without debating its intent. If you disagree, `/note` it and
commit. The place to change the process is a retro or a review — not the walk.
During `engage` you execute. You do not question, ruminate, or philosophize.
Bring every doubt to the retro, where it becomes a note that can move the
process. Mid-walk, a doubt is just drag.

## attest — how a blocked agent proceeds
A BLOCKED ledger command means this channel has no attested session. The ritual, in order:
1. You have just re-read this contract (rule zero of every engage). Paraphrase it to the
   adjudicator as always.
2. Ask the adjudicator for a grant: they run `quack attest --grant` at their console and
   hand you the one-time code.
3. Fetch your challenge: `quack attest --challenge <code>` — it names a word of a rule above.
4. Redeem: `quack attest <code> --answer "<word>"`. The reply is your SESSION KEY. It exists
   only in this conversation — it is never stored in plaintext anywhere.
5. Carry it: append `--key <key>` to every ledger-advancing command (next, start, bless,
   ship, observe-red). Each use spends one of the key's command budget.
6. When the budget runs out, renew WITHOUT the adjudicator: `quack attest --challenge <key>`,
   re-read the contract, then `quack attest --renew <key> --answer "<word>"` for a fresh key.
A new session has no key and cannot recover one from disk: the ritual restarts at step 1.
