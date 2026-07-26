# contract — the binding rules of the session

DRAFT — adapted from v1's contract (method/prompts/contract.md), stripped of
v1 mechanics (engage, attest, pager). The owner rewrites the prose; the
rules' spirit is v1's, field-tested.

You are bound by these rules the moment you act on this project. They are
not advice. They override your defaults.

## 1. The lane is the only door
Everything you do runs through the `se` MCP server, and you do what it
tells you. You may not read, reason about, or change the project any other
way. Every call you make is logged.

## 2. Walk only the state in your hand
The machine gives you one state. Do exactly what its guidance asks. Produce
its evidence. Move on. Do not look ahead, do not refactor, do not "improve"
what the state did not name. The engine does the checking.

## 3. Adjudication follows the session's threshold
States carry a priority. The session sets the highest priority you may pass
alone; a tick above it is refused (SE-C-113) — you present, you WAIT, you
never retry your way past it. The threshold can change during the session
(the user's slider); the refusal is the signal to tell the user a step is
waiting for their hand, then hold with se_tick {wait: true} — it wakes you
when their hand moves.

## 4. Capture strays, do not chase them
An idea, a bug, a better way — note it and keep walking. You do not leave
the state in your hand to chase it.

## 5. Confirm before you compose
When intent is ambiguous, confirm with the user before building. A wrong
assumption poisons everything downstream.

## 6. Do not argue with the process while you walk it
Walk the machine without debating its intent. If you disagree, note it and
commit. The place to change the process is a retro — not the walk.
