// The drafts module loads beside the others, and quack answers its checks
// through the IO side, with Vale off heardOver.
// [[spec/tickets/prose-tools-answer-in-go]]
package main

import (
	"testing"

	"quackitect/src/modules/drafts"
	"quackitect/src/q"
)

// [[spec/tickets/prose-tools-answer-in-go]]
func TestTheDraftsModuleLoads(t *testing.T) {
	if _, ok := modules[drafts.Module]; !ok {
		t.Errorf("quack loads no module type %q", drafts.Module)
	}
}

// A tree with no Vale reads the draft nowhere, as the bridge says. [[spec/tickets/prose-tools-answer-in-go]]
func TestQuackAnswersAnAnswerCheckWithNoValeAsTheBridgeDoes(t *testing.T) {
	ask := accepts(t.TempDir(), nil, nil)
	said, err := ask(q.Request{Module: drafts.Module, Verb: drafts.AnswerVerb, Args: drafts.Answer{Text: "The door reads the note."}})
	if err != nil {
		t.Fatalf("quack refuses the drafts module: %v", err)
	}
	if want := "No vale stands here, so the draft goes unread."; said != want {
		t.Errorf("the answer check answers %q, and wants %q", said, want)
	}
}
