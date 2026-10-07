package main // level0: InPackageTest - a main package admits no outside test package

import "testing"

// A root with no rules answers the seam a lint that stands nowhere, with the reason. [[spec/tickets/go-rules-replace-vale]]
// level0: FixtureOutsideHome - the case needs an empty root of its own, where no rule stands
func TestTheRulesReasonReachesTheDraftsLint(t *testing.T) {
	t.Parallel()
	said := draftsLint(t.TempDir())("a draft", "level0-answer.md")
	if said.Stands || said.Ran || said.Why != "no rule stands at spec/config/styles/VoiceParagraph/Auxiliary.yml" {
		t.Errorf("draftsLint answers %+v under a root with no rules", said)
	}
}
