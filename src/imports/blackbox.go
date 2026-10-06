// The blackbox guard: a Go test file standing inside the package it tests.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports

import (
	"go/ast"
	"go/token"
)

// The marker sparing a test file that stands inside its package, with its reason. [[spec/design_output/model#the-guards-hold-a-baseline]]
const inPackageMarker = "level0: InPackageTest - "

// The test files whose package clause lacks _test and carries no marker, as the fileset names them. [[spec/design_output/model#the-guards-hold-a-baseline]]
func InPackageTests(fset *token.FileSet, files []*ast.File) []string {
	return nil
}
