// The purity guard over planted packages.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports_test

import (
	"slices"
	"testing"

	"quackitect/src/imports"
)

const reachesEveryKind = `package p

import (
	"crypto/rand"
	"database/sql"
	"net/http"
	"os"
	"os/exec"
	"time"

	ix "quackitect/src/index"
)

func Files() { os.ReadFile("a") }

func Runs() { exec.Command("git", "status") }

func Network() { http.Get("x") }

func Clock() time.Time { return time.Now() }

func Random() { rand.Read(nil) }

func Index() { ix.Ask() }

func Database() { sql.Open("a", "b") }

type door struct{}

func (door) Read() { os.Getenv("A") }
`

func TestAFunctionReachingTheOutsideIsNamed(t *testing.T) {
	t.Parallel()
	fset, files := parsed(t, map[string]string{"p/p.go": reachesEveryKind})
	want := []string{"p/p.go Clock", "p/p.go Database", "p/p.go Files", "p/p.go Index", "p/p.go Network", "p/p.go Random", "p/p.go Runs", "p/p.go door.Read"}
	if said := imports.ImpureFunctions(fset, files); !slices.Equal(said, want) {
		t.Fatalf("the guard names %v, not %v", said, want)
	}
}

const sparedReaches = `package s

import (
	"os"
	"strings"
	"time"
)

// Reads the variable. level0: Impure - it reads the environment once at start
func Doc() { os.Getenv("A") }

func Body() {
	// level0: Impure - the verb reads the tree
	os.ReadFile("a")
}

func Pure(a string) string { return strings.ToUpper(a) }

func Span(d time.Duration) time.Duration { return d * 2 }
`

func TestAMarkedAndAPureFunctionAreSpared(t *testing.T) {
	t.Parallel()
	fset, files := parsed(t, map[string]string{"s/s.go": sparedReaches})
	if said := imports.ImpureFunctions(fset, files); len(said) != 0 {
		t.Fatalf("the guard names %v, though each function stands marked or pure", said)
	}
}

func TestAnIOModuleAndATestFileAreSpared(t *testing.T) {
	t.Parallel()
	fset, files := parsed(t, map[string]string{
		"m/m.go":      "package m\n\nimport (\n\t\"os\"\n\n\t\"quackitect/src/q\"\n)\n\nfunc Register(c *q.Config) { q.IO() }\n\nfunc Read() { os.ReadFile(\"a\") }\n",
		"t/t_test.go": "package t_test\n\nimport \"os\"\n\nfunc helper() { os.ReadFile(\"a\") }\n",
	})
	if said := imports.ImpureFunctions(fset, files); len(said) != 0 {
		t.Fatalf("the guard names %v inside an IO module or a test file", said)
	}
}

func TestEveryOutsideKindNamesAGoName(t *testing.T) {
	t.Parallel()
	kinds := []string{"clock", "files", "git", "index", "network", "processes", "random"}
	for _, kind := range kinds {
		if len(imports.OutsideKinds[kind]) == 0 {
			t.Fatalf("the outside kind %s names no Go name", kind)
		}
	}
	if len(imports.OutsideKinds) != len(kinds) {
		t.Fatalf("the outside kinds read %v, not the seven", imports.OutsideKinds)
	}
}
