// The real-wait guard, named over a planted file and over every test the tree
// holds against the door audit.
// [[spec/guidance/code/testing]]
package imports

import (
	"go/parser"
	"go/token"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"testing"
)

// The note whose tables list every test reaching a real door. [[spec/design_output/doors#one-contract-test-per-door]]
const doorAudit = "spec/design_output/doors.md"

// A code span in the audit naming a Go test file, or a glob of them.
var auditedTest = regexp.MustCompile("`([^`]+_test\\.go)`")

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
	want := []string{"time.Sleep", "exec.Command", "os.StartProcess"}
	if said := RealWaits(file); !slices.Equal(said, want) {
		t.Fatalf("the real waits read %v, where %v stand", said, want)
	}
}

func TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit(t *testing.T) {
	t.Parallel()
	root := filepath.Join("..", "..")
	note, err := os.ReadFile(filepath.Join(root, doorAudit))
	if err != nil {
		t.Fatal(err)
	}
	listed := []string{}
	for _, span := range auditedTest.FindAllStringSubmatch(string(note), -1) {
		listed = append(listed, span[1])
	}
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
		waits := RealWaits(file)
		if len(waits) > 0 && !slices.ContainsFunc(listed, func(glob string) bool { ok, _ := path.Match(glob, rel); return ok }) {
			t.Errorf("%s calls %s outside the door tests %s lists, so wait on a fake clock or readiness, or list it there", rel, strings.Join(waits, ", "), doorAudit)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(listed) == 0 {
		t.Fatalf("%s lists no test file", doorAudit)
	}
}
