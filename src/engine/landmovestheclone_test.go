package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// A REAL GIT, A REAL BARE ORIGIN AND THE REAL SCRIPT. What is under test is
// where git leaves HEAD and the working tree after a push, and a fed git would
// answer whatever it was told.
//
// The clone is on v4 with origin behind it, because land.sh names that remote
// and that branch.
func aCloneWithABareOrigin(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	bare := filepath.Join(root, "origin.git")
	clone := filepath.Join(root, "clone")
	mustGit(t, "", "init", "-q", "--bare", "--initial-branch=v4", bare)
	mustGit(t, "", "init", "-q", "--initial-branch=v4", clone)
	mustGit(t, clone, "config", "user.name", "t")
	mustGit(t, clone, "config", "user.email", "t@t")
	mustGit(t, clone, "remote", "add", "origin", bare)
	writeIn(t, clone, "landed.txt", "as it was\n")
	writeIn(t, clone, "kept.txt", "as it was\n")
	mustGit(t, clone, "add", "--", "landed.txt", "kept.txt")
	mustGit(t, clone, "commit", "-q", "--only", "-m", "the tree as it was", "landed.txt", "kept.txt")
	mustGit(t, clone, "push", "-q", "origin", "v4")
	return clone
}

func writeIn(t *testing.T, dir, rel, text string) {
	t.Helper()
	if err := os.WriteFile(filepath.Join(dir, rel), []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}

func readIn(t *testing.T, dir, rel string) string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join(dir, rel))
	if err != nil {
		t.Fatal(err)
	}
	return string(b)
}

// runLand runs the script the box actually lands through, from inside the
// clone, and answers what it printed.
func runLand(t *testing.T, clone, msg string, paths ...string) string {
	t.Helper()
	script, err := filepath.Abs(filepath.Join("..", "..", "util", "git", "land.sh"))
	if err != nil {
		t.Fatal(err)
	}
	cmd := exec.Command("sh", append([]string{script, msg}, paths...)...)
	cmd.Dir = clone
	cmd.Env = append(os.Environ(),
		"GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t",
		"GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t",
		"GIT_TERMINAL_PROMPT=0")
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("land.sh %s: %v\n%s", msg, err, out)
	}
	return string(out)
}

// theCommitItReported reads the hash off the line land.sh prints under PUSHED,
// which is the log --oneline of what went to origin.
func theCommitItReported(t *testing.T, out string) string {
	t.Helper()
	for _, line := range strings.Split(out, "\n") {
		if strings.TrimSpace(line) == "PUSHED" {
			continue
		}
		if fields := strings.Fields(line); len(fields) > 1 && strings.HasPrefix(out, "PUSHED") {
			return fields[0]
		}
	}
	t.Fatalf("land.sh reported no pushed commit:\n%s", out)
	return ""
}

func TestALandBringsTheCloneUpToWhatItPushed(t *testing.T) {
	clone := aCloneWithABareOrigin(t)
	writeIn(t, clone, "landed.txt", "as it is now\n")

	out := runLand(t, clone, "the file lands", "landed.txt")

	reported := theCommitItReported(t, out)
	if at := mustGit(t, clone, "rev-parse", "--short", "HEAD"); at != reported {
		t.Fatalf("HEAD is %s and land.sh reported pushing %s:\n%s", at, reported, out)
	}
	if at, tip := mustGit(t, clone, "rev-parse", "HEAD"), strings.Fields(mustGit(t, clone, "ls-remote", "origin", "v4"))[0]; at != tip {
		t.Fatalf("HEAD is %s and origin holds %s", at, tip)
	}
	if dirty := mustGit(t, clone, "status", "--porcelain"); dirty != "" {
		t.Fatalf("the landed paths were the only changes, so status should be clean, and it reads:\n%s", dirty)
	}
}

func TestALandLeavesAFileItWasNotGivenAlone(t *testing.T) {
	clone := aCloneWithABareOrigin(t)
	writeIn(t, clone, "landed.txt", "as it is now\n")
	writeIn(t, clone, "kept.txt", "dirty, and nobody has landed it\n")

	out := runLand(t, clone, "the file lands", "landed.txt")

	if held := readIn(t, clone, "kept.txt"); held != "dirty, and nobody has landed it\n" {
		t.Fatalf("a file the land was not given reads %q", held)
	}
	if carried, err := runGit(t, clone, "show", "origin/v4:kept.txt"); err != nil || carried != "as it was" {
		t.Fatalf("origin carries kept.txt as %q, %v", carried, err)
	}
	if dirty := mustGit(t, clone, "status", "--porcelain"); dirty != "M kept.txt" && dirty != " M kept.txt" {
		t.Fatalf("status should name kept.txt and nothing else, and it reads:\n%s\nland said:\n%s", dirty, out)
	}
}

// A FAST-FORWARD THAT CANNOT RUN LEAVES EVERYTHING WHERE IT WAS, including the
// index. The staging catchup does to get past its own landed paths is undone
// when the fast-forward is refused, or the next commit by name carries a path
// nobody asked for.
func TestARefusedFastForwardStagesNothing(t *testing.T) {
	clone := aCloneWithABareOrigin(t)

	// somebody else moves kept.txt on the branch tip
	elsewhere := filepath.Join(t.TempDir(), "elsewhere")
	mustGit(t, "", "clone", "-q", mustGit(t, clone, "remote", "get-url", "origin"), elsewhere)
	mustGit(t, elsewhere, "config", "user.name", "t")
	mustGit(t, elsewhere, "config", "user.email", "t@t")
	writeIn(t, elsewhere, "kept.txt", "moved by another hand\n")
	mustGit(t, elsewhere, "add", "--", "kept.txt")
	mustGit(t, elsewhere, "commit", "-q", "--only", "-m", "another hand", "kept.txt")
	mustGit(t, elsewhere, "push", "-q", "origin", "HEAD:v4")

	writeIn(t, clone, "landed.txt", "as it is now\n")
	writeIn(t, clone, "kept.txt", "dirty here, and unlanded\n")
	before := mustGit(t, clone, "rev-parse", "HEAD")

	out := runLand(t, clone, "the file lands", "landed.txt")

	if !strings.Contains(out, "CLONE LEFT AT") {
		t.Fatalf("the fast-forward had to be refused, and land said:\n%s", out)
	}
	if at := mustGit(t, clone, "rev-parse", "HEAD"); at != before {
		t.Fatalf("HEAD moved to %s over a working tree that would have been overwritten", at)
	}
	if held := readIn(t, clone, "kept.txt"); held != "dirty here, and unlanded\n" {
		t.Fatalf("a file the land was not given reads %q", held)
	}
	if staged, err := runGit(t, clone, "diff", "--cached", "--name-only"); err != nil || staged != "" {
		t.Fatalf("the refused fast-forward left %q staged, %v", staged, err)
	}
}
