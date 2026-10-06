// The disk doors: the names in a folder, the files under one, and a link.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"quackitect/src/imports"
)

// The branch verbs' cases run on FakeRepo, FakeRunner and FakeDisk, so no test file here spawns or sleeps, and the doors chapter lists none of them among the tests reaching a real door. [[spec/tickets/branch-verbs-meet-fake-git]]
func TestTheBranchVerbCasesSpawnNothingAndTheDoorsChapterListsThemNowhere(t *testing.T) {
	t.Parallel()
	names, err := filepath.Glob("*_test.go")
	if err != nil || len(names) == 0 {
		t.Fatalf("the package's test files read %v, %v", names, err)
	}
	note, err := os.ReadFile(filepath.Join("..", "..", "spec", "design_output", "doors.md"))
	if err != nil {
		t.Fatal(err)
	}
	for _, name := range names {
		file, err := parser.ParseFile(token.NewFileSet(), name, nil, 0)
		if err != nil {
			t.Fatal(err)
		}
		if waits := imports.RealWaits(file); len(waits) > 0 {
			t.Errorf("%s calls %v, where the branch verbs' cases run on FakeRepo, FakeRunner and FakeDisk", name, waits)
		}
		if strings.Contains(string(note), "`src/branches/"+name+"`") {
			t.Errorf("spec/design_output/doors.md still lists src/branches/%s as a test reaching a real door", name)
		}
	}
}

// A folder names its files in name order and leaves its folders out, and a walk names every file under it. [[spec/design_output/doors#one-door-per-outside-thing]]
func TestTheDiskDoorsNameTheFiles(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{"notes/b.md": "b", "notes/a.md": "a", "notes/deep/c.md": "c"})
	if got := one.d.names("notes"); !slices.Equal(got, []string{"a.md", "b.md"}) {
		t.Fatalf("the folder names %v", got)
	}
	if got := one.d.filesUnder("notes"); !slices.Equal(got, []string{"notes/a.md", "notes/b.md", "notes/deep/c.md"}) {
		t.Fatalf("the walk names %v", got)
	}
	if got := one.d.names("none"); got != nil {
		t.Fatalf("a missing folder names %v", got)
	}
}

// A link reads what it names, and its removal leaves that standing. [[spec/design_output/review#a-worktree-runs-the-check]]
func TestALinkLeavesWhatItNames(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{"lib/x.txt": "held"})
	to := filepath.Join(t.TempDir(), "deep", "lib")
	if !one.d.link("lib", to) || readFile(filepath.Join(to, "x.txt")) != "held" {
		t.Fatal("the link reads nothing")
	}
	unlink(to)
	if one.read("lib/x.txt") != "held" || readFile(filepath.Join(to, "x.txt")) != "" {
		t.Fatal("the removal reaches past the link")
	}
}
