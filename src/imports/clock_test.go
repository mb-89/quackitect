// The real-wait guard, named over a planted file and over every test the tree
// holds against the door audit.
// [[spec/guidance/code/testing]]
package imports

import (
	"go/ast"
	"go/parser"
	"go/token"
	"io/fs"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

// The note whose tables list every test reaching a real door. [[spec/design_output/doors#one-contract-test-per-door]]
const doorAudit = "spec/design_output/doors.md"

const plantedAudit = "| door | `a/listed_test.go` |\n| family | `b/*_test.go` |\n"

const plantedQuiet = `package p

import "testing"

func TestQuiet(t *testing.T) {}
`

const plantedWaits = `package p

import (
	"os"
	run "os/exec"
	"testing"
	"time"
)

func TestWaits(t *testing.T) {
	time.Sleep(time.Millisecond)
	_ = run.Command("go")
	_ = run.CommandContext(nil, "go")
	_, _ = os.StartProcess("go", nil, nil)
	_ = time.After(time.Second)
}
`

func TestASleepAndASpawnAreNamedThroughTheirImportNames(t *testing.T) {
	t.Parallel()
	file, err := parser.ParseFile(token.NewFileSet(), "p_test.go", plantedWaits, 0)
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"time.Sleep", "exec.Command", "exec.CommandContext", "os.StartProcess"}
	if said := RealWaits(file); !slices.Equal(said, want) {
		t.Fatalf("the real waits read %v, where %v stand", said, want)
	}
}

// A test waiting on the box is named where no span of the audit matches it, by its path or a glob. [[spec/tickets/audit-guard-fires-on-plant]]
func TestATestWaitingOutsideAPlantedAuditIsNamed(t *testing.T) {
	t.Parallel()
	parsed := func(text string) *ast.File {
		file, err := parser.ParseFile(token.NewFileSet(), "p_test.go", text, 0)
		if err != nil {
			t.Fatal(err)
		}
		return file
	}
	files := map[string]*ast.File{
		"a/listed_test.go":  parsed(plantedWaits),
		"b/globbed_test.go": parsed(plantedWaits),
		"c/outside_test.go": parsed(plantedWaits),
		"c/quiet_test.go":   parsed(plantedQuiet),
	}
	want := []string{"c/outside_test.go calls time.Sleep, exec.Command, exec.CommandContext, os.StartProcess"}
	if said := UnauditedWaits(plantedAudit, files); !slices.Equal(said, want) {
		t.Fatalf("the guard names %v, where %v stands", said, want)
	}
}

func TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit(t *testing.T) {
	t.Parallel()
	root := filepath.Join("..", "..")
	note, err := os.ReadFile(filepath.Join(root, doorAudit))
	if err != nil {
		t.Fatal(err)
	}
	files := map[string]*ast.File{}
	err = filepath.WalkDir(filepath.Join(root, "src"), func(at string, entry fs.DirEntry, err error) error {
		if err != nil || entry.IsDir() || !strings.HasSuffix(at, "_test.go") {
			return err
		}
		rel, err := filepath.Rel(root, at)
		if err != nil {
			return err
		}
		rel = filepath.ToSlash(rel)
		file, err := parser.ParseFile(token.NewFileSet(), at, nil, 0)
		if err != nil {
			return err
		}
		files[rel] = file
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(note), "_test.go`") {
		t.Fatalf("%s lists no test file", doorAudit)
	}
	for _, line := range UnauditedWaits(string(note), files) {
		t.Errorf("%s outside the door tests %s lists, so wait on a fake clock or readiness, or list it there", line, doorAudit)
	}
}
