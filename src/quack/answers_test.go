// The log, report and stop tools answer the bridge's text off the hooks door
// over the real wiring, before any action runs.
// [[spec/tickets/log-report-stop-in-go]]
package main

import (
	"strings"
	"testing"

	"quackitect/src/modules/hooks"
)

// What the door answers a level zero call with, as the tool's result. [[spec/tickets/log-report-stop-in-go]]
func answeredBy(t *testing.T, door *hooks.Door, tool string, input map[string]any) string {
	t.Helper()
	answer, err := door.Hook(hooks.Post{Event: "tool.call", E: map[string]any{"tool": tool, "input": input, "session_id": waitSession}})
	if err != nil {
		t.Fatal(err)
	}
	for _, one := range answer.Effects {
		if said, ok := one.Result.(string); ok && one.Kind == "result" && one.Text == "" {
			return said
		}
	}
	return ""
}

// [[spec/tickets/log-report-stop-in-go]]
func TestTheLogReportAndStopToolsAnswerOffTheDoor(t *testing.T) {
	door := waitWorldOf(t).door
	if said, want := answeredBy(t, door, "mcp__level0__report", map[string]any{"text": "Half way."}), "The reply stands in the log. Nothing asked for one, so carry on, and write it in the chat too where the owner reads it."; said != want {
		t.Errorf("the report answers %q, and wants %q", said, want)
	}
	if said, want := answeredBy(t, door, "mcp__level0__log", map[string]any{"kind": "port", "said": "The find lands."}), "The line stands in the log under port."; said != want {
		t.Errorf("the log answers %q, and wants %q", said, want)
	}
	if said, want := answeredBy(t, door, "mcp__level0__stop", map[string]any{"reason": "the-moon-is-full"}), "the-moon-is-full names no reason this tree holds."; !strings.HasPrefix(said, want) {
		t.Errorf("the stop answers %q, and wants it to open on %q", said, want)
	}
}
