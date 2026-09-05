package main

import (
	"os"
	"os/exec"
	"sort"
	"strings"
	"testing"
)

// THE DELTA IS THE TOKEN'S OWN WRITES, NOT THE TREE'S.
//
// se test reads a delta as the tree against the snapshot taken when the token
// was taken up. Where several agents work one tree, that is every hand's
// uncommitted work rather than the holder's change: a token that wrote three
// files came back with fifty-seven entries, and the whole battery was ruled on
// util/checks/scripts-are-lf.mjs, a file that token never wrote. A whole ruling
// is meant to say this change is wide enough to need everything. There it said
// another hand's was.
//
// THE RECORD ALREADY SAYS WHOSE WRITE IS WHOSE. Every apply journals an entry
// under .se/undo carrying the token it was made on and the files it touched.
//
// AND WHERE IT SAYS NOTHING, NOTHING IS DROPPED. A write made by a shell command
// is in no journal, so a token with no apply on record keeps the whole diff and
// the answer says why. A write the engine cannot prove is a write it will not
// silently drop.

// theCommit is the snapshot a delta is read against, which is what taking a
// token up records on it.
func theCommit(t *testing.T, dir string) string {
	t.Helper()
	cmd := exec.Command("git", "rev-parse", "HEAD")
	cmd.Dir = dir
	out, err := cmd.Output()
	if err != nil {
		t.Fatalf("git rev-parse: %v", err)
	}
	return strings.TrimSpace(string(out))
}

// aTokenTaking mints a token and writes the snapshot on it, which is what a
// take-up does. It is local, so the token file itself is private material and
// stays out of every delta here.
func aTokenTaking(t *testing.T, r Roots, since string) string {
	t.Helper()
	tok, err := Mint(r, Token{Tracked: local(), Process: "queued", Title: "one hand's work", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	tok.Began = append(tok.Began, since)
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	return tok.ID
}

// wrote applies one file under the token named, which is what puts the write in
// the record under that name.
func wrote(t *testing.T, r Roots, on, file, text string) {
	t.Helper()
	if _, err := Apply(r, []Edit{{File: file, Op: "create", New: text}}, false, on, "worker-"+on); err != nil {
		t.Fatalf("applying %s on %s: %v", file, on, err)
	}
}

// ONE TREE, TWO TOKENS, AND THE THREE CASES THE NARROWING HAS.
func TestTheDeltaIsWhatThisTokenWrote(t *testing.T) {
	t.Parallel()
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)
	writeWorkableProcess(t, dir, "queued")
	head := theCommit(t, dir)

	mine := aTokenTaking(t, r, head)
	theirs := aTokenTaking(t, r, head)
	wrote(t, r, mine, "one.md", "# one\n")
	wrote(t, r, mine, "two.md", "# two\n")
	wrote(t, r, mine, "three.md", "# three\n")
	// THE OTHER HAND WRITES A WHOLE TRIGGER, in the same tree, at the same time.
	wrote(t, r, theirs, "util/checks/scripts-are-lf.mjs", "// another hand\n")

	got, err := TestTheDelta(r, db, mine, nil, false, "worker-mine")
	if err != nil {
		t.Fatal(err)
	}
	var paths []string
	for _, ch := range got.Delta {
		paths = appendOnce(paths, ch.Path)
	}
	sort.Strings(paths)
	if strings.Join(paths, ",") != "one.md,three.md,two.md" {
		t.Errorf("the delta is not this token's own three writes: %v", paths)
	}
	if got.Whole {
		t.Errorf("another hand's check ruled the whole battery on a token that never "+
			"wrote it: %s", got.WhyWhole)
	}

	// AND A TOKEN WITH NOTHING ON RECORD KEEPS THE WHOLE DIFF, AND SAYS SO.
	empty := aTokenTaking(t, r, head)
	blank, err := TestTheDelta(r, db, empty, nil, false, "worker-empty")
	if err != nil {
		t.Fatal(err)
	}
	if len(blank.Delta) <= len(got.Delta) {
		t.Errorf("a token with nothing on record was narrowed to %d changes", len(blank.Delta))
	}
	if !blank.Whole || !strings.Contains(blank.WhyWhole, "nothing in the record") ||
		!strings.Contains(blank.WhyWhole, empty) {
		t.Errorf("the answer does not name the empty record: whole %v, %q", blank.Whole, blank.WhyWhole)
	}

	// The other hand's file is really there, so the case above is about the
	// narrowing and not about a write that never landed.
	if _, err := os.Stat(dir + "/util/checks/scripts-are-lf.mjs"); err != nil {
		t.Fatalf("the other hand's write is not in the tree: %v", err)
	}
}
