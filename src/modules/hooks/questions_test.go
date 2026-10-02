// An owner's prompt keeps the questions it asks, which the answer check
// reads, off questionsIn in .claude/skills/level0/lib/answer.js.
// [[spec/tickets/prose-tools-answer-in-go]]
package hooks

import "testing"

// A question mark inside a fence asks nothing, and a run of marks asks once. [[spec/tickets/prose-tools-answer-in-go]]
func TestAnOwnersPromptKeepsItsQuestionCount(t *testing.T) {
	text := "Does it run?? Where does it stand?\n```\nwhy?\n```\nAnd the log?"
	land := stepper()
	state := land(promptEvent, "", map[string]any{"origin": map[string]any{"kind": "composer"}, "text": text})
	if state.Questions != 3 {
		t.Errorf("the prompt keeps %d questions, and wants 3", state.Questions)
	}
}

// A helper's prompt asks the owner's answer nothing, so the count stands at none. [[spec/tickets/prose-tools-answer-in-go]]
func TestAHelpersPromptKeepsNoQuestion(t *testing.T) {
	land := stepper()
	state := land(promptEvent, "", map[string]any{"origin": map[string]any{"kind": "task"}, "text": "Does it run?"})
	if state.Questions != 0 {
		t.Errorf("a task's prompt keeps %d questions, and wants none", state.Questions)
	}
}
