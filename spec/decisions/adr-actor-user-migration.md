---
id: adr-actor-user-migration
decided_in: i0011_geronticide
type: adr
adjudicated_by: human
statement: Actor stamps migrate human to user in one audited pass. An explicit quack migrate-actors command rewrites the actor fields. It appends a migration event recording count and timestamp. Readers treat human and user as one value forever. An unmigrated clone still computes. The self-cert metric counts agent versus non-agent and spans both eras. New records write user.
class: review
killer: false
---
## Rationale (not load-bearing)
The geronticide sunset from adr-stamp-vocabulary lands. One-shot + read-compat keeps every clone computable and the audit trail honest. Fixture-proven before it touches the real ledger.
