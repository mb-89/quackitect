// The shadow writes a row where the old count and the new one differ, and
// nothing where they agree or the slice stands old.
// [[spec/tickets/open-tasks-run-in-shadow]]
package work

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// A root whose default file sets the slice, and the index count a fake answers. [[spec/tickets/open-tasks-run-in-shadow]]
func sliced(t *testing.T, mode string, count int) string {
	t.Helper()
	root := t.TempDir()
	config := filepath.Join(root, "spec", "config")
	if err := os.MkdirAll(config, 0o755); err != nil {
		t.Fatal(err)
	}
	text := `{"migration": {"opentasks": "` + mode + `"}}`
	if err := os.WriteFile(filepath.Join(config, "level0.json"), []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
	was := askOpenTasks
	t.Cleanup(func() { askOpenTasks = was })
	askOpenTasks = func(string) (int, bool) {
		if mode == "old" {
			t.Errorf("the old slice asks the index")
		}
		return count, true
	}
	return root
}

func rowsIn(t *testing.T, root string) []map[string]any {
	t.Helper()
	text, err := os.ReadFile(filepath.Join(root, ".se", ".log", "session.jsonl"))
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		t.Fatal(err)
	}
	var out []map[string]any
	for _, line := range strings.Split(strings.TrimSpace(string(text)), "\n") {
		var row map[string]any
		if err := json.Unmarshal([]byte(line), &row); err != nil {
			t.Fatalf("a row reads as no JSON: %s", line)
		}
		out = append(out, row)
	}
	return out
}

var shadowAt = time.Date(2026, 9, 28, 12, 0, 0, 0, time.UTC)

func TestAShadowMismatchWritesAShadowRow(t *testing.T) {
	root := sliced(t, "shadow", 5)
	if err := shadowOf(root, 3, shadowAt); err != nil {
		t.Fatal(err)
	}
	rows := rowsIn(t, root)
	if len(rows) != 1 {
		t.Fatalf("the mismatch writes %d rows, and wants 1", len(rows))
	}
	row := rows[0]
	if row["kind"] != "shadow" || row["slice"] != "open-tasks" || row["old"] != 3.0 || row["new"] != 5.0 || row["at"] != "2026-09-28T12:00:00.000Z" {
		t.Fatalf("the row reads %v", row)
	}
	if said, _ := row["said"].(string); said == "" || len(said) > 80 {
		t.Fatalf("the row says %q, and wants one line the log draws", said)
	}
}

func TestAMatchUnderShadowWritesNothing(t *testing.T) {
	root := sliced(t, "shadow", 3)
	if err := shadowOf(root, 3, shadowAt); err != nil {
		t.Fatal(err)
	}
	if rows := rowsIn(t, root); len(rows) != 0 {
		t.Fatalf("a match writes %v", rows)
	}
}

func TestTheOldSliceAsksNothing(t *testing.T) {
	root := sliced(t, "old", 9)
	if err := shadowOf(root, 3, shadowAt); err != nil {
		t.Fatal(err)
	}
	if rows := rowsIn(t, root); len(rows) != 0 {
		t.Fatalf("the old slice writes %v", rows)
	}
}

// PlacesAt hands the shadow the count the tab draws. [[spec/tickets/places-at-runs-the-shadow]]
func TestPlacesAtHandsTheShadowTheCountTheTabDraws(t *testing.T) {
	root := sliced(t, "shadow", 5)
	was := runPlaces
	t.Cleanup(func() { runPlaces = was })
	runPlaces = func(string) ([]byte, error) {
		return []byte(`{"loose":[{"name":"free","queue":"1"},{"name":"other","queue":"2"}]}`), nil
	}
	places, err := PlacesAt(root)
	if err != nil {
		t.Fatal(err)
	}
	rows := rowsIn(t, root)
	if places.Takeable != 2 || len(rows) != 1 || rows[0]["old"] != 2.0 || rows[0]["new"] != 5.0 {
		t.Fatalf("the tab draws %d, and the shadow writes %v", places.Takeable, rows)
	}
}

// A door standing nowhere answers no count, and the ask starts none. [[spec/tickets/places-at-runs-the-shadow]]
func TestTheAskAnswersNothingWhereNoDoorStands(t *testing.T) {
	if count, answered := askOpenTasks(t.TempDir()); answered {
		t.Fatalf("the ask answers %d where no door stands", count)
	}
}

// The new slice answers the index's count, and writes no shadow row. [[spec/tickets/the-badge-reads-open-tasks]]
func TestTheNewSliceAnswersTheIndexCount(t *testing.T) {
	root := sliced(t, "new", 5)
	if count := slicedCount(root, 3, shadowAt); count != 5 {
		t.Fatalf("the new slice answers %d, and wants the index's 5", count)
	}
	if rows := rowsIn(t, root); len(rows) != 0 {
		t.Fatalf("the new slice writes %v", rows)
	}
}

// A door answering nowhere leaves the old count standing under the new slice. [[spec/tickets/the-badge-reads-open-tasks]]
func TestTheNewSliceKeepsTheOldCountWhereNoDoorAnswers(t *testing.T) {
	root := sliced(t, "new", 5)
	askOpenTasks = func(string) (int, bool) { return 0, false }
	if count := slicedCount(root, 3, shadowAt); count != 3 {
		t.Fatalf("the new slice answers %d with no door, and wants the old 3", count)
	}
}

// The shadow slice answers the old count, and writes its row beside it. [[spec/tickets/the-badge-reads-open-tasks]]
func TestTheShadowSliceAnswersTheOldCountAndWritesItsRow(t *testing.T) {
	root := sliced(t, "shadow", 5)
	if count := slicedCount(root, 3, shadowAt); count != 3 {
		t.Fatalf("the shadow slice answers %d, and wants the old 3", count)
	}
	if rows := rowsIn(t, root); len(rows) != 1 || rows[0]["new"] != 5.0 {
		t.Fatalf("the shadow slice writes %v", rows)
	}
}

// The badge's verb and the window's header both read Places.Takeable, which PlacesAt fills off the slice. [[spec/tickets/the-badge-reads-open-tasks]]
func TestTheBadgeAndTheHeaderReadOneValue(t *testing.T) {
	root := sliced(t, "new", 5)
	was := runPlaces
	t.Cleanup(func() { runPlaces = was })
	runPlaces = func(string) ([]byte, error) {
		return []byte(`{"loose":[{"name":"free","queue":"1"},{"name":"other","queue":"2"}]}`), nil
	}
	places, err := PlacesAt(root)
	if err != nil {
		t.Fatal(err)
	}
	tab := &Tab{Places: &places}
	if places.Takeable != 5 || tab.Label(nil) != "work (5)" {
		t.Fatalf("the badge reads %d, and the header %q", places.Takeable, tab.Label(nil))
	}
}
