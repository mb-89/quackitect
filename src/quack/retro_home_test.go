// The retro's folder stands under the private folder, and each timed source
// reads the time its lines carry.
// [[spec/guidance/retro/chapter]]
package main

import (
	"path/filepath"
	"testing"
)

// A retro's home stands at .se/.retro/<name> under the root. [[spec/guidance/retro/chapter]]
func TestARetroHomeStandsUnderTheRetroFolder(t *testing.T) {
	got := retroHome("/tree", "retro-abc")
	want := filepath.Join("/tree", ".se", ".retro", "retro-abc")
	if got != want {
		t.Fatalf("retroHome answers %q, want %q", got, want)
	}
}

// The transcripts read their time off timestamp, and the log off at. [[spec/guidance/retro/chapter]]
func TestEachTimedSourceReadsItsTime(t *testing.T) {
	lines := map[string]string{
		"transcripts": `{"type":"user","timestamp":"2026-01-02T03:04:05Z"}`,
		"log":         `{"level":"info","at":"2026-01-02T03:04:05Z"}`,
	}
	for _, source := range retroTimed {
		found := source.field.FindStringSubmatch(lines[source.top])
		if len(found) < 2 || found[1] != "2026-01-02T03:04:05Z" {
			t.Fatalf("%s reads %v", source.top, found)
		}
	}
}
