package main

import (
	"os"
	"path/filepath"
	"testing"
)

// A SAVE MOVES A TOKEN BETWEEN STORES. IT DOES NOT COPY IT.
//
// The folder is the answer to whether a token is traced, so the process decides
// which store a token lives in. A save wrote into the folder the process names
// and left the old file where it was, so one token became two files with one id
// and the editor drew the row twice. Measured on the bulk conversion.
func TestASaveMovesRatherThanCopies(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	writeProcess(t, root, "kept", true)
	writeProcess(t, root, "loose", false)

	tok, err := Mint(r, Token{Process: "kept", Title: "a token that moves", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	traced := filepath.Join(TracedDir(r), tok.ID+".md")
	if _, err := os.Stat(traced); err != nil {
		t.Fatalf("a token of a traced process is not in doc/work: %v", err)
	}

	// The process changes, so where it lives changes with it.
	tok.Process = "loose"
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(EphemeralDir(r), tok.ID+".md")); err != nil {
		t.Fatalf("it did not arrive in .se/work: %v", err)
	}
	if _, err := os.Stat(traced); err == nil {
		t.Fatal("it is in both stores, so one id names two files")
	}
	// AND ONE ID STILL NAMES ONE ROW.
	if all := Tokens(r); len(all) != 1 {
		t.Fatalf("the engine reads %d tokens where one was written", len(all))
	}
}

func writeProcess(t *testing.T, root, name string, traced bool) {
	t.Helper()
	dir := ProcessesDir(root)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	kept := "false"
	if traced {
		kept = "true"
	}
	body := "name: " + name + "\ndescription: a process for the test\ntraced: " + kept + "\n" +
		"sections:\n  required:\n    - detail\nstates:\n  - name: first\n    description: where it starts\n" +
		"activities:\n  - name: write\n    does: write it\n    to: first\n" +
		"dispositions:\n  - name: done\n    description: it was done\n"
	if err := os.WriteFile(filepath.Join(dir, name+".process.yaml"), []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
}
