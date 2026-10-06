// The clear the door answers at a turn's end, off clearsAfter in
// src/bridge/handover.js. The Stop answers it, whichever end of the turn
// lands first.
// [[spec/tickets/clear-answers-off-the-door]] [[spec/tickets/the-clear-continues-the-session]]
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
	readHold    = "read-handover"
)

// A session holding the clear under the binding named ends its answered turn, with the turn's two ends in the order named, and answers what each end answers. [[spec/tickets/the-clear-continues-the-session]]
func turnEndsHoldingTheClear(t *testing.T, binding string, ends ...string) map[string]Answer {
	t.Helper()
	clear, _ := json.Marshal(map[string]any{"ticket": clearTicket, "ephemeral": true})
	root := treeOf(t, map[string]string{clearHold: string(clear)}, "")
	door := holdDoor(t, Settings{Binding: binding, BindingLayer: builtInLayer, HandoverAt: caseMark})
	said := map[string]Answer{}
	for _, event := range ends {
		e := map[string]any{"session_id": "s1"}
		if event == turnEvent {
			e["reason"], e["answer"] = answerReason, "The handover stands."
		}
		answer, err := door.Hook(Post{Event: event, Root: root, E: e})
		if err != nil {
			t.Fatal(err)
		}
		said[event] = answer
	}
	return said
}

func clears(answer Answer) bool {
	for _, one := range answer.Effects {
		if one.Kind == clearEffect && strings.HasPrefix(one.Text, resumeOpens) {
			return true
		}
	}
	return false
}

// [[spec/tickets/the-clear-continues-the-session]]
func TestAStopWithTheClearInHandAnswersTheClear(t *testing.T) {
	said := turnEndsHoldingTheClear(t, queueBinding, stopEvent, turnEvent)

	if !clears(said[stopEvent]) {
		t.Fatalf("the Stop with the clear in hand answers %+v, and wants a clear carrying the resume prompt", said[stopEvent].Effects)
	}
	if clears(said[turnEvent]) {
		t.Fatalf("the turn complete after the clear answers %+v, and wants no second clear", said[turnEvent].Effects)
	}
}

// [[spec/tickets/the-clear-continues-the-session]]
func TestATurnCompleteLandingFirstStillClears(t *testing.T) {
	said := turnEndsHoldingTheClear(t, queueBinding, turnEvent, stopEvent)

	if !clears(said[stopEvent]) {
		t.Fatalf("the Stop after the turn complete answers %+v, and wants a clear carrying the resume prompt", said[stopEvent].Effects)
	}
}

// [[spec/tickets/clear-answers-off-the-door]]
func TestAStopOffTheQueueKeepsTheConversation(t *testing.T) {
	said := turnEndsHoldingTheClear(t, godBinding, stopEvent, turnEvent)

	for _, answer := range said {
		for _, one := range answer.Effects {
			if one.Kind == clearEffect {
				t.Fatalf("a binding off the queue answers %+v, and keeps the conversation", answer.Effects)
			}
		}
	}
}

// The Stop that answers the clear puts the read in the clear's place, keeping its hand and its stamp, and drops the due mark, so the pull after the clear hands the next leaf. [[spec/tickets/the-clear-hands-back-the-leaf]]
func TestTheClearAtTheStopHandsTheReadAndDropsTheDueMark(t *testing.T) {
	clear, _ := json.Marshal(map[string]any{"ticket": clearTicket, "step": clearTicket, "ephemeral": true, "hand": myHand, "taken": "t0"})
	root := treeOf(t, map[string]string{clearHold: string(clear), dueMark: `{"tokens":5000,"at":1000}`}, "")
	door := marksDoor(t)

	answer, err := door.Hook(Post{Event: stopEvent, Root: root, E: map[string]any{"session_id": "s1"}})
	if err != nil {
		t.Fatal(err)
	}

	if !clears(answer) {
		t.Fatalf("the Stop with the clear in hand answers %+v, and wants the clear", answer.Effects)
	}
	body, ok := (disk{root}).Read(clearHold)
	var held map[string]any
	if !ok || json.Unmarshal([]byte(body), &held) != nil {
		t.Fatalf("the hold after the clear reads %q", body)
	}
	if held["ticket"] != readHold || held["step"] != readHold || held["ephemeral"] != true || held["hand"] != myHand || held["taken"] != "t0" {
		t.Fatalf("the hold after the clear reads %v, and wants %s in the clear's hand", held, readHold)
	}
	if _, ok := (disk{root}).Read(dueMark); ok {
		t.Fatalf("the due mark stands after the clear, so the pull hands the handover again")
	}
}
