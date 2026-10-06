package main

import "testing"

// A root with no rules answers the seam a lint that stands nowhere, with the reason. [[spec/tickets/go-rules-replace-vale]]
func TestTheRulesReasonReachesTheDraftsLint(t *testing.T) {
	t.Parallel()
	said := draftsLint(t.TempDir())("a draft", "level0-answer.md")
	if said.Stands || said.Ran || said.Why != "no rule stands at spec/config/styles/VoiceParagraph/Auxiliary.yml" {
		t.Errorf("draftsLint answers %+v under a root with no rules", said)
	}
}
