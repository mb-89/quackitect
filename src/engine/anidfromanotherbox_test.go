package main

import (
	"strings"
	"testing"
)

// AN ID NAMING ANOTHER BOX'S WORK IS MARKED, AND A MARKED ID IS NO FINDING.
//
// Many boxes mint tokens and only what lands travels, so a note here names
// work whose token never reached this branch. The sentence is true, and
// nothing on the branch can resolve it: measured at the tip, 306 mentions of
// 200 ids across 166 notes, and not one of them reachable from any ref this
// remote carries. Deleting the id throws away where the work came from, and
// the check was built to catch the other case, an id nobody ever minted.
//
// So the writer says which one it is, once, beside the id. "(another box)"
// reads as English, keeps the sentence saying where the work came from, and
// leaves an unmarked id answering to the rule exactly as before.
//
// Why it is this shape: [[an-id-from-another-box-is-marked]].
func TestAnIdFromAnotherBoxIsNoFinding(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	writeProcess(t, r.Work, "gated")

	marked := mintWithDetail(t, r,
		"the queue answered investigate on wk-aaaaaaaaaa (another box) at the time").ID
	// THE MARK IS WHAT DOES IT, AND NOT THE SENTENCE AROUND IT. The same words
	// carrying an unmarked id are still the case the check was built for, so
	// this half fails if the mark is read as a blanket exemption.
	bare := mintWithDetail(t, r,
		"the queue answered investigate on wk-cccccccccc at the time").ID

	said := map[string]string{}
	for _, f := range LintTokens(r) {
		said[f.ID] = f.Says
	}
	if says, named := said[marked]; named {
		t.Errorf("a marked id was read as reaching nothing: %s", says)
	}
	says, named := said[bare]
	switch {
	case !named:
		t.Errorf("the lint says nothing about %s, so an unmarked id reaching nothing stays silent", bare)
	case !strings.Contains(says, "wk-cccccccccc"):
		t.Errorf("the finding does not name the id that reaches nothing: %s", says)
	}
}
