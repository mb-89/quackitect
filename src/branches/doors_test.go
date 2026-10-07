// The doors: no case here spawns a process, the disk doors name the files and
// keep a link, and a take and a dispatch run whole on the fakes.
// [[spec/tickets/branch-verbs-meet-fake-git]]
package branches // level0: InPackageTest - the cases build on the in-package helpers newTree, groupNote and dpTree, and reach the unexported disk doors link, unlink, names and filesUnder

import (
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"sync"
	"testing"

	"quackitect/src/imports"
	"quackitect/src/proc"
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
	to := ".se/deep/lib"
	if !one.d.link("lib", to) || one.read(to+"/x.txt") != "held" {
		t.Fatal("the link reads nothing")
	}
	one.d.unlink(to)
	if one.read("lib/x.txt") != "held" || one.read(to+"/x.txt") != "" {
		t.Fatal("the removal reaches past the link")
	}
}

// A take and a dispatch run whole over a runner taught no git, so a fixture or a verb reaching the real git door answers NotStarted and fails here. [[spec/tickets/branch-verbs-meet-fake-git]]
func TestATakeAndADispatchRunOnTheFakesAndSpawnNoGit(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose(), "new-group": groupNote})
	one.branch("g", map[string]string{ticketAt("g"): groupNote, ticketAt("kid"): childNote})
	var ran []string
	var mu sync.Mutex
	one.d.Run = func(said proc.Command) proc.Said {
		mu.Lock()
		ran = append(ran, strings.Join(said.Argv, " "))
		mu.Unlock()
		return one.run.Run(said)
	}
	if _, taught := one.run.Programs["git"]; taught {
		t.Fatal("the fixture's runner knows git")
	}
	if code := one.dpRun("--json"); code != codeOK {
		t.Fatalf("the dispatch answers %d: %s%s", code, one.out.String(), one.errs.String())
	}
	if one.peOriginTip(workBranch+"new-group") == "" {
		t.Fatal("the dispatch opens no branch")
	}
	if code := one.branchSays("take", "g"); code != codeOK {
		t.Fatalf("the take answers %d: %s%s", code, one.out.String(), one.errs.String())
	}
	if one.here() != "work/g" || heldIn(one.originShows("work/g", ticketAt("g"))) == nil {
		t.Fatal("the take claims nothing on origin")
	}
	for _, each := range ran {
		if each == "git" || strings.HasPrefix(each, "git ") {
			t.Fatalf("a verb spawns %q", each)
		}
	}
}
