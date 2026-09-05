package main

import (
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// A PARKED TOKEN LEAVES THE QUEUE FOR EVERY ROLE, COMES BACK WHEN UN-PARKED,
// AND IS NAMED WHERE A PERSON LOOKS.
//
// The queue passing over it is half the mechanism. The other half is the
// person who parked it finding it again: se query and the state of play name
// every token carrying a ready_when, with the condition it holds, because
// whoever parks one owns un-parking it and cannot un-park what nothing shows.
func TestAParkedTokenLeavesTheQueueAndIsNamed(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	const why = "the owner takes the backlog conversation up again"

	// A WORKER'S STEP, PARKED. It stands at open, which the do step leaves.
	atOpen := mintStandard(t, r, "parked at open")
	atOpen.ReadyWhen = why
	if err := SaveToken(r, atOpen); err != nil {
		t.Fatal(err)
	}
	// A REVIEWER'S STEP, PARKED. It stands at done, which the verdict leaves.
	atDone := mintStandard(t, r, "parked at done")
	atDone.Status, atDone.Author, atDone.ReadyWhen = "done", "worker-1", why
	if err := SaveToken(r, atDone); err != nil {
		t.Fatal(err)
	}

	if got := Pull(r, "worker-2", RoleWorker, Payload{}); got.Pull == AnswerWork {
		t.Fatalf("a worker pull was handed %s while it waits on a person", got.Token.ID)
	}
	if got := Pull(r, "reviewer-1", RoleReviewer, Payload{}); got.Pull == AnswerWork {
		t.Fatalf("a reviewer pull was handed %s while it waits on a person", got.Token.ID)
	}

	// SE QUERY NAMES THEM, WITH THE CONDITION. The shipped view declares the
	// group, so the panel shows what the queue will not hand out.
	b, err := LoadBase(filepath.Join("..", "..", "util", "views", "work.base"))
	if err != nil {
		t.Fatal(err)
	}
	tab, err := Render(b, b.Views[0], TokenRows(r))
	if err != nil {
		t.Fatal(err)
	}
	var parked *Group
	var names []string
	for i := range tab.Groups {
		names = append(names, tab.Groups[i].Name)
		if tab.Groups[i].Name == "parked" {
			parked = &tab.Groups[i]
		}
	}
	if parked == nil {
		t.Fatalf("the work view declares no parked group: %v", names)
	}
	named := map[string]bool{}
	for _, l := range parked.Lines {
		named[l.ID] = true
		if l.Cells["ready_when"].Value != why {
			t.Errorf("%s is named without its condition: %+v", l.ID, l.Cells)
		}
	}
	if !named[atOpen.ID] || !named[atDone.ID] {
		t.Errorf("the parked group names %v, wanted %s and %s", ids(parked.Lines), atOpen.ID, atDone.ID)
	}

	// AND THE STATE OF PLAY NAMES THEM, WITH THE CONDITION.
	screen := TheStateOfPlay(r, time.Now()).Screen()
	for _, want := range []string{"2 parked", atOpen.ID, atDone.ID, why} {
		if !strings.Contains(screen, want) {
			t.Errorf("the state of play does not carry %q:\n%s", want, screen)
		}
	}

	// CLEARING THE FIELD PUTS EACH BACK IN ITS QUEUE ON THE NEXT PULL.
	atOpen.ReadyWhen = ""
	if err := SaveToken(r, atOpen); err != nil {
		t.Fatal(err)
	}
	if got := Pull(r, "worker-2", RoleWorker, Payload{}); got.Pull != AnswerWork || got.Token == nil || got.Token.ID != atOpen.ID {
		t.Fatalf("un-parked, the worker pull answered %s %s", got.Pull, got.Notice)
	}
	atDone.ReadyWhen = ""
	if err := SaveToken(r, atDone); err != nil {
		t.Fatal(err)
	}
	if got := Pull(r, "reviewer-1", RoleReviewer, Payload{}); got.Pull != AnswerWork || got.Token == nil || got.Token.ID != atDone.ID {
		t.Fatalf("un-parked, the reviewer pull answered %s %s", got.Pull, got.Notice)
	}
}
