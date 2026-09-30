// The window's road to the watch over /v1: each event the stream sends lands
// as a message, and the stream's end lands as one more.
// [[spec/tickets/v1-watch-streams-changes]]

package registry

import (
	"context"
	"encoding/json"
	"errors"

	tea "github.com/charmbracelet/bubbletea"
)

// One change the watch sends: the name, the revision it stands at, and its value. [[spec/design_output/model#surfaces]]
type Change struct {
	Name     string          `json:"name"`
	Revision int64           `json:"revision"`
	Value    json.RawMessage `json:"value"`
}

// The stream ends, and says why where it broke. [[spec/tickets/v1-watch-streams-changes]]
type Ended struct {
	Why string
}

// What a tab watches through: the /v1 door, or the fake a case seeds. [[spec/tickets/v1-watch-streams-changes]]
type Watcher interface {
	Watch(ctx context.Context, names []string, each func(Change)) error
}

// [[spec/tickets/v1-watch-streams-changes]]
func (v V1) Watch(_ context.Context, _ []string, _ func(Change)) error {
	return errors.New("the watch stands unbuilt")
}

// [[spec/tickets/v1-watch-streams-changes]]
func Stream(_ context.Context, _ Watcher, _ []string) <-chan tea.Msg {
	out := make(chan tea.Msg)
	close(out)
	return out
}

// [[spec/tickets/v1-watch-streams-changes]]
func Next(_ <-chan tea.Msg) tea.Cmd {
	return func() tea.Msg { return nil }
}
