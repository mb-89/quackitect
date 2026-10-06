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

// A trailer naming a model comes back as one refusing row carrying the line. [[spec/tickets/commit-door-refuses-model-trailers]]
func TestModelTrailersRefusesATrailerNamingAModel(t *testing.T) {
	for _, line := range []string{
		"Co-Authored-By: Claude Opus 5.5",
		"Co-Authored-By: Claude Sonnet",
		"Assisted-By: claude-fable-5-1",
		"Co-Authored-By: GPT-5",
	} {
		rows := ModelTrailers("the change\n\nthe body\n\n" + line + "\nClaude-Session: https://claude.ai/code/x\n")
		if len(rows) != 1 || rows[0].Rule != "ModelTrailer" || rows[0].Said != line || !Refuses(rows[0].Rule) || rows[0].Message == "" {
			t.Errorf("ModelTrailers over %q reads %v", line, rows)
		}
	}
}

// A session link, and a model named in the body alone, pass. [[spec/tickets/commit-door-refuses-model-trailers]]
func TestModelTrailersPassesASessionLink(t *testing.T) {
	for _, said := range []string{
		"the change\n\nClaude-Session: https://claude.ai/code/session_x\n",
		"the opus helper moves\n\nthe body names sonnet",
	} {
		if rows := ModelTrailers(said); len(rows) != 0 {
			t.Errorf("ModelTrailers over %q reads %v", said, rows)
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
