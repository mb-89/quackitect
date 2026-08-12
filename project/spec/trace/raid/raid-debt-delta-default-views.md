---
minted_in: i2-parallel-iterations-across-machines-seed
id: raid-debt-delta-default-views
type: "[[raid]]"
kind: debt
statement: The reference views still list the whole corpus - the minted_in stamps stand, but the resolvers do not yet default to the bound record's delta with the corpus opt-in.
owner: the driving agent
trigger: the next form opened in a record whose table lists another record's nodes, or the owner's next reiteration of the delta demand
status: open
breaks_how_badly: abrasive
how_likely: certain
impact: Every reference table in a record lists the standing corpus beside the delta - 38 test-specs where 7 are the iteration's own - and the reader wades through history, exactly what the owner has flagged three times.
source_refs:
  - req-nodes-scoped-to-iteration
  - note-db7c72bd519c
---

Taken knowingly at the b10 signing: the stamp at mint and the corpus
backfill landed and test green; the resolver default and the opt-in
toggle did not. The cost compounds with every node the corpus gains.

The remaining work: the $-item resolvers filter to the bound record's
minted_in by default, an opt-in widens to the corpus, and the coverage
laws stay corpus-wide. The stamps this debt rests on are already on
every node.
