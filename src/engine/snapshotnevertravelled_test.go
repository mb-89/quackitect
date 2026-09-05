package main

import "testing"

// A SNAPSHOT THIS BOX NEVER HAD IS NOT A REASON TO RUN NOTHING.
//
// A take-up writes a commit under refs/se/steps, and no push carries that ref.
// So a token taken up on one box and worked on another names a hash the second
// box never had. git diff on a full hash it does not hold answers "fatal: bad
// object", which the delta reader did not recognise, so se test answered an
// error and ran nothing.
//
// MEASURED. Every travelled token on this box answered it, while every token
// minted here tested. The queue's own test door was shut for exactly the work
// that came from somewhere else.
//
// THE FALLBACK IS THE NEWEST began THIS BOX HOLDS, THEN HEAD, and the answer
// says which was used. A delta measured against a snapshot nobody can name is
// a number with no question behind it.
func TestASnapshotThisBoxNeverHadStillTests(t *testing.T) {
	t.Parallel()
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)
	writeWorkableProcess(t, dir, "queued")
	head := theCommit(t, dir)

	// A HASH THAT IS WELL FORMED AND IS NOT AN OBJECT HERE, which is what a
	// snapshot from another box looks like to this one.
	const elsewhere = "c2682c671c7ab75306367de55d36104c0ec51b96"

	t.Run("only a snapshot from elsewhere", func(t *testing.T) {
		on := aTokenTaking(t, r, elsewhere)
		wrote(t, r, on, "one.md", "# one\n")

		got, err := TestTheDelta(r, db, on, nil, true, "worker-one")
		if err != nil {
			t.Fatalf("se test answered an error rather than a plan: %v", err)
		}
		if got.Since == elsewhere {
			t.Errorf("it measured against %s, which is no object here", elsewhere)
		}
		if got.Since != "HEAD" {
			t.Errorf("with no snapshot this box holds, the fallback is HEAD, and it says %q", got.Since)
		}
	})

	// AND WHERE ONE OF THEM IS HERE, THAT IS THE ONE MEASURED AGAINST. A token
	// taken up on two boxes carries both, and the newest this box holds is a
	// truer question than HEAD.
	t.Run("one from elsewhere and one from here", func(t *testing.T) {
		on := aTokenTaking(t, r, head)
		tok, err := LoadToken(r, on)
		if err != nil {
			t.Fatal(err)
		}
		tok.Began = append(tok.Began, elsewhere)
		if err := SaveToken(r, tok); err != nil {
			t.Fatal(err)
		}
		wrote(t, r, on, "two.md", "# two\n")

		got, err := TestTheDelta(r, db, on, nil, true, "worker-two")
		if err != nil {
			t.Fatalf("se test answered an error rather than a plan: %v", err)
		}
		if got.Since != head {
			t.Errorf("it says %q, and the newest snapshot this box holds is %s", got.Since, head)
		}
	})
}
