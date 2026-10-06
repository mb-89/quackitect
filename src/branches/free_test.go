// The cloud trigger: the routine, and the branches free.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// The settings default of the stale span, read off the schema the tree tracks. [[spec/tickets/every-named-path-resolves]]
func staleDefault(t *testing.T) int64 {
	t.Helper()
	text, err := os.ReadFile(filepath.Join("..", "..", "spec", "config", "level0.schema.json"))
	if err != nil {
		t.Fatal(err)
	}
	var schema struct {
		Properties struct {
			Work struct {
				Properties struct {
					StaleAfter struct {
						Default string `json:"default"`
					} `json:"staleAfter"`
				} `json:"properties"`
			} `json:"work"`
		} `json:"properties"`
	}
	if err := json.Unmarshal(text, &schema); err != nil {
		t.Fatal(err)
	}
	return int64(spanOf(schema.Properties.Work.Properties.StaleAfter.Default))
}

// Where no layer sets the key, the stale span reads the settings default, and no constant of its own. [[spec/tickets/every-named-path-resolves]]
func TestTheStaleSpanReadsTheSettingsDefault(t *testing.T) {
	t.Parallel()
	root, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	want := staleDefault(t)
	for _, d := range []*Doors{{Method: root}, {Method: root, Config: func(string) any { return nil }}} {
		if got := d.staleSpan(); want == 0 || got != want {
			t.Errorf("the stale span reads %d, and the settings default %d", got, want)
		}
	}
}

// The trigger names the routine, and each free branch, past one waiting on another. [[spec/design_output/work#the-routine-a-verb-names]]
func TestTheTriggerNamesTheFreeBranches(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("a", map[string]string{ticketAt("a"): groupNote})
	one.branch("b", map[string]string{ticketAt("b"): withField(groupNote, "depends_on", "[a]")})
	one.out.Reset()
	if code := Cloud(one.d, []string{"trigger"}); code != 0 {
		t.Fatalf("the trigger answers %d", code)
	}
	said := one.out.String()
	holds(t, said, "action=run  trigger_id="+routineID)
	holds(t, said, "  work/a\n")
	if contains(said, "  work/b") {
		t.Fatalf("a waiting branch reads free: %s", said)
	}
}

// The cloud verb with no word prints its usage, and an unknown word refuses. [[spec/design_output/work#the-routine-a-verb-names]]
func TestTheCloudVerbPrintsItsUsage(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if code := Cloud(one.d, nil); code != 0 {
		t.Fatalf("a bare cloud answers %d", code)
	}
	if code := Cloud(one.d, []string{"nope"}); code != codeRefused {
		t.Fatalf("an unknown word answers %d", code)
	}
	holds(t, one.out.String(), "Usage: ./RUNME.sh cloud <verb>")
}
