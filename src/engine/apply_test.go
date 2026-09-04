package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// ONE BAD EDIT WRITES NOTHING.
//
// This is the property the whole applier is shaped around, and the reason it is
// a manifest rather than a call per file. A half-applied change leaves the tree
// in a state nobody designed, and the agent believes it landed, so the next
// thing it does is built on a lie.
func TestOneBadEditWritesNothing(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	good := filepath.Join(r.Work, "kept.txt")
	if err := os.WriteFile(good, []byte("hello world"), 0o644); err != nil {
		t.Fatal(err)
	}

	for _, c := range []struct {
		name  string
		edits []Edit
		says  string
	}{
		{"the old text is not there",
			[]Edit{{File: "kept.txt", Old: "hello", New: "goodbye"},
				{File: "kept.txt", Old: "nowhere in it", New: "x"}},
			"not in the file"},
		{"the old text is there twice",
			[]Edit{{File: "twice.txt", Old: "one", New: "two"}},
			"there 2 times"},
		{"a file that is not there",
			[]Edit{{File: "absent.txt", Old: "a", New: "b"}},
			"absent.txt"},
		{"create over a file that exists",
			[]Edit{{File: "kept.txt", Op: "create", New: "over the top"}},
			"already there"},
		{"an op nobody wrote",
			[]Edit{{File: "kept.txt", Op: "sideways", New: "x"}},
			"no such op"},
		{"a file outside the tree",
			[]Edit{{File: filepath.Join("..", "escape.txt"), Op: "create", New: "x"}},
			"outside the folder"},
	} {
		t.Run(c.name, func(t *testing.T) {
			if err := os.WriteFile(filepath.Join(r.Work, "twice.txt"),
				[]byte("one and one"), 0o644); err != nil {
				t.Fatal(err)
			}
			_, err := Apply(r, c.edits, false, "wk-test", "tester")
			if err == nil {
				t.Fatalf("%s was taken", c.name)
			}
			if !strings.Contains(err.Error(), c.says) {
				t.Errorf("it was refused for something else: %v", err)
			}
			// AND THE FILE THAT WAS FINE IS UNTOUCHED. The first edit of the
			// first case is a good one, and it must not have landed.
			b, err := os.ReadFile(good)
			if err != nil {
				t.Fatal(err)
			}
			if string(b) != "hello world" {
				t.Errorf("a refused manifest wrote anyway: %q", b)
			}
		})
	}
}

// EDITS TO ONE FILE COMPOSE, in the order they were written, against the file
// as the earlier ones left it rather than against what is on disk.
func TestEditsToOneFileCompose(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	path := filepath.Join(r.Work, "compose.txt")
	if err := os.WriteFile(path, []byte("alpha beta"), 0o644); err != nil {
		t.Fatal(err)
	}
	got, err := Apply(r, []Edit{
		{File: "compose.txt", Old: "alpha", New: "gamma"},
		{File: "compose.txt", Old: "gamma beta", New: "gamma delta"},
	}, false, "wk-test", "tester")
	if err != nil {
		t.Fatal(err)
	}
	if n := got.Edits["compose.txt"]; n != 2 {
		t.Errorf("it counted %d edits to the one file", n)
	}
	b, _ := os.ReadFile(path)
	if string(b) != "gamma delta" {
		t.Errorf("the file reads %q", b)
	}
}

// A DRY RUN CHECKS EVERYTHING AND WRITES NOTHING, so an agent can ask whether a
// manifest would land before it does.
func TestADryRunWritesNothing(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	path := filepath.Join(r.Work, "dry.txt")
	if err := os.WriteFile(path, []byte("before"), 0o644); err != nil {
		t.Fatal(err)
	}
	got, err := Apply(r, []Edit{{File: "dry.txt", Old: "before", New: "after"}}, true, "wk-test", "tester")
	if err != nil {
		t.Fatal(err)
	}
	if !got.Dry || len(got.Files) != 1 {
		t.Errorf("the answer does not say it was dry: %+v", got)
	}
	if b, _ := os.ReadFile(path); string(b) != "before" {
		t.Errorf("a dry run wrote: %q", b)
	}
	if got.Undo != "" {
		t.Error("a dry run wrote an undo journal for a change it did not make")
	}
}

// WHAT WAS THERE IS KEPT BEFORE ANYTHING IS OVERWRITTEN. A bulk edit nobody can
// undo is the incident the journal exists to prevent.
func TestAnApplyKeepsWhatWasThere(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	path := filepath.Join(r.Work, "journal.txt")
	if err := os.WriteFile(path, []byte("the old content"), 0o644); err != nil {
		t.Fatal(err)
	}
	got, err := Apply(r, []Edit{
		{File: "journal.txt", Old: "old", New: "new"},
		{File: "born.txt", Op: "create", New: "brand new"},
	}, false, "wk-test", "tester")
	if err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile(filepath.Join(r.Work, filepath.FromSlash(got.Undo)))
	if err != nil {
		t.Fatalf("reading the undo journal: %v", err)
	}
	said := string(b)
	if !strings.Contains(said, "the old content") {
		t.Errorf("the journal does not hold what the file said: %s", said)
	}
	// A FILE THIS APPLY BROUGHT INTO BEING IS RECORDED AS ABSENT, so undoing
	// removes it rather than writing an empty one over it.
	if !strings.Contains(said, "did_not_exist") {
		t.Errorf("the journal does not say born.txt was not there: %s", said)
	}
	// AND IT SAYS WHOSE APPLY IT WAS, which is what keeps an undo off another
	// agent's work.
	for _, want := range []string{"wk-test", "tester"} {
		if !strings.Contains(said, want) {
			t.Errorf("the journal does not say %q wrote it: %s", want, said)
		}
	}
}

// A PATH THAT LEAVES THE TREE IS REFUSED, whether it climbs out or is absolute.
func TestAPathOutsideTheTreeIsRefused(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	elsewhere := filepath.Join(t.TempDir(), "elsewhere.txt")
	for _, name := range []string{
		filepath.Join("..", "up.txt"),
		filepath.Join("a", "..", "..", "round.txt"),
		elsewhere,
	} {
		if _, err := Apply(r, []Edit{{File: name, Op: "create", New: "x"}}, false, "wk-test", "tester"); err == nil {
			t.Errorf("%s was taken", name)
		}
		if _, err := os.Stat(elsewhere); err == nil {
			t.Fatal("it wrote outside the folder being worked on")
		}
	}
}

func aTreeToWriteIn(t *testing.T) Roots {
	t.Helper()
	root := t.TempDir()
	return Roots{Method: root, Work: root}
}

// AN UNDO PUTS BACK WHAT THE LAST APPLY OVERWROTE, and removes what it created.
func TestAnUndoPutsBackWhatWasThere(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	kept := filepath.Join(r.Work, "kept.txt")
	if err := os.WriteFile(kept, []byte("the original"), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := Apply(r, []Edit{
		{File: "kept.txt", Old: "original", New: "changed"},
		{File: "born.txt", Op: "create", New: "new"},
	}, false, "wk-test", "tester"); err != nil {
		t.Fatal(err)
	}
	if _, err := Undo(r, "wk-test", "tester"); err != nil {
		t.Fatal(err)
	}
	if b, _ := os.ReadFile(kept); string(b) != "the original" {
		t.Errorf("it reads %q after the undo", b)
	}
	if _, err := os.Stat(filepath.Join(r.Work, "born.txt")); err == nil {
		t.Error("a file the apply created survived the undo")
	}
	// AND THE ENTRY IS USED UP, so undoing twice does not undo something else.
	if _, err := Undo(r, "wk-test", "tester"); err == nil {
		t.Error("the same entry was undone twice")
	}
}

// A FILE THAT MOVED SINCE THE APPLY REFUSES THE WHOLE UNDO.
//
// Writing the old bytes over it would throw away whatever was done afterwards,
// and it would do it silently. All or nothing, and nothing is the answer.
func TestAnUndoRefusesWhenAFileHasDrifted(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	one := filepath.Join(r.Work, "one.txt")
	two := filepath.Join(r.Work, "two.txt")
	for _, p := range []string{one, two} {
		if err := os.WriteFile(p, []byte("before"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	if _, err := Apply(r, []Edit{
		{File: "one.txt", Old: "before", New: "after"},
		{File: "two.txt", Old: "before", New: "after"},
	}, false, "wk-test", "tester"); err != nil {
		t.Fatal(err)
	}
	// Somebody else works on one of them.
	if err := os.WriteFile(one, []byte("somebody else's work"), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := Undo(r, "wk-test", "tester"); err == nil {
		t.Fatal("the undo ran over a file that had changed")
	} else if !strings.Contains(err.Error(), "changed since the apply") {
		t.Errorf("it was refused for something else: %v", err)
	}
	// AND THE FILE THAT HAD NOT DRIFTED IS UNTOUCHED, because it is all or nothing.
	if b, _ := os.ReadFile(two); string(b) != "after" {
		t.Errorf("a refused undo restored two.txt anyway: %q", b)
	}
	if b, _ := os.ReadFile(one); string(b) != "somebody else's work" {
		t.Errorf("a refused undo overwrote the newer work: %q", b)
	}
}
