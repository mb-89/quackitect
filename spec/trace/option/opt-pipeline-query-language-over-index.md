---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-pipeline-query-language-over-index
type: "[[option]]"
statement: index frontmatter and inline fields into an in-memory table per node kind, then answer a small pipeline expression language (TABLE/FROM/WHERE/SORT) against it
cluster: cluster-the-query
question: how does answer-a-structured-query evaluate a query against the corpus
found_by: prior-art
source: 'Obsidian Dataview, community plugin (github.com/blacksmithgu/obsidian-dataview README: DQL, "a pipeline-based, vaguely SQL-looking expression language")'
---

## Mechanism

Rather than one YAML document per saved view, the query is a short line of
syntax the caller writes on the spot — `TABLE name, kind FROM "requirement"
WHERE priority = "must"` — evaluated against an index Dataview rebuilds on
every vault change.

Costs a real parser for a small grammar (not just YAML), and an index kept
warm rather than a fresh walk per call. Buys ad hoc queries the caller did
not have to author as a file first — useful if callers turn out to want
one-off shapes the pinned subset never anticipated.
