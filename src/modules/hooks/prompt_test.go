// The prompt the door answers, off onPromptSubmit in src/bridge/answer.js:
// the answer-first line in front of an owner's prompt, and a row of the
// session log for every prompt.
// [[spec/tickets/prompt-answers-off-the-door]]
package hooks

import (
	"encoding/json"
	"strings"
	"testing"
)

// The event the prompt arrives on, the effect a rewrite answers with, the answer-first line's opening off warns in lib/answer.js, and the session log lib/folders.js owns. [[spec/tickets/prompt-answers-off-the-door]]
const (
	submitEvent  = "prompt.submit"
	eventEffect  = "event"
	answerFirst  = "The owner sent a prompt, and nothing has answered it yet."
	sessionRows  = ".se/.log/session.jsonl"
	ownerPrompt  = "Take the next ticket."
	handBackText = "The helper's report stands."
)

// A prompt from the origin named, posted to a door over a fresh tree, and the answer and the tree. [[spec/tickets/prompt-answers-off-the-door]]
func prompts(t *testing.T, origin, text string) (Answer, string) {
	t.Helper()
	root := treeOf(t, map[string]string{}, "")
	door := holdDoor(t, Settings{Binding: queueBinding, BindingLayer: builtInLayer})
	said, err := door.Hook(Post{Event: submitEvent, Root: root, E: map[string]any{
		"session_id": "s1", "text": text, "before": "row-1", "origin": map[string]any{"kind": origin},
	}})
	if err != nil {
		t.Fatal(err)
	}
	return said, root
}

// The rows of the session log under the root. [[spec/tickets/prompt-answers-off-the-door]]
func rowsUnder(root string) []map[string]any {
	body, _ := (disk{root}).Read(sessionRows)
	var rows []map[string]any
	for _, line := range strings.Split(body, "\n") {
		var row map[string]any
		if json.Unmarshal([]byte(line), &row) == nil {
			rows = append(rows, row)
		}
	}
	return rows
}

// [[spec/tickets/prompt-answers-off-the-door]]
func TestAnOwnersPromptAnswersTheEventOpeningOnTheAnswerFirstLine(t *testing.T) {
	said, _ := prompts(t, "composer", ownerPrompt)

	for _, one := range said.Effects {
		event, _ := one.Result.(map[string]any)
		text := textOf(event, "text")
		if one.Kind == eventEffect && strings.HasPrefix(text, answerFirst) && strings.HasSuffix(text, ownerPrompt) {
			if _, rides := event["before"]; rides {
				t.Fatalf("the rewritten event carries before: %+v", event)
			}
			return
		}
	}
	t.Fatalf("an owner's prompt answers %+v, and wants an event opening on the answer-first line", said.Effects)
}

// [[spec/tickets/prompt-answers-off-the-door]]
func TestAPromptLandsAsARowOfTheSessionLog(t *testing.T) {
	_, root := prompts(t, "composer", ownerPrompt)

	for _, row := range rowsUnder(root) {
		if textOf(row, "kind") == "prompt" && textOf(row, "text") == ownerPrompt {
			return
		}
	}
	t.Fatalf("the session log holds %v, and wants a prompt row carrying the prompt", rowsUnder(root))
}

// [[spec/tickets/prompt-answers-off-the-door]]
func TestAHelpersHandBackLandsAsAnAgentRowAndPasses(t *testing.T) {
	said, root := prompts(t, "task-notification", handBackText)

	for _, one := range said.Effects {
		if one.Kind == eventEffect {
			t.Fatalf("a hand-back answers %+v, and asks for no reply", said.Effects)
		}
	}
	for _, row := range rowsUnder(root) {
		if textOf(row, "kind") == "agent" && textOf(row, "text") == handBackText {
			return
		}
	}
	t.Fatalf("the session log holds %v, and wants an agent row carrying the hand-back", rowsUnder(root))
}
