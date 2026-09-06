package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A READ THROUGH THE ENGINE IS A READ.
//
// The delete guard asks whether this actor has looked at a file, and the answer
// came from the harness alone. A Read call was noted and a cat through se_run
// was not.
//
// MEASURED, September 2026, on a cloud box. Three files were read whole through
// se_run and the next se_run naming rm on them was refused with NOTHING IS
// DELETED THAT NOBODY LOOKED AT. The same three read with the harness Read tool,
// and the same rm, went through at once.
//
// THE WRITE GATE REFUSES THE HARNESS'S OWN BASH on that box, so se_run is the
// only door left. An agent that follows the card can never satisfy the guard,
// and one that reaches past it can, so the guard rewarded going round the door
// the project wants used.
func aFileToLookAt(t *testing.T, r Roots, name, said string) string {
	t.Helper()
	at := filepath.Join(r.Work, filepath.FromSlash(name))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(said), 0o644); err != nil {
		t.Fatal(err)
	}
	return at
}

func TestACatThroughTheEngineCountsAsALook(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	const actor = "worker-reader"
	aFileToLookAt(t, r, "doc/reachable.md", "a file somebody looks at\n")

	// UNREAD, THE DELETE IS REFUSED. Without this the test proves nothing: the
	// guard would be quiet whatever the read did.
	why, refuse := ARemovalWithoutARead(r, actor, "rm doc/reachable.md", r.Work)
	if !refuse {
		t.Fatal("this proves nothing: an unread file was already deletable")
	}
	if !strings.Contains(why, "reachable.md") {
		t.Fatalf("the refusal names no file: %s", why)
	}

	// AND A CAT THROUGH THE ENGINE IS THE LOOK.
	AReadThroughTheEngine(r, actor, "cat doc/reachable.md", r.Work)
	if why, refuse := ARemovalWithoutARead(r, actor, "rm doc/reachable.md", r.Work); refuse {
		t.Errorf("the file was read through the engine and the delete was refused: %s", why)
	}
}

// AND A COMMAND THAT READS NOTHING COUNTS AS NOTHING.
//
// The rule stays what it says. A path that merely appears in a command is not a
// path anybody looked at, or every echo would be a look.
func TestACommandThatPrintsNoFileIsNotALook(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	const actor = "worker-echo"
	aFileToLookAt(t, r, "doc/untouched.md", "nobody read this\n")

	for _, command := range []string{
		"echo doc/untouched.md",
		"touch doc/untouched.md",
		"ls doc",
	} {
		AReadThroughTheEngine(r, actor, command, r.Work)
		if _, refuse := ARemovalWithoutARead(r, actor, "rm doc/untouched.md", r.Work); !refuse {
			t.Fatalf("%q counted as a look at the file, and it prints none", command)
		}
	}
}

// AND ONE HAND'S READ IS NOT ANOTHER'S. The guard asks about this actor, and
// the note carries who made it, so a second hand still has to look.
func TestAnotherHandsReadIsNotYours(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	aFileToLookAt(t, r, "doc/theirs.md", "one hand read this\n")

	AReadThroughTheEngine(r, "worker-first", "cat doc/theirs.md", r.Work)
	if _, refuse := ARemovalWithoutARead(r, "worker-first", "rm doc/theirs.md", r.Work); refuse {
		t.Fatal("the hand that read it was refused, so nothing below is about the actor")
	}
	if _, refuse := ARemovalWithoutARead(r, "worker-second", "rm doc/theirs.md", r.Work); !refuse {
		t.Error("a hand that read nothing was allowed the delete on another hand's read")
	}
}

// AND A PATH THAT IS NOT THERE IS NOT NOTED. sed takes a script before its
// file, and head takes a count, so a reader's arguments hold words that are no
// path at all. Noting one would be a look at a file nobody has.
func TestAReadNotesOnlyTheFilesThatExist(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	const actor = "worker-sed"
	aFileToLookAt(t, r, "doc/paged.md", "one\ntwo\nthree\n")

	noted := AReadThroughTheEngine(r, actor, "sed -n 1,2p doc/paged.md", r.Work)
	if len(noted) != 1 || !strings.HasSuffix(filepath.ToSlash(noted[0]), "doc/paged.md") {
		t.Fatalf("the reader noted %v, and one file was read", noted)
	}
	if _, refuse := ARemovalWithoutARead(r, actor, "rm doc/paged.md", r.Work); refuse {
		t.Error("a file read by sed was refused the delete")
	}
}
