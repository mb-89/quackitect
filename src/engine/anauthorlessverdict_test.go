package main

import (
	"path/filepath"
	"strings"
	"testing"
)

// A GUARD THAT READS A FIELD NOBODY WROTE PASSES EVERYTHING, AND PASSES IT
// SILENTLY.
//
// The verdict is never the author's, and the guard asks whether the author is
// the puller. For a token carrying no author at all the answer is no, so it was
// handed over. MEASURED on 2026-09-07: wk-13bfca8541 was written by main, its
// frontmatter carried no author, and the queue offered main its own verdict.
//
// AN ABSENT AUTHOR IS THE CASE THE RULE IS ABOUT. It is not a token whose
// author differs. It is a token whose provenance nobody wrote down, so nobody
// can be told the verdict is not theirs.

func TestAVerdictOnAnAuthorlessTokenIsRefused(t *testing.T) {
	r := Roots{Method: filepath.Join("..", ".."), Work: t.TempDir()}
	token := Token{ID: "wk-0000000000", Title: "one nobody signed"}
	why := theVerdictIsNotYours(r, token, "somebody")
	if why == nil {
		t.Fatal("a token with no author was handed out for a verdict, so the rule guards nothing")
	}
	if why.Clause != "author" {
		t.Errorf("it was refused under %q, and this is about the author", why.Clause)
	}
	if !strings.Contains(why.Wrong, token.ID) {
		t.Errorf("the refusal does not name the token: %s", why.Wrong)
	}
	if why.Satisfies == "" {
		t.Error("the refusal names no legal move, so a reader cannot act on it")
	}
}

// AND THE ONE IT ALWAYS CAUGHT IS STILL CAUGHT. Widening a guard is how the
// case it already held stops being held.
func TestAVerdictIsStillNotTheAuthorsOwn(t *testing.T) {
	r := Roots{Method: filepath.Join("..", ".."), Work: t.TempDir()}
	token := Token{ID: "wk-1111111111", Title: "one main wrote", Author: "main"}
	if why := theVerdictIsNotYours(r, token, "main"); why == nil {
		t.Fatal("the author was handed its own verdict")
	}
	// AND A KNOWN AUTHOR WHO IS SOMEBODY ELSE IS LET THROUGH, or the guard is
	// off rather than widened and no verdict is ever given by anybody.
	if why := theVerdictIsNotYours(r, token, "another"); why != nil {
		t.Errorf("a second actor was refused a verdict it may give: %s", why.Wrong)
	}
}
