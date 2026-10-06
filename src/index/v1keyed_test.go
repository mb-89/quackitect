// The watch over /v1 sends a keyed name of a wired family, parsed off its file.
// [[spec/tickets/the-lens-reads-v1]]
package index

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
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
	root := tree(t)
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
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), c, file)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	return standing
}

// The first event the watch of name sends, or a fault where it sends none. [[spec/tickets/the-lens-reads-v1]]
func firstKeyed(t *testing.T, standing Standing, name string) keyedEvent {
	t.Helper()
	said, err := http.Get(fmt.Sprintf("http://127.0.0.1:%d/v1/watch?names=%s", standing.V1, name))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { said.Body.Close() })
	if said.StatusCode != http.StatusOK {
		t.Fatalf("the watch of %s answers %d", name, said.StatusCode)
	}
	events := make(chan keyedEvent, 1)
	go func() {
		lines := bufio.NewScanner(said.Body)
		for lines.Scan() {
			data, found := strings.CutPrefix(lines.Text(), "data:")
			var one keyedEvent
			if found && json.Unmarshal([]byte(strings.TrimSpace(data)), &one) == nil {
				events <- one
				return
			}
		}
	}()
	select {
	case one := <-events:
		return one
	case <-time.After(watchPatience):
		t.Fatalf("the watch of %s sends no event", name)
	}
	return keyedEvent{}
}

// A watch over a keyed name of a wired family sends its value, parsed off its file. [[spec/tickets/the-lens-reads-v1]]
func TestWatchSendsAKeyedName(t *testing.T) {
	t.Parallel()
	first := firstKeyed(t, keyedDoor(t), keyedHold)
	if first.Name != keyedHold || !strings.Contains(string(first.Value), `ticket`) {
		t.Fatalf("the first event names %s with %s, and wants the hold its file holds", first.Name, first.Value)
	}
}
