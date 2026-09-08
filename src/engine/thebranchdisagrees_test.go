package main

import (
	"strings"
	"testing"
)

// A NOTICE THAT BLAMES A LAG THERE IS NONE OF IS AN INSTRUCTION NOBODY CAN ACT ON.
//
// The queue declines to hand out what the fetched branch has archived, and says
// the clone is behind and to bring spec/work into step. That reading is right
// when the branch dropped the note. It is wrong when the branch carries the
// note and an archive row for it at once.
//
// MEASURED, September 2026. Three ids were named on every pull of a session,
// each with that instruction. Two stood on the branch byte for byte as they
// stood here, so no fetch and no checkout could have changed anything. Three
// hands read the notice and none of them could satisfy it.
//
// SO THE NOTICE ONLY BLAMES A LAG IT CANNOT RULE OUT. Where the note here is
// the branch's own note, the record disagrees with itself, and that is what the
// answer says.
func TestTheNoticeDoesNotBlameALagItCanRuleOut(t *testing.T) {
	t.Parallel()
	behind, tok := aCloneWhoseBranchDisagrees(t)

	got := Pull(behind, "worker-1", RoleWorker, Payload{})
	if !strings.Contains(got.Notice, tok.ID) {
		t.Fatalf("the pass-over does not name %s: %s", tok.ID, got.Notice)
	}
	if strings.Contains(got.Notice, "this clone is behind it") {
		t.Errorf("the notice blames a lag over a note the branch carries unchanged: %s", got.Notice)
	}
	if strings.Contains(got.Notice, "Bring spec/work into step") {
		t.Errorf("the notice asks for a fetch that would change nothing: %s", got.Notice)
	}
	if !strings.Contains(got.Notice, "disagrees with itself") {
		t.Errorf("the notice does not say the two halves of the record disagree: %s", got.Notice)
	}
}

// AND A BRANCH THAT REALLY DID MOVE ON IS STILL READ AS A LAG, so the rule
// above narrowed the notice rather than removing it.
func TestARealLagIsStillNamedALag(t *testing.T) {
	t.Parallel()
	behind, tok := aCloneBehindTheClose(t)

	got := Pull(behind, "worker-1", RoleWorker, Payload{})
	if !strings.Contains(got.Notice, tok.ID) {
		t.Fatalf("the pass-over does not name %s: %s", tok.ID, got.Notice)
	}
	if !strings.Contains(got.Notice, "this clone is behind it") {
		t.Errorf("a clone whose branch moved the note on is no longer told it is behind: %s", got.Notice)
	}
}
