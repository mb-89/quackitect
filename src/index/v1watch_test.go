// The watch over /v1 sends each named value once it opens, then each change
// to one, and refuses a name the catalog lacks before it streams.
// [[spec/tickets/v1-watch-streams-changes]]
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

// How long a case waits on the next event before it reads the stream as silent. [[spec/design_output/model#surfaces]]
const watchPatience = 5 * time.Second

type watched struct {
	Name     string    `json:"name"`
	Revision int64     `json:"revision"`
	Value    q.Content `json:"value"`
}

// A door whose one file a case writes again, and the hand that writes it. [[spec/design_output/model#surfaces]]
func watchingV1(t *testing.T) (Standing, func(text string)) {
	t.Helper()
	root := tree(t)
	c := q.New()
	hand := q.OutIn(c, "files/<path...>", q.Content{})
	var later Commit
	file := func(_ string, commit Commit) (func(), error) {
		later = commit
		return func() {}, commit(hand, map[string]any{"files/spec/one.md": q.Content{Hash: "one", Text: "one"}})
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
	writes := func(text string) {
		if err := later(hand, map[string]any{"files/spec/one.md": q.Content{Hash: text, Text: text}}); err != nil {
			t.Fatal(err)
		}
	}
	return standing, writes
}

// The stream's events, one a message, until the stream ends. [[spec/design_output/model#surfaces]]
func openWatch(t *testing.T, standing Standing, names string) (*http.Response, <-chan watched) {
	t.Helper()
	said, err := http.Get(fmt.Sprintf("http://127.0.0.1:%d/v1/watch?names=%s", standing.V1, names))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { said.Body.Close() })
	events := make(chan watched)
	go func() {
		defer close(events)
		lines := bufio.NewScanner(said.Body)
		for lines.Scan() {
			data, found := strings.CutPrefix(lines.Text(), "data:")
			if !found {
				continue
			}
			var one watched
			if json.Unmarshal([]byte(strings.TrimSpace(data)), &one) == nil {
				events <- one
			}
		}
	}()
	return said, events
}

func nextEvent(t *testing.T, events <-chan watched) watched {
	t.Helper()
	select {
	case one, open := <-events:
		if !open {
			t.Fatal("the stream ends, and a case waits on an event")
		}
		return one
	case <-time.After(watchPatience):
		t.Fatal("the stream sends no event")
	}
	return watched{}
}

func TestV1WatchSendsEachNamedValueOnConnect(t *testing.T) {
	standing, _ := watchingV1(t)
	said, events := openWatch(t, standing, "files/spec/one.md")
	if said.StatusCode != http.StatusOK || !strings.HasPrefix(said.Header.Get("Content-Type"), "text/event-stream") {
		t.Fatalf("the watch answers %d, %s", said.StatusCode, said.Header.Get("Content-Type"))
	}
	first := nextEvent(t, events)
	if first.Name != "files/spec/one.md" || first.Value.Text != "one" || first.Revision == 0 {
		t.Fatalf("the first event reads %+v, and wants the file at its revision", first)
	}
}

func TestV1WatchSendsAChangeToANamedValue(t *testing.T) {
	standing, writes := watchingV1(t)
	_, events := openWatch(t, standing, "files/spec/one.md")
	first := nextEvent(t, events)
	writes("two")
	next := nextEvent(t, events)
	if next.Name != "files/spec/one.md" || next.Value.Text != "two" || next.Revision <= first.Revision {
		t.Fatalf("the change reads %+v after %+v, and wants two at a later revision", next, first)
	}
}

func TestV1WatchAnswersANameTheCatalogLacksWithAProblem(t *testing.T) {
	said, body := getV1(t, standingV1(t), "/v1/watch?names=t/none")
	if said.StatusCode != http.StatusNotFound || !strings.Contains(string(body), "t/none") {
		t.Fatalf("the watch answers %d: %s", said.StatusCode, body)
	}
}
