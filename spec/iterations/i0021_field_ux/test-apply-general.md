---
id: test-apply-general
type: test
statement: An apply manifest mixing create, write, and replace operations dry-runs first, lands all-or-nothing, and logs the touched files with outcome; one failing operation rolls back the whole manifest.
class: executed
verify: selftest:apply-general
killer: false
---
