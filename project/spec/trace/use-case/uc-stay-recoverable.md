---
id: uc-stay-recoverable
type: "[[use-case]]"
statement: Recover the walk from any break
actor: stk-agent
trigger: A break interrupts the walk — a refusal, a lost context, a dead session.
precondition: The walk stands at a recorded position.
guarantee: The walk continues from the recorded position, with no grant born from silence and no person's rescue.
refines:
  - sty-recoverability
killer: true
---

## Main scenario

1. The agent's call breaks a rule and the engine refuses it.
2. The refusal arrives typed: the clause, what was expected, what arrived, and an executable remedy.
3. The agent executes the remedy unchanged and the engine accepts it.
4. The session ends without warning.
5. A new session asks for the walk and the engine recomputes the position from the repository alone.
6. The engine serves the recorded state with its guidance and its owed evidence, and the walk continues.

## Extensions

- 2a. The rejection carries no executable remedy: the agent cannot recover alone; the break escalates to the front desk as an escape.
- 3a. The remedy, executed unchanged, is refused again: the recovery loop is broken; the agent escapes with the repeating clause recorded.
- 4a. A live offer stood when the session died: the engine treats the silence as dismissal and records no grant.
- 5a. The repository does not carry the position: the walk cannot resume; the loss is reported as what fell, never papered over.
