package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A SECTION THE RECORD WILL NOT WRITE STOPS THAT TOKEN, NOT THE QUEUE.
//
// Two standard tokens owed a verdict, and one carried a step table restored
// verbatim from its ended commit, past the words the schema allows an evidence
// chapter. Handing a token out saves it, the save refused, and the pull
// answered wait naming the write. So one oversized chapter answered wait to
// every reviewer, and the other token owing a verdict was never reached.
//
// The queue passes over it the way it passes over a parked token, and the wait
// notice names it so somebody can shorten it. The save still refuses: the cap
// is the point, and lifting it would trade a stopped queue for a record that
// holds what nobody reads.
func TestAnOversizedChapterDoesNotStopTheQueue(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	// TWO TOKENS OWING A VERDICT, both authored by the worker so neither is
	// the reviewer's own.
	var owed []Token
	for _, title := range []string{"the first change", "the second change"} {
		tok := mintStandard(t, r, title)
		if got := Pull(r, "worker-1", RoleWorker, Payload{}); got.Pull != AnswerWork {
			t.Fatalf("the worker was not handed %s: %s %s", tok.ID, got.Pull, got.Notice)
		}
		ticked(t, r, tok.ID)
		if got := Pull(r, "worker-1", RoleWorker, Payload{ID: tok.ID}); got.Pull == AnswerRefused {
			t.Fatalf("the work step was refused: %+v", got.Findings)
		}
		done, err := LoadToken(r, tok.ID)
		if err != nil {
			t.Fatal(err)
		}
		owed = append(owed, done)
	}

	// THE ONE THE QUEUE REACHES FIRST IS THE OVERSIZED ONE, because the queue
	// is ordered by id and this test is about what happens behind it.
	first, second := owed[0], owed[1]
	if second.ID < first.ID {
		first, second = second, first
	}

	// PAST THE CAP, WRITTEN STRAIGHT ONTO THE NOTE. The save is the door that
	// refuses this, so a token in this state arrives through some other door,
	// which is how the real two arrived.
	growChapter(t, r, first.ID, "step 2. do", 260)

	// THE SAVE STILL REFUSES IT, naming the chapter and both numbers.
	over, err := LoadToken(r, first.ID)
	if err != nil {
		t.Fatal(err)
	}
	err = SaveToken(r, over)
	if err == nil {
		t.Fatal("the save took a chapter past the words the schema allows")
	}
	if !strings.Contains(err.Error(), "step 2. do") || !strings.Contains(err.Error(), "200") {
		t.Fatalf("the refusal does not name the chapter and its bound: %v", err)
	}

	// AND THE QUEUE HANDS OUT THE ONE BEHIND IT.
	got := Pull(r, "reviewer-1", RoleReviewer, Payload{})
	if got.Pull != AnswerWork || got.Token == nil {
		t.Fatalf("the queue answered %s instead of handing out the token behind the oversized one: %s",
			got.Pull, got.Notice)
	}
	if got.Token.ID != second.ID {
		t.Fatalf("the queue handed %s, wanted %s", got.Token.ID, second.ID)
	}

	// AND WHEN THERE IS NOTHING BEHIND IT, THE WAIT NAMES IT, so the chapter
	// that cannot be written can be found and shortened.
	got = Pull(r, "reviewer-2", RoleReviewer, Payload{})
	if got.Pull != AnswerWait {
		t.Fatalf("with only the oversized token left the queue answered %s", got.Pull)
	}
	if !strings.Contains(got.Notice, first.ID) {
		t.Fatalf("the wait does not name the token the record will not write: %s", got.Notice)
	}
}

// growChapter writes one chapter of a note past its bound, going round the
// save so the note lands in the state the record was found in.
func growChapter(t *testing.T, r Roots, id, chapter string, words int) {
	t.Helper()
	path := noteAt(r, id)
	if path == "" {
		t.Fatalf("no note on disk for %s", id)
	}
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	head := "## evidence: " + chapter
	text := string(b)
	at := strings.Index(text, head)
	if at < 0 {
		t.Fatalf("%s carries no %q", filepath.Base(path), head)
	}
	at += len(head)
	text = text[:at] + "\n\n" + strings.TrimSpace(strings.Repeat("restored ", words)) + "\n" + text[at:]
	if err := os.WriteFile(path, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}
