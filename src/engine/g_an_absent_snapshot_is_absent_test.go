package main

import (
	"strings"
	"testing"
)

// THE INSTRUMENT IS PROVED BEFORE IT RULES.
//
// A door that refuses every note carrying the claim would pass the planted case
// for the wrong reason, and it would refuse the five notes that were right. So
// each planted case here has a clean one beside it differing in the one fact
// the rule turns on, which is whether git answers for the name.
//
// THE REPOSITORY IS PLANTED AND REAL. The resolving name is a commit this test
// wrote, and the absent one is a full hash of a snapshot no clone holds, so
// both answers come from git rather than from a stub.
func TestASnapshotCalledAbsentDoesNotResolve(t *testing.T) {
	r := Roots{Work: t.TempDir()}
	r.Method = r.Work
	for _, args := range [][]string{
		{"init", "--quiet", "--initial-branch", "main"},
		{"commit", "--allow-empty", "--quiet", "-m", "the snapshot the engine wrote here"},
	} {
		if _, err := gitHere(r, args...); err != nil {
			t.Fatalf("git %v: %v", args, err)
		}
	}
	begun, err := gitHere(r, "rev-parse", "--short=12", "HEAD")
	if err != nil {
		t.Fatalf("the planted repository has no snapshot to name: %v", err)
	}
	// A NAME NO CLONE HOLDS. Forty hexadecimal characters are a whole hash, so
	// git answers for it or for nothing.
	const elsewhere = "0123456789abcdef0123456789abcdef01234567"
	tracked := TheTrackedFolder + "/wk-1111111111.md"
	mine := ".se/work/wk-1111111111.md"
	note := func(said string) string {
		return "---\nkind: work\nstatus: open\n---\n\n## detail\n\n" + said + "\n"
	}

	// PLANTED. The note calls a snapshot this box wrote absent, which is the
	// sentence that sent a reviewer to HEAD.
	err = aSnapshotCalledAbsentDoesNotResolve(r, false, tracked,
		note(begun+" is no object in this clone, so the span cannot be read."))
	theSnapshotDoorRefused(t, "a note calling a snapshot this box wrote absent", err,
		begun, "cat-file", "commit", "reviews the note")

	// PLANTED, in the folder that never travels. A reviewer on this box is sent
	// to the span by a private note the same way.
	err = aSnapshotCalledAbsentDoesNotResolve(r, false, mine,
		note(begun+" is no object in this clone, so the span cannot be read."))
	theSnapshotDoorRefused(t, "a private note calling a snapshot this box wrote absent", err, begun)

	// CLEAN. The same sentence about a snapshot git does not know. This is the
	// five notes that were right, and refusing them would be the door lying too.
	err = aSnapshotCalledAbsentDoesNotResolve(r, false, tracked,
		note(elsewhere+" is no object in this clone, so the span cannot be read."))
	theSnapshotDoorAllowed(t, "a note calling a snapshot git does not know absent", err)

	// CLEAN. The claim is quoted, so the note is reporting the defect rather than
	// making it. Refusing this refuses the finding that asked for the rule.
	err = aSnapshotCalledAbsentDoesNotResolve(r, false, tracked,
		note("the note said \""+begun+" is no object in this clone\" and git answers it."))
	theSnapshotDoorAllowed(t, "a note quoting the claim to report it", err)

	// CLEAN. The name and the claim are in different sentences, so the note names
	// no snapshot it calls absent.
	err = aSnapshotCalledAbsentDoesNotResolve(r, false, tracked,
		note(begun+" is the span this change sits on. The engine warned that a snapshot is no object here."))
	theSnapshotDoorAllowed(t, "a note whose claim and whose span are two sentences", err)

	// CLEAN. A note that says nothing about any object asks git nothing.
	err = aSnapshotCalledAbsentDoesNotResolve(r, false, tracked,
		note("the change is bracketed by "+begun+" and the closing snapshot."))
	theSnapshotDoorAllowed(t, "a note naming a span and making no claim", err)

	// CLEAN. Source is not a note, and a reviewer is sent to no span by it.
	err = aSnapshotCalledAbsentDoesNotResolve(r, false, "src/engine/snapshot.go",
		note(begun+" is no object in this clone, so the span cannot be read."))
	theSnapshotDoorAllowed(t, "a file that is not a note", err)

	// CLEAN. A clean archive of a commit holds no .git, and a door that refused
	// for want of one would say nothing about any note.
	bare := Roots{Work: t.TempDir()}
	bare.Method = bare.Work
	err = aSnapshotCalledAbsentDoesNotResolve(bare, false, tracked,
		note(begun+" is no object in this clone, so the span cannot be read."))
	theSnapshotDoorAllowed(t, "a note in a tree with no repository over it", err)
}

// theSnapshotDoorRefused says the door refused, and that the refusal names why.
// A refusal a reader cannot act on is a wall, and the words are what make it a
// door.
func theSnapshotDoorRefused(t *testing.T, what string, err error, words ...string) {
	t.Helper()
	if err == nil {
		t.Fatalf("%s was allowed through, and a reviewer reading it goes to HEAD instead of the span", what)
	}
	for _, want := range words {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal of %s does not say %q, so a writer is not told what to do: %s", what, want, err)
		}
	}
}

// theSnapshotDoorAllowed says the door let a legal write through. It is the
// half that makes the refusals above evidence rather than a door that refuses
// every note carrying the words.
func theSnapshotDoorAllowed(t *testing.T, what string, err error) {
	t.Helper()
	if err != nil {
		t.Fatalf("%s was refused, and a note that is right about an absent snapshot has to be writable: %s", what, err)
	}
}
