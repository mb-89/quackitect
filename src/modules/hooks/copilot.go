// Copilot's events and replies over the hooks door: each Copilot call posts
// as the Claude call it stands for, and the effects answer in the shape the
// surface reads. [[spec/tickets/copilot-hooks-run-in-go]]
package hooks

import (
	"encoding/json"
	"errors"
	"strings"

	"quackitect/src/modules/hooks/write"
)

// The two surfaces, and the text a failed start adds. [[spec/tickets/copilot-hooks-run-in-go]]
const (
	VSCodeSurface = "vscode"
	CloudSurface  = "cloud"
	notReady      = " The cage is not ready; do not claim otherwise."
)

// The shell tools a Copilot host names, the hooks door's event a Claude event posts as, and the Claude name of each Copilot cloud event. [[spec/tickets/copilot-hooks-run-in-go]]
var (
	shellTools   = map[string]bool{"Bash": true, "bash": true, "powershell": true, "run_in_terminal": true, "send_to_terminal": true}
	postedEvents = map[string]string{"SessionStart": startEvent, "PreToolUse": toolEvent, "Stop": stopEvent}
	copilotNames = map[string]string{
		"sessionStart": "SessionStart", "preToolUse": "PreToolUse", "postToolUse": "PostToolUse",
		"agentStop": "Stop", "sessionEnd": "SessionEnd",
	}
)

// One Copilot event, read off the hook's input: its Claude name, the surface, the session, the bare tool name, its arguments, and whether a Stop retries. [[spec/tickets/copilot-hooks-run-in-go]]
type CopilotEvent struct {
	Event   string
	Surface string
	Session string
	Tool    string
	Args    map[string]any
	Retry   bool
}

// What an event answers: a deny, a block, context, or a failure. [[spec/tickets/copilot-hooks-run-in-go]]
type CopilotResult struct {
	Deny    string
	Block   string
	Context string
	Failed  string
}

// The event a hook input stands for on a surface, vscode or cloud. [[spec/tickets/copilot-hooks-run-in-go]]
func EventOf(input map[string]any, event, surface string) (CopilotEvent, error) {
	if surface != VSCodeSurface && surface != CloudSurface {
		return CopilotEvent{}, errors.New("Name the Copilot surface: vscode or cloud.")
	}
	args, err := argsOf(firstOf(input, "tool_input", "toolArgs"))
	if err != nil {
		return CopilotEvent{}, err
	}
	if named, ok := copilotNames[event]; ok {
		event = named
	}
	tool := stringOf(firstOf(input, "tool_name", "toolName"))
	return CopilotEvent{
		Event: event, Surface: surface, Session: stringOf(firstOf(input, "session_id", "sessionId")),
		Tool: tool[strings.LastIndex(tool, ".")+1:], Args: args, Retry: truthy(input["stop_hook_active"]),
	}, nil
}

// The first of the keys the input holds a value under. [[spec/tickets/copilot-hooks-run-in-go]]
func firstOf(input map[string]any, keys ...string) any {
	for _, key := range keys {
		if value := input[key]; value != nil {
			return value
		}
	}
	return nil
}

// A tool's arguments, which the cloud sends as JSON text. [[spec/tickets/copilot-hooks-run-in-go]]
func argsOf(value any) (map[string]any, error) {
	if text, ok := value.(string); ok {
		var args map[string]any
		if err := json.Unmarshal([]byte(text), &args); err != nil {
			return nil, err
		}
		value = args
	}
	if args, ok := value.(map[string]any); ok && args != nil {
		return args, nil
	}
	return map[string]any{}, nil
}

// The hooks door's event a Copilot event posts as. [[spec/tickets/copilot-hooks-run-in-go]]
func PostedAs(event string) string {
	if posted, ok := postedEvents[event]; ok {
		return posted
	}
	return "classic." + event
}

// The Claude calls one Copilot tool call stands for: a shell call as Bash, an edit as one Write a changed file, and any other tool as itself. [[spec/tickets/copilot-hooks-run-in-go]]
func CallsOf(event CopilotEvent, read func(path string) (string, error)) ([]map[string]any, error) {
	if shellTools[event.Tool] {
		return []map[string]any{{"tool": bashTool, "command": stringOf(event.Args["command"])}}, nil
	}
	changed, err := write.Mutations(event.Tool, event.Args, read)
	if err != nil {
		return nil, err
	}
	calls := make([]map[string]any, 0, len(changed))
	for _, one := range changed {
		call := map[string]any{"tool": write.WriteTool, "file_path": one.Path}
		if !one.Gone {
			call["content"] = one.Text
		}
		calls = append(calls, call)
	}
	if len(calls) > 0 {
		return calls, nil
	}
	call := map[string]any{"tool": event.Tool}
	for key, value := range event.Args {
		call[key] = value
	}
	return []map[string]any{call}, nil
}

// The result an event answers off the door, which ask posts to: the first deny or block a call meets, else the afters joined as context. A door answering nothing refuses a guarded call and passes the rest. [[spec/tickets/copilot-hooks-run-in-go]]
func CopilotAnswers(event CopilotEvent, ask func(Post) (Answer, error), read func(path string) (string, error), root string) (CopilotResult, error) {
	posted := PostedAs(event.Event)
	calls := []map[string]any{{}}
	if posted == toolEvent {
		var err error
		if calls, err = CallsOf(event, read); err != nil {
			return CopilotResult{}, err
		}
	}
	var context []string
	for _, call := range calls {
		if event.Session != "" {
			call["session_id"] = event.Session
		}
		said, err := ask(Post{Event: posted, E: call, Root: root})
		if err != nil {
			if Guarded(posted, call) {
				return CopilotResult{Deny: RefusedText(call)}, nil
			}
			continue
		}
		afters, stops := copilotStep(said)
		if stops != (CopilotResult{}) {
			return stops, nil
		}
		context = append(context, afters...)
	}
	if len(context) == 0 {
		return CopilotResult{}, nil
	}
	return CopilotResult{Context: strings.Join(context, "\n\n")}, nil
}

// The afters one answer carries, or the deny or block it stops on. A result naming no text, a clear or an event answers the call and drops its afters. [[spec/tickets/copilot-hooks-run-in-go]]
func copilotStep(said Answer) ([]string, CopilotResult) {
	var afters []string
	for _, one := range said.Effects {
		switch one.Kind {
		case resultKind:
			if one.Text != "" {
				return nil, CopilotResult{Deny: one.Text}
			}
			fields, _ := one.Result.(map[string]any)
			if fields["deny"] != nil {
				return nil, CopilotResult{Deny: stringOf(fields["deny"])}
			}
			if fields["block"] != nil {
				return nil, CopilotResult{Block: stringOf(fields["block"])}
			}
			return nil, CopilotResult{}
		case blockKind:
			return nil, CopilotResult{Block: one.Text}
		case "clear", eventKind:
			return nil, CopilotResult{}
		case afterKind:
			if one.Text != "" && one.Name != "" {
				afters = append(afters, "# "+one.Name+"\n"+one.Text)
			} else if one.Text != "" {
				afters = append(afters, one.Text)
			}
		}
	}
	return afters, CopilotResult{}
}

// The reply a surface reads for a result. [[spec/tickets/copilot-hooks-run-in-go]]
func ReplyOf(event CopilotEvent, result CopilotResult) map[string]any {
	if event.Surface == CloudSurface {
		return cloudReply(result)
	}
	switch {
	case result.Failed != "":
		return map[string]any{"continue": false, "stopReason": result.Failed, "systemMessage": result.Failed}
	case result.Deny != "":
		return map[string]any{"hookSpecificOutput": map[string]any{
			"hookEventName": "PreToolUse", "permissionDecision": "deny",
			"permissionDecisionReason": result.Deny, "additionalContext": result.Deny,
		}}
	case result.Block != "":
		return map[string]any{"hookSpecificOutput": map[string]any{"hookEventName": "Stop", "decision": "block", "reason": result.Block}}
	case result.Context != "":
		return map[string]any{"hookSpecificOutput": map[string]any{"hookEventName": event.Event, "additionalContext": result.Context}}
	}
	return map[string]any{}
}

// The reply the cloud agent reads, which ends no turn and carries a failure as context. [[spec/tickets/copilot-hooks-run-in-go]]
func cloudReply(result CopilotResult) map[string]any {
	switch {
	case result.Deny != "":
		return map[string]any{"permissionDecision": "deny", "permissionDecisionReason": result.Deny}
	case result.Block != "":
		return map[string]any{"decision": "block", "reason": result.Block}
	case result.Context != "":
		return map[string]any{"additionalContext": result.Context}
	case result.Failed != "":
		return map[string]any{"additionalContext": result.Failed}
	}
	return map[string]any{}
}

// The result a fault answers, so a broken hook still denies. [[spec/tickets/copilot-hooks-run-in-go]]
func FailureOf(event CopilotEvent, reason string) CopilotResult {
	switch {
	case event.Event == "PreToolUse":
		return CopilotResult{Deny: reason}
	case event.Event == "Stop" && event.Retry:
		return CopilotResult{Failed: reason}
	case event.Event == "Stop":
		return CopilotResult{Block: reason}
	}
	return CopilotResult{Context: reason + notReady}
}
