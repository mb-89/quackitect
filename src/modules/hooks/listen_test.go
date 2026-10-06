// The standing file the listener writes names the events the door decides, so
// the hook reads the list off it. [[spec/tickets/level0-hooks-hold-no-rule]]
package hooks

import (
	"encoding/json"
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
	// The DOORED set of .claude/skills/level0/hooks/cage.ts. [[spec/tickets/level0-hooks-hold-no-rule]]
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
