// The blackbox guard: a Go test file standing inside the package it tests.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports

import (
	"go/ast"
	"go/parser"
	"go/token"
	"slices"
	"strings"
)

// The marker sparing a test file that stands inside its package, with its reason. [[spec/design_output/model#the-guards-hold-a-baseline]]
const inPackageMarker = "level0: InPackageTest - "

// The test files whose package clause lacks _test and carries no marker, as the fileset names them. [[spec/design_output/model#the-guards-hold-a-baseline]]
func InPackageTests(fset *token.FileSet, files []*ast.File) []string {
	named := []string{}
	for _, file := range files {
		name := fset.Position(file.Package).Filename
		if !strings.HasSuffix(name, "_test.go") || strings.HasSuffix(file.Name.Name, "_test") || marksInPackage(fset, file) {
			continue
		}
		named = append(named, name)
	}
	slices.Sort(named)
	return named
}

// Whether the file's doc, or a comment on its package clause's line, carries the marker. [[spec/design_output/model#the-guards-hold-a-baseline]]
func marksInPackage(fset *token.FileSet, file *ast.File) bool {
	if file.Doc != nil && strings.Contains(file.Doc.Text(), inPackageMarker) {
		return true
	}
	clause := fset.Position(file.Package).Line
	for _, group := range file.Comments {
		if fset.Position(group.Pos()).Line == clause && strings.Contains(group.Text(), inPackageMarker) {
			return true
		}
	}
	return false
}

// The blackbox guard over the tracked files: each Go test file parsed to its package clause. [[spec/design_output/model#the-guards-hold-a-baseline]]
func inPackageTracked(tracked []string, read func(path string) string) []string {
	fset := token.NewFileSet()
	files := []*ast.File{}
	for _, path := range tracked {
		if !strings.HasSuffix(path, "_test.go") {
			continue
		}
		file, err := parser.ParseFile(fset, path, read(path), parser.PackageClauseOnly|parser.ParseComments)
		if err != nil {
			continue
		}
		files = append(files, file)
	}
	return InPackageTests(fset, files)
}
