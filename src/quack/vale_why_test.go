package main

import (
	"testing"
)

// A root with no Vale answers the seam a lint that stands nowhere, with the reason the JS lint names. [[spec/tickets/drafts-lint-seam-carries-why]]
func TestTheValeReasonReachesTheDraftsLint(t *testing.T) {
	t.Parallel()
	said := draftsLint(t.TempDir())("a draft", "level0-answer.md")
	if said.Stands || said.Ran || said.Why != "no vale stands here" {
		t.Errorf("draftsLint answers %+v under a root with no Vale", said)
	}
}

// A Vale reading nothing names why: its stderr where it exits on one, the run's error, or that it answered nothing. [[spec/tickets/drafts-lint-seam-carries-why]]
func TestTheValeReasonNamesWhyValeReadNothing(t *testing.T) {
	t.Parallel()
	cases := []struct {
		claim string
		ran   ranResult
		why   string
	}{
		{"stderr names the fault", ranResult{code: 2, stderr: " E100 config broken \n"}, "E100 config broken"},
		{"the run's fault names it", ranResult{code: exitFailed, fault: "fork/exec vale: permission denied"}, "fork/exec vale: permission denied"},
		{"an exit with nothing said names its status", ranResult{code: 3}, "exit status 3"},
		{"an empty answer", ranResult{}, "vale answered nothing"},
		{"an answer past JSON", ranResult{stdout: "not json"}, "vale answered no JSON: not json"},
	}
	for _, one := range cases {
		if got := unreadWhy(one.ran); got != one.why {
			t.Errorf("%s: unreadWhy answers %q, want %q", one.claim, got, one.why)
		}
	}
}
