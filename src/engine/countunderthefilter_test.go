package main

import "testing"

// THE COUNT IS THE FILTERED QUEUE, BECAUSE THERE IS ONLY ONE ANSWER.
//
// THE OWNER'S WORDS, September 2026: there can only ever be one answer to how
// many tokens are open. It is the answer I get if I look at the filter.
//
// MEASURED that month. work.queue_filter stood at bucket:claims and a pull
// answered "143 tokens are open and workable". Twenty-two tokens carried the
// bucket. next() narrows through theQueueOffers before it counts anything, and
// StaffingOf walked the tokens raw. So the queue and the sentence beside it
// were two different questions.
//
// AND THE PANEL'S DEPTH IS THE THIRD READING. QueueDepth counted by a rule of
// its own, so a fix touching only staffing leaves two numbers that can still
// disagree. Both halves are asserted here, off one door.
func TestTheCountCountsUnderTheFilter(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	mintStandard(t, r, "alpha one")
	mintStandard(t, r, "beta one")
	mintStandard(t, r, "beta two")

	if s := StaffingOf(r, TheFloor()); s.OpenWork != 3 {
		t.Fatalf("three tokens and the count says %d, so nothing here is about the filter", s.OpenWork)
	}

	// A FILTER THAT MATCHES ONE LEAVES THE COUNT AT ONE.
	setFilter(t, r, "title: alpha")
	if s := StaffingOf(r, TheFloor()); s.OpenWork != 1 {
		t.Errorf("title: alpha left the count at %d of three", s.OpenWork)
	}
	if got := QueueDepth(r); got != 1 {
		t.Errorf("the depth says %d where the count says one, and there is one answer", got)
	}

	// AN EXPRESSION THAT WILL NOT READ NARROWS NOTHING, here as everywhere.
	setFilter(t, r, "((")
	if s := StaffingOf(r, TheFloor()); s.OpenWork != 3 {
		t.Errorf("an unreadable filter narrowed the count to %d", s.OpenWork)
	}
}
