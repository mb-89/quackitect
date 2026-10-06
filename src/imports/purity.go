// The purity guard: a Go function reaching the outside outside an IO module,
// carrying no reason.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports

import (
	"go/ast"
	"go/token"
)

// The marker a function reaching the outside carries, with its reason. [[spec/design_output/model#the-guards-hold-a-baseline]]
const impureMarker = "level0: Impure - "

// Each outside kind, and the Go names that reach it: a package path, or a path and a member after a dot. [[spec/design_output/model#the-guards-hold-a-baseline]]
var OutsideKinds = map[string][]string{}

// Each function reaching the outside with no reason, outside an IO module, as its file and its name, sorted. [[spec/design_output/model#the-guards-hold-a-baseline]]
func ImpureFunctions(fset *token.FileSet, files []*ast.File) []string {
	return nil
}
