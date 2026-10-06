// The tests that run alone, named over planted source and over the packages
// the check spends its go part on.
// [[spec/guidance/code/testing]]
package imports_test

import (
	"go/ast"
	"go/parser"
	"go/token"
	"path/filepath"
	"slices"
	"testing"

	"quackitect/src/imports"
)

// The packages whose tests the go part waits on longest, per the measure on [[spec/tickets/the-check-fits-its-budget]].
var slowPackages = []string{"src/branches", "src/quack", "src/imports", "src/pull", "src/index"}

const plantedTests = `package p

import "testing"

func setsHome(t *testing.T) { t.Setenv("HOME", "/") }

func TestBeside(t *testing.T) {
	t.Parallel()
}

func TestBarred(t *testing.T) {
	setsHome(t)
}

func TestAlone(t *testing.T) {
	t.Run("a subtest", func(t *testing.T) { t.Parallel() })
}

func TestMain(m *testing.M) {}

// level0: RunsAlone - swaps a package variable
func swapsState(t *testing.T) {}

func TestSwaps(t *testing.T) {
	swapsState(t)
}

// level0: RunsAlone - swaps a package variable
func TestMarked(t *testing.T) {}
`

func TestATestRunningAloneWithNothingBarringItIsNamed(t *testing.T) {
	t.Parallel()
	file, err := parser.ParseFile(token.NewFileSet(), "p_test.go", plantedTests, parser.ParseComments)
	if err != nil {
		t.Fatal(err)
	}
	if said := imports.SerialTests([]*ast.File{file}); !slices.Equal(said, []string{"TestAlone"}) {
		t.Fatalf("the tests named alone read %v", said)
	}
}

func TestTheSlowPackagesRunEveryTestBesideTheOthers(t *testing.T) {
	t.Parallel()
	for _, pkg := range slowPackages {
		paths, err := filepath.Glob(filepath.Join("..", "..", filepath.FromSlash(pkg), "*_test.go"))
		if err != nil || len(paths) == 0 {
			t.Fatalf("%s holds no test file: %v", pkg, err)
		}
		fset := token.NewFileSet()
		files := []*ast.File{}
		for _, path := range paths {
			file, err := parser.ParseFile(fset, path, nil, parser.ParseComments)
			if err != nil {
				t.Fatal(err)
			}
			files = append(files, file)
		}
		for _, name := range imports.SerialTests(files) {
			t.Errorf("%s: %s runs alone, so call t.Parallel at its top", pkg, name)
		}
	}
}
