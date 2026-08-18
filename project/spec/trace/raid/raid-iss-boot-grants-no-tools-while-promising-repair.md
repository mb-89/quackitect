---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: raid-iss-boot-grants-no-tools-while-promising-repair
type: "[[raid]]"
kind: issue
statement: boot/prepare_idle carries legal_tools of nothing at all, and its own guidance says the repair tools are legal there, so a red exit script at boot cannot be repaired through the lane.
owner: the owner
trigger: already live - hit three times on the i17 arrival, 2026-08-18
status: open
impact: The only door left is the native one the contract forbids. An agent that obeys the contract is stuck at boot forever; an agent that finishes booting has broken rule 1 to do it. Every arrival on a machine where an exit script is red faces that choice, and nothing in the log records which way it went.
breaks_how_badly: crippling
how_likely: expected
probe: "OPEN. The state's own guidance already states the intent - while a check stands red, the repair tools are legal HERE - so the fix is to make the drawing match the sentence: grant the file verbs on prepare_idle, or draw a repair sub-state the failing script routes into."
source_refs:
  - i17-the-options-pool-triage-a-raw-note-into-
  - raid-iss-an-exit-script-may-not-read-unpinned-host-state
weighs_with: none
weighs_against: none
---

## The shape of it

MEASURED ON THE i17 ARRIVAL, 2026-08-18. `prose-inspect.ts` is an exit script
of `boot/prepare_idle`. It came back red with 64 findings. The pull answered:

    legal_tools: []

and, in the same answer, the state's guidance:

    While a check stands red, the repair tools are legal HERE - fix what the
    output names, then pull again.

BOTH SENTENCES CANNOT BE TRUE. The second is what an agent acts on and the
first is what the machine enforces.

## Why it is worse than an ordinary missing tool

A REFUSAL ELSEWHERE HAS A REMEDY AND A WAY ROUND. This one does not: the
remedy printed on the refusal is "fix what the output names, then pull again",
and the state grants nothing to fix it with. There is no other state to escape
to, because boot cannot be escaped.

SO IT SELECTS FOR CONTRACT-BREAKING. The agent that got the walk moving is the
one that reached for a native editor. That is the wrong lesson to teach at the
first state of every session, and it is taught silently.

## Repayment

Grant `se_file_read`, `se_file_patch` and `se_file_write` on `prepare_idle`
while an exit script stands red, or draw a repair sub-state the failing script
routes into. Then a test that asserts the state's legal tools can act on what
its own guidance promises.
