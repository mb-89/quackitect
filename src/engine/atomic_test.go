package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A WRITE THAT FAILS LEAVES WHAT WAS THERE, RATHER THAN NOTHING.
//
// This is the property the guard's state needs and os.WriteFile does not have.
// The loaders all swallow a read failure into an empty value, so a truncated
// file is not a wrong obligation, it is no obligation, and nothing says one was
// ever owed.
func TestAWriteThatFailsLeavesTheOldFile(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	path := filepath.Join(dir, "state.json")
	if err := writeAtomic(path, []byte(`{"owed":1}`), 0o644); err != nil {
		t.Fatal(err)
	}

	// A WRITE THAT CANNOT LAND. The target is made a directory, so the rename
	// fails after the bytes are written, which is the shape of the crash this
	// guards: the new content exists and the name does not point at it yet.
	blocked := filepath.Join(dir, "blocked.json")
	if err := os.Mkdir(blocked, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := writeAtomic(blocked, []byte(`{"owed":2}`), 0o644); err == nil {
		t.Error("a write onto a directory answered no error")
	}
	// AND IT LEFT NO RUBBISH BESIDE IT. A temporary file left behind is read by
	// nothing and grows for ever.
	left, err := os.ReadDir(dir)
	if err != nil {
		t.Fatal(err)
	}
	for _, e := range left {
		if strings.Contains(e.Name(), ".tmp") {
			t.Errorf("a failed write left %s behind", e.Name())
		}
	}

	// The first file is untouched by any of it.
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if string(b) != `{"owed":1}` {
		t.Errorf("the file that was already there now reads %q", b)
	}
}

// AND A WRITE OVER AN EXISTING FILE REPLACES IT WHOLE.
//
// The rename is the only moment a reader can see a change, so a reader that
// opens the file at any instant reads one complete version or the other.
func TestAWriteReplacesTheWholeFile(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "state.json")
	for _, want := range []string{
		`{"owed":1,"and":"a much longer first version of this file"}`,
		`{"owed":2}`,
	} {
		if err := writeAtomic(path, []byte(want), 0o644); err != nil {
			t.Fatal(err)
		}
		b, err := os.ReadFile(path)
		if err != nil {
			t.Fatal(err)
		}
		if string(b) != want {
			t.Errorf("it reads %q where %q was written", b, want)
		}
	}
}

// THE GUARD'S STATE GOES THROUGH IT, and this is what says so. A new writer
// added with os.WriteFile is the defect coming back, and it would come back
// quietly, because a truncated file reads as an empty one.
func TestTheGuardsStateIsWrittenAtomically(t *testing.T) {
	t.Parallel()
	// Every file the guard rebuilds from scratch on a tool call, named by the
	// function that writes it.
	//
	// A NAME HERE THAT THE TREE NO LONGER DECLARES IS A FAILURE, NOT A SKIP. It
	// listed ticket.go, which went with the ticket, and a list that quietly
	// passes over what is missing is a list nobody notices has gone stale.
	for _, name := range []string{
		"arrival.go", "evidence.go", "gate.go", "heard.go", "hold.go",
		"hook.go", "investigate.go", "nudge.go", "owed.go", "stop.go",
		"tools.go", "watch.go",
	} {
		b, err := os.ReadFile(filepath.Join("..", "..", "src", "engine", name))
		if err != nil {
			t.Errorf("%s is named here and this package has no such file. "+
				"Take it off the list, or put back what wrote guard state in it: %v", name, err)
			continue
		}
		if strings.Contains(string(b), "os.WriteFile(") {
			t.Errorf("%s writes guard state with os.WriteFile, which truncates first. "+
				"Use writeAtomic: every loader here reads a failure as an empty value, "+
				"so a half-written file is state that silently disappears", name)
		}
	}
}
