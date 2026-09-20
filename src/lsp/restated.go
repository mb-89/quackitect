// The facts a note restates. One measure answers both rules: the longest run of
// words two places share, over the notes a pointer ties together.
// [[spec/design_output/tree#the-rules-over-two-files]]
package main

const (
	// The rule over a heading retelling the heading its pointer names. [[spec/design_output/tree#the-rules-over-two-files]]
	RestatedPointer = "RestatedPointer"
	// The rule over one rule line standing in two guidance notes. [[spec/design_output/tree#the-rules-over-two-files]]
	RestatedRule = "RestatedRule"
)

// [[spec/design_output/tree#the-rules-over-two-files]]
func restatedFaults(tree *Tree, pointer, rule int) []Finding {
	_ = tree
	_ = pointer
	_ = rule
	return []Finding{}
}

// The longest run of words two texts share. [[spec/design_output/tree#the-rules-over-two-files]]
func sharedRun(one, other string) int {
	_ = one
	_ = other
	return 0
}
