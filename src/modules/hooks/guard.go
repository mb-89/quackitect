// The guard while the hooks door stands down: which call stays guarded, which
// command recovers the index or saves the work, and the refusal a guarded call
// meets. The rules leave cage.ts for this file.
// [[spec/tickets/level0-hooks-hold-no-rule]]
package hooks

// Whether a call stays guarded while the door stands down. A stub until the build step lands it. [[spec/tickets/level0-hooks-hold-no-rule]]
func Guarded(event string, e map[string]any) bool {
	return false
}

// Whether a command brings the index back or saves the work. A stub until the build step lands it. [[spec/tickets/level0-hooks-hold-no-rule]]
func Recovers(command string) bool {
	return false
}

// The words a shell reads off a command, or nil where a character outside quotes chains, pipes, redirects or substitutes. A stub until the build step lands it. [[spec/tickets/level0-hooks-hold-no-rule]]
func WordsOf(command string) []string {
	return nil
}

// The one line a guarded call meets while the door stands down. A stub until the build step lands it. [[spec/tickets/level0-hooks-hold-no-rule]]
func RefusedText(e map[string]any) string {
	return ""
}
