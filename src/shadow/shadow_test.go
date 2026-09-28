// A shadow row lands in the session log with the slice and both answers, and
// a slice reads shadow off its key alone.
// [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
package shadow

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestARowLandsInTheSessionLog(t *testing.T) {
	root := t.TempDir()
	at := time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)
	if err := Write(root, Row{Slice: "cfg", Said: "cfg in shadow", Old: "a", New: "b", More: map[string]any{"key": "k"}}, at); err != nil {
		t.Fatal(err)
	}
	if err := Write(root, Row{Slice: "cfg", Said: "again", Old: 1, New: 2}, at); err != nil {
		t.Fatal(err)
	}
	raw, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(LogAt)))
	if err != nil {
		t.Fatal(err)
	}
	lines := strings.Split(strings.TrimSpace(string(raw)), "\n")
	if len(lines) != 2 {
		t.Fatalf("the log holds %d rows, and wants 2", len(lines))
	}
	var row map[string]any
	if err := json.Unmarshal([]byte(lines[0]), &row); err != nil {
		t.Fatal(err)
	}
	if row["kind"] != Mode || row["slice"] != "cfg" || row["old"] != "a" || row["new"] != "b" || row["key"] != "k" || row["at"] != "2026-01-02T03:04:05.000Z" {
		t.Fatalf("the row reads %v", row)
	}
}

func TestASliceReadsShadowOffItsKey(t *testing.T) {
	root := t.TempDir()
	if On(root, "cfg") {
		t.Fatal("a slice with no key reads shadow")
	}
	path := filepath.Join(root, "spec", "config", "level0.json")
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(`{"migration":{"cfg":"shadow"}}`), 0o644); err != nil {
		t.Fatal(err)
	}
	if !On(root, "cfg") {
		t.Fatal("a slice whose key reads shadow reads off")
	}
}
