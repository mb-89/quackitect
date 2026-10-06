// The cage while the hooks door stands down: a guarded call meets the
// refusal, and the commands that bring the index back or save the work pass.
// [[spec/tickets/copilot-hooks-run-in-go]]
package hooks

// Whether a call meets the refusal while the door answers nothing. [[spec/tickets/copilot-hooks-run-in-go]]
func Guarded(_ string, _ map[string]any) bool {
	return false
}

// Whether a command brings the index back or saves the work, standing alone. [[spec/tickets/copilot-hooks-run-in-go]]
func Recovers(_ string) bool {
	return false
}

// The words a shell reads off a command, or false where a character outside quotes chains, pipes, redirects or substitutes. [[spec/tickets/copilot-hooks-run-in-go]]
func wordsOf(_ string) ([]string, bool) {
	return nil, false
}

// The line a guarded call meets while the door stands down. [[spec/tickets/copilot-hooks-run-in-go]]
func RefusedText(_ map[string]any) string {
	return ""
}
