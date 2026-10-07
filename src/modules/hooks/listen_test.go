// The standing file the listener writes names the events the door decides, so
// the hook reads the list off it. [[spec/tickets/level0-hooks-hold-no-rule]]
package hooks

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"testing"
)

func TestStandingNamesEvents(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	stop, err := Listen(root, &Door{})
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(StandingFile)))
	if err != nil {
		t.Fatal(err)
	}
	var standing struct {
		Events []string `json:"events"`
	}
	if err := json.Unmarshal(text, &standing); err != nil {
		t.Fatalf("the standing file reads %q, which reads as no JSON: %v", text, err)
	}
	// The events the bridge's DOORS table named before the bridge left, each one the door decides now. [[spec/tickets/the-bridge-server-leaves]]
	want := []string{
		"session.start",
		"prompt.context",
		"prompt.submit",
		"classic.MessageDisplay",
		"agent.spoke",
		"session.compact",
		"session.end",
		"session.measure",
		"turn.said",
		"turn.complete",
		"classic.Stop",
		"agent.spawn",
		"tool.describe",
		"tool.call",
		"agent.answered",
	}
	got := append([]string(nil), standing.Events...)
	sort.Strings(got)
	sort.Strings(want)
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("the standing file names the events %q, and wants %q", standing.Events, want)
	}
}

// Posts a body at a path of the standing door, under the token or none, and answers the status and the body. [[spec/tickets/level0-hooks-hold-no-rule]]
func postedAt(t *testing.T, root, path, body string, token bool) (int, []byte) {
	t.Helper()
	text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(StandingFile)))
	if err != nil {
		t.Fatal(err)
	}
	var standing Standing
	if err := json.Unmarshal(text, &standing); err != nil {
		t.Fatal(err)
	}
	asked, _ := http.NewRequest(http.MethodPost, "http://127.0.0.1:"+jsonNumber(standing.Port)+"/"+path, bytes.NewReader([]byte(body)))
	if token {
		asked.Header.Set("Authorization", bearer+standing.Token)
	}
	said, err := http.DefaultClient.Do(asked)
	if err != nil {
		t.Fatal(err)
	}
	defer said.Body.Close()
	var out bytes.Buffer
	out.ReadFrom(said.Body)
	return said.StatusCode, out.Bytes()
}

// The door answers each post with the step its effects answer, and a back post asks no rows back. [[spec/tickets/level0-hooks-hold-no-rule]]
func TestTheDoorAnswersTheStepBesideItsEffects(t *testing.T) {
	one := doorOver(t, &calls{}, &book{})
	root := t.TempDir()
	stop, err := Listen(root, one.door)
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	for _, back := range []bool{false, true} {
		body, _ := json.Marshal(map[string]any{"event": "session.start", "e": map[string]any{"session_id": "s9"}, "back": back})
		code, text := postedAt(t, root, "hook", string(body), true)
		var said Stepped
		if err := json.Unmarshal(text, &said); code != http.StatusOK || err != nil {
			t.Fatalf("the post answers %d %q (%v)", code, text, err)
		}
		if got, want := jsonOf(t, said.Step), jsonOf(t, StepOf(said.Effects, "session.start", !back)); got != want {
			t.Errorf("back %v: the step reads %s, and wants %s", back, got, want)
		}
	}
}

// The door merges the adds into what the harness answered, behind the token. [[spec/tickets/level0-hooks-hold-no-rule]]
func TestTheDoorServesTheMerge(t *testing.T) {
	root := t.TempDir()
	stop, err := Listen(root, &Door{})
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	body := `{"said":{"context":["a"]},"adds":{"context":["b"]}}`
	if code, _ := postedAt(t, root, "merge", body, false); code != http.StatusUnauthorized {
		t.Errorf("a merge with no token answers %d, and wants 401", code)
	}
	code, text := postedAt(t, root, "merge", body, true)
	if code != http.StatusOK || string(bytes.TrimSpace(text)) != `{"context":["a","b"]}` {
		t.Errorf("the merge answers %d %q, and wants the grown list", code, text)
	}
}
