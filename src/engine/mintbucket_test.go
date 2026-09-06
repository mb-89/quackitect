package main

import "testing"

// THE MINT TAKES THE BUCKET THE WORK WAS FOUND IN.
//
// A bucket is what a person narrows the queue to, and the mint took eleven
// arguments without it. So filing a new token was a hand edit of front matter
// after the fact, and no hand did it unprompted.
//
// MEASURED in September 2026. Fifteen tokens were minted on one box with the
// queue narrowed to a bucket, and not one carried it. The queue could offer
// none of them and answered three workable while fifteen sat outside it.
//
// AND UNSAID INHERITS, because an agent draining a narrowed queue is in a
// bucket already, and backlog rule 5 files a found bug where it was found.
func TestTheMintTakesABucket(t *testing.T) {
	r := aTreeWithTheProcesses(t)

	// LOCAL, so taking it up below needs no claim. A claim is between boxes and
	// this test is about the bucket, which travels either way.
	named := theNotesDoor(t, r, "mcp__quackitect__se_work", []string{"work", "--title", "named outright",
		"--process", "trivial", "--tracked", "false", "--done-when", "it carries the bucket",
		"--bucket", "claims", "--by", "main"})
	if named.Bucket != "claims" {
		t.Fatalf("a mint naming a bucket answered %q", named.Bucket)
	}
	if back, err := LoadToken(r, named.ID); err != nil || back.Bucket != "claims" {
		t.Errorf("the bucket did not reach the disk: %v %q", err, back.Bucket)
	}

	// NOTHING NAMED AND NOTHING HELD CARRIES NONE, because guessing one files
	// work where nobody is looking for it.
	alone := theNotesDoor(t, r, "mcp__quackitect__se_work", []string{"work", "--title", "nothing in hand",
		"--process", "trivial", "--tracked", "true", "--done-when", "it carries no bucket", "--by", "main"})
	if alone.Bucket != "" {
		t.Errorf("a mint with nothing held invented the bucket %q", alone.Bucket)
	}

	// AND ONE MADE WITH A BUCKETED TOKEN IN HAND INHERITS IT.
	if _, err := TakeUp(r, named.ID, "main"); err != nil {
		t.Fatal(err)
	}
	inherited := theNotesDoor(t, r, "mcp__quackitect__se_work", []string{"work", "--title", "found while working",
		"--process", "trivial", "--tracked", "true", "--done-when", "it inherits the bucket", "--by", "main"})
	if inherited.Bucket != "claims" {
		t.Errorf("a mint made holding a claims token answered %q", inherited.Bucket)
	}
}
