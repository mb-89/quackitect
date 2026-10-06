// The fixture guard: a top-level Go test building a fixture outside the home.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports

import (
	"go/ast"
	"go/token"
)

// The marker sparing a fixture build outside the home, with its reason. [[spec/design_output/model#the-guards-hold-a-baseline]]
const fixtureMarker = "level0: FixtureOutsideHome - "

// Each top-level test reaching a fixture build outside the home, as its file and its name, sorted. [[spec/design_output/model#the-guards-hold-a-baseline]]
func FixtureBuilds(fset *token.FileSet, files []*ast.File) []string {
	return nil
}
