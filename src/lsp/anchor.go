// A pointer names a chapter, and this reads its anchor against the headings of
// the note it names. A pointer at a heading the note lacks draws, so a reader
// follows no pointer into a note with no answer.
// [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
package main

// The rule over a pointer whose note holds no heading slugging to its anchor. [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
const DeadAnchor = "DeadAnchor"

// [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
func anchorFaults(tree *Tree, path string) []Finding {
	return nil
}

// [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
func anchorSweep(tree *Tree) []Finding {
	return nil
}
