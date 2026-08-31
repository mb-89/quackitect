package main

import (
	"strings"
	"testing"
)

func someTokens(t *testing.T, r Roots, titles ...string) []Token {
	t.Helper()
	var out []Token
	for _, title := range titles {
		tok, err := Mint(r, Token{Title: title, Assignee: "main", Scope: SingleStep,
			MintedBy: "person"})
		if err != nil {
			t.Fatal(err)
		}
		out = append(out, tok)
	}
	return out
}

// A BUCKET IS THE PERSON'S OWN NAME FOR A GROUP, and it does not move the work.
// The status stays exactly as it was and only the grouping changes.
func TestFilingRowsInABucketLeavesTheirStatusAlone(t *testing.T) {
	r := guidanceTree(t)
	all := someTokens(t, r, "the first one", "the second one")

	name, err := FileInBucket(r, []string{all[0].ID, all[1].ID}, "later", "person")
	if err != nil {
		t.Fatal(err)
	}
	if name != "later" {
		t.Fatalf("it filed them in %q", name)
	}
	for _, was := range all {
		now, err := LoadToken(r, was.ID)
		if err != nil {
			t.Fatal(err)
		}
		if now.Bucket != "later" {
			t.Fatalf("%s is in %q", was.ID, now.Bucket)
		}
		if now.Status != was.Status {
			t.Fatalf("filing moved %s from %s to %s", was.ID, was.Status, now.Status)
		}
	}
}

// THE BUCKET IS MADE FIRST AND NAMED AFTERWARDS. A webview refuses a browser
// prompt, so a control that asked for a name did nothing at all when pressed.
// An empty name asks the engine, which knows what is taken.
func TestAnEmptyNameAsksTheEngineForAFreeOne(t *testing.T) {
	r := guidanceTree(t)
	all := someTokens(t, r, "the first one", "the second one", "the third one")

	first, err := FileInBucket(r, []string{all[0].ID}, "", "person")
	if err != nil {
		t.Fatal(err)
	}
	second, err := FileInBucket(r, []string{all[1].ID}, "", "person")
	if err != nil {
		t.Fatal(err)
	}
	if first == second {
		t.Fatalf("two buckets got the same name: %q", first)
	}
	if isStatus(first) || isStatus(second) {
		t.Fatalf("a fresh name collides with a status: %q %q", first, second)
	}
}

// ONLY A PERSON MAKES ONE. An agent filing rows into a group of its own is an
// agent inventing a word nobody agreed to.
func TestAnAgentCannotMakeABucket(t *testing.T) {
	r := guidanceTree(t)
	all := someTokens(t, r, "the first one")
	if _, err := FileInBucket(r, []string{all[0].ID}, "later", "main"); err == nil {
		t.Fatal("an agent made a bucket")
	}
}

// A STATUS CAN NEVER BE RENAMED FROM HERE, and the refusal says so rather than
// quietly doing nothing.
func TestAStatusIsNotABucket(t *testing.T) {
	r := guidanceTree(t)
	someTokens(t, r, "the first one")

	_, err := RenameBucket(r, "open", "later", "person")
	if err == nil {
		t.Fatal("a status was renamed")
	}
	if !strings.Contains(err.Error(), "is a status") {
		t.Fatalf("the refusal does not say why: %v", err)
	}
	// And a bucket cannot take a status's name either.
	all := someTokens(t, r, "the second one")
	if _, err := FileInBucket(r, []string{all[0].ID}, "later", "person"); err != nil {
		t.Fatal(err)
	}
	if _, err := RenameBucket(r, "later", "submitted", "person"); err == nil {
		t.Fatal("a bucket was named after a status")
	}
}

// A bucket is renamed on every token carrying it, and nothing else moves.
func TestRenamingABucketMovesEveryTokenInIt(t *testing.T) {
	r := guidanceTree(t)
	all := someTokens(t, r, "the first one", "the second one", "the third one")
	if _, err := FileInBucket(r, []string{all[0].ID, all[1].ID}, "later", "person"); err != nil {
		t.Fatal(err)
	}
	n, err := RenameBucket(r, "later", "next week", "person")
	if err != nil {
		t.Fatal(err)
	}
	if n != 2 {
		t.Fatalf("it moved %d tokens", n)
	}
	for _, was := range all[:2] {
		now, _ := LoadToken(r, was.ID)
		if now.Bucket != "next week" {
			t.Fatalf("%s is in %q", was.ID, now.Bucket)
		}
	}
	if now, _ := LoadToken(r, all[2].ID); now.Bucket != "" {
		t.Fatalf("a token outside the bucket moved to %q", now.Bucket)
	}
	// A bucket nobody is in is named rather than silently doing nothing.
	if _, err := RenameBucket(r, "later", "again", "person"); err == nil {
		t.Fatal("renaming an empty bucket was accepted")
	}
}
