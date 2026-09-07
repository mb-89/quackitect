package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE CLASS, PLANTED, AND NOT THE HISTORY THIS TREE HAPPENS TO HOLD.
//
// The sweep this replaces read 176 real merges and carried a ledger of two ruled
// shas, so green meant "nobody has minted a new exception" rather than "the
// class is caught". Two commits say the same thing in milliseconds, and they can
// be shown red.

func aMergeTree(t *testing.T) (Roots, func(...string) string) {
	t.Helper()
	r := Roots{Method: filepath.Join("..", ".."), Work: t.TempDir()}
	git := func(args ...string) string {
		t.Helper()
		out, _ := gitHere(r, args...) // a conflicting merge exits non-zero on purpose
		return out
	}
	write := func(name, text string) {
		t.Helper()
		if err := os.WriteFile(filepath.Join(r.Work, name), []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	git("init", "--quiet", "--initial-branch", "main")
	git("config", "user.email", "a@b.c")
	git("config", "user.name", "a box")
	write("shared.txt", "the base\n")
	write("other.txt", "untouched\n")
	git("add", "shared.txt", "other.txt")
	git("commit", "--quiet", "-m", "the base")
	return r, git
}

func at(r Roots, name string) string { return filepath.Join(r.Work, name) }

// ONE SIDE MOVES THE FILE, THE OTHER LEAVES IT, AND THE MERGE WRITES A THIRD
// THING. There was nothing to resolve, so the work on the side that moved is
// gone. This is the whole class.
func TestAOneSidedMergeThatWritesAThirdThingIsNamed(t *testing.T) {
	r, git := aMergeTree(t)

	git("checkout", "--quiet", "-b", "moved")
	os.WriteFile(at(r, "shared.txt"), []byte("the work that was done\n"), 0o644)
	git("add", "shared.txt")
	git("commit", "--quiet", "-m", "the work")

	git("checkout", "--quiet", "main")
	os.WriteFile(at(r, "other.txt"), []byte("something else\n"), 0o644)
	git("add", "other.txt")
	git("commit", "--quiet", "-m", "elsewhere")

	// The mid-edit copy: a merge made from a working tree holding neither side.
	git("merge", "--quiet", "--no-commit", "--no-ff", "moved")
	os.WriteFile(at(r, "shared.txt"), []byte("a third thing nobody wrote\n"), 0o644)
	git("add", "shared.txt")
	git("commit", "--quiet", "-m", "the merge that ate the work")

	said := AMergeReverts(r, strings.TrimSpace(git("rev-parse", "HEAD")))
	if len(said) == 0 {
		t.Fatal("the merge kept neither parent on a file only one side moved, and it was not named")
	}
	if !namesTheFile(said, "shared.txt") {
		t.Errorf("the finding does not name the file whose work was lost: %v", said)
	}
	if namesTheFile(said, "other.txt") {
		t.Errorf("a file the merge did not lose was named: %v", said)
	}
}

// AND AN HONEST MERGE IS QUIET. Without this the detector could name every file
// and still pass the case above.
func TestAMergeThatKeepsOneSideIsNotNamed(t *testing.T) {
	r, git := aMergeTree(t)

	git("checkout", "--quiet", "-b", "moved")
	os.WriteFile(at(r, "shared.txt"), []byte("the work that was done\n"), 0o644)
	git("add", "shared.txt")
	git("commit", "--quiet", "-m", "the work")

	git("checkout", "--quiet", "main")
	os.WriteFile(at(r, "other.txt"), []byte("something else\n"), 0o644)
	git("add", "other.txt")
	git("commit", "--quiet", "-m", "elsewhere")

	git("merge", "--quiet", "--no-ff", "-m", "an honest merge", "moved")

	if said := AMergeReverts(r, strings.TrimSpace(git("rev-parse", "HEAD"))); len(said) != 0 {
		t.Errorf("an honest merge was named a revert: %v", said)
	}
}

// A CONFLICT BOTH SIDES MOVED IS A RESOLUTION, however little the result looks
// like either parent. Fifteen of the seventeen the old sweep found were this,
// and a detector that cannot tell them apart names the whole history.
func TestAResolutionBothSidesMovedIsNotARevert(t *testing.T) {
	r, git := aMergeTree(t)

	git("checkout", "--quiet", "-b", "moved")
	os.WriteFile(at(r, "shared.txt"), []byte("this side\n"), 0o644)
	git("add", "shared.txt")
	git("commit", "--quiet", "-m", "this side")

	git("checkout", "--quiet", "main")
	os.WriteFile(at(r, "shared.txt"), []byte("that side\n"), 0o644)
	git("add", "shared.txt")
	git("commit", "--quiet", "-m", "that side")

	git("merge", "--quiet", "--no-commit", "--no-ff", "moved")
	os.WriteFile(at(r, "shared.txt"), []byte("both, folded together\n"), 0o644)
	git("add", "shared.txt")
	git("commit", "--quiet", "-m", "resolved")

	if said := AMergeReverts(r, strings.TrimSpace(git("rev-parse", "HEAD"))); len(said) != 0 {
		t.Errorf("a resolution both sides moved was named a revert: %v", said)
	}
}

func namesTheFile(said []string, want string) bool {
	for _, s := range said {
		if strings.Contains(s, want) {
			return true
		}
	}
	return false
}
