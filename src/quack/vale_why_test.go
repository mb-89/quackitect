package main

import (
	"errors"
	"os/exec"
	"testing"
)

// A root with no Vale answers the seam a lint that stands nowhere, with the reason the JS lint names. [[spec/tickets/drafts-lint-seam-carries-why]]
func TestTheValeReasonReachesTheDraftsLint(t *testing.T) {
	said := draftsLint(t.TempDir())("a draft", "level0-answer.md")
	if said.Stands || said.Ran || said.Why != "no vale stands here" {
		t.Errorf("draftsLint answers %+v under a root with no Vale", said)
	}
}

// A Vale reading nothing names why: its stderr where it exits on one, the run's error, or that it answered nothing. [[spec/tickets/drafts-lint-seam-carries-why]]
func TestTheValeReasonNamesWhyValeReadNothing(t *testing.T) {
	cases := []struct {
		claim string
		said  []byte
		err   error
		why   string
	}{
		{"stderr names the fault", nil, &exec.ExitError{Stderr: []byte(" E100 config broken \n")}, "E100 config broken"},
		{"the run's error names it", nil, errors.New("signal: killed"), "signal: killed"},
		{"an empty answer", nil, nil, "vale answered nothing"},
		{"an answer past JSON", []byte("not json"), nil, "vale answered no JSON: not json"},
	}
	for _, one := range cases {
		if got := unreadWhy(one.said, one.err); got != one.why {
			t.Errorf("%s: unreadWhy answers %q, want %q", one.claim, got, one.why)
		}
	}
}
