package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// The retro folder holds the log and the transcripts side by side, each on its
// own clock, so reading what happened means reading two files and holding the
// order in your head. The collect weaves one file where they are interleaved.

// aTreeToWeave is a tree carrying two log files and one transcript, timed so
// that the right answer alternates between the two sources. A reader can tell a
// merge from a concatenation only when the sources interleave.
func aTreeToWeave(t *testing.T) (Roots, string, []byte) {
	t.Helper()
	r := lane(t)
	logs := r.Private("log")
	if err := os.MkdirAll(logs, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(name, body string) {
		if err := os.WriteFile(filepath.Join(logs, name), []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("session-20260101-000000.jsonl",
		`{"t":"2026-01-01T00:00:01Z","seq":1,"src":"engine","kind":"pull","actor":"main","msg":"one"}`+nl)
	write("session-20260101-000100.jsonl",
		`{"t":"2026-01-01T00:00:03Z","seq":1,"src":"engine","kind":"pull","actor":"worker-two","msg":"three"}`+nl)

	// The middle turn carries no timestamp, which is the case the transcripts
	// actually show, and it sits between two that do.
	turns := `{"timestamp":"2026-01-01T00:00:00Z","type":"user"}` + nl +
		`{"type":"assistant"}` + nl +
		`{"timestamp":"2026-01-01T00:00:04Z","type":"assistant"}` + nl
	path := filepath.Join(t.TempDir(), "claude.jsonl")
	if err := os.WriteFile(path, []byte(turns), 0o644); err != nil {
		t.Fatal(err)
	}
	return r, path, []byte(turns)
}

func TestTheRetroWeavesOneTimeline(t *testing.T) {
	t.Parallel()
	r, transcript, original := aTreeToWeave(t)

	got, err := Retro(r, "main", []Transcript{{Name: "claude", Path: transcript, Who: "main"}})
	if err != nil {
		t.Fatalf("the retro did not collect: %v", err)
	}
	if got.Timeline == "" {
		t.Fatal("the collect says nothing about a timeline, so nobody is told where it is")
	}
	b, err := os.ReadFile(got.Timeline)
	if err != nil {
		t.Fatalf("the timeline it named cannot be read: %v", err)
	}

	var woven []TimelineEntry
	for _, line := range strings.Split(strings.TrimSpace(string(b)), "\n") {
		if strings.TrimSpace(line) == "" {
			continue
		}
		var e TimelineEntry
		if err := json.Unmarshal([]byte(line), &e); err != nil {
			t.Fatalf("a timeline line will not read as JSON: %v\n%s", err, line)
		}
		woven = append(woven, e)
	}
	if len(woven) != 5 {
		t.Fatalf("two log records and three turns are five lines, and the timeline holds %d:\n%s",
			len(woven), b)
	}

	// IT IS A MERGE, NOT A CONCATENATION. The sources alternate, so a file that
	// simply appended one to the other cannot pass this.
	wantSource := []string{"transcript", "log", "transcript", "log", "transcript"}
	var last time.Time
	for i, e := range woven {
		at, err := time.Parse(time.RFC3339Nano, e.T)
		if err != nil {
			t.Fatalf("line %d carries no readable time: %q", i+1, e.T)
		}
		if at.Before(last) {
			t.Fatalf("line %d is at %s, which is before the line above it at %s", i+1, e.T, last)
		}
		last = at
		if e.Source != wantSource[i] {
			t.Fatalf("line %d comes from %q and the interleaved order wants %q:\n%s",
				i+1, e.Source, wantSource[i], b)
		}
		if e.Who == "" {
			t.Fatalf("line %d names no actor, and a line nobody owns cannot be read back", i+1)
		}
	}

	// THE GUESSED STAMP SAYS IT IS GUESSED. It sits between its neighbours, and
	// it is the only one marked, so a reader never mistakes it for a reading.
	if !woven[2].Interpolated {
		t.Error("the turn that carried no timestamp is not marked as interpolated")
	}
	for i, e := range woven {
		if i != 2 && e.Interpolated {
			t.Errorf("line %d carried its own timestamp and is marked interpolated", i+1)
		}
	}
	guessed, _ := time.Parse(time.RFC3339Nano, woven[2].T)
	before, _ := time.Parse(time.RFC3339Nano, "2026-01-01T00:00:00Z")
	after, _ := time.Parse(time.RFC3339Nano, "2026-01-01T00:00:04Z")
	if !guessed.After(before) || !guessed.Before(after) {
		t.Errorf("the guessed stamp is %s, which is not between its neighbours %s and %s",
			woven[2].T, before, after)
	}

	// AND THE SOURCES ARE LEFT AS THEY WERE. The timeline is a reading of them,
	// so a weave that consumed what it read would cost the folder its evidence.
	if len(got.Transcript) != 1 {
		t.Fatalf("the transcript did not land in the folder: %v", got.Missing)
	}
	kept, err := os.ReadFile(got.Transcript[0])
	if err != nil {
		t.Fatalf("the copied transcript cannot be read: %v", err)
	}
	if string(kept) != string(original) {
		t.Errorf("the copied transcript was changed by the weave:\n%s", kept)
	}
	drained, err := os.ReadDir(filepath.Join(got.Folder, "log"))
	if err != nil {
		t.Fatalf("the drained log cannot be read: %v", err)
	}
	if len(drained) != 2 {
		t.Errorf("two log files were drained and the folder holds %d", len(drained))
	}
}
