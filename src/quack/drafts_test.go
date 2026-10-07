// The drafts module loads beside the others, and quack answers its checks
// through the IO side, with the lint off heardOver.
// [[spec/tickets/prose-tools-answer-in-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"testing"

	"quackitect/src/modules/drafts"
	"quackitect/src/q"
)

// A tree with no rules reads the draft nowhere, as the bridge says. [[spec/tickets/prose-tools-answer-in-go]]
func TestQuackAnswersAnAnswerCheckWithNoRulesAsTheBridgeDoes(t *testing.T) {
	t.Parallel()
	ask := accepts(t.TempDir(), nil, nil) // level0: FixtureOutsideHome - the check reads a root of the case's own where no Vale stands
	said, err := ask(q.Request{Module: drafts.Module, Verb: drafts.AnswerVerb, Args: drafts.Answer{Text: "The door reads the note."}})
	if err != nil {
		t.Fatalf("quack refuses the drafts module: %v", err)
	}
	if want := "No voice rules stand here, so the draft goes unread."; said != want {
		t.Errorf("the answer check answers %q, and wants %q", said, want)
	}
}
