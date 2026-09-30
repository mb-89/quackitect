// The canary block and its debt against the bridge: one case table, which the
// JavaScript counts write, and the door answers alike.
// [[spec/tickets/brief-answers-off-the-door]]
package hooks

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"testing"
)

// The case table the JavaScript counts write, the events the brief reads, and an answer naming no canary. [[spec/tickets/brief-answers-off-the-door]]
const (
	briefCases  = cageLogs + "/brief-cases.json"
	contextPost = "prompt.context"
	compactPost = "session.compact"
	plainAnswer = "I read the tree."
)

type briefRow struct {
	Name     string            `json:"name"`
	Stop     bool              `json:"stop"`
	Files    map[string]string `json:"files"`
	Rules    int               `json:"rules"`
	Notes    int               `json:"notes"`
	Sentence string            `json:"sentence"`
	Canary   string            `json:"canary"`
	Owes     string            `json:"owes"`
}

// The rows the JavaScript counts write. [[spec/tickets/brief-answers-off-the-door]]
func briefRowsOf(t *testing.T) []briefRow {
	t.Helper()
	body, err := os.ReadFile(briefCases)
	if err != nil {
		t.Fatal(err)
	}
	var table struct {
		Cases []briefRow `json:"cases"`
	}
	if err := json.Unmarshal(body, &table); err != nil {
		t.Fatal(err)
	}
	if len(table.Cases) == 0 {
		t.Fatalf("no case stands in %s", briefCases)
	}
	return table.Cases
}

// A door over the row's notes, with the stop hook the row names, and a sender posting each event there as the session s1. [[spec/tickets/brief-answers-off-the-door]]
func briefDoor(t *testing.T, one briefRow) func(event string, e map[string]any) Answer {
	t.Helper()
	root := treeOf(t, one.Files, "")
	door := holdDoor(t, Settings{Words: nameWords, Binding: queueBinding, BindingLayer: builtInLayer, StopOff: !one.Stop})
	return func(event string, e map[string]any) Answer {
		t.Helper()
		post := postOf(holdPost{Event: event, E: e})
		post.Root = root
		said, err := door.Hook(post)
		if err != nil {
			t.Fatal(err)
		}
		return said
	}
}

// A call no rule of the door holds or refuses. [[spec/tickets/brief-answers-off-the-door]]
func readCall() map[string]any {
	return map[string]any{"tool": "Read", "input": map[string]any{"file_path": "README.md"}}
}

// Whether an after effect of the answer carries the text whole. [[spec/tickets/brief-answers-off-the-door]]
func afterHolds(said Answer, text string) bool {
	for _, one := range said.Effects {
		if one.Kind == afterKind && one.Text == text {
			return true
		}
	}
	return false
}

// A session that reads its context and ends its first turn on no canary line. [[spec/tickets/brief-answers-off-the-door]]
func owedAfterATurn(send func(string, map[string]any) Answer) {
	send(startEvent, map[string]any{})
	send(contextPost, map[string]any{})
	send(turnEvent, map[string]any{"reason": answerReason, "answer": plainAnswer})
}

// Every row's prompt context after a start answers an after carrying the canary block, with the counts the JavaScript gives. [[spec/tickets/brief-answers-off-the-door]]
func TestAPromptContextAfterAStartAnswersTheCanary(t *testing.T) {
	for _, one := range briefRowsOf(t) {
		t.Run(one.Name, func(t *testing.T) {
			if counts := fmt.Sprintf("%d rules, %d notes", one.Rules, one.Notes); !strings.Contains(one.Sentence, counts) {
				t.Fatalf("the row's sentence %q names no %q", one.Sentence, counts)
			}
			send := briefDoor(t, one)
			send(startEvent, map[string]any{})
			said := send(contextPost, map[string]any{})
			if !afterHolds(said, one.Canary) {
				t.Fatalf("a prompt context after a start answers %+v, and wants an after carrying the canary block of %q", said.Effects, one.Sentence)
			}
		})
	}
}

// A first turn ending on no canary line opens the debt, and the next call carries the owes line. [[spec/tickets/brief-answers-off-the-door]]
func TestAnOpenDebtRidesTheNextCall(t *testing.T) {
	one := briefRowsOf(t)[0]
	send := briefDoor(t, one)
	owedAfterATurn(send)
	if said := send(toolEvent, readCall()); !afterHolds(said, one.Owes) {
		t.Fatalf("the call after an unpaid turn answers %+v, and wants an after carrying the owes line of %q", said.Effects, one.Sentence)
	}
}

// A step opening on the canary line pays the open debt, and the next call carries no owes line. [[spec/tickets/brief-answers-off-the-door]]
func TestTheCanaryLinePaysTheDebt(t *testing.T) {
	one := briefRowsOf(t)[0]
	send := briefDoor(t, one)
	owedAfterATurn(send)
	if said := send(toolEvent, readCall()); !afterHolds(said, one.Owes) {
		t.Fatalf("the call before the line answers %+v, and wants the debt standing", said.Effects)
	}
	send(saidEvent, map[string]any{"text": one.Sentence + "\n\nI read the tree next."})
	if said := send(toolEvent, readCall()); afterHolds(said, one.Owes) {
		t.Fatalf("the call after the line answers %+v, and wants no owes line", said.Effects)
	}
}

// A compaction reopens a paid debt, and the next call carries the owes line again. [[spec/tickets/brief-answers-off-the-door]]
func TestACompactionOpensTheDebtAgain(t *testing.T) {
	one := briefRowsOf(t)[0]
	send := briefDoor(t, one)
	send(startEvent, map[string]any{})
	send(contextPost, map[string]any{})
	send(saidEvent, map[string]any{"text": one.Sentence + "\n\nI read the tree next."})
	send(turnEvent, map[string]any{"reason": answerReason, "answer": one.Sentence})
	if said := send(toolEvent, readCall()); afterHolds(said, one.Owes) {
		t.Fatalf("the call after a paid turn answers %+v, and wants no owes line", said.Effects)
	}
	send(compactPost, map[string]any{"trigger": "auto"})
	if said := send(toolEvent, readCall()); !afterHolds(said, one.Owes) {
		t.Fatalf("the call after a compaction answers %+v, and wants an after carrying the owes line of %q", said.Effects, one.Sentence)
	}
}
