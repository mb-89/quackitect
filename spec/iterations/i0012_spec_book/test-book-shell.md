---
id: test-book-shell
type: test
statement: The rendered book carries the sidebar shell: the chapter TOC, the search input, the filter-expression input, and the details card - all static DOM, script toggles only.
class: executed
verify: selftest:book-shell
killer: false
---
## Rationale (not load-bearing)
Guards the shell's contract: navigation and controls exist at emit time as real
DOM; the script may toggle classes and attributes, never create content.
