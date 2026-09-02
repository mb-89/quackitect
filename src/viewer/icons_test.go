package main

import (
	"os"
	"path/filepath"
	"testing"
)

// EVERY MARK COMES FROM THE ONE TABLE, and this window reads it too. The table
// said the same mark is the same mark in the sidebar, the editor and the log
// window, and the log window's marks were not in it.
func TestTheMarksComeFromTheTable(t *testing.T) {
	t.Parallel()
	icons = nil
	yes, no := true, false

	// With no table at all, the marks written here are what draws. A blank
	// column in a terminal reads as a missing record.
	if got := (Record{OK: &yes}).Mark(); got != "✓" {
		t.Fatalf("with no table it drew %q", got)
	}
	if got := (Record{OK: &no}).Mark(); got != "✗" {
		t.Fatalf("with no table it drew %q", got)
	}

	// A table decides them, and the walk finds it above the log.
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "util"), 0o755)
	os.MkdirAll(filepath.Join(dir, ".se", "log"), 0o755)
	os.WriteFile(filepath.Join(dir, "util", "icons.json"), []byte(
		`{"$comment":"the fixture's own","ok":{"glyph":"Y"},"refused":{"glyph":"N"}}`), 0o644)
	log := filepath.Join(dir, ".se", "log", "session.jsonl")
	os.WriteFile(log, []byte("{}\n"), 0o644)

	ReadIcons(log)
	if got := (Record{OK: &yes}).Mark(); got != "Y" {
		t.Fatalf("the table says Y and it drew %q", got)
	}
	if got := (Record{OK: &no}).Mark(); got != "N" {
		t.Fatalf("the table says N and it drew %q", got)
	}
	if _, ok := icons["$comment"]; ok {
		t.Fatal("a note was read as an icon")
	}
	icons = nil
}
