package main

import (
	"strings"
	"testing"
)

// A REFUSAL WITH NOTHING CLAIMED ASKS BEFORE IT LISTS.
func TestTheRefusalAsksBeforeItLists(t *testing.T) {
	t.Parallel()
	said := TheList("")
	for _, asks := range []string{"only they can", "carry on"} {
		if !strings.Contains(said, asks) {
			t.Errorf("the refusal does not ask about %q: %s", asks, said)
		}
	}
}

// THE REFUSAL SAYS WHY IT CAME BACK, so a repeat is not read as a mystery.
//
// "Do anything and it is gone" was read as "do work and it is gone". An agent
// claimed, asked the engine for its status, and the status cleared the claim.
// The notice came back unchanged, so the agent read a cleared claim as a
// refused one and went round forty times.
//
// THERE IS ONE CAUSE NOW. A claim that stands is granted, so this notice coming
// back can only mean a call cleared the claim, and it says so.
func TestTheRefusalSaysTheClaimWasCleared(t *testing.T) {
	said := TheList("")
	for _, want := range []string{"CLEARED BY A CALL", "Claim again"} {
		if !strings.Contains(said, want) {
			t.Errorf("the refusal does not say %q:\n%s", want, said)
		}
	}
}
