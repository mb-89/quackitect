package main

import (
	"os"
	"path/filepath"
	"testing"
)

// A LINE WRITTEN NOW IS READ NOW. The window is watched while somebody works,
// so a line that only arrives on a reload is a line that arrived too late.
func TestALineAppendedIsReadWithoutReopening(t *testing.T) {
	p := filepath.Join(t.TempDir(), "session.jsonl")
	write := func(s string) {
		f, err := os.OpenFile(p, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := f.WriteString(s); err != nil {
			t.Fatal(err)
		}
		f.Close()
	}

	write(`{"t":"1","kind":"start","msg":"one"}` + "\n")
	tl := &tailer{path: p}
	recs, restarted, err := tl.read()
	if err != nil || restarted || len(recs) != 1 {
		t.Fatalf("first read: %d records, restarted=%v, err=%v", len(recs), restarted, err)
	}

	// Nothing new, so nothing comes back and the offset holds.
	if recs, _, _ := tl.read(); len(recs) != 0 {
		t.Fatalf("it read %d records that were not written", len(recs))
	}

	// A line appended while the file is being watched.
	write(`{"t":"2","kind":"prompt","msg":"two"}` + "\n")
	recs, restarted, err = tl.read()
	if err != nil {
		t.Fatal(err)
	}
	if restarted {
		t.Fatal("an append was read as a restart")
	}
	if len(recs) != 1 || recs[0].Msg != "two" {
		t.Fatalf("the appended line came back as %+v", recs)
	}
	if recs[0].ID != 2 {
		t.Fatalf("the second line carries id %d", recs[0].ID)
	}

	// A line with no newline yet is not read until it is finished.
	write(`{"t":"3","kind":"prompt","msg":"half`)
	if recs, _, _ := tl.read(); len(recs) != 0 {
		t.Fatalf("a half-written line was read: %+v", recs)
	}
	write(`"}` + "\n")
	if recs, _, _ := tl.read(); len(recs) != 1 || recs[0].Msg != "half" {
		t.Fatalf("the finished line came back as %+v", recs)
	}
}
