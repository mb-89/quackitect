// The fixture guard over planted test files.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports_test

import (
	"slices"
	"testing"

	"quackitect/src/imports"
)

const buildsOutsideHome = `package p_test

import (
	"os/exec"
	"testing"
)

func tree(t *testing.T) string { return t.TempDir() }

func TestDirect(t *testing.T) { _ = t.TempDir() }

func TestThroughHelper(t *testing.T) { _ = tree(t) }

func TestSpawns(t *testing.T) { _ = exec.Command("git", "init") }

func TestPure(t *testing.T) {}
`

func TestATestBuildingAFixtureOutsideTheHomeIsNamed(t *testing.T) {
	t.Parallel()
	fset, files := parsed(t, map[string]string{"p/a_test.go": buildsOutsideHome})
	want := []string{"p/a_test.go TestDirect", "p/a_test.go TestSpawns", "p/a_test.go TestThroughHelper"}
	if said := imports.FixtureBuilds(fset, files); !slices.Equal(said, want) {
		t.Fatalf("the guard names %v, not %v", said, want)
	}
}

const theHome = `package p_test

import (
	"os"
	"testing"
)

func home() string { dir, _ := os.MkdirTemp("", "p"); return dir }

func TestMain(m *testing.M) { _ = home(); os.Exit(m.Run()) }
`

const sparedCases = `package p_test

import "testing"

func TestReadsTheHome(t *testing.T) { _ = home() }

func TestMarkedCall(t *testing.T) {
	_ = t.TempDir() // level0: FixtureOutsideHome - the case writes its own tree
}

// level0: FixtureOutsideHome - the case writes its own tree
func TestMarkedDoc(t *testing.T) { _ = t.TempDir() }
`

func TestTheHomeAndAMarkedCallAreSpared(t *testing.T) {
	t.Parallel()
	fset, files := parsed(t, map[string]string{
		"p/main_test.go":          theHome,
		"p/b_test.go":             sparedCases,
		"src/q/qtest/one_test.go": buildsOutsideHome,
	})
	if said := imports.FixtureBuilds(fset, files); len(said) != 0 {
		t.Fatalf("the guard names %v, though each build stands home or marked", said)
	}
}
