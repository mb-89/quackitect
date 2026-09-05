package main

import (
	"strings"
	"testing"
)

// THE WAIT NOTICE CALLS WORK YOURS, SO IT MUST BE YOURS, AND SAID ONCE.
//
// MEASURED, PULLING AS reviewer-poplar ON 2026-09-05. It read "12 piece(s) are
// yours and every one is blocked", listed six ids, then listed the same six
// again. There were six, and not one of them was the puller's.
//
// TWO FAULTS, AND THIS DRIVES BOTH. The list was built inside a pass that runs
// twice, so every held token landed twice. And it took a token whenever anybody
// held it, with no comparison against the actor asking.
//
// A TOKEN THAT HAS ENDED IS NOBODY'S WORK. One that closed still carrying a
// holder was named as a piece somebody had to answer for.
func TestTheWaitNoticeNamesYourOwnHeldWorkOnce(t *testing.T) {
	t.Parallel()

	all := []Token{
		{ID: "wk-mine", Holder: "reviewer-poplar"},
		{ID: "wk-theirs", Holder: "worker-elm"},
		{ID: "wk-alsotheirs", Holder: "worker-ash"},
		{ID: "wk-closed", Holder: "reviewer-poplar", Disposition: Done},
	}

	got := theirOwnHeld(all, "reviewer-poplar")

	// ONCE, NOT TWICE.
	if len(got) != 1 {
		t.Fatalf("it answers %d piece(s) and one is the actor's own and open: %v", len(got), got)
	}
	if got[0] != "wk-mine" {
		t.Fatalf("it answers %q, and the actor's own open token is wk-mine", got[0])
	}

	// AND THE NOTICE THAT CALLS THEM YOURS NAMES THAT ONE, AND NO OTHER.
	said := waitNotice(guidanceTree(t), "reviewer-poplar", got)
	if !strings.Contains(said, "wk-mine") {
		t.Errorf("the notice does not name the piece the actor holds: %s", said)
	}
	for _, other := range []string{"wk-theirs", "wk-alsotheirs", "wk-closed"} {
		if strings.Contains(said, other) {
			t.Errorf("the notice calls %s yours, and it is not: %s", other, said)
		}
	}
	if strings.Contains(said, "2 piece(s)") {
		t.Errorf("the notice counts one piece twice: %s", said)
	}
}
