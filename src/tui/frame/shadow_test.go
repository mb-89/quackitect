// The shadow row a mismatch writes: one JSON line the log tab reads back as
// a row of kind shadow, carrying its slice.
// [[spec/design_output/model#the-log-is-a-view]]

package frame

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// [[spec/design_output/model#the-log-is-a-view]]
func TestAShadowRowStandsInTheLogWithItsSlice(t *testing.T) {
	t.Parallel()
	path := filepath.Join(t.TempDir(), "session.jsonl")
	if err := os.WriteFile(path, []byte("{\"kind\":\"prompt\"}\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	now := time.Date(2026, 9, 29, 12, 0, 0, 0, time.UTC)
	if err := WriteShadow(path, now, "window", "window in shadow: a row reads apart"); err != nil {
		t.Fatal(err)
	}
	body, _ := os.ReadFile(path)
	lines := strings.Split(strings.TrimSpace(string(body)), "\n")
	if len(lines) != 2 {
		t.Fatalf("the log holds %d lines, and wants its own and the shadow row", len(lines))
	}
	var row map[string]any
	if err := json.Unmarshal([]byte(lines[1]), &row); err != nil {
		t.Fatalf("the shadow row is no JSON: %v", err)
	}
	if row["kind"] != "shadow" || row["slice"] != "window" || row["level"] != "info" || row["said"] != "window in shadow: a row reads apart" || row["at"] != "2026-09-29T12:00:00.000Z" {
		t.Fatalf("the shadow row reads %v", row)
	}
}
