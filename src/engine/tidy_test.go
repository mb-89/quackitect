package main

import (
	"encoding/json"
	"errors"
	"testing"
	"time"
)

// A PART THAT CANNOT RUN HERE MUST NOT TAKE THE REST WITH IT.
//
// A cloud box cannot write a ref the proxy refuses, and that is the ordinary
// case rather than a fault. A tidy that stopped there would mean a cloud box
// tidies nothing at all, which is the condition this token was written for.
//
// THE GIT IT IS HANDED REFUSES EVERY CALL, because a refusal is the thing
// under test and a real remote cannot be made to answer 403 on demand.
func TestATidyPartThatCannotRunDoesNotStopTheRest(t *testing.T) {
	t.Parallel()
	r := aTidyTree(t)

	refuses := func(args ...string) (string, error) {
		return "", errors.New("git push: HTTP 403 from the proxy")
	}
	parts := tidyWith(r, time.Now().UTC(), refuses)

	if len(parts) != 3 {
		t.Fatalf("the tidy answered %d part(s), and there are three jobs", len(parts))
	}
	by := map[string]TidyPart{}
	for _, p := range parts {
		by[p.Name] = p
	}
	for _, name := range []string{"archive", "claims", "refs"} {
		if _, ok := by[name]; !ok {
			t.Fatalf("no part is named %s: %+v", name, parts)
		}
	}

	// THE TWO THAT NEED NO GIT STILL RAN, which is the whole rule.
	if !by["archive"].Could {
		t.Errorf("the archive part gave up because another part could not run: %+v", by["archive"])
	}
	if !by["claims"].Could {
		t.Errorf("the claims part gave up because another part could not run: %+v", by["claims"])
	}
	if by["claims"].Did != 1 {
		t.Errorf("the claims part dropped %d lapsed claim(s), and one was lapsed", by["claims"].Did)
	}

	// AND THE ONE THAT COULD NOT SAYS SO, AND SAYS WHY.
	if by["refs"].Could {
		t.Fatalf("the refs part says it could, and every git call refused: %+v", by["refs"])
	}
	if by["refs"].Why == "" {
		t.Error("the refs part could not run and says nothing about why, so nobody knows what is owed")
	}
}

// THE SECOND RUN CHANGES NOTHING, so a retro that calls this on every start
// does not walk the same work twice and does not report work it did not do.
func TestASecondTidyChangesNothing(t *testing.T) {
	t.Parallel()
	r := aTidyTree(t)

	now := time.Now().UTC()
	silent := func(args ...string) (string, error) { return "", nil }

	first := tidyWith(r, now, silent)
	did := 0
	for _, p := range first {
		did += p.Did
	}
	if did == 0 {
		t.Fatal("the first tidy did nothing, so the second proves nothing")
	}

	for _, p := range tidyWith(r, now, silent) {
		if p.Did != 0 {
			t.Errorf("the second tidy did %d thing(s) in %s, and the first left nothing to do", p.Did, p.Name)
		}
	}
}

// THE VERB ANSWERS THE THREE PARTS, each with a name, a count and whether this
// box could do it.
//
// IT GOES THROUGH runVerbInside, WHICH IS THE DISPATCHER ITSELF. Running the
// program at a shell proves nothing here: the client relays a verb to whatever
// engine is already up, so a new verb answers no such verb until somebody swaps
// the engine. This is the same table that relay reads.
func TestTheTidyVerbAnswersItsParts(t *testing.T) {
	r := aTidyTree(t)

	said := runVerbInside(t.Context(), r, verbAsk{Verb: "tidy", Args: []string{"--work", r.Work}})
	if said.Code != 0 {
		t.Fatalf("se tidy answered %d: %s", said.Code, said.Err)
	}
	var got struct {
		Parts []TidyPart `json:"parts"`
	}
	if err := json.Unmarshal([]byte(said.Out), &got); err != nil {
		t.Fatalf("se tidy did not answer JSON: %v\n%s", err, said.Out)
	}
	want := []string{"archive", "claims", "refs"}
	if len(got.Parts) != len(want) {
		t.Fatalf("se tidy answered %d part(s): %s", len(got.Parts), said.Out)
	}
	for i, name := range want {
		if got.Parts[i].Name != name {
			t.Errorf("part %d is named %q, and the parts run in the order archive, claims, refs",
				i, got.Parts[i].Name)
		}
	}
	if got.Parts[1].Did != 1 {
		t.Errorf("the claims part dropped %d lapsed claim(s), and one was lapsed", got.Parts[1].Did)
	}
}

// THE RETRO TIDIES ON THE WAY IN, so the tidying is one thing with one name
// rather than a list somebody has to remember to run beside it.
func TestARetroTidiesOnStart(t *testing.T) {
	r := aTidyTree(t)

	got, err := Retro(t.Context(), r, "main", nil)
	if err != nil {
		t.Fatalf("the retro would not run: %v", err)
	}
	if len(got.Tidy) != 3 {
		t.Fatalf("the retro carries %d tidy part(s), and the tidy has three", len(got.Tidy))
	}
	for _, p := range got.Tidy {
		if p.Name == "" {
			t.Errorf("a tidy part in the retro has no name, so nobody can read what it was: %+v", p)
		}
	}
}

// aTidyTree is a tree with one thing for each part to find: a token that has
// closed and never been archived, and a claim that has lapsed.
func aTidyTree(t *testing.T) Roots {
	t.Helper()
	r := aTreeWithHistory(t)

	closed, err := Mint(r, Token{Process: "trivial", Title: "already closed",
		Status: "first", Tracked: local()})
	if err != nil {
		t.Fatal(err)
	}
	closed.Disposition = Done
	closed.Status = "closed"
	if err := SaveToken(r, closed); err != nil {
		t.Fatal(err)
	}

	stale, err := Mint(r, Token{Process: "trivial", Title: "held too long",
		Status: "first", Tracked: local()})
	if err != nil {
		t.Fatal(err)
	}
	long := time.Duration(LoadConfig(r).ClaimHours+1) * time.Hour
	stale.ClaimedBy = "aaaaaaaa/worker-gone"
	stale.ClaimedAt = time.Now().UTC().Add(-long).Format(ClaimStamp)
	if err := SaveToken(r, stale); err != nil {
		t.Fatal(err)
	}
	return r
}
