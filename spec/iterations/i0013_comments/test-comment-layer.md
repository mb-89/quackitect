---
id: test-comment-layer
type: test
statement: The comment layer captures anchored reader feedback in an embedded annotation island and saves it back safely.
class: executed
verify: selftest:comment-dom-static comment-escape comment-island comment-premark comment-suggest
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. The emitted book with the comment layer differs from one without only in the island, the layer's root element, and its script - the content region is byte-identical. *(was test-comment-dom-static)*
2. A fixture island with hostile markup in the comment text renders inert - the annotator writes comment bodies through text assignment only, never markup injection. *(was test-comment-escape)*
3. A commented fixture copy holds exactly one JSON island; every entry parses against the W3C-shaped schema. *(was test-comment-island)*
4. A fixture island entry whose target names a unit anchor directly (no selection selectors) parses and appears in the read-back listing. *(was test-comment-premark)*
5. A fixture island entry with a suggested edit carries both the original quote and the proposed wording; the read-back lists both fields. *(was test-comment-suggest)*
