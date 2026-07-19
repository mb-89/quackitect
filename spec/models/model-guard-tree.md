---
id: model-guard-tree
type: model
kind: structural
statement: Where does each new guard part sit? This is the part-of tree of the engine-laws subsystem.
class: review
killer: false
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: skeleton value
---
```mermaid
flowchart TD
  elem-engine-laws["engine laws (i22)"]
  elem-command-guards["command guard layer"]
  go-guard-selftest["selftest gate rule"]
  go-guard-cli["agent-CLI refusal rule"]
  elem-grant["standing grant"]
  go-grant-store["grant ledger events"]
  go-grant-review["morning-review surface"]
  elem-battery-shape["battery run shape"]
  go-verdict-guard["verdict-write guards"]
  go-battery-progress["progress line"]
  go-battery-batch["batch answer"]
  go-battery-parallel["concurrent runners"]
  elem-lint-pair["lint pair"]
  go-voice-lint["voice lint pass"]
  go-recital-chain["recital chain selftest"]
  elem-engine-laws -->|has| elem-command-guards
  elem-command-guards -->|has| go-guard-selftest
  elem-command-guards -->|has| go-guard-cli
  elem-engine-laws -->|has| elem-grant
  elem-grant -->|has| go-grant-store
  elem-grant -->|has| go-grant-review
  elem-engine-laws -->|has| elem-battery-shape
  elem-battery-shape -->|has| go-verdict-guard
  elem-battery-shape -->|has| go-battery-progress
  elem-battery-shape -->|has| go-battery-batch
  elem-battery-shape -->|has| go-battery-parallel
  elem-engine-laws -->|has| elem-lint-pair
  elem-lint-pair -->|has| go-voice-lint
  elem-lint-pair -->|has| go-recital-chain
```
## Rationale (not load-bearing)
One line to see: four groups, eleven leaves; every leaf is a future `design:` marker id
the M6 build fills (the M4-allocation the sky-fall rule checks against).

Placement and contract, one line per leaf:

- go-guard-selftest: in the dispatch guard layer, because the rule must fire before ANY handler. In: command name, channel, gate readiness. Out: pass, or a refusal naming quack verify and the gate.
- go-guard-cli: same layer, same reason. In: command name, channel, the workspace's declared agent lane. Out: pass, or a refusal naming the MCP tools.
- go-grant-store: beside the other ledger events, because a grant IS an adjudication fact. In: scope, expiry. Out: grant id; a scope match verdict for a bless.
- go-grant-review: on the grant, because the collection is the grant's own exit ritual. In: a closed grant. Out: the collected blesses, listed for confirmation.
- go-verdict-guard: wrapping the ONE verdict-write path, because i21 proved per-test guards miss. In: a run result plus busy flag and red-record state. Out: recorded verdict, or a discard with its reason.
- go-battery-progress: in the battery runner, where the loop counter lives. In: test index, total. Out: one numbered console line per test.
- go-battery-batch: at the battery entry, where the cache is consulted. In: content hash state. Out: a cache answer, or a full run.
- go-battery-parallel: in the battery runner's loop. In: the independent test list. Out: the same verdicts, recorded through the one guarded write path.
- go-voice-lint: in the lint pass list, beside the EARS check. In: authored statement fields. Out: flags.
- go-recital-chain: in the selftest corpus, beside the entry-chain checks. In: contract.md and AGENTS.md bytes. Out: pass or fail.
