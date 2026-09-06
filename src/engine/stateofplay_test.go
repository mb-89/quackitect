package main

import (
	"os"
	"path/filepath"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
	"time"
)

// THE STATE OF PLAY IS READ, NEVER WRITTEN. One screen answers what is going
// on: who holds what, how deep each queue stands, what waits on a person,
// what is parked, and what moved in the last hour.
func TestTheStateOfPlayReadsOneScreen(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	Project(r)
	l, _ := sessionlog.Open(r.Private("log"))
	l.Close()

	held, err := Mint(r, Token{Tracked: local(), Title: "held work", Process: "trivial", Status: "open", Holder: "worker-x"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Mint(r, Token{Title: "waits on a person", Process: "note", Status: "noted", NeedsHuman: true}); err != nil {
		t.Fatal(err)
	}
	if _, err := Mint(r, Token{Title: "parked for later", Process: "note", Status: "noted", ReadyWhen: "after the retro"}); err != nil {
		t.Fatal(err)
	}

	before, _ := os.ReadFile(filepath.Join(r.Private("log"), sessionlog.Current))

	screen := TheStateOfPlay(r, time.Now()).Screen()

	for _, want := range []string{"worker-x", held.ID, "open 1", "noted 2", "1 on a person", "1 parked", "minted 3"} {
		if !strings.Contains(screen, want) {
			t.Fatalf("the screen does not carry %q:\n%s", want, screen)
		}
	}

	// READING WRITES NOTHING. The record is byte for byte what it was.
	after, _ := os.ReadFile(filepath.Join(r.Private("log"), sessionlog.Current))
	if string(before) != string(after) {
		t.Fatal("reading the state of play wrote to the record")
	}
}
