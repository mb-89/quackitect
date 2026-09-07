package main

import (
	"strings"
	"testing"
	"time"
)

// A BOX HAS TO BE TOLD THAT ITS OWN COLLECTION DIES WITH IT.
//
// The retro moves a period into .se/retro, and nothing pushes .se. On a desk
// that is the point. On a group branch the container is reclaimed, so the same
// move throws the period away. The collection is left alone and the box is told.

// noGit is a git that answers nothing, so the parts reaching a remote answer as
// they would on a box with none.
func noGit(args ...string) (string, error) { return "", nil }

func theTravelPart(t *testing.T, r Roots) TidyPart {
	t.Helper()
	for _, part := range tidyWith(r, time.Now().UTC(), noGit) {
		if part.Name == "what travels" {
			return part
		}
	}
	t.Fatal("the tidy answers no part about what travels, so a desk reads it nowhere")
	return TidyPart{}
}

// ON A GROUP BRANCH IT SAYS SO, and names the output that survives. A box told
// only that something is wrong does not know what to do instead.
func TestTheTidySaysTheRetroFolderDoesNotTravel(t *testing.T) {
	part := theTravelPart(t, aBoxOnBranch(t, "group/archive"))
	if part.Could {
		t.Fatal("it says the folder travels, and nothing pushes .se")
	}
	for _, want := range []string{".se", "spec/work", "push"} {
		if !strings.Contains(part.Why, want) {
			t.Errorf("it does not name %q: %s", want, part.Why)
		}
	}
}

// ON AN ORDINARY BRANCH NOTHING IS OWED. The disk outlives the session there,
// so the collection is the point rather than the loss.
func TestTheTidySaysNothingIsOwedOnAnOrdinaryBranch(t *testing.T) {
	part := theTravelPart(t, aBoxOnBranch(t, "v4"))
	if !part.Could {
		t.Errorf("a desk was told its folder does not travel: %s", part.Why)
	}
	if part.Why != "" {
		t.Errorf("it owes a desk something: %s", part.Why)
	}
}
