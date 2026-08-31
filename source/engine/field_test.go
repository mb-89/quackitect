package main

import (
	"strings"
	"testing"
)

// A PERSON EDITS A CELL AND THE ENGINE DECIDES. What the engine owns is not a
// person's to type: typing over it puts the note and the engine's reading of it
// out of step, and nothing would say so.
func TestWhatMayBeWrittenByHandAndWhatMayNot(t *testing.T) {
	for _, c := range []struct{ field, to, says string }{
		{"title", "a shorter title", ""},
		{"detail", "the whole instruction", ""},
		{"assignee", "scribe-1", ""},
		{"bucket", "this week", ""},
		{"scope", "multi-step", ""},

		{"title", "one two three four five six", "4 words at most"},
		{"assignee", "", "every token is somebody's"},
		{"scope", "sideways", "a scope is"},
		{"id", "wk-other", "the engine's"},
		{"seq", "1", "the engine's"},
		{"status", "closed", "moved by a pull"},
		{"holder", "somebody", "moved by a pull"},
		{"subs", "wk-1", "a relation"},
		{"traced", "true", "decided at minting"},
		{"nonsense", "x", "does not write"},
	} {
		tok := Token{Title: "a title", Assignee: "main", Scope: SingleStep}
		err := WriteField(&tok, c.field, c.to)
		if c.says == "" {
			if err != nil {
				t.Errorf("%s=%q was refused: %v", c.field, c.to, err)
			}
			continue
		}
		if err == nil {
			t.Errorf("%s=%q was accepted", c.field, c.to)
			continue
		}
		if !strings.Contains(err.Error(), c.says) {
			t.Errorf("%s=%q refused with %q, which does not say %q", c.field, c.to, err, c.says)
		}
	}
}

// The four-word rule is the same rule wherever a title is written.
func TestATitleWrittenByHandKeepsTheFourWordRule(t *testing.T) {
	tok := Token{Title: "a title", Assignee: "main", Scope: SingleStep}
	if err := WriteField(&tok, "title", "one two three four"); err != nil {
		t.Fatalf("four words was refused: %v", err)
	}
	if tok.Title != "one two three four" {
		t.Fatalf("it wrote %q", tok.Title)
	}
	if err := WriteField(&tok, "title", "one two three four five"); err == nil {
		t.Fatal("five words was accepted")
	}
	if tok.Title != "one two three four" {
		t.Fatalf("a refused write changed the token to %q", tok.Title)
	}
}

// A BUCKET IS A NAME A PERSON TYPED. An agent that invents one has made a
// grouping nobody meant, and two agents inventing two names for one idea is
// how a list stops being readable.
func TestOnlyAPersonNamesABucket(t *testing.T) {
	tok := Token{Title: "a title", Assignee: "main", Scope: SingleStep}
	if err := WriteFieldBy(&tok, "bucket", "later", "main"); err == nil {
		t.Fatal("an agent invented a bucket")
	} else if !strings.Contains(err.Error(), "backlogged") {
		t.Fatalf("the refusal does not say what the agent can do instead: %v", err)
	}
	if tok.Bucket != "" {
		t.Fatalf("the refused write left %q on the token", tok.Bucket)
	}
	// A person names one, and an agent may still clear one.
	if err := WriteFieldBy(&tok, "bucket", "this week", "person"); err != nil {
		t.Fatalf("a person was refused: %v", err)
	}
	if err := WriteFieldBy(&tok, "bucket", "", "main"); err != nil {
		t.Fatalf("an agent could not empty a bucket: %v", err)
	}
}
