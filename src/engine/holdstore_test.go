package main

import (
	"os"
	"path/filepath"
	"quackitect/engine/internal/frontmatter"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
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
func noteParts(t *testing.T, r Roots, id string) (frontmatter.Front, string) {
	t.Helper()
	b, err := os.ReadFile(noteAt(r, id))
	if err != nil {
		t.Fatal(err)
	}
	front, body := frontmatter.Split(string(b))
	f, err := frontmatter.Parse(front)
	if err != nil {
		t.Fatal(err)
	}
	return f, body
}

// exceptTheStretch drops the two fields a take-up and a put-down are expected
// to move: began and ended are the snapshots the engine writes at each end.
func exceptTheStretch(f frontmatter.Front) frontmatter.Front {
	out := frontmatter.Front{}
	for k, v := range f {
		if k == "began" || k == "ended" {
			continue
		}
		out[k] = v
	}
	return out
}

// A TAKE-UP AND A PUT-DOWN LEAVE THE FILE ALONE, apart from the stretch.
func TestTakeUpAndPutDownWriteNoHolderIntoTheFile(t *testing.T) {
	t.Parallel()
	r := heldTokenRoots(t)
	tok, err := Mint(r, Token{Tracked: local(), Process: "queued", Title: "work to be held", Status: "first"})
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
	if d := cmp.Diff(exceptTheStretch(wasFront), exceptTheStretch(upFront)) + cmp.Diff(wasBody, upBody); d != "" {
		t.Fatalf("take-up changed the file beyond began and ended (-was +now):\n%s", d)
	}

	if _, err := PutDown(r, tok.ID, "worker-1"); err != nil {
		t.Fatal(err)
	}
	downFront, downBody := noteParts(t, r, tok.ID)
	if v, ok := downFront["holder"]; ok {
		t.Fatalf("put-down wrote holder %v into the token file", v)
	}
	if d := cmp.Diff(exceptTheStretch(wasFront), exceptTheStretch(downFront)) + cmp.Diff(wasBody, downBody); d != "" {
		t.Fatalf("put-down changed the file beyond began and ended (-was +now):\n%s", d)
	}
}

// THE ENGINE STILL KNOWS WHO HOLDS WHAT. Taking the field off the page is only
// safe if the hold is still answerable, because the queue, se --doing and the
// reclaim all ask the token who holds it.
func TestTheEngineStillKnowsWhoHoldsWhat(t *testing.T) {
	t.Parallel()
	r := heldTokenRoots(t)
	tok, err := Mint(r, Token{Tracked: local(), Process: "queued", Title: "work to be held", Status: "first"})
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
	tok, err := Mint(r, Token{Tracked: local(), Process: "queued", Title: "work from before", Status: "first"})
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

// A HOLD FROM A SESSION THAT HAS ENDED IS NOBODY HOLDING ANYTHING.
//
// A fresh editor drew worker-heron holding a token from the night before, on a
// machine where nothing was running and no agent of that name existed. The
// holder came off the token so a take-up that was never put down would stop
// leaving a name in a file nothing reopens. Keeping it in a store that outlives
// the session moved that defect rather than ending it.
func TestAHoldFromAnEndedSessionIsNotBelieved(t *testing.T) {
	r := aTreeToWriteIn(t)
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		t.Fatal(err)
	}
	// AND A SESSION HAS TO BE READABLE FOR ANOTHER ONE TO HAVE ENDED. The store
	// now decides through ofThisSession, so a log naming nobody decides nothing
	// and what was written stands. This test is about a session that ended, so
	// the tree is put in a later one and the window is its own test.
	theSessionNowIs(t, r, "20260905-100000")
	// What the night before left behind, under its own session. The id is made
	// up: a test naming a token in the record goes stale when that one retires.
	was := []byte(`{"session":"20260903-193501","held":{"wk-fromlastnight":"worker-heron"}}`)
	if err := writeAtomic(filepath.Join(r.Private(), "holds.json"), was, 0o644); err != nil {
		t.Fatal(err)
	}
	if by := HeldBy(r, "wk-fromlastnight"); by != "" {
		t.Fatalf("a hold from an ended session reads as held by %q", by)
	}

	// AND A HOLD THIS SESSION TOOK IS KEPT, which is the half that has to work.
	if err := recordHold(r, "wk-mine", "worker-one"); err != nil {
		t.Fatal(err)
	}
	if by := HeldBy(r, "wk-mine"); by != "worker-one" {
		t.Fatalf("a hold taken in this session reads as %q", by)
	}
	// AND PUTTING IT DOWN CLEARS IT, rather than leaving a name behind.
	if err := recordHold(r, "wk-mine", ""); err != nil {
		t.Fatal(err)
	}
	if by := HeldBy(r, "wk-mine"); by != "" {
		t.Fatalf("a hold put down still reads as held by %q", by)
	}
}
