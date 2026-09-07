package main

import (
	"strings"
	"testing"
)

// A REMEDY NAMING A FOLDER THE STALE COPY IS NOT IN CANNOT BE FOLLOWED.
//
// The pass-over tells the reader to bring doc/work into step with the branch.
// That is the right remedy for a note under doc/work and no remedy at all for
// one under .se/work, which git carries nowhere. No fetch, no merge and no
// reset moves it.
//
// MEASURED, September 2026. Three ids were named on every pull of a session
// under that instruction, and doc/work held none of the three. All three sat
// under .se/work. The queue stayed blocked and each hand was sent to a folder
// with nothing in it.
//
// SO THE NOTICE NAMES THE FILE. Both kinds ride in one tree here, because the
// engine has to tell them apart rather than pick one wording for both.
func TestThePassOverNamesTheFileItMeans(t *testing.T) {
	behind, onTheBranch, private := aCloneWithBothKindsOfPassOver(t)

	got := Pull(behind, "worker-1", RoleWorker, Payload{})

	trackedAt := "doc/work/" + onTheBranch.ID + ".md"
	privateAt := ".se/work/" + private.ID + ".md"
	if !strings.Contains(got.Notice, trackedAt) {
		t.Errorf("the notice does not name %s, so the reader is told a folder and not a file:\n%s", trackedAt, got.Notice)
	}
	if !strings.Contains(got.Notice, privateAt) {
		t.Errorf("the notice does not name %s, which is the file that has to go:\n%s", privateAt, got.Notice)
	}

	// THE PRIVATE HALF IS READ ALONE. The tracked half may ask for a fetch and
	// this one may not, so one paragraph carrying both could satisfy neither.
	said := ""
	for _, part := range strings.Split(got.Notice, "\n\nPassed over") {
		if strings.Contains(part, private.ID) {
			said = part
		}
	}
	if said == "" {
		t.Fatalf("no paragraph of the notice names %s:\n%s", private.ID, got.Notice)
	}
	if strings.Contains(said, onTheBranch.ID) {
		t.Fatalf("both kinds are in one paragraph, so neither can carry its own remedy:\n%s", said)
	}
	if strings.Contains(said, "fetch") {
		t.Errorf("the private copy is told to fetch, and no fetch reaches .se/work:\n%s", said)
	}
	if strings.Contains(said, "Bring doc/work into step") {
		t.Errorf("the private copy is sent to doc/work, which does not hold it:\n%s", said)
	}
}
