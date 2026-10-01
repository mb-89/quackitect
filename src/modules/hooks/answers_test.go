// The log, report and stop calls answer the bridge's text off the folds that
// land them, and the door answers that text as the tool's result.
// [[spec/tickets/log-report-stop-in-go]]
package hooks

import (
	"strings"
	"testing"

	"quackitect/src/modules/hooks/stop"
	"quackitect/src/q"
)

// The log tool's call, and the reason no rule names. [[spec/tickets/log-report-stop-in-go]]
const (
	logCallName = levelZero + "log"
	noReason    = "the-moon-is-full"
)

// [[spec/tickets/log-report-stop-in-go]]
func TestAReportWithNoDemandAnswersTheBridgesLine(t *testing.T) {
	land := stepper()
	state := land(toolEvent, "", map[string]any{"tool": reportCall, "text": "The branch stands green."})
	if want := "The reply stands in the log. Nothing asked for one, so carry on, and write it in the chat too where the owner reads it."; state.Said.Result != want {
		t.Errorf("the report answers %q, and wants %q", state.Said.Result, want)
	}
	if len(state.Said.Rows) != 1 || state.Said.Rows[0].Kind != "reply" || state.Said.Rows[0].Text != "The branch stands green." {
		t.Errorf("the report lands the rows %+v, and wants one reply row carrying its text", state.Said.Rows)
	}
	if state = land(toolEvent, "", map[string]any{"tool": reportCall, "text": "  "}); state.Said.Result != "report takes the text of the reply." {
		t.Errorf("a report with no text answers %q, and wants: report takes the text of the reply.", state.Said.Result)
	}
}

// [[spec/tickets/log-report-stop-in-go]]
func TestAReportPayingTheDemandNamesWhatItAnswers(t *testing.T) {
	land := stepper()
	land(promptEvent, "", map[string]any{"origin": map[string]any{"kind": "composer"}, "text": "How far along?"})
	state := land(toolEvent, "", map[string]any{"tool": reportCall, "text": "Half way."})
	if want := "The reply stands in the log, and it answers: " + promptWhy + ". Write it in the chat too, as text, and carry on."; state.Said.Result != want {
		t.Errorf("the report answers %q, and wants %q", state.Said.Result, want)
	}
}

// [[spec/tickets/log-report-stop-in-go]]
func TestAReportLackingTheDemandSaysWhatItLacks(t *testing.T) {
	demand := &Demand{Why: "The owner asks for a full update", Chapters: []string{"Done", "Now", "Open", "ETA"}}
	text := "Done: the port."
	lacks := demand.lacks(text)
	if lacks == "" {
		t.Fatalf("a text with one chapter lacks nothing, and the case wants a lack")
	}
	state := stepHolds(Holds{Demand: demand}, q.Event{Seq: 1, Kind: toolEvent, Hand: q.Hand{Session: "s1"}, Fields: map[string]any{"tool": reportCall, "text": text}})
	if state.Said.Result != lacks {
		t.Errorf("the report answers %q, and wants what the demand lacks: %q", state.Said.Result, lacks)
	}
}

// [[spec/tickets/log-report-stop-in-go]]
func TestALogCallLandsItsRowAndNamesItsKind(t *testing.T) {
	land := stepper()
	state := land(toolEvent, "", map[string]any{"tool": logCallName, "kind": "port", "said": "The find lands.", "level": "warn", "text": "in detail"})
	if want := "The line stands in the log under port."; state.Said.Result != want {
		t.Errorf("the log answers %q, and wants %q", state.Said.Result, want)
	}
	if rows := state.Said.Rows; len(rows) != 1 || rows[0].Level != "warn" || rows[0].Kind != "port" || rows[0].Said != "The find lands." || rows[0].Text != "in detail" {
		t.Errorf("the log lands the rows %+v, and wants one warn row of kind port", rows)
	}
	if state = land(toolEvent, "", map[string]any{"tool": logCallName, "kind": "port", "level": "loud"}); state.Said.Result != "log takes a kind and one sentence." || len(state.Said.Rows) != 0 {
		t.Errorf("a log with no sentence answers %q and %d rows, and wants: log takes a kind and one sentence.", state.Said.Result, len(state.Said.Rows))
	}
	if state = land(toolEvent, "", map[string]any{"tool": logCallName, "kind": "port", "said": "Loud.", "level": "loud"}); len(state.Said.Rows) != 1 || state.Said.Rows[0].Level != "info" {
		t.Errorf("a log at a level nobody names lands %+v, and wants an info row", state.Said.Rows)
	}
}

// The facts a stop call reads: the case's rules and the queue's binding. [[spec/tickets/log-report-stop-in-go]]
func stopFields(t *testing.T, reason string, facts Stopped) map[string]any {
	t.Helper()
	rules, _ := stop.RulesOf(caseRules)
	facts.Rules = rules
	return map[string]any{"tool": stopCall, "reason": reason, heldField: map[string]any{heldBinding: queueBinding}, stoppedField: facts}
}

// [[spec/tickets/log-report-stop-in-go]]
func TestAStopNamingNoReasonListsTheIds(t *testing.T) {
	state := stopStepper()(toolEvent, "", stopFields(t, noReason, Stopped{}), Holds{})
	rules, _ := stop.RulesOf(caseRules)
	var ids []string
	for _, one := range stop.StopReasons(rules) {
		ids = append(ids, one.ID)
	}
	if want := noReason + " names no reason this tree holds. The ids: " + strings.Join(ids, ", ") + "."; state.Said.Result != want {
		t.Errorf("the stop answers %q, and wants %q", state.Said.Result, want)
	}
}

// [[spec/tickets/log-report-stop-in-go]]
func TestAStopWhoseCheckFallsSaysWhy(t *testing.T) {
	state := stopStepper()(toolEvent, "", stopFields(t, "the-work-stands-complete", Stopped{Working: "a-ticket"}), Holds{})
	if !strings.HasPrefix(state.Said.Result, "The claim falls. ") || len(state.Said.Result) <= len("The claim falls. ") || state.Claim != "" {
		t.Errorf("a stop over a ticket in hand answers %q and claims %q, and wants: The claim falls. and why, with no claim", state.Said.Result, state.Claim)
	}
}

// [[spec/tickets/log-report-stop-in-go]]
func TestAStopThatStandsAnswersTheStopLine(t *testing.T) {
	state := stopStepper()(toolEvent, "", stopFields(t, "the-work-stands-complete", Stopped{}), Holds{})
	if want := "The claim stands. The answer before this call carries the report, so end the turn with the line stop: the-work-stands-complete alone. The owner reads the answer once."; state.Said.Result != want {
		t.Errorf("the stop answers %q, and wants %q", state.Said.Result, want)
	}
}

// The door answers a report call with the fold's text as the tool's result. [[spec/tickets/log-report-stop-in-go]]
func TestTheDoorAnswersAReportWithItsText(t *testing.T) {
	world := doorOver(t, &calls{}, &book{})
	said := hooks(t, world.door, Post{Event: toolEvent, E: map[string]any{"tool": reportCall, "input": map[string]any{"text": "Done."}, "session_id": "s1"}})
	for _, one := range said.Effects {
		if one.Kind == resultKind && one.Text == "" && strings.HasPrefix(one.Result.(string), "The reply stands in the log.") {
			return
		}
	}
	t.Errorf("the door answers %+v, and wants the report's text as the tool's result", said.Effects)
}
