// Copilot's replies on each surface, and the event a hook input reads as,
// the cases copilot.test.js held. [[spec/tickets/copilot-hooks-run-in-go]]
package hooks_test

import (
	"reflect"
	"strings"
	"testing"

	"quackitect/src/modules/hooks"
)

func TestCopilotReplyShapesEachSurface(t *testing.T) {
	t.Parallel()
	vscode := func(event string) hooks.CopilotEvent { return hooks.CopilotEvent{Event: event, Surface: "vscode"} }
	cloud := func(event string) hooks.CopilotEvent { return hooks.CopilotEvent{Event: event, Surface: "cloud"} }
	cases := []struct {
		name   string
		event  hooks.CopilotEvent
		result hooks.CopilotResult
		want   map[string]any
	}{
		{"vscode deny", vscode("PreToolUse"), hooks.CopilotResult{Deny: "Fix line two."}, map[string]any{"hookSpecificOutput": map[string]any{
			"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "Fix line two.", "additionalContext": "Fix line two.",
		}}},
		{"cloud deny", cloud("PreToolUse"), hooks.CopilotResult{Deny: "Fix line two."}, map[string]any{"permissionDecision": "deny", "permissionDecisionReason": "Fix line two."}},
		{"vscode block", vscode("Stop"), hooks.CopilotResult{Block: "Write the result."}, map[string]any{"hookSpecificOutput": map[string]any{
			"hookEventName": "Stop", "decision": "block", "reason": "Write the result.",
		}}},
		{"cloud block", cloud("Stop"), hooks.CopilotResult{Block: "Write the result."}, map[string]any{"decision": "block", "reason": "Write the result."}},
		{"vscode context", vscode("SessionStart"), hooks.CopilotResult{Context: "one note"}, map[string]any{"hookSpecificOutput": map[string]any{
			"hookEventName": "SessionStart", "additionalContext": "one note",
		}}},
		{"cloud context", cloud("SessionStart"), hooks.CopilotResult{Context: "one note"}, map[string]any{"additionalContext": "one note"}},
		{"vscode failed", vscode("Stop"), hooks.CopilotResult{Failed: "Checker missing"}, map[string]any{"continue": false, "stopReason": "Checker missing", "systemMessage": "Checker missing"}},
		{"cloud failed", cloud("Stop"), hooks.CopilotResult{Failed: "Checker missing"}, map[string]any{"additionalContext": "Checker missing"}},
		{"vscode nothing", vscode("PostToolUse"), hooks.CopilotResult{}, map[string]any{}},
		{"cloud nothing", cloud("PostToolUse"), hooks.CopilotResult{}, map[string]any{}},
	}
	for _, one := range cases {
		if got := hooks.ReplyOf(one.event, one.result); !reflect.DeepEqual(got, one.want) {
			t.Errorf("%s replies %#v, and wants %#v", one.name, got, one.want)
		}
	}
	if got := hooks.FailureOf(vscode("PreToolUse"), "Level zero: down"); got != (hooks.CopilotResult{Deny: "Level zero: down"}) {
		t.Errorf("a failing call answers %+v, and wants the deny", got)
	}
	if got := hooks.FailureOf(vscode("Stop"), "Level zero: down"); got != (hooks.CopilotResult{Block: "Level zero: down"}) {
		t.Errorf("a failing Stop answers %+v, and wants the block", got)
	}
	retry := hooks.CopilotEvent{Event: "Stop", Surface: "vscode", Retry: true}
	if got := hooks.FailureOf(retry, "Level zero: down"); got != (hooks.CopilotResult{Failed: "Level zero: down"}) {
		t.Errorf("a failing retry answers %+v, and wants the failure", got)
	}
	want := hooks.CopilotResult{Context: "Level zero: down The cage is not ready; do not claim otherwise."}
	if got := hooks.FailureOf(vscode("SessionStart"), "Level zero: down"); got != want {
		t.Errorf("a failing start answers %+v, and wants %+v", got, want)
	}
}

func TestCopilotEventKeepsTheLastToolName(t *testing.T) {
	t.Parallel()
	event, err := hooks.EventOf(map[string]any{"tool_name": "functions.run_in_terminal", "session_id": "s1"}, "PreToolUse", "vscode")
	if err != nil || event.Tool != "run_in_terminal" || event.Session != "s1" || event.Event != "PreToolUse" {
		t.Errorf("a namespaced tool reads %+v, %v, and wants run_in_terminal on s1", event, err)
	}
	for _, args := range []any{map[string]any{"path": "a.md"}, `{"path":"a.md"}`} {
		event, err := hooks.EventOf(map[string]any{"sessionId": "one", "toolName": "edit", "toolArgs": args}, "preToolUse", "cloud")
		if err != nil || event.Session != "one" || event.Event != "PreToolUse" || event.Surface != "cloud" || !reflect.DeepEqual(event.Args, map[string]any{"path": "a.md"}) {
			t.Errorf("cloud arguments %v read %+v, %v, and want the path on one", args, event, err)
		}
	}
	if numbered, err := hooks.EventOf(map[string]any{"tool_name": "edit", "session_id": 7}, "PreToolUse", "vscode"); err != nil || numbered.Session != "7" {
		t.Errorf("a numbered session reads %+v, %v, and wants the session as its text", numbered, err)
	}
	if stop, err := hooks.EventOf(map[string]any{"stop_hook_active": true}, "agentStop", "vscode"); err != nil || stop.Event != "Stop" || !stop.Retry {
		t.Errorf("a repeated agent stop reads %+v, %v, and wants a Stop retry", stop, err)
	}
	if _, err := hooks.EventOf(map[string]any{}, "PreToolUse", "other"); err == nil || !strings.Contains(err.Error(), "surface") {
		t.Errorf("an unknown surface answers %v, and wants a refusal naming the surface", err)
	}
}
