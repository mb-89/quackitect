// The pull's shell over the process door's fake runner.
// [[spec/design_output/doors#the-process-door]]
package pull

import (
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	"quackitect/src/imports"
	"quackitect/src/proc"
)

// The pull's cases run on the fakes, so they spawn no git, and the doors chapter lists them among no test reaching a real door. [[spec/tickets/pull-meets-fake-git]]
func TestThePullCasesSpawnNothingAndTheDoorsChapterListsThemNowhere(t *testing.T) {
	t.Parallel()
	for _, name := range []string{"pull_test.go", "pull_clear_test.go"} {
		file, err := parser.ParseFile(token.NewFileSet(), name, nil, 0)
		if err != nil {
			t.Fatal(err)
		}
		if waits := imports.RealWaits(file); len(waits) > 0 {
			t.Errorf("%s calls %v, where the pull's cases run on FakeRepo and FakeRunner", name, waits)
		}
	}
	note, err := os.ReadFile(filepath.Join("..", "..", "spec", "design_output", "doors.md"))
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(note), "`src/pull/pull_test.go`") {
		t.Error("spec/design_output/doors.md still lists src/pull/pull_test.go as a test reaching a real door")
	}
}

func TestTheShellRunsALineThroughShInTheRootAndReadsAProgramThatNeverStartsAsAFault(t *testing.T) {
	t.Parallel()
	var ran []proc.Command
	sh := &proc.FakeRunner{Programs: map[string]proc.Program{"sh": func(one proc.Command) proc.Said {
		ran = append(ran, one)
		return proc.Said{Out: "said\n", Err: "warned\n", Code: 3}
	}}}
	out, exit, err := ShellOver(sh.Run, "the/root")("echo said; exit 3")
	if out != "said\n" || exit != 3 || err != nil {
		t.Errorf("the shell answers %q, %d, %v", out, exit, err)
	}
	want := []proc.Command{{Argv: []string{"sh", "-c", "echo said; exit 3"}, Dir: "the/root"}}
	if !reflect.DeepEqual(ran, want) {
		t.Errorf("the shell runs %+v, and wants %+v", ran, want)
	}
	nobody := &proc.FakeRunner{}
	if _, _, err := ShellOver(nobody.Run, "the/root")("echo said"); err == nil {
		t.Error("the shell reads a program that never starts as no fault")
	}
	killed := &proc.FakeRunner{Programs: map[string]proc.Program{"sh": func(proc.Command) proc.Said { return proc.Said{Err: "killed", Code: proc.Signalled} }}}
	if _, _, err := ShellOver(killed.Run, "the/root")("echo said"); err == nil || err.Error() != "killed" {
		t.Errorf("the shell reads a run a signal ends as %v, and wants its fault", err)
	}
}
