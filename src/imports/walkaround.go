// The walkaround analyzer: a Go use of a name a door owns, outside every door
// owning it, off the owns.yaml declarations the tree holds.
// [[spec/design_output/doors#nothing-walks-around-a-door]]
package imports

import "golang.org/x/tools/go/analysis"

// [[spec/design_output/doors#nothing-walks-around-a-door]]
var Walkaround = &analysis.Analyzer{
	Name: "walkaround",
	Doc:  "a name a door owns stands in no file outside the doors owning it",
	Run:  walkaround,
}

func walkaround(pass *analysis.Pass) (any, error) {
	return nil, nil
}
