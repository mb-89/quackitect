package main

import (
	"bytes"
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE GUARD IS ASKED FOR BY ITS OWN WORDS, the way the removal guard is: a
// call from an agent holding nothing is refused by the gate whatever it says,
// so each case names the sentence this guard writes and no other.
const (
	saidStrangers = "A COMMIT CARRIES ONLY THE PATHS IT NAMES"
	saidStageAll  = "A STAGE OF EVERYTHING IS REFUSED"
)

// aRepository makes the fixture's work root a git repository with an identity
// to commit under.
func aRepository(t *testing.T, r Roots) {
	t.Helper()
	gitAt(t, r.Work, "init", "-q")
	gitAt(t, r.Work, "config", "user.email", "fixture@example.invalid")
	gitAt(t, r.Work, "config", "user.name", "fixture")
}

// runVerb puts a command to the run verb the way a shell or the lane does,
// naming a token, and answers what the verb wrote.
func runVerb(t *testing.T, r Roots, id, command string) map[string]any {
	t.Helper()
	var out, said bytes.Buffer
	c := &call{ctx: context.Background(), roots: r,
		args: []string{"--on", id, "--by", "main", "--command", command},
		in:   strings.NewReader(""), out: &out, err: &said}
	runRun(c)
	got := map[string]any{}
	if err := json.Unmarshal(out.Bytes(), &got); err != nil {
		t.Fatalf("the run verb answered %q on the answer stream and %q on the reason stream", out.String(), said.String())
	}
	return got
}

// A COMMIT MADE WHILE ANOTHER PATH IS STAGED CARRIES ONLY THE PATHS IT NAMED.
//
// This half is git's own: with a pathspec, git commit is --only. It is driven
// through the real door all the same, so the guard that refuses the other
// shapes is seen letting this one through, and the other hand's stage is
// seen standing where it was.
func TestACommitCarriesOnlyItsOwnPaths(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	tok := mintStandard(t, r, "a commit of mine")
	aRepository(t, r)
	mine := filepath.Join(r.Work, "mine.txt")
	theirs := filepath.Join(r.Work, "theirs.txt")
	for _, p := range []string{mine, theirs} {
		if err := os.WriteFile(p, []byte("one\n"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	gitAt(t, r.Work, "add", "--", "mine.txt", "theirs.txt")
	gitAt(t, r.Work, "commit", "-q", "-m", "the base")

	// ANOTHER HAND STAGES ITS CHANGE, and this one changes its own file.
	if err := os.WriteFile(theirs, []byte("two\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	gitAt(t, r.Work, "add", "--", "theirs.txt")
	if err := os.WriteFile(mine, []byte("two\n"), 0o644); err != nil {
		t.Fatal(err)
	}

	got := runVerb(t, r, tok.ID, `git commit -q -m "mine alone" mine.txt`)
	if why, refused := got["error"]; refused {
		t.Fatalf("a commit naming its path was refused: %v", why)
	}
	if exit, _ := got["exit"].(float64); exit != 0 {
		t.Fatalf("the commit answered %v: %v", exit, got["output"])
	}
	if names := gitAt(t, r.Work, "show", "--name-only", "--format=", "HEAD"); names != "mine.txt" {
		t.Fatalf("the commit carries %q, and mine.txt was the one path named", names)
	}
	if staged := gitAt(t, r.Work, "diff", "--cached", "--name-only"); staged != "theirs.txt" {
		t.Fatalf("the other hand's stage is %q after the commit, and it should stand where it was", staged)
	}
}

// A COMMIT WITH NO PATH NAMED, AND A STAGE OF EVERYTHING, ARE REFUSED AT BOTH
// DOORS: the harness's Bash, through the hook, and the run verb.
func TestACommitNamesItsPaths(t *testing.T) {
	t.Parallel()
	r, run, _ := removalTree(t)

	cases := []struct {
		name    string
		command string
		said    string // the refusal expected, or nothing
	}{
		{"a commit naming no path", `git commit -m "x"`, saidStrangers},
		{"a commit of everything", `git commit -a -m "x"`, saidStrangers},
		{"a commit of everything, clustered", `git commit -am "x"`, saidStrangers},
		{"a commit of everything, spelt out", `git commit --all -m x`, saidStrangers},
		{"a commit including the index", `git commit -m x -i a.go`, saidStrangers},
		{"an amend with no path", `git commit --amend --no-edit`, saidStrangers},
		{"a commit from a message file, no path", `git commit -F msg.txt`, saidStrangers},
		{"a commit in another folder", `git -C ` + r.Work + ` commit -m x`, saidStrangers},
		{"a commit after a cd", `cd src && git commit -m "x"`, saidStrangers},
		{"a stage of everything", `git add -A`, saidStageAll},
		{"a stage of everything, spelt out", `git add --all`, saidStageAll},
		{"a stage of the dot", `git add .`, saidStageAll},
		// THE ALLOWED SHAPES, which keep this from being a ban on git.
		{"a commit naming its path", `git commit -m "x" a.go`, ""},
		{"a commit naming its paths, with --only", `git commit --only -m "x" a.go b.go`, ""},
		{"a commit from a message file, with paths", `git commit -q -F msg.txt -- a.go`, ""},
		{"a message that could be a path", `git commit -m x -- a.go`, ""},
		{"a stage naming its path", `git add a.go`, ""},
		{"a stage after the dashes", `git add -- a.go`, ""},
		{"git status", `git status`, ""},
		{"git log", `git log --oneline`, ""},
		// A SENTENCE CARRYING THE WORDS IS NOT A COMMIT.
		{"prose in an echo", `echo "git commit -m x"`, ""},
		{"prose in a detail", `./.bin/se work --by worker-elm --title "x" --detail "git commit -m x is refused"`, ""},
		{"prose in a message", `git commit -m "add -A is refused" a.go`, ""},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			said := run(c.command)
			for _, other := range []string{saidStrangers, saidStageAll} {
				got := strings.Contains(said, other)
				if got != (other == c.said) {
					t.Fatalf("refused with %q: %v, want %v. The guard said: %s", other, got, other == c.said, said)
				}
			}
		})
	}

	// AND THE RUN VERB IS THE SAME DOOR WITH A TOKEN ON IT. It runs the command
	// itself, without the hook, so the guard is asked there too.
	tok := mintStandard(t, r, "a commit by verb")
	aRepository(t, r)
	for _, c := range []struct{ command, said string }{
		{`git commit -m "x"`, saidStrangers},
		{`git add -A`, saidStageAll},
	} {
		got := runVerb(t, r, tok.ID, c.command)
		why, _ := got["error"].(string)
		if !strings.Contains(why, c.said) {
			t.Fatalf("the run verb let %s through: %v", c.command, got)
		}
	}
	got := runVerb(t, r, tok.ID, `git status --short`)
	if why, refused := got["error"]; refused {
		t.Fatalf("the run verb refused git status: %v", why)
	}
}
