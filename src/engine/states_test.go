package main

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// THE ENGINE KNOWS ELEVEN STATES AND NO OTHERS, AND THE LIST IS ONE LIST.
//
// The owner named ten: backlogged, then the spec half and the implementation
// half each running open, in work, submitted and in review, and imp done. The
// eleventh is aborted, which is the engine's rather than the owner's: the owner
// named where work goes and this is where a dropped token stops.
//
// THERE IS NO SPEC DONE, because a spec that is agreed IS implementation open.
func TestTheStatesAreTheOnesNamed(t *testing.T) {
	want := []Status{
		"backlogged",
		"spec_open", "spec_in_work", "spec_submitted", "spec_in_review",
		"imp_open", "imp_in_work", "imp_submitted", "imp_in_review", "imp_done",
		"aborted",
	}
	got := States()
	if len(got) != len(want) {
		t.Fatalf("the engine knows %d states and the owner named %d: %v", len(got), len(want), got)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("state %d is %q rather than %q", i, got[i], want[i])
		}
	}
	if Status("spec_done").Known() {
		t.Fatal("there is a spec done, and an agreed spec IS implementation open")
	}
	// AND THE LIST IS ONE LIST. Known asks it rather than spelling the states a
	// second time, so a name added to one cannot be missing from the other.
	for _, s := range want {
		if !s.Known() {
			t.Fatalf("%q is in the list and the engine does not know it", s)
		}
	}
	if Status("nonesuch").Known() {
		t.Fatal("the engine knows a state nobody named")
	}
	// TWO ENDINGS AND NO MORE.
	ends := 0
	for _, s := range States() {
		if s.Ended() {
			ends++
		}
	}
	if ends != 2 {
		t.Fatalf("%d states are terminal, and the endings are imp_done and aborted", ends)
	}
}

// A TOKEN STARTS WHERE ITS HALF BEGINS, and StartsAt is where that is decided.
func TestATokenStartsWhereItsHalfBegins(t *testing.T) {
	// A token somebody minted with nothing said drafts first.
	if at := StartsAt(Token{Title: "a person minted this"}); at != SpecOpen {
		t.Fatalf("a token with nothing said starts at %s", at)
	}
	// A BACKLOGGED TOKEN DOES NOT DRAFT YET. It drafts when somebody opens it.
	if at := StartsAt(Token{Title: "one for later", Status: Backlogged}); at != Backlogged {
		t.Fatalf("a backlogged token starts at %s", at)
	}
	// A SUB-TOKEN BREAKS DOWN WORK WHOSE CRITERIA ARE AGREED, so drafting it
	// again would agree the same thing twice.
	if at := StartsAt(Token{Title: "half of it", Parent: "wk-0000000000"}); at != ImpOpen {
		t.Fatalf("a sub-token starts at %s rather than open for implementation", at)
	}
	// And what the minter asks for is what the token carries.
	r := lane(t)
	back := mint(t, r, Token{Title: "one for later", Status: Backlogged})
	if back.Status != Backlogged {
		t.Fatalf("a token minted backlogged is %s", back.Status)
	}
}

// A DRAFT RUNS THE FOUR VERBS: open, in work, submitted, in review.
func TestADraftRunsTheFourVerbs(t *testing.T) {
	r := guidanceTree(t)
	tok := aSpec(t, r, "a thing to build")
	at := func() Status {
		t.Helper()
		back, err := LoadToken(r, tok.ID)
		if err != nil {
			t.Fatal(err)
		}
		return back.Status
	}
	if at() != SpecOpen {
		t.Fatalf("a minted draft is %s", at())
	}
	// HANDING IT OUT IS WHAT MAKES IT IN WORK. A draft nobody had touched and
	// one somebody was writing used to be the same state.
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWork {
		t.Fatalf("the draft was not handed out: %q", a.Pull)
	}
	if at() != SpecInWork {
		t.Fatalf("a draft handed to its drafter is %s", at())
	}
	// SUBMITTED IS WHERE A QUEUE IS COUNTED. A draft went from the drafter's
	// hands into a reviewer's with no state in between.
	if a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID}); a.Pull == AnswerRefused {
		t.Fatalf("the draft was refused: %v", a.Findings)
	}
	if at() != SpecSubmitted {
		t.Fatalf("a draft the drafter sent is %s", at())
	}
	if a := Pull(r, "rev", RoleReviewer, Payload{}); a.Pull != AnswerReview {
		t.Fatalf("the reviewer got %q", a.Pull)
	}
	if at() != SpecInReview {
		t.Fatalf("a draft a reviewer took is %s", at())
	}
}

// AGREEING A DRAFT OPENS IMPLEMENTATION, and there is nothing in between.
func TestAgreeingADraftOpensImplementation(t *testing.T) {
	r := guidanceTree(t)
	tok := aSpec(t, r, "a thing to build")
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID})
	Pull(r, "rev", RoleReviewer, Payload{})
	Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "accept"})
	back, _ := LoadToken(r, tok.ID)
	if back.Status != ImpOpen {
		t.Fatalf("an agreed draft is %s", back.Status)
	}
	// AND NO STATE CALLED SPEC DONE EXISTS to have landed in instead.
	if Status("spec_done").Known() {
		t.Fatal("the engine carries a spec done")
	}
}

// THE IMPLEMENTATION HALF RUNS THE SAME FOUR VERBS AND ENDS AT DONE.
func TestImplementationRunsTheSameFourVerbs(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "do the thing", Status: ImpOpen})
	at := func() Status {
		t.Helper()
		back, _ := LoadToken(r, tok.ID)
		return back.Status
	}
	if at() != ImpOpen {
		t.Fatalf("a minted token is %s", at())
	}
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWork {
		t.Fatalf("the work was not handed out: %q", a.Pull)
	}
	if at() != ImpInWork {
		t.Fatalf("work handed out is %s", at())
	}
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	if at() != ImpSubmitted {
		t.Fatalf("submitted work is %s", at())
	}
	Pull(r, "rev", RoleReviewer, Payload{})
	if at() != ImpInReview {
		t.Fatalf("work a reviewer took is %s", at())
	}
	Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "accept"})
	if at() != ImpDone {
		t.Fatalf("accepted work is %s", at())
	}
}

// AN ABORT COMES OFF EVERY STATE THAT HAS NOT ALREADY ENDED, and the list it
// walks is the engine's own rather than one written out here.
func TestAnAbortComesOffEveryState(t *testing.T) {
	tried := 0
	for _, s := range States() {
		if s.Ended() {
			continue
		}
		tried++
		r := lane(t)
		tok := mint(t, r, Token{Title: "one to abort"})
		// Mint decides where a token starts, so the fixture writes the state
		// this turn of the loop is about.
		tok.Status = s
		if err := SaveToken(r, tok); err != nil {
			t.Fatal(err)
		}
		if _, err := Abort(r, tok.ID, "it is obsolete", "person"); err != nil {
			t.Fatalf("a token in %s could not be aborted: %v", s, err)
		}
		back, _ := LoadToken(r, tok.ID)
		if back.Status != Aborted {
			t.Fatalf("a token in %s aborted to %s", s, back.Status)
		}
		if back.AbortedFrom != s {
			t.Fatalf("a token aborted from %s records %q", s, back.AbortedFrom)
		}
	}
	if tried == 0 {
		t.Fatal("no state was tried, so this guards nothing")
	}
}

// AN ABORT CARRIES ITS REASON, and one with none is refused.
func TestAnAbortCarriesItsReason(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "one to abort", Status: ImpInWork})
	if _, err := Abort(r, tok.ID, "   ", "person"); err == nil {
		t.Fatal("an abort with no reason was allowed")
	}
	if back, _ := LoadToken(r, tok.ID); back.Status != ImpInWork {
		t.Fatalf("the refused abort moved it to %s", back.Status)
	}
	if _, err := Abort(r, tok.ID, "it is a duplicate of the other one", "person"); err != nil {
		t.Fatal(err)
	}
	back, _ := LoadToken(r, tok.ID)
	if back.Reason != "it is a duplicate of the other one" {
		t.Fatalf("the abort's reason is %q", back.Reason)
	}
	// AND THE ABORT SAYS WHAT IT STOPPED IN THE MIDDLE OF. A draft nobody
	// agreed and a build somebody half finished are different things to read
	// six weeks later.
	if back.AbortedFrom != ImpInWork {
		t.Fatalf("the abort came off imp_in_work and records %q", back.AbortedFrom)
	}
	// THE DISPOSITION SAYS WHAT BECAME OF IT AND THE STATE SAYS WHERE IT
	// STOPPED. They are two fields and they stay two.
	if back.Disposition != Dropped {
		t.Fatalf("an aborted token's disposition is %q", back.Disposition)
	}
}

// AN ENDED TOKEN IS NOT ENDED AGAIN, because the first ending is the true one.
func TestAnEndedTokenIsNotAbortedAgain(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "one that ended", Status: ImpOpen})
	if _, err := Abort(r, tok.ID, "it is obsolete", "person"); err != nil {
		t.Fatal(err)
	}
	_, err := Abort(r, tok.ID, "and again", "person")
	if err == nil {
		t.Fatal("an ended token was ended a second time")
	}
	if !strings.Contains(err.Error(), string(Aborted)) {
		t.Fatalf("the refusal does not say which ending it already has: %v", err)
	}
	back, _ := LoadToken(r, tok.ID)
	if back.Reason != "it is obsolete" {
		t.Fatalf("the second abort wrote over the first: %q", back.Reason)
	}
	// And a token that ended done is refused the same way.
	other := mint(t, r, Token{Title: "one that finished", Status: ImpOpen})
	other.Status, other.Disposition = ImpDone, Done
	if err := SaveToken(r, other); err != nil {
		t.Fatal(err)
	}
	_, err = Abort(r, other.ID, "too late", "person")
	if err == nil {
		t.Fatal("a finished token was aborted")
	}
	if !strings.Contains(err.Error(), string(ImpDone)) {
		t.Fatalf("the refusal does not say which ending it already has: %v", err)
	}
}

// EVERY TOKEN ALREADY IN THIS TREE READS BACK UNDER THE NEW NAMES, and one that
// ended by becoming other tokens reads back as a different thing from one that
// ended done.
//
// A DISPOSITION IS SET WHEN THE WORKER SUBMITS AND A STATE ENDS WHEN THE
// REVIEWER ACCEPTS, so a token in review carries done while it is still open.
// The table is read on the tokens that have ended, which is where it decides
// anything.
//
// THE CHECK REFUSES UNLESS IT FOUND ONE OF EACH, rather than passing on a tree
// that has neither.
func TestTheTokensThatExistReadUnderTheNewNames(t *testing.T) {
	r := Roots{Method: filepath.Join("..", ".."), Work: filepath.Join("..", "..")}
	all := Tokens(r)
	if len(all) == 0 {
		t.Fatal("no token was read, so this guards nothing")
	}
	done, became := 0, 0
	for _, tok := range all {
		if !tok.Status.Known() {
			t.Errorf("%s reads back as %q, which the engine does not know", tok.ID, tok.Status)
		}
		if !tok.Status.Ended() {
			continue
		}
		if at := EndsAt(tok.Disposition); at != tok.Status {
			t.Errorf("%s ended %q, which lands at %s, and it reads back as %s",
				tok.ID, tok.Disposition, at, tok.Status)
		}
		switch tok.Disposition {
		case Done:
			done++
		case Became:
			became++
		}
	}
	if done == 0 || became == 0 {
		t.Fatalf("the tree holds %d done and %d became among the tokens that ended, "+
			"so this cannot tell them apart", done, became)
	}
}

// A DROPPED TOKEN READS BACK AS ABORTED, built here because this tree has none.
func TestADroppedTokenReadsBackAsAborted(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "one that was dropped", Status: ImpInReview})
	if _, err := Abort(r, tok.ID, "obsolete since the rewrite", "person"); err != nil {
		t.Fatal(err)
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Status != Aborted {
		t.Fatalf("it reads back as %s", back.Status)
	}
	if back.Disposition != Dropped {
		t.Fatalf("its disposition reads back as %q", back.Disposition)
	}
	if back.Reason != "obsolete since the rewrite" {
		t.Fatalf("the reason did not come with it: %q", back.Reason)
	}
	// AND WHERE IT STOPPED CAME WITH IT TOO.
	if back.AbortedFrom != ImpInReview {
		t.Fatalf("it reads back as aborted from %q", back.AbortedFrom)
	}
}

// NO FILTER IN A .base FILE COMPARES status AGAINST A NAME THE ENGINE DOES NOT
// CARRY.
//
// THAT IS THE ONE SHAPE WITH SOMETHING TO FIND. A status: line in frontmatter
// finds nothing once doc/work and .se/work are excluded, because those two
// directories are the only places frontmatter carries one. A status in
// util/*.json finds nothing either: the icon table declares an icon whose key
// is open and the parameter tree has a node typed status, and neither is a
// status.
func TestNoFilterNamesAStatusTheEngineDoesNotKnow(t *testing.T) {
	root := filepath.Join("..", "..")
	compares := regexp.MustCompile(`status\s*(?:==|!=)\s*"([^"]*)"`)
	judged := 0
	err := filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		if d.IsDir() {
			// THE SCRATCHPAD IS SCRATCH. Lab copies of the views live under it,
			// and nothing reads one as an instruction.
			if skipDirs[d.Name()] || d.Name() == "scratchpad" {
				return filepath.SkipDir
			}
			return nil
		}
		if !strings.HasSuffix(d.Name(), ".base") {
			return nil
		}
		b, err := os.ReadFile(path)
		if err != nil {
			t.Fatalf("%s cannot be read, so this guards nothing: %v", path, err)
		}
		for i, line := range strings.Split(string(b), nl) {
			for _, m := range compares.FindAllStringSubmatch(line, -1) {
				judged++
				if !Status(m[1]).Known() {
					t.Errorf("%s:%d filters on %q, which the engine does not carry", path, i+1, m[1])
				}
			}
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if judged == 0 {
		t.Fatal("no filter compares a status, so this guards nothing")
	}
}

// EVERY OLD NAME READS BACK, AND THE CHECK DOES NOT DEPEND ON A NOTE SURVIVING.
//
// WHY THIS IS SEPARATE FROM THE SWEEP ABOVE. The sweep reads the tokens on disk,
// and every one of them is a note the engine rewrites under the new names the
// first time anything touches it. So the sweep's ability to fail is spent by the
// migration succeeding: the last note spelling in_work stopped spelling it the
// moment that token was submitted, and the last one spelling submitted stopped
// when a reviewer pulled it. Two aliases went unguarded inside one afternoon,
// one of them to a review that changed no code at all.
//
// THE TELL, AND IT GENERALISES: ask what the tree would have to contain for the
// check to go red, then ask whether the system removes that thing while working.
// When the answer is yes, the check needs a fixture it owns.
//
// SO THE LIST IS HERE AND NOT READ FROM THE MAP. Walking wasCalled would take
// its cases from the thing under test, so deleting an entry would delete the
// case that guards it and the check would stay green. These are the names notes
// in this tree were written under, which is a fact about what happened and does
// not change.
var everOnDisk = map[Status]Status{
	"spec":           SpecOpen,
	"open":           ImpOpen,
	"in_work":        ImpInWork,
	"submitted":      ImpSubmitted,
	"in_review":      ImpInReview,
	"closed":         ImpDone,
	"spec_ready":     SpecSubmitted,
	"spec_in_review": SpecInReview, // kept its name, and it still has to read back
}

func TestEveryOldNameReadsBackWhoeverIsLeftOnDisk(t *testing.T) {
	if len(everOnDisk) == 0 {
		t.Fatal("no old name is named here, so this guards nothing")
	}
	for old, now := range everOnDisk {
		r := lane(t)
		id := "wk-0000000001"
		note := "---" + nl +
			"id: " + id + nl +
			"seq: \"1\"" + nl +
			"type: work" + nl +
			"title: one older note" + nl +
			"status: " + string(old) + nl +
			"assignee: main" + nl +
			"scope: single-step" + nl +
			"traced: \"true\"" + nl +
			"---" + nl + nl + "## detail" + nl + nl + "what it was about" + nl
		if err := os.MkdirAll(TracedDir(r), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(TracedDir(r), id+".md"), []byte(note), 0o644); err != nil {
			t.Fatal(err)
		}
		back, err := LoadToken(r, id)
		if err != nil {
			t.Fatalf("a note saying status: %s cannot be read: %v", old, err)
		}
		if back.Status != now {
			t.Errorf("a note saying status: %s reads back as %s rather than %s", old, back.Status, now)
		}
		if !back.Status.Known() {
			t.Errorf("a note saying status: %s reads back as %q, which the engine does not know", old, back.Status)
		}
	}
	// AND THE ENGINE RENAMES NOTHING THIS DOES NOT KNOW ABOUT. A rename added to
	// the map and not to this list is a rename nobody wrote a case for, and the
	// refusal says which one.
	for old := range wasCalled {
		if _, named := everOnDisk[old]; !named {
			t.Errorf("the engine reads %q as an old name and nothing here says a note ever said it", old)
		}
	}
	// A name nobody ever used is not invented a meaning for.
	if got := ReadStatus("nonesuch"); got != Status("nonesuch") {
		t.Fatalf("a name nobody used reads back as %q", got)
	}
}
