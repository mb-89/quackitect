---
id: test-strict-frontmatter
type: test
verifies: [req-strict-frontmatter]
statement: A node file with malformed frontmatter or an unknown key (the depends-on typo) makes the engine exit nonzero naming the file and key, while every allowlisted key including the i7 additions still parses clean.
class: executed
verify: selftest:parser-strict
killer: false
---
