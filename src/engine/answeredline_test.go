package main

import (
	"strings"
	"testing"
)

// A CHECKLIST LINE HAS THREE STATES, NOT TWO: met, not met, and not looked at.
//
// The gate had two. It refused on !done before it ever read the evidence cell,
// so a worker who answered a line honestly with a sentence saying why the
// criterion does not hold could not close the token at all: se_pull refused,
// naming that line, and went on refusing one line per pull until every box was
// ticked. The only way out was to tick a line the worker had just written was
// false, which is the outcome doc/guidance/work-token.md rule 15 exists to
// prevent.
//
// MEASURED on a live token. Two do-checklist lines were answered with
// sentences saying why they were not met, se_pull refused twice, once per
// line, and both were then ticked with the qualification left in the sentence.
// The same submission was accepted. Only the boxes changed, and a reader of
// that closed token can no longer tell a line that was met from a line the
// gate forced.
//
// So what is refused is an UNANSWERED line. A line with something in its
// evidence cell has been looked at, and whether it was met is a thing for the
// reviewer to rule on rather than for the gate to extort a tick over.

const (
	// The row answered honestly rather than ticked.
	unmetButAnswered = "| done | criterion | evidence | receipt |\n" +
		"|---|---|---|---|\n" +
		"| [ ] | one test was seen red and then green | NOT MET: the battery cannot run " +
		"on this machine, so no test was seen at all. | wk-1111111111 |"
	// The same row, not looked at.
	notLookedAt = "| done | criterion | evidence | receipt |\n" +
		"|---|---|---|---|\n" +
		"| [ ] | one test was seen red and then green |  |  |"
)

func TestAnUntickedLineThatIsAnsweredCloses(t *testing.T) {
	t.Parallel()
	r := aTreeWithAChecklist(t, t.TempDir(), doSays)
	tok := mintWithChecklist(t, r, map[string]string{
		"step 1. ask": askTable, "step 2. do": unmetButAnswered})

	got := Pull(r, "worker-a", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	if got.Pull == AnswerRefused {
		t.Fatalf("a line answered with why it is not met was refused, so the only way to close "+
			"is to tick something the worker has just written is false: %+v", got.Findings)
	}
	// AND THE ANSWER IS STILL ON THE NOTE, for the reviewer to rule on.
	if text := noteText(t, r, tok.ID); !strings.Contains(text, "NOT MET: the battery cannot run") {
		t.Fatalf("the honest answer did not survive the close:\n%s", text)
	}
}

func TestAnUnansweredLineIsRefusedAndSaysSo(t *testing.T) {
	t.Parallel()
	r := aTreeWithAChecklist(t, t.TempDir(), doSays)
	tok := mintWithChecklist(t, r, map[string]string{
		"step 1. ask": askTable, "step 2. do": notLookedAt})

	got := Pull(r, "worker-a", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	if got.Pull != AnswerRefused {
		t.Fatal("a line neither ticked nor answered closed the token, " +
			"so the guard was removed rather than moved")
	}
	f := got.Findings[0]
	if !strings.Contains(f.Wrong, doSays) {
		t.Fatalf("the refusal does not name the line it is about: %+v", f)
	}
	if !strings.Contains(f.Wrong, "not answered") {
		t.Fatalf("the refusal does not say the line is unanswered: %+v", f)
	}
	if strings.Contains(f.Wrong, "not ticked") {
		t.Fatalf("the refusal still asks for a tick rather than an answer: %+v", f)
	}
}
