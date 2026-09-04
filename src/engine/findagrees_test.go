package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"testing"
)

// WHAT THE INDEX HOLDS IS WHAT A SEARCH ADMITS TO HOLDING.
//
// se_find answered nothing for dev_guide while nineteen files sat there, on
// disk and in the index's own file table. That one is fixed, and the fix has
// its own check: LIKE reads an underscore as a wildcard and SQLite has no
// default escape character, so dev_guide/ became a prefix nothing has.
//
// THE STANDING RULE IS WHAT THIS PINS, and it is bigger than that character. A
// path with a row in the file table and no answer from find is one index
// disagreeing with itself, and an answer of nothing reads exactly like a
// folder that is empty. The method sends every agent to the index rather than
// the disk, so nobody checks: three agents read one such answer as a deleted
// tree in a night, and one dropped a token over it.

// pathsFindCannotSee is the comparison, and it is the whole rule: every path
// the index holds that a search by that exact path answers nothing for.
//
// The lookup is a parameter because a rule that passes on a tree whose defect
// is already fixed proves nothing about itself. Handed a door that hides one
// file, this has to say which, and the check below is where it does.
func pathsFindCannotSee(held []string, answers func(path string) int) []string {
	var hidden []string
	for _, path := range held {
		if answers(path) == 0 {
			hidden = append(hidden, path)
		}
	}
	return hidden
}

// A CHECK THAT CANNOT GO RED PROVES NOTHING ABOUT THE RULE. This one is handed
// a search that does hide an indexed path, so the tree passing below means the
// tree and not the check.
func TestTheCheckSeesAPathTheSearchHides(t *testing.T) {
	t.Parallel()
	held := []string{"dev_guide/coverage.md", "plain/ordinary.md"}
	hidden := pathsFindCannotSee(held, func(path string) int {
		if path == "dev_guide/coverage.md" {
			return 0 // the underscore unescaped, the way it answered
		}
		return 1
	})
	if len(hidden) != 1 || hidden[0] != "dev_guide/coverage.md" {
		t.Fatalf("a search hiding one indexed path was read as %v", hidden)
	}
}

// AND OVER A TREE NOTHING IS HIDDEN, whatever is odd about its names and
// whatever git believes about them.
func TestEveryIndexedPathIsFound(t *testing.T) {
	t.Parallel()
	r := aTreeToIndex(t)
	withHistory(t, r.Work)
	git := func(args ...string) {
		t.Helper()
		cmd := exec.Command("git", args...)
		cmd.Dir = r.Work
		if out, err := cmd.CombinedOutput(); err != nil {
			t.Fatalf("git %s: %v\n%s", args[0], err, out)
		}
	}

	// THE NAMES LIKE HAS AN OPINION ABOUT, and one it has none about.
	const staged = "dev_guide/coverage.md"
	for _, name := range []string{
		staged,
		"dev_guide/levels/level-0-design.md",
		"100%/share.md",
		"plain/ordinary.md",
	} {
		p := filepath.Join(r.Work, filepath.FromSlash(name))
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte("the word we are looking for is quackitect\n"), 0o644); err != nil {
			t.Fatal(err)
		}
	}

	// AND ONE FILE GIT BELIEVES IS GONE WHILE IT SITS THERE. It is committed
	// and then dropped from git's index, which is the staged deletion a
	// person reads as D in git status, with the file still on the disk.
	git("add", "-A")
	git("commit", "--quiet", "-m", "the files as they stand")
	git("rm", "--cached", "--quiet", "--", filepath.FromSlash(staged))

	aFedDaemon(t, r, true)

	// BOTH HALVES COME THROUGH THE ONE DOOR, so neither is read off a
	// connection the other does not have.
	held, err := Ask(r, AskParams{SQL: "SELECT path FROM file ORDER BY path", Limit: askCeiling})
	if err != nil {
		t.Fatal(err)
	}
	var paths []string
	for _, row := range held.Rows {
		path, ok := row[0].(string)
		if !ok {
			t.Fatalf("the file table answered a path that is not a string: %v", row[0])
		}
		paths = append(paths, path)
	}
	if len(paths) == 0 {
		t.Fatal("the file table holds nothing, so this check asks nothing")
	}

	hidden := pathsFindCannotSee(paths, func(path string) int {
		got, err := Find(r, FindParams{Path: path})
		if err != nil {
			t.Fatalf("searching for %s: %v", path, err)
		}
		return got.Count
	})
	if len(hidden) > 0 {
		t.Errorf("the file table holds %d of %d path(s) a search answers nothing for: %v. "+
			"An answer of nothing reads as a path that is not there", len(hidden), len(paths), hidden)
	}
}
