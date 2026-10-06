// The voice's split of a commit message's findings, off the bridge's
// lib/warnings.js, and the trailers a message sheds.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"reflect"
	"testing"
)

func TestTheVoiceKeepsTheRefusals(t *testing.T) {
	found := []Row{{Rule: "level0.Private"}, {Rule: "level0.Hedge"}, {Rule: "VoiceRulesRan"}, {Rule: "PrivateLike"}}
	if got, want := RefusesIn(found), []Row{found[0], found[2]}; !reflect.DeepEqual(got, want) {
		t.Errorf("RefusesIn keeps %+v, want %+v", got, want)
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

func TestRefusesReadsTheRuleNamePastItsLastDot(t *testing.T) {
	for rule, want := range map[string]bool{"level0.Private": true, "VoiceRulesRan": true, "level0.Hedge": false, "PrivateLike": false} {
		if got := Refuses(rule); got != want {
			t.Errorf("Refuses(%s) reads %v, want %v", rule, got, want)
		}
	}
}

func TestCutFlattensTheWordsAndEndsOnTheMark(t *testing.T) {
	if got := Cut("one\n  two", LineCut); got != "one two" {
		t.Errorf("Cut reads %q, want the words on one line", got)
	}
	if got := Cut("abcdefghij", 8); got != "abcde..." {
		t.Errorf("Cut reads %q, want abcde...", got)
	}
}
