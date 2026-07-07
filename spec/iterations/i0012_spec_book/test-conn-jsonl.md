---
id: test-conn-jsonl
type: test
statement: A fixture edges.jsonl loads its lines as edges; a malformed line and a dangling endpoint each refuse naming the file and line.
class: executed
verify: selftest:conn-jsonl
killer: false
---
