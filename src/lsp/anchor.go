// A pointer names a chapter, and this reads its anchor against the headings of
// the note it names. A pointer at a heading the note lacks draws, so a reader
// follows no pointer into a note with no answer.
// [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
package main

import "quackitect/yaml"

// The rule over a pointer whose note holds no heading slugging to its anchor. [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
const DeadAnchor = "DeadAnchor"

// [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
func anchorFaults(tree *Tree, path string) []Finding {
	out := []Finding{}
	for i, row := range yaml.SplitLines(tree.Read(path)) {
		for _, found := range anchorAt.FindAllStringSubmatch(row, -1) {
			note, anchor := found[1], found[2]
			if !noteStands(tree, note) || headingNamed(tree, note, anchor) != "" {
				continue
			}
			out = append(out, fault(DeadAnchor, path, i+1,
				"The pointer names "+anchor+", and "+note+" holds no heading of that name. Name a heading the note holds."))
		}
	}
	return out
}

// A pointer at a note the tree lacks is the link check's, so this reads the note that stands. [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
func noteStands(tree *Tree, note string) bool {
	for _, end := range []string{"", ".md"} {
		if tree.Exists(note + end) {
			return true
		}
	}
	return false
}

// [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
func anchorSweep(tree *Tree) []Finding {
	out := []Finding{}
	for _, path := range tree.Paths() {
		if isDraft(path) {
			continue
		}
		out = append(out, anchorFaults(tree, path)...)
	}
	return out
}
