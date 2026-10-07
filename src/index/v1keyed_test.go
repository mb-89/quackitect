// The watch over /v1 sends a keyed name of a wired family, parsed off its file.
// [[spec/tickets/the-lens-reads-v1]]
package index // level0: InPackageTest - it reads the unexported standingOf

import (
	"bufio"
	"encoding/json"
	"fmt"
	"strings"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The name a case watches: a hold file, under the family an instance wires. [[spec/tickets/the-lens-reads-v1]]
const keyedHold = "holds/hold/.se/.runtime/hold/box.json"

type keyedEvent struct {
	Name  string          `json:"name"`
	Value json.RawMessage `json:"value"`
}

// A door over a catalog whose loaded family stands wired under an instance, with its one file committed. [[spec/tickets/the-lens-reads-v1]]
func keyedDoor(t *testing.T) Standing {
	t.Helper()
	w := q.Wiring{
		Instances: []q.Instance{{Name: "holds", Module: "holds"}},
		Wires:     map[string]string{"holds.files/<path...>": "files/<path...>"},
	}
	wired, faults := q.Load(w, map[string]func(*q.Catalog){"holds": func(c *q.Catalog) {
		q.ProjectIn(c, "hold", ".se/.runtime/hold/*.json", q.JSON, q.Loaded, q.Ordered{}, q.Doc("a hold, keyed by its file"))
	}})
	if len(faults) > 0 {
		t.Fatalf("the load refuses: %v", faults)
	}
	c := q.New()
	hand := q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file"))
	c.Take(wired)
	file := func(_ string, commit Commit) (func(), error) {
		return func() {}, commit(hand, map[string]any{"files/.se/.runtime/hold/box.json": q.Content{Hash: "box", Text: `{"ticket": "x"}`}})
	}
	_, standing := served(t, qtest.Wall(), tree(t), c, nil, file)
	return standing
}

// The first event the watch of name sends, or a fault where it sends none. [[spec/tickets/the-lens-reads-v1]]
func firstKeyed(t *testing.T, standing Standing, name string) keyedEvent {
	t.Helper()
	said, stream, err := streamsDoor("GET", fmt.Sprintf("http://127.0.0.1:%d/v1/watch?names=%s", standing.V1, name), nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { stream.Close() })
	if said.StatusCode != statusOK {
		t.Fatalf("the watch of %s answers %d", name, said.StatusCode)
	}
	events := make(chan keyedEvent, 1)
	go func() {
		defer close(events)
		lines := bufio.NewScanner(stream)
		for lines.Scan() {
			data, found := strings.CutPrefix(lines.Text(), "data:")
			var one keyedEvent
			if found && json.Unmarshal([]byte(strings.TrimSpace(data)), &one) == nil {
				events <- one
				return
			}
		}
	}()
	one, open := <-events
	if !open {
		t.Fatalf("the watch of %s ends with no event", name)
	}
	return one
}

// A watch over a keyed name of a wired family sends its value, parsed off its file. [[spec/tickets/the-lens-reads-v1]]
// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestWatchSendsAKeyedName(t *testing.T) {
	t.Parallel()
	first := firstKeyed(t, keyedDoor(t), keyedHold)
	if first.Name != keyedHold || !strings.Contains(string(first.Value), `ticket`) {
		t.Fatalf("the first event names %s with %s, and wants the hold its file holds", first.Name, first.Value)
	}
}
