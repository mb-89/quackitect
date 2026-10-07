// The real-wait guard, named over a planted file and over every test the tree
// holds against the door audit.
// [[spec/guidance/code/testing]]
package imports_test

import (
	"go/ast"
	"go/parser"
	"go/token"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"quackitect/src/imports"
	"quackitect/src/modules/files"
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

	"quackitect/src/proc"
)

func TestWaits(t *testing.T) {
	time.Sleep(time.Millisecond)
	_ = run.Command("go")
	_ = run.CommandContext(nil, "go")
	_, _ = os.StartProcess("go", nil, nil)
	_ = proc.Real(proc.Command{Argv: []string{"go"}})
	_ = time.After(time.Second)
}
`

func TestASleepAndASpawnAreNamedThroughTheirImportNames(t *testing.T) {
	t.Parallel()
	file, err := parser.ParseFile(token.NewFileSet(), "p_test.go", plantedWaits, 0)
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"time.Sleep", "exec.Command", "exec.CommandContext", "os.StartProcess", "proc.Real"}
	if said := imports.RealWaits(file); !slices.Equal(said, want) {
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
	want := []string{"c/outside_test.go calls time.Sleep, exec.Command, exec.CommandContext, os.StartProcess, proc.Real"}
	if said := imports.UnauditedWaits(plantedAudit, files); !slices.Equal(said, want) {
		t.Fatalf("the guard names %v, where %v stands", said, want)
	}
}

func TestASpanMatchingNoFileIsNamed(t *testing.T) {
	t.Parallel()
	if said := imports.StaleSpans(plantedAudit+"a suffix: `_contract_test.go`, a door: `.d/gone.js`, `.d/here.js`\n", []string{"a/listed_test.go", "c/other_test.go", ".d/here.js"}); !slices.Equal(said, []string{"b/*_test.go", ".d/gone.js"}) {
		t.Fatalf("the guard names %v, where b/*_test.go and .d/gone.js alone match no file, and the bare suffix names no path", said)
	}
}

func TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit(t *testing.T) {
	t.Parallel()
	tree := files.NewDisk(filepath.Join("..", ".."))
	note, _, err := tree.Read(doorAudit)
	if err != nil {
		t.Fatal(err)
	}
	listed, err := tree.List("src")
	if err != nil {
		t.Fatal(err)
	}
	parsed := map[string]*ast.File{}
	for _, rel := range listed {
		if !strings.HasSuffix(rel, "_test.go") {
			continue
		}
		text, _, err := tree.Read(rel)
		if err != nil {
			t.Fatal(err)
		}
		file, err := parser.ParseFile(token.NewFileSet(), rel, text, 0)
		if err != nil {
			t.Fatal(err)
		}
		parsed[rel] = file
	}
	if !strings.Contains(note, "_test.go`") {
		t.Fatalf("%s lists no test file", doorAudit)
	}
	held := append([]string{}, listed...)
	for _, folder := range []string{"test", ".claude", "spec"} {
		more, err := tree.List(folder)
		if err != nil {
			t.Fatal(err)
		}
		held = append(held, more...)
	}
	for _, span := range imports.StaleSpans(note, held) {
		t.Errorf("%s names %s, and no file the tree holds matches it", doorAudit, span)
	}
	for _, line := range imports.UnauditedWaits(note, parsed) {
		t.Errorf("%s outside the door tests %s lists, so wait on a fake clock or readiness, or list it there", line, doorAudit)
	}
}
