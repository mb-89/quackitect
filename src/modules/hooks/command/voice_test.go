// The voice's split of a commit message's findings, off the bridge's
// lib/warnings.js, and the trailers a message sheds.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"reflect"
	"testing"
)

func TestTheVoiceSplitsRefusalsFromForm(t *testing.T) {
	found := []Row{{Rule: "level0.Private"}, {Rule: "level0.Hedge"}, {Rule: "VoiceRulesRan"}, {Rule: "PrivateLike"}}
	if got, want := RefusesIn(found), []Row{found[0], found[2]}; !reflect.DeepEqual(got, want) {
		t.Errorf("RefusesIn keeps %+v, want %+v", got, want)
	}
	if got, want := FormIn(found), []Row{found[1], found[3]}; !reflect.DeepEqual(got, want) {
		t.Errorf("FormIn keeps %+v, want %+v", got, want)
	}
}

func TestWithoutTrailersDropsTheClosingTrailers(t *testing.T) {
	for _, one := range []struct{ said, want string }{
		{"the change\n\nCo-Authored-By: a b\nClaude-Session: x\n", "the change"},
		{"the change\n\nthe body", "the change\n\nthe body"},
		{"Fixes: one line alone", "Fixes: one line alone"},
	} {
		if got := WithoutTrailers(one.said); got != one.want {
			t.Errorf("WithoutTrailers(%q) reads %q, want %q", one.said, got, one.want)
		}
	}
}
