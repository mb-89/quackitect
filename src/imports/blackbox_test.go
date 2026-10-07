// The blackbox guard over planted test files.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports_test

import (
	"go/ast"
	"go/parser"
	"go/token"
	"slices"
	"testing"

	"quackitect/src/imports"
)

func parsed(t *testing.T, files map[string]string) (*token.FileSet, []*ast.File) {
	t.Helper()
	fset := token.NewFileSet()
	var out []*ast.File
	for name, text := range files {
		file, err := parser.ParseFile(fset, name, text, parser.ParseComments)
		if err != nil {
			t.Fatal(err)
		}
		out = append(out, file)
	}
	return fset, out
}

func TestAnInPackageTestFileIsNamed(t *testing.T) {
	t.Parallel()
	fset, files := parsed(t, map[string]string{"a/a_test.go": "package a\n"})
	if said := imports.InPackageTests(fset, files); !slices.Equal(said, []string{"a/a_test.go"}) {
		t.Fatalf("the guard names %v, not the in-package test file", said)
	}
}

func TestAMarkedOrBlackBoxFileIsSpared(t *testing.T) {
	t.Parallel()
	fset, files := parsed(t, map[string]string{
		"b/b_test.go": "package b_test\n",
		"c/c_test.go": "package c // level0: InPackageTest - it reads the parser's state\n",
		"d/d_test.go": "// The cases over d.\n// level0: InPackageTest - it reads the parser's state\npackage d\n",
		"e/e.go":      "package e\n",
	})
	if said := imports.InPackageTests(fset, files); len(said) != 0 {
		t.Fatalf("the guard names %v, though each file stands black-box, marked or no test", said)
	}
	if said := imports.InPackageTests(fset, append(files, parsedOne(t, fset, "f/f_test.go", "package f\n"))); !slices.Equal(said, []string{"f/f_test.go"}) {
		t.Fatalf("beside the spared files the guard names %v", said)
	}
}

func parsedOne(t *testing.T, fset *token.FileSet, name, text string) *ast.File {
	t.Helper()
	file, err := parser.ParseFile(fset, name, text, parser.ParseComments)
	if err != nil {
		t.Fatal(err)
	}
	return file
}
