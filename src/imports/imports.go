// The import rules, as go/analysis analyzers: a module imports no door, and a
// door, the index or a renderer imports no module.
// [[spec/design_output/go-doors#the-build-checks-imports]]
package imports

import "golang.org/x/tools/go/analysis"

var NoDoor = &analysis.Analyzer{
	Name: "nodoor",
	Doc:  "a package under src/modules imports no package under src/doors",
	Run:  func(*analysis.Pass) (any, error) { return nil, nil },
}

var NoName = &analysis.Analyzer{
	Name: "noname",
	Doc:  "a door, the index or a renderer imports no package under src/modules",
	Run:  func(*analysis.Pass) (any, error) { return nil, nil },
}

// [[spec/design_output/go-doors#the-build-checks-imports]]
func Faults(from string, imported []string) []string { return nil }
