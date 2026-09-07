package main

import (
	"testing"
	"time"
)

// A CLOSE ASKS FOR A LAND AND THEN SHUTS THE DOOR TO IT.
//
// The submit answers the paths a hand must land. The next call, se run naming
// that same token, was refused because the token had ended, so the hand minted
// a token nobody wanted in order to run one command.
//
// MEASURED, 2026-09-07, on wk-48eee4caa6 closing itself. The notice read: land
// every path this close wrote. The land answered: already ended as done, name a
// token that is open, or mint one. Four closes that day paid the same toll.
//
// THE OWNER RULED. A land may name a token that closed a moment ago. Working
// one is still refused, so nothing is filed where nobody will look for it.
// NOT IN PARALLEL. Both tests here read the clock, which is a package variable
// so that the other one can answer it.
func TestALandRunsOnATokenThatJustClosed(t *testing.T) {
	r := aTreeWithOneStep(t)
	tok := mintTask(t, r, "a hand lands this", "")

	if got := Pull(r, "worker-a", RoleWorker, Payload{ID: tok.ID, Disposition: "done"}); got.Pull == AnswerRefused {
		t.Fatalf("the close was refused: %+v", got.Findings)
	}

	// THE CLOCK IS FED HERE TOO. Left alone it answers not-known over a fixture
	// that writes no snapshot, and aWarmLand lets an untimed close through, so
	// the window would go untested and this line could not redden.
	was := theCloseWasAt
	t.Cleanup(func() { theCloseWasAt = was })
	theCloseWasAt = func(Roots, Token) (time.Time, bool) { return time.Now(), true }

	land := `sh util/git/land.sh "the close named these" doc/work/` + tok.ID + `.md doc/work/archive.jsonl`
	if !aWarmLand(r, tok.ID, land) {
		t.Errorf("a land naming the token that just closed was not allowed through")
	}

	// AND ONLY A LAND. Working a closed token stays refused, which is the gate
	// this narrows rather than removes.
	if aWarmLand(r, tok.ID, "go test ./...") {
		t.Errorf("an ordinary command was allowed through on a closed token")
	}
	if _, err := TakeUp(r, tok.ID, "worker-a"); err == nil {
		t.Errorf("the gate itself went away, and it was only to be narrowed")
	}
}

// AND A TOKEN THAT CLOSED LONG AGO IS STILL REFUSED. A land follows its close
// at once. One naming a token from yesterday is somebody misreading the record.
func TestALandOnALongClosedTokenIsRefused(t *testing.T) {
	r := aTreeWithOneStep(t)
	tok := mintTask(t, r, "a hand lands this", "")
	if got := Pull(r, "worker-a", RoleWorker, Payload{ID: tok.ID, Disposition: "done"}); got.Pull == AnswerRefused {
		t.Fatalf("the close was refused: %+v", got.Findings)
	}

	// THE CLOCK IS FED, rather than a commit forged with a date in it.
	was := theCloseWasAt
	t.Cleanup(func() { theCloseWasAt = was })
	theCloseWasAt = func(Roots, Token) (time.Time, bool) {
		return time.Now().Add(-24 * time.Hour), true
	}

	land := `sh util/git/land.sh "late" doc/work/` + tok.ID + `.md`
	if aWarmLand(r, tok.ID, land) {
		t.Errorf("a land named a token closed a day ago and was allowed through")
	}
}
