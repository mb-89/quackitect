//go:build contract

// The contract of git: every work branch on origin answers with the ticket
// files directly under spec/tickets on its tip and trunk's copy of its group
// ticket, by name, on the fake and on a real repository.
// [[spec/design_output/model#the-fake-keeps-a-contract]]
package git

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"reflect"
	"testing"

	"quackitect/src/ticket"
)

// The hands a case moves the remote with. [[spec/design_output/model#the-fake-keeps-a-contract]]
type remote struct {
	push func(name string, files map[string]string)
	land func(files map[string]string)
	drop func(name string)
	add  func(second int64, files map[string]string)
	// Writes files into the checkout that no commit adds. [[spec/tickets/check-sweep-reads-tracked]]
	write func(files map[string]string)
}

func gitSuite(t *testing.T, one Git, hands remote) {
	tips := func() []ticket.Tip {
		t.Helper()
		said, err := one.Tips()
		if err != nil {
			t.Fatal(err)
		}
		return said
	}
	if said := tips(); len(said) != 0 {
		t.Fatalf("a remote with no work branch answers %+v", said)
	}
	hands.land(map[string]string{"spec/tickets/the-group.md": "trunk's copy\n", "spec/tickets/shared.md": "shared\n", "spec/tickets/dropped.md": "dropped\n"})
	hands.push("the-group", map[string]string{
		"spec/tickets/the-group.md":   "the tip's copy\n",
		"spec/tickets/a-child.md":     "a child\n",
		"spec/tickets/shared.md":      "shared\n",
		"spec/tickets/nested/deep.md": "no ticket\n",
		"spec/tickets/notes.txt":      "no note\n",
		"spec/other.md":               "outside\n",
	})
	hands.push("another", map[string]string{"spec/tickets/another.md": "its own\n"})
	want := []ticket.Tip{
		{Name: "another", Files: []ticket.File{{Path: "spec/tickets/another.md", Text: "its own\n"}},
			Gone: []string{"spec/tickets/dropped.md", "spec/tickets/shared.md", "spec/tickets/the-group.md"}},
		{Name: "the-group", Trunk: "trunk's copy\n", Files: []ticket.File{
			{Path: "spec/tickets/a-child.md", Text: "a child\n"},
			{Path: "spec/tickets/the-group.md", Text: "the tip's copy\n"},
		}, Gone: []string{"spec/tickets/dropped.md"}},
	}
	if said := tips(); !reflect.DeepEqual(said, want) {
		t.Fatalf("the remote answers %+v, and wants %+v", said, want)
	}
	hands.land(map[string]string{"spec/tickets/nested/deep.md": "no ticket\n", "spec/other.md": "outside\n"})
	trunk, err := one.Trunk()
	if err != nil {
		t.Fatal(err)
	}
	if wantTrunk := []ticket.File{{Path: "spec/tickets/dropped.md", Text: "dropped\n"}, {Path: "spec/tickets/shared.md", Text: "shared\n"}, {Path: "spec/tickets/the-group.md", Text: "trunk's copy\n"}}; !reflect.DeepEqual(trunk, wantTrunk) {
		t.Fatalf("trunk answers %+v, and wants %+v", trunk, wantTrunk)
	}
	hands.drop("another")
	if said := tips(); len(said) != 1 || said[0].Name != "the-group" {
		t.Fatalf("a deleted branch leaves, and the remote answers %+v", said)
	}
	stoodSuite(t, one, hands)
}

// The checkout's history answers the second each path under the ticket folder came in, and a path outside it stands nowhere. [[spec/tickets/verbs-queue-order]]
func stoodSuite(t *testing.T, one Git, hands remote) {
	t.Helper()
	if said, err := one.Stood(); err != nil || len(said) != 0 {
		t.Fatalf("a checkout adding no ticket answers %v, %v", said, err)
	}
	hands.add(1_700_000_000, map[string]string{"spec/tickets/first.md": "one\n", "spec/other.md": "outside\n"})
	hands.add(1_700_086_400, map[string]string{"spec/tickets/second.md": "two\n"})
	want := map[string]int64{"spec/tickets/first.md": 1_700_000_000, "spec/tickets/second.md": 1_700_086_400}
	if said, err := one.Stood(); err != nil || !reflect.DeepEqual(said, want) {
		t.Fatalf("the checkout answers %v, %v, and wants %v", said, err, want)
	}
	trackedSuite(t, one, hands)
}

// The checkout answers every path its history adds, and no file written beside them. [[spec/tickets/check-sweep-reads-tracked]]
func trackedSuite(t *testing.T, one Git, hands remote) {
	t.Helper()
	hands.write(map[string]string{"spec/scratch.md": "untracked\n"})
	said, err := one.Tracked()
	if err != nil {
		t.Fatal(err)
	}
	held := map[string]bool{}
	for _, at := range said {
		held[at] = true
	}
	for _, at := range []string{"spec/tickets/first.md", "spec/other.md", "spec/tickets/second.md"} {
		if !held[at] {
			t.Fatalf("the checkout answers %v, and wants %s, which its history adds", said, at)
		}
	}
	if held["spec/scratch.md"] {
		t.Fatalf("the checkout answers %v, and wants no spec/scratch.md, which no commit adds", said)
	}
}

func TestGitKeepsItsContract(t *testing.T) {
	t.Run("fake", func(t *testing.T) {
		fake := NewFake()
		gitSuite(t, fake, remote{push: fake.Push, land: fake.Land, drop: fake.Drop, add: func(second int64, files map[string]string) {
			for at := range files {
				fake.Add(second, at)
			}
		}, write: func(map[string]string) {}})
	})
	t.Run("real", func(t *testing.T) {
		origin, local := scratch(t)
		gitSuite(t, New(local), remote{
			push: func(name string, files map[string]string) {
				run(t, origin, "checkout", "-q", "-B", "work/"+name, "main")
				run(t, origin, "rm", "-rq", "--ignore-unmatch", "spec")
				committed(t, origin, files)
				run(t, origin, "checkout", "-q", "main")
				run(t, local, "fetch", "-q", "--prune", "origin")
			},
			land: func(files map[string]string) {
				committed(t, origin, files)
				run(t, local, "fetch", "-q", "--prune", "origin")
			},
			drop: func(name string) {
				run(t, origin, "branch", "-q", "-D", "work/"+name)
				run(t, local, "fetch", "-q", "--prune", "origin")
			},
			add: func(second int64, files map[string]string) {
				t.Setenv("GIT_COMMITTER_DATE", fmt.Sprintf("@%d +0000", second))
				committed(t, local, files)
			},
			write: func(files map[string]string) { written(t, local, files) },
		})
	})
}

// The bus caps a message at 64 MiB. [[spec/tickets/seed-splits-under-bus-cap]]
const busCap = 64 << 20

// The tips this checkout reads off origin land under the bus cap. [[spec/tickets/tips-carry-branch-changes-alone]]
func TestTheLiveTipsLandUnderTheBusCap(t *testing.T) {
	tips, err := New(filepath.Join("..", "..", "..")).Tips()
	if err != nil {
		t.Fatal(err)
	}
	if len(tips) == 0 {
		t.Skip("no work branch stands on origin")
	}
	all, err := json.Marshal(tips)
	if err != nil {
		t.Fatal(err)
	}
	if len(all) > busCap {
		t.Fatalf("the tips carry %d bytes over %d branches, past the bus cap of %d", len(all), len(tips), busCap)
	}
}

// A shallow clone reads its ages again once a fetch deepens it, though HEAD stands still. [[spec/tickets/verbs-queue-order]]
func TestADeepenedCloneReadsItsAgesAgain(t *testing.T) {
	origin, _ := scratch(t)
	t.Setenv("GIT_COMMITTER_DATE", "@1700000000 +0000")
	committed(t, origin, map[string]string{"spec/tickets/old.md": "old\n"})
	t.Setenv("GIT_COMMITTER_DATE", "@1700086400 +0000")
	committed(t, origin, map[string]string{"spec/tickets/new.md": "new\n"})
	shallow := filepath.Join(t.TempDir(), "shallow")
	run(t, ".", "clone", "-q", "--depth", "1", "file://"+origin, shallow)
	one := New(shallow)
	if said, _ := one.Stood(); said["spec/tickets/old.md"] != 1_700_086_400 {
		t.Fatalf("a shallow clone dates every file to its boundary, and answers %v", said)
	}
	run(t, shallow, "fetch", "-q", "--unshallow")
	if said, _ := one.Stood(); said["spec/tickets/old.md"] != 1_700_000_000 {
		t.Fatalf("the deepened clone answers %v, and wants old.md at its own second", said)
	}
}

// A repository standing as origin, and a clone of it. [[spec/design_output/model#the-fake-keeps-a-contract]]
func scratch(t *testing.T) (origin, local string) {
	t.Helper()
	root := t.TempDir()
	origin, local = filepath.Join(root, "origin"), filepath.Join(root, "local")
	run(t, root, "init", "-q", "-b", "main", origin)
	committed(t, origin, map[string]string{"README": "a tree\n"})
	run(t, root, "clone", "-q", origin, local)
	return origin, local
}

func committed(t *testing.T, dir string, files map[string]string) {
	t.Helper()
	written(t, dir, files)
	run(t, dir, "add", "-A")
	run(t, dir, "commit", "-q", "--allow-empty", "-m", "a step")
}

// [[spec/tickets/check-sweep-reads-tracked]]
func written(t *testing.T, dir string, files map[string]string) {
	t.Helper()
	for at, text := range files {
		full := filepath.Join(dir, filepath.FromSlash(at))
		if err := os.MkdirAll(filepath.Dir(full), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(full, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

func run(t *testing.T, dir string, args ...string) {
	t.Helper()
	cmd := exec.Command("git", append([]string{"-c", "user.name=contract", "-c", "user.email=contract@example.invalid", "-c", "commit.gpgsign=false"}, args...)...)
	cmd.Dir = dir
	if said, err := cmd.CombinedOutput(); err != nil {
		t.Fatalf("git %v answers %v: %s", args, err, said)
	}
}
