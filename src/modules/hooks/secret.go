// The run's secret at the hook door: a Read, a Grep or a Glob naming its file
// meets the refusal the command door gives a command reaching it.
// [[spec/tickets/v1-takes-a-run-secret]]
package hooks

import "quackitect/src/modules/hooks/command"

// Whether a Read, a Grep or a Glob names the run's secret in its path or its pattern. [[spec/tickets/v1-takes-a-run-secret]]
func readsSecret(e map[string]any) bool {
	switch textOf(e, "tool") {
	case "Read", "Grep", "Glob":
		for _, key := range []string{"file_path", "path", "pattern", "glob"} {
			if command.SecretName.MatchString(textOf(e, key)) {
				return true
			}
		}
	}
	return false
}
