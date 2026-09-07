package main

import (
	"encoding/json"
	"strings"
	"testing"

	"quackitect/engine/internal/sessionlog"
	"quackitect/filter"
)

// A FILTER THAT WILL NOT READ IS RECORDED, AND STILL NARROWS NOTHING.
//
// A broken expression is the same as no filter, and that is right: a queue that
// emptied while somebody was still typing would starve an agent for a reason
// nobody could see. The argument for it ends with "the box beside it is where a
// person sees what they typed".
//
// THERE IS NO BOX ON THE ONE MACHINE THIS WAS BUILT FOR. A person on a cloud
// box presses nothing, so the filter is a parameter. They set one, get a word
// wrong, and the box they meant to hand one bucket is handed the whole backlog.
// The two readings look identical from outside: work comes out either way.
//
// SO IT IS SAID RATHER THAN ENFORCED. The record carries the expression that
// would not read, and the queue goes on handing out everything. Both halves are
// here, because reporting it and refusing it are different fixes and only one
// of them is wanted.
func TestAFilterThatWillNotReadIsRecorded(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	l, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "engine started", sessionlog.Yes(), nil)
	l.Close()

	work := mintStandard(t, r, "ordinary work")
	const said = "bucket:((claims"
	if _, err := filter.ParseFilter(said); err == nil {
		t.Fatalf("%q reads as a filter, so nothing here is about one that will not", said)
	}
	setFilter(t, r, said)

	// THE WIDENING IS REPORTED AND NOT ENFORCED, so the work still comes out.
	got := Pull(r, "worker-one", RoleWorker, Payload{})
	if got.Token == nil || got.Token.ID != work.ID {
		t.Fatalf("an unreadable filter narrowed the queue: %s %q", got.Pull, got.Notice)
	}

	// AND THE RECORD NAMES WHAT WAS WRITTEN, because a person who cannot see
	// the box has only the record to tell the two readings apart.
	for _, line := range logLines(t, r) {
		var rec sessionlog.Record
		if err := json.Unmarshal([]byte(line), &rec); err != nil {
			continue
		}
		if strings.Contains(rec.Msg, said) {
			return
		}
	}
	t.Errorf("nothing in the record names %q, so a mistyped filter and no filter "+
		"are the same thing from outside", said)
}
