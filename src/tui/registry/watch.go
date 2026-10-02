// The window's road to the watch over /v1: each event the stream sends lands
// as a message, and the stream's end lands as one more.
// [[spec/tickets/v1-watch-sends-changes]]

package registry

import (
	"bufio"
	"context"
	"encoding/json"
	"io"
	"net/url"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
)

// The largest event the road reads, since one carries a whole value. [[spec/tickets/v1-watch-sends-changes]]
const eventCap = 16 << 20

// One change the watch sends: the name, the revision it stands at, and its value. [[spec/design_output/model#surfaces]]
type Change struct {
	Name     string          `json:"name"`
	Revision int64           `json:"revision"`
	Value    json.RawMessage `json:"value"`
}

// The stream ends, and says why where it broke. [[spec/tickets/v1-watch-sends-changes]]
type Ended struct {
	Why string
}

// What a tab watches through: the /v1 door, or the fake a case seeds. [[spec/tickets/v1-watch-sends-changes]]
type Watcher interface {
	Watch(ctx context.Context, names []string, each func(Change)) error
}

// Hands each event's data on until the stream or the context ends. [[spec/tickets/v1-watch-sends-changes]]
func (v V1) Watch(ctx context.Context, names []string, each func(Change)) error {
	code, status, body, err := stream(ctx, v.Base+"/watch?names="+url.QueryEscape(strings.Join(names, ",")))
	if err != nil {
		return err
	}
	defer body.Close()
	if code >= statusBad {
		said, _ := io.ReadAll(body)
		return problemIn(status, said)
	}
	lines := bufio.NewScanner(body)
	lines.Buffer(nil, eventCap)
	for lines.Scan() {
		data, found := strings.CutPrefix(lines.Text(), "data:")
		if !found {
			continue
		}
		var one Change
		if err := json.Unmarshal([]byte(strings.TrimSpace(data)), &one); err != nil {
			return err
		}
		each(one)
	}
	return lines.Err()
}

// Runs the watch off the tab: each change lands as a message, then one Ended. [[spec/tickets/v1-watch-sends-changes]]
func Stream(ctx context.Context, w Watcher, names []string) <-chan tea.Msg {
	out := make(chan tea.Msg)
	go func() {
		defer close(out)
		hands := func(msg tea.Msg) {
			select {
			case out <- msg:
			case <-ctx.Done():
			}
		}
		err := w.Watch(ctx, names, func(one Change) { hands(one) })
		ended := Ended{}
		if err != nil {
			ended.Why = err.Error()
		}
		hands(ended)
	}()
	return out
}

// The next message off the stream, so a tab arms it again after each one. [[spec/tickets/v1-watch-sends-changes]]
func Next(stream <-chan tea.Msg) tea.Cmd {
	return func() tea.Msg {
		one, open := <-stream
		if !open {
			return Ended{}
		}
		return one
	}
}
