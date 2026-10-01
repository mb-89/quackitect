// The clear the door answers at a turn's end, off clearsAfter in
// src/bridge/handover.js.
// [[spec/tickets/clear-answers-off-the-door]]
package hooks

import (
	"encoding/json"
	"strings"
	"testing"
)

// The effect the clear answers with, and the opening of the resume prompt, off RESUME in handover.js. [[spec/tickets/clear-answers-off-the-door]]
const (
	clearEffect = "clear"
	resumeOpens = "Level zero cleared the conversation"
)

// A session holding the clear under the binding named: a Stop sets the handover at clear, then the answered turn ends. [[spec/tickets/clear-answers-off-the-door]]
func turnEndsHoldingTheClear(t *testing.T, binding string) Answer {
	t.Helper()
	clear, _ := json.Marshal(map[string]any{"ticket": clearTicket, "ephemeral": true})
	root := treeOf(t, map[string]string{clearHold: string(clear)}, "")
	door := holdDoor(t, Settings{Binding: queueBinding, BindingLayer: builtInLayer, HandoverAt: caseMark})
	if _, err := door.Hook(Post{Event: stopEvent, Root: root, E: map[string]any{"session_id": "s1"}}); err != nil {
		t.Fatal(err)
	}
	door.from.Config = func(string) Settings {
		return Settings{Binding: binding, BindingLayer: builtInLayer, HandoverAt: caseMark}
	}
	said, err := door.Hook(Post{Event: turnEvent, Root: root, E: map[string]any{"session_id": "s1", "reason": answerReason, "answer": "The handover stands."}})
	if err != nil {
		t.Fatal(err)
	}
	return said
}

// [[spec/tickets/clear-answers-off-the-door]]
func TestATurnCompleteWithTheClearInHandAnswersTheClear(t *testing.T) {
	said := turnEndsHoldingTheClear(t, queueBinding)

	for _, one := range said.Effects {
		if one.Kind == clearEffect && strings.HasPrefix(one.Text, resumeOpens) {
			return
		}
	}
	t.Fatalf("the turn's end with the clear in hand answers %+v, and wants a clear carrying the resume prompt", said.Effects)
}

// [[spec/tickets/clear-answers-off-the-door]]
func TestATurnCompleteOffTheQueueKeepsTheConversation(t *testing.T) {
	said := turnEndsHoldingTheClear(t, godBinding)

	for _, one := range said.Effects {
		if one.Kind == clearEffect {
			t.Fatalf("a binding moved off the queue answers %+v, and keeps the conversation", said.Effects)
		}
	}
}
