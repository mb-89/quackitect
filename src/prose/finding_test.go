// The body names each finding, the text it wrote and the line it stands in,
// and closes on the Hold line naming each rule once.
// [[spec/tickets/prose-tools-answer-in-go]]
package prose

import "testing"

// [[spec/tickets/prose-tools-answer-in-go]]
func TestTheBodyNamesEachFindingAndTheHold(t *testing.T) {
	found := []Refused{
		{Line: 1, Column: 10, Rule: "VoiceVale.Jargon", Message: "Name the thing.", Said: "leverages", Context: "The door leverages the synergy."},
		{Line: 2, Column: 1, Rule: "VoiceVale.Hedge", Message: "Cut the hedge."},
		{Line: 3, Column: 4, Rule: "VoiceVale.Jargon", Message: "Name the thing.", Said: "synergy"},
	}
	want := "  spec/a.md:1:10  VoiceVale.Jargon\n    wrote: leverages\n    in: The door leverages the synergy.\n    Name the thing.\n\n" +
		"  spec/a.md:2:1  VoiceVale.Hedge\n    Cut the hedge.\n\n" +
		"  spec/a.md:3:4  VoiceVale.Jargon\n    wrote: synergy\n    Name the thing.\n\n" +
		"Hold VoiceVale.Jargon and VoiceVale.Hedge for the rest of this turn: apply the same rule to every line you write next, and fix the lines you already wrote if they break it."
	if said := Body("spec/a.md", found); said != want {
		t.Errorf("the body reads %q, and wants %q", said, want)
	}
}
