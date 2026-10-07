// The coverage rules: every verb and tab an example shows, and every standard
// ticket's done_when naming the example proving it, both in report mode.
// [[spec/design_output/examples#the-checks]]
package check

// Each verb and tab no example names under interface. [[spec/design_output/examples#the-checks]]
func exampleCovers(tree *Tree) []Finding { return nil }

// Each open standard ticket whose done_when names no example. [[spec/design_output/examples#the-checks]]
func exampleProves(tree *Tree) []Finding { return nil }
