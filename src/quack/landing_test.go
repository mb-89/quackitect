// The landing verbs commit, push and rename over a landing repository and a
// fake verb road.
// [[spec/tickets/landing-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/files"
	"quackitect/src/modules/git"
)

// A landing repository stands under a folder its test's name stays out of, however long the name runs. [[spec/tickets/landing-verbs-windows-green]]
func TestLandingRepoStandsUnderAShortFolder(t *testing.T) {
	t.Parallel()
	t.Run("sentinel, a case named past the Windows path limit "+strings.Repeat("x", 120), func(t *testing.T) {
		at := landingRepo(t).root
		if strings.Contains(at, "sentinel") || len(filepath.Base(filepath.Dir(at))) > 32 {
			t.Fatalf("the repository stands at %s, which carries the test's name", at)
		}
	})
}

// The verb runs the fake records, and what each verb answers by its words. [[spec/tickets/landing-verbs-port-to-go]]
type verbsHeard struct {
	ran     [][]string
	answers map[string]verbAnswer
}

// A verb's exit code and what it says. [[spec/tickets/landing-verbs-port-to-go]]
type verbAnswer struct {
	code int
	said string
}

// Whether the fake ran the verb the words name. [[spec/tickets/landing-verbs-port-to-go]]
func (heard *verbsHeard) reached(words string) bool {
	for _, one := range heard.ran {
		if strings.Join(one, " ") == words {
			return true
		}
	}
	return false
}

// The moment every landing case's clock and commit read. [[spec/tickets/landing-verbs-port-to-go]]
func caseNow() time.Time { return time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC) }

// The doors over a landing repository: its FakeRepo, and fakes for the verbs the road runs, Vale, the log and the clock. The box stands in the cloud, and no claude stands on it. [[spec/tickets/quack-repos-meet-fake-git]]
func fakeLanding(at *landing) (landingDoors, *verbsHeard, *[]map[string]any) {
	record := &verbsHeard{answers: map[string]verbAnswer{}}
	rows := &[]map[string]any{}
	return landingDoors{
		root:  at.root,
		git:   at.repo,
		cloud: true,
		verb: func(words ...string) (int, string) {
			record.ran = append(record.ran, words)
			said := record.answers[strings.Join(words, " ")]
			return said.code, said.said
		},
		voice: func(string) []heard { return nil },
		log:   func(row map[string]any) error { *rows = append(*rows, row); return nil },
		now:   caseNow,
		box:   quietBox(),
	}, record, rows
}

// A landing repository: its folder, the FakeRepo over that folder, and the origin it pushes to, in memory. [[spec/tickets/quack-repos-meet-fake-git]]
type landing struct {
	t      *testing.T
	root   string
	repo   *git.FakeRepo
	origin *git.FakeRepo
}

// The branch a landing repository opens on. [[spec/tickets/quack-repos-meet-fake-git]]
const trunkBranch = "main"

// A repository on main holding an open ticket and a closed one, pushed to an origin. [[spec/tickets/quack-repos-meet-fake-git]]
func landingRepo(t *testing.T) *landing {
	t.Helper()
	origin := git.NewFakeRepo(files.NewFakeDisk(), caseNow)
	at := landingOver(t, func(root string) *git.FakeRepo { return origin.Clone(files.NewDisk(root)) })
	at.origin = origin
	if pushed := at.repo.Push(trunkBranch, true); !pushed.OK {
		t.Fatal(pushed.Err)
	}
	return at
}

// The same repository with no origin, so a push refuses. [[spec/tickets/quack-repos-meet-fake-git]]
func landingAlone(t *testing.T) *landing {
	t.Helper()
	return landingOver(t, func(root string) *git.FakeRepo { return git.NewFakeRepo(files.NewDisk(root), caseNow) })
}

// The landing tree under a short folder, in the repository the maker builds over it, committed once. [[spec/tickets/quack-repos-meet-fake-git]]
func landingOver(t *testing.T, maker func(root string) *git.FakeRepo) *landing {
	t.Helper()
	at := &landing{t: t, root: shortDir(t)}
	at.repo = maker(at.root)
	at.repo.Set("user.name", "a hand")
	at.repo.Set("user.email", "hand@example.invalid")
	lays(t, at.root, "spec/tickets/a-ticket.md", "---\nstate: open\n---\n\n# Ask\n")
	lays(t, at.root, "spec/tickets/shut.md", "---\nstate: closed\n---\n\n# Ask\n")
	lays(t, at.root, "README.md", "a tree\n")
	at.commits("a-ticket: the tree opens")
	return at
}

// Stages every path and commits it, and stops the case where the repository refuses. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) commits(message string) {
	at.t.Helper()
	at.must(at.repo.AddAll())
	_, err := at.repo.Commit(message, nil)
	at.must(err)
}

// Fails the case where a fixture's move answers a fault. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) must(err error) {
	at.t.Helper()
	if err != nil {
		at.t.Fatal(err)
	}
}

// The commit HEAD names. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) head() string {
	said, _ := at.repo.Resolve("HEAD")
	return said
}

// The subject at HEAD. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) subject() string { return subjectOf(at.repo, "HEAD") }

// The subject origin holds on a branch. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) originSubject(branch string) string {
	return subjectOf(at.origin, "refs/heads/"+branch)
}

// The subject of the commit a ref names in a repository, or nothing. [[spec/tickets/quack-repos-meet-fake-git]]
func subjectOf(repo git.Repo, ref string) string {
	log, err := repo.Log("", ref, false)
	if err != nil || len(log) == 0 {
		return ""
	}
	return log[0].Subject
}

// The paths the index stages against HEAD, a move by its new path, one a line. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) staged() string {
	said, _ := at.repo.Staged(nil)
	var out []string
	for _, one := range said {
		out = append(out, one.Path)
	}
	return strings.Join(out, "\n")
}

// What HEAD's commit changes, a status and a path a line, a move read as its deletion and its addition. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) landed() string {
	said, _ := at.repo.Changed("HEAD")
	var out []string
	for _, one := range said {
		if one.From != "" {
			out = append(out, "D\t"+one.From, "A\t"+one.Path)
			continue
		}
		out = append(out, one.Status+"\t"+one.Path)
	}
	return strings.Join(out, "\n")
}

// The paths HEAD's commit changes, one a line. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) landedNames() string {
	said, _ := at.repo.Changed("HEAD")
	var out []string
	for _, one := range said {
		out = append(out, one.Path)
	}
	return strings.Join(out, "\n")
}

// Moves a path on disk and stages both sides, as git mv does. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) moves(from, to string) {
	at.t.Helper()
	at.must(realDisk().rename(filepath.Join(at.root, filepath.FromSlash(from)), filepath.Join(at.root, filepath.FromSlash(to))))
	at.must(at.repo.Add([]string{from, to}))
}

// A fresh folder under a short name. t.TempDir names its folder after the test, and a path under it runs past the Windows path limit. [[spec/tickets/landing-verbs-windows-green]]
func shortDir(t *testing.T) string {
	t.Helper()
	at, err := realDisk().makeTemp("", "land")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = realDisk().removeAll(at) })
	return at
}

// Writes a file under the root, its folder first. [[spec/tickets/landing-verbs-port-to-go]]
func lays(t *testing.T, root, path, text string) {
	t.Helper()
	hq1SeedDisk(t, realDisk(), root, map[string]string{path: text})
}
