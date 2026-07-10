---
id: test-book-artifact
type: test
statement: The book compiles to one self-contained, accessible, machine-digestible HTML artifact with an mdbook-style shell.
class: executed
verify: selftest:book-a11y book-dom-static book-figures book-shell book-single-file llm-digestible
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The rendered fixture book carries landmarks and a heading hierarchy; every interactive toggle is a real focusable element, never a click-only div; the theme's contrast pairs pass the AA bound. *(was test-book-a11y)*
2. Every content layer of a probe node is present in the emitted HTML source; the script block contains no content-creating call. *(was test-book-dom-static)*
3. A fixture manifest with a figure reference renders it inline as text-based markup; the book makes no external request for it; the figure's text content survives plain-text extraction. *(was test-book-figures)*
4. The rendered book carries the sidebar shell: the chapter TOC, the search input, the filter-expression input, and the details card - all static DOM, script toggles only. *(was test-book-shell)*
5. A rendered book is one file; it names no external URL in any src, href-to-asset, or fetch. *(was test-book-single-file)*
6. Plain text extraction of a rendered fixture book preserves the layer labels, the normative statements, and the node trust metadata; nothing load-bearing exists only in script. *(was test-llm-digestible)*
