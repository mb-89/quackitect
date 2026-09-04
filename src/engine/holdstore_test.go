package main

import (
	"os"
	"reflect"
	"strings"
	"testing"
)

// THE HOLD IS ENGINE STATE, NOT TOKEN CONTENT.
//
// TakeUp wrote holder into the token's frontmatter, so a hold that was never
// put down left a name in a file the engine had no reason to revisit. Nine
// tokens in this tree carry holders from agents whose session ended, and the
// queue answered investigate on one of them rather than handing out work.

// noteParts answers a token file's frontmatter and its body as they are on
// disk. The file is read rather than the token, because what is written on the
// page is the thing under discussion.
func noteParts(t *testing.T, r Roots, id string) (Front, string) {
	t.Helper()
	b, err := os.ReadFile(noteAt(r, id))
	if err != nil {
		t.Fatal(err)
	}
	front, body := SplitNote(string(b))
	f, err := ParseFront(front)
	if err != nil {
		t.Fatal(err)
	}
	return f, body
}

// exceptTheStretch drops the two fields a take-up and a put-down are expected
// to move: began and ended are the snapshots the engine writes at each end.
func exceptTheStretch(f Front) Front {
	out := Front{}
	for k, v := range f {
		if k == "began" || k == "ended" {
			continue
		}
		out[k] = v
	}
	return out
}

// heldTokenRoots is the setup the hold tests share: a tree, a workable process
// and an open log, so the session has a name to write arrivals against.
func heldTokenRoots(t *testing.T) Roots {
	t.Helper()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	writeProcess(t, root, "queued", false)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { log.Close() })
	log.Write("engine", "start", "engine", "for the session name", Yes(), nil)
	return r
}

// A TAKE-UP AND A PUT-DOWN LEAVE THE FILE ALONE, apart from the stretch.
func TestTakeUpAndPutDownWriteNoHolderIntoTheFile(t *testing.T) {
	t.Parallel()
	r := heldTokenRoots(t)
	tok, err := Mint(r, Token{Process: "queued", Title: "work to be held", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	wasFront, wasBody := noteParts(t, r, tok.ID)

	if _, err := TakeUp(r, tok.ID, "worker-1"); err != nil {
		t.Fatal(err)
	}
	upFront, upBody := noteParts(t, r, tok.ID)
	if v, ok := upFront["holder"]; ok {
		t.Fatalf("take-up wrote holder %v into the token file; the hold is the engine's", v)
	}
	if !reflect.DeepEqual(exceptTheStretch(upFront), exceptTheStretch(wasFront)) || upBody != wasBody {
		t.Fatalf("take-up changed the file beyond began and ended:\n%v\nwas\n%v", upFront, wasFront)
	}

	if _, err := PutDown(r, tok.ID, "worker-1"); err != nil {
		t.Fatal(err)
	}
	downFront, downBody := noteParts(t, r, tok.ID)
	if v, ok := downFront["holder"]; ok {
		t.Fatalf("put-down wrote holder %v into the token file", v)
	}
	if !reflect.DeepEqual(exceptTheStretch(downFront), exceptTheStretch(wasFront)) || downBody != wasBody {
		t.Fatalf("put-down changed the file beyond began and ended:\n%v\nwas\n%v", downFront, wasFront)
	}
}

// THE ENGINE STILL KNOWS WHO HOLDS WHAT. Taking the field off the page is only
// safe if the hold is still answerable, because the queue, se --doing and the
// reclaim all ask the token who holds it.
func TestTheEngineStillKnowsWhoHoldsWhat(t *testing.T) {
	t.Parallel()
	r := heldTokenRoots(t)
	tok, err := Mint(r, Token{Process: "queued", Title: "work to be held", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := TakeUp(r, tok.ID, "worker-1"); err != nil {
		t.Fatal(err)
	}
	if got, err := LoadToken(r, tok.ID); err != nil || got.Holder != "worker-1" {
		t.Fatalf("the engine lost the hold: holder %q, %v", got.Holder, err)
	}
	if held := InWorkFor(r, "worker-1"); len(held) != 1 || held[0].ID != tok.ID {
		t.Fatalf("the hold is not in worker-1's hands: %v", held)
	}

	if _, err := PutDown(r, tok.ID, "worker-1"); err != nil {
		t.Fatal(err)
	}
	if got, _ := LoadToken(r, tok.ID); got.Holder != "" {
		t.Fatalf("the hold outlived the put-down: holder %q", got.Holder)
	}
	if held := InWorkFor(r, "worker-1"); len(held) != 0 {
		t.Fatalf("worker-1 still holds %v after putting it down", held)
	}
}

// A STALE HOLDER IN A FILE IS READ AND NOT BELIEVED. Every token written
// before this change carries one, and nine of them name agents that are gone.
func TestAStaleHolderInTheFileIsNotBelieved(t *testing.T) {
	t.Parallel()
	r := heldTokenRoots(t)
	tok, err := Mint(r, Token{Process: "queued", Title: "work from before", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	path := noteAt(r, tok.ID)
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	stale := strings.Replace(string(b), "status: ", "holder: worker-gone\nstatus: ", 1)
	if stale == string(b) {
		t.Fatal("the test could not write a stale holder into the file")
	}
	if err := os.WriteFile(path, []byte(stale), 0o644); err != nil {
		t.Fatal(err)
	}

	if got, err := LoadToken(r, tok.ID); err != nil || got.Holder != "" {
		t.Fatalf("the engine believed a holder written in the file: %q, %v", got.Holder, err)
	}
	if held := InWorkFor(r, "worker-gone"); len(held) != 0 {
		t.Fatalf("a name left in a file put work in worker-gone's hands: %v", held)
	}
}
