package main

import (
	"os"
	"strings"
	"testing"
)

// THE COUNT IS WHAT THE QUEUE WOULD HAND OUT, NEVER HOW MANY ROWS EXIST.
//
// The staffing guard holds the main agent until the hands the queue wants have
// pulled. It counted the tokens itself, with its own reading of what is
// workable, and that reading was not the queue's. So it counted work the pull
// passes over, asked for hands, and every hand spawned was told wait and left.
// The demand then came back, for ever.
//
// MEASURED in September 2026: forty-one tokens the branch had archived, three
// reviewers spawned in a row, each told wait, and the main agent refused every
// call in between.

// aSectionPastItsBound breaks a note the way the record refuses one: a chapter
// longer than the schema allows, which is what the save holds every note to.
func aSectionPastItsBound(t *testing.T, r Roots, id string) {
	t.Helper()
	p := noteAt(r, id)
	b, err := os.ReadFile(p)
	if err != nil {
		t.Fatal(err)
	}
	too := "\n\n## detail\n\n" + strings.Repeat("a word and another one. ", 200) + "\n"
	if err := os.WriteFile(p, append(b, too...), 0o644); err != nil {
		t.Fatal(err)
	}
}

func TestTheCountSkipsWhatTheQueueWillNotHandOut(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	good := mintStandard(t, r, "the record writes")
	bad := mintStandard(t, r, "the record refuses")
	aSectionPastItsBound(t, r, bad.ID)

	// THE RECORD REFUSES ONE OF THEM, which is what makes this a test.
	broken, err := LoadToken(r, bad.ID)
	if err != nil {
		t.Fatal(err)
	}
	if TheRecordRefuses(r, broken) == nil {
		t.Fatal("the note this test breaks is one the record would still write")
	}

	if s := StaffingOf(r, TheFloor()); s.OpenWork != 1 {
		t.Errorf("the count says %d open, and the queue would hand out one", s.OpenWork)
	}

	// AND THE QUEUE AGREES: it hands out the one the record will write.
	a := next(r, "worker-one", RoleWorker)
	if a.Token == nil {
		t.Fatalf("the queue handed out nothing: %s", a.Notice)
	}
	if a.Token.ID != good.ID {
		t.Fatalf("the queue handed out %s rather than %s", a.Token.ID, good.ID)
	}

	// WITH THAT ONE IN A HAND, NEITHER HAS WORK LEFT.
	//
	// The queue answers wait, so the count must want nobody. A count that
	// still says one is the deadlock: the guard asks for a hand, the hand is
	// told wait, and it leaves.
	if s := StaffingOf(r, TheFloor()); s.OpenWork != 0 {
		t.Errorf("the count says %d open where the queue has nothing left", s.OpenWork)
	}
	if back := next(r, "worker-two", RoleWorker); back.Token != nil {
		t.Fatalf("the queue handed out %s after its only work went", back.Token.ID)
	}
}
