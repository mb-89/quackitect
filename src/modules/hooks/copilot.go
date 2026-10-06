// Copilot's events and replies over the hooks door: each Copilot call posts
// as the Claude call it stands for, and the effects answer in the shape the
// surface reads. [[spec/tickets/copilot-hooks-run-in-go]]
package hooks

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
func EventOf(_ map[string]any, _, _ string) (CopilotEvent, error) {
	return CopilotEvent{}, nil
}

// The hooks door's event a Copilot event posts as. [[spec/tickets/copilot-hooks-run-in-go]]
func PostedAs(_ string) string {
	return ""
}

// The Claude calls one Copilot tool call stands for. [[spec/tickets/copilot-hooks-run-in-go]]
func CallsOf(_ CopilotEvent, _ func(path string) (string, error)) ([]map[string]any, error) {
	return nil, nil
}

// The result an event answers off the door, which ask posts to. [[spec/tickets/copilot-hooks-run-in-go]]
func CopilotAnswers(_ CopilotEvent, _ func(Post) (Answer, error), _ func(path string) (string, error), _ string) (CopilotResult, error) {
	return CopilotResult{}, nil
}

// The reply a surface reads for a result. [[spec/tickets/copilot-hooks-run-in-go]]
func ReplyOf(_ CopilotEvent, _ CopilotResult) map[string]any {
	return nil
}

// The result a fault answers, so a broken hook still denies. [[spec/tickets/copilot-hooks-run-in-go]]
func FailureOf(_ CopilotEvent, _ string) CopilotResult {
	return CopilotResult{}
}
