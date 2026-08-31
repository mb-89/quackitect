package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// WHAT A PERSON OWNS IS THE ORDER. The queue hands out the lowest seq, and
// without this an agent holding the wrong token could not put it down.
func TestAPersonPutsATokenFirst(t *testing.T) {
	r := guidanceTree(t)
	mint := func(title string) Token {
		tok, err := Mint(r, Token{Title: title, Assignee: "main", MintedBy: "person"})
		if err != nil {
			t.Fatal(err)
		}
		return tok
	}
	first, second, third := mint("the first one"), mint("the second one"), mint("the third one")
	if first.Seq >= second.Seq || second.Seq >= third.Seq {
		t.Fatalf("minting did not order them: %d %d %d", first.Seq, second.Seq, third.Seq)
	}

	if a := Pull(r, "main", RoleWorker, Payload{}); a.Token.ID != first.ID {
		t.Fatalf("the queue gave %s rather than the oldest", a.Token.ID)
	}
	moved, err := PutFirst(r, third.ID)
	if err != nil {
		t.Fatal(err)
	}
	if moved.Seq >= first.Seq {
		t.Fatalf("%s is at %d, which is not before %d", third.ID, moved.Seq, first.Seq)
	}

	// IT WRITES SEQ AND NOTHING ELSE. The state stays with the pull.
	was, _ := LoadToken(r, third.ID)
	if was.Status != Open || was.Holder != "" {
		t.Fatalf("it moved more than the order: %s held by %q", was.Status, was.Holder)
	}
	// The first token is still in work, so the queue gives that back before
	// anything else. Once it is submitted, the reordered one comes next.
	Pull(r, "main", RoleWorker, Payload{ID: first.ID, Disposition: "done"})
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Token.ID != third.ID {
		t.Fatalf("after the reorder the queue gave %s", a.Token.ID)
	}
	_ = second
}

// A token already first stays where it is rather than sliding down forever.
func TestPuttingTheFirstOneFirstChangesNothing(t *testing.T) {
	r := guidanceTree(t)
	tok, err := Mint(r, Token{Title: "the only one", Assignee: "main", MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	again, err := PutFirst(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if again.Seq != tok.Seq {
		t.Fatalf("it moved from %d to %d with nothing ahead of it", tok.Seq, again.Seq)
	}
}

// THE ORDER IS A DECISION AND EVERY DECISION IS IN THE RECORD. The queue hands
// out by seq, so a log that does not say who moved one cannot explain why the
// next pull answered what it did.
func TestPuttingATokenFirstIsRecorded(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	mint := func(title string) Token {
		tok, err := Mint(r, Token{Title: title, Assignee: "main", Scope: SingleStep,
			MintedBy: "person"})
		if err != nil {
			t.Fatal(err)
		}
		return tok
	}
	mint("the first one")
	third := mint("the third one")

	out, err := exec.Command(exe, "work", "--first", third.ID, "--by", "person",
		"--work", r.Work).CombinedOutput()
	if err != nil {
		t.Fatalf("%v: %s", err, out)
	}

	b, err := os.ReadFile(filepath.Join(r.Private("log"), Current))
	if err != nil {
		t.Fatal(err)
	}
	log := string(b)
	for _, want := range []string{third.ID, "put first at seq", `"actor":"person"`} {
		if !strings.Contains(log, want) {
			t.Fatalf("the record does not carry %q:\n%s", want, log)
		}
	}
}
