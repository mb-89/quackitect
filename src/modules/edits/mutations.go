// The file changes a Copilot edit call proposes, decoded before the call
// reaches disk, so the hooks door judges each as one Write.
// [[spec/tickets/copilot-hooks-run-in-go]]
package edits

// One changed file: its path and its whole text, or gone where a patch deletes it. [[spec/tickets/copilot-hooks-run-in-go]]
type Mutation struct {
	Path string
	Text string
	Gone bool
}

// The files an edit tool's call changes, each with its resulting text, read through read. [[spec/tickets/copilot-hooks-run-in-go]]
func Mutations(_ string, _ map[string]any, _ func(path string) (string, error)) ([]Mutation, error) {
	return nil, nil
}

// The files a Begin Patch / End Patch envelope adds, updates and deletes. [[spec/tickets/copilot-hooks-run-in-go]]
func PatchChanges(_ string, _ func(path string) (string, error)) ([]Mutation, error) {
	return nil, nil
}
