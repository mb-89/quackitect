package main

import (
	"strings"
	"testing"
)

const theFilterKey = "work.queue_filter"

// THE QUEUE IS NARROWED TO WHAT A PERSON ASKED FOR.
//
// A person files tokens into a bucket and points an agent at it. On a cloud box
// they press nothing, so the filter is a parameter and reaches them as
// KEYWORD:QUEUE_FILTER.
//
// THE LANGUAGE IS THE ONE ALREADY HERE. src/filter is KQL, the same reader the
// log window and the work editor use, so process: trivial means here what it
// means there.
func TestTheQueueIsNarrowedByTheFilter(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	alpha := mintStandard(t, r, "alpha one")
	mintStandard(t, r, "beta one")
	mintStandard(t, r, "beta two")

	if got := QueueDepth(r); got != 3 {
		t.Fatalf("three tokens and the queue counts %d, so nothing here is about the filter", got)
	}

	// A FILTER THAT MATCHES ONE LEAVES ONE.
	setFilter(t, r, "title: alpha")
	if got := QueueDepth(r); got != 1 {
		t.Errorf("title: alpha left %d of three", got)
	}
	got := Pull(r, "main", RoleWorker, Payload{})
	if got.Token == nil || got.Token.ID != alpha.ID {
		t.Errorf("the queue handed out something the filter excludes: %+v", got.Token)
	}

	// AND A FILTER THAT MATCHES NOTHING LEAVES NOTHING.
	setFilter(t, r, "title: nothingatall")
	if got := QueueDepth(r); got != 0 {
		t.Errorf("a filter matching nothing left %d", got)
	}
}

// AN EXPRESSION THAT WILL NOT READ FILTERS NOTHING.
//
// A half-typed filter in the panel would otherwise starve an agent while
// somebody is still typing, and the person watching would see the queue empty
// for no reason they could see. So a broken filter is the same as no filter.
//
// THE OWNER'S WORDS: if the group is not found, then just nothing happens. Then
// we are still unfiltered.
func TestABrokenFilterFiltersNothing(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	mintStandard(t, r, "alpha one")
	mintStandard(t, r, "beta one")

	for _, said := range []string{"((", "bucket:", "and"} {
		setFilter(t, r, said)
		if got := QueueDepth(r); got != 2 {
			t.Errorf("%q narrowed the queue to %d, and a filter that will not read narrows nothing",
				said, got)
		}
	}
}

// A QUEUE WITH NOTHING LEFT HANDS OUT THE NOTES.
//
// THE OWNER'S WORDS: I give the cloud a certain bucket, and when it is done
// with that, it finishes up the notes.
//
// IT USED TO RIDE ON FINISHING ALONE, so an agent that emptied its bucket was
// answered with wait while its own notes sat unworked.
func TestAnEmptyQueueHandsOutTheNotes(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	mintStandard(t, r, "alpha one")
	note := mintNote(t, r, "seen in passing")

	// THE BUCKET IS EMPTIED by a filter that matches no tracked work.
	setFilter(t, r, "title: nothingatall")
	if got := QueueDepth(r); got != 0 {
		t.Fatalf("the queue is not empty, so this proves nothing: %d", got)
	}

	got := Pull(r, "main", RoleWorker, Payload{})
	if got.Token == nil {
		t.Fatalf("an empty queue handed out nothing at all, notes included: %q", got.Notice)
	}
	if got.Token.ID != note.ID {
		t.Errorf("an empty queue handed out %s rather than the note", got.Token.ID)
	}
}

// AND FINISHING UP HANDS OUT NOTHING, NOTES INCLUDED.
//
// THE OWNER'S WORDS: finishing just means finish your token and then stop.
// Draining the notes is what an empty queue does, and the two are separate now.
func TestFinishingHandsOutNothingAtAll(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	mintNote(t, r, "a note left over")
	if _, err := SetHold(r, HoldFinishing, "the owner"); err != nil {
		t.Fatal(err)
	}

	got := Pull(r, "main", RoleWorker, Payload{})
	if got.Token != nil {
		t.Errorf("finishing handed out %s, and finishing means pick nothing up", got.Token.ID)
	}
	if !strings.Contains(got.Notice, "finishing up") {
		t.Errorf("the notice does not say a person is finishing up: %q", got.Notice)
	}
}

// setFilter stores the filter the way the panel does, through the tree rather
// than round it, so what the test sets is what a person's typing would set.
func setFilter(t *testing.T, r Roots, said string) {
	t.Helper()
	theParametersSay(t, r, theFilterKey, said)
}
