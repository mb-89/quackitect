// The landing verbs commit, push and rename over a landing repository and a
// fake verb road.
// [[spec/tickets/landing-verbs-port-to-go]]
package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// A landing repository stands under a folder its test's name stays out of, however long the name runs. [[spec/tickets/landing-verbs-windows-green]]
func TestLandingRepoStandsUnderAShortFolder(t *testing.T) {
	t.Parallel()
	t.Run("sentinel, a case named past the Windows path limit "+strings.Repeat("x", 120), func(t *testing.T) {
		root, origin := landingRepo(t)
		for _, at := range []string{root, origin} {
			if strings.Contains(at, "sentinel") || len(filepath.Base(filepath.Dir(at))) > 32 {
				t.Fatalf("the repository stands at %s, which carries the test's name", at)
			}
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

// The doors over a repository: real git under the root, and fakes for the verbs the road runs, Vale, the log and the clock. The box stands in the cloud, and no claude stands on it. [[spec/tickets/landing-verbs-port-to-go]]
func fakeLanding(root string) (landingDoors, *verbsHeard, *[]map[string]any) {
	record := &verbsHeard{answers: map[string]verbAnswer{}}
	rows := &[]map[string]any{}
	return landingDoors{
		root:  root,
		cloud: true,
		verb: func(words ...string) (int, string) {
			record.ran = append(record.ran, words)
			said := record.answers[strings.Join(words, " ")]
			return said.code, said.said
		},
		voice: func(string) []heard { return nil },
		log:   func(row map[string]any) error { *rows = append(*rows, row); return nil },
		now:   func() time.Time { return time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC) },
	}, record, rows
}

// A repository on main holding an open ticket and a closed one, pushed to a bare origin. [[spec/tickets/landing-verbs-port-to-go]]
func landingRepo(t *testing.T) (string, string) {
	t.Helper()
	root := shortDir(t)
	origin := filepath.Join(shortDir(t), "origin.git")
	gitDoes(t, "", "init", "-q", "--bare", origin)
	gitDoes(t, "", "init", "-q", "-b", "main", root)
	for _, one := range [][]string{{"user.name", "a hand"}, {"user.email", "hand@example.invalid"}, {"commit.gpgsign", "false"}, {"core.autocrlf", "false"}} {
		gitDoes(t, root, "config", one[0], one[1])
	}
	lays(t, root, "spec/tickets/a-ticket.md", "---\nstate: open\n---\n\n# Ask\n")
	lays(t, root, "spec/tickets/shut.md", "---\nstate: closed\n---\n\n# Ask\n")
	lays(t, root, "README.md", "a tree\n")
	gitDoes(t, root, "add", "-A")
	gitDoes(t, root, "commit", "-q", "-m", "a-ticket: the tree opens")
	gitDoes(t, root, "remote", "add", "origin", origin)
	gitDoes(t, root, "push", "-q", "origin", "main")
	return root, origin
}

// A fresh folder under a short name. t.TempDir names its folder after the test, and a push into a bare origin there runs past the Windows path limit. [[spec/tickets/landing-verbs-windows-green]]
func shortDir(t *testing.T) string {
	t.Helper()
	at, err := os.MkdirTemp("", "land")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { os.RemoveAll(at) })
	return at
}

// Runs git under the dir, and stops the test where it fails. [[spec/tickets/landing-verbs-port-to-go]]
func gitDoes(t *testing.T, dir string, args ...string) string {
	t.Helper()
	run := exec.Command("git", args...)
	run.Dir = dir
	said, err := run.CombinedOutput()
	if err != nil {
		t.Fatalf("git %s answers %v: %s", strings.Join(args, " "), err, said)
	}
	return strings.TrimSpace(string(said))
}

// Writes a file under the root, its folder first. [[spec/tickets/landing-verbs-port-to-go]]
func lays(t *testing.T, root, path, text string) {
	t.Helper()
	at := filepath.Join(root, filepath.FromSlash(path))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}
