package main // level0: InPackageTest - a main package admits no outside test package

import (
	"testing"

	"quackitect/src/proc"
)

// A root with no Vale answers the seam a lint that stands nowhere, with the reason the JS lint names. [[spec/tickets/drafts-lint-seam-carries-why]]
func TestTheValeReasonReachesTheDraftsLint(t *testing.T) {
	t.Parallel()
	said := draftsLint(sharedFolder())("a draft", "level0-answer.md")
	if said.Stands || said.Ran || said.Why != "no vale stands here" {
		t.Errorf("draftsLint answers %+v under a root with no Vale", said)
	}
}

// A Vale reading nothing names why: its stderr where it exits on one, the run's error, or that it answered nothing. [[spec/tickets/drafts-lint-seam-carries-why]]
func TestTheValeReasonNamesWhyValeReadNothing(t *testing.T) {
	t.Parallel()
	cases := []struct {
		claim string
		said  proc.Said
		why   string
	}{
		{"stderr names the fault", proc.Said{Err: " E100 config broken \n", Code: 2}, "E100 config broken"},
		{"the run's fault names it", proc.Said{Err: "proc: the run passes its wait", Code: proc.NotStarted}, "proc: the run passes its wait"},
		{"an exit with no stderr names its status", proc.Said{Code: 2}, "exit status 2"},
		{"an empty answer", proc.Said{}, "vale answered nothing"},
		{"an answer past JSON", proc.Said{Out: "not json"}, "vale answered no JSON: not json"},
	}
	for _, one := range cases {
		if got := unreadWhy(one.said); got != one.why {
			t.Errorf("%s: unreadWhy answers %q, want %q", one.claim, got, one.why)
		}
	}
}
