package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// withTheParameters gives a fixture the declaration the filter is read through.
//
// WITHOUT IT THE QUEUE IS NARROWED BY NOTHING. theFilterInForce returns early
// when LoadValues fails, so a tree with no spec/config/parameters.json derives no
// expression from its branch and hands out every bucket. That is the product's
// deliberate answer and it is written down in the function, but it means a
// fixture that forgets this file proves the opposite of what it says it proves.
func withTheParameters(t *testing.T, r Roots) {
	t.Helper()
	// SpecAt, NOT A JOIN. The five declarations moved from src/config to
	// spec/config, and DeclaredAt reads the new place. A join here left this
	// fixture reading a folder the tree no longer has, which is the exact hazard
	// the comment on DeclaredAt names: a move does not find a path built by
	// joining segments. fixture_test.go already copies them this way.
	to := SpecAt(r.Method, "config")
	if err := os.MkdirAll(to, 0o755); err != nil {
		t.Fatal(err)
	}
	// BOTH FILES, BECAUSE LoadValues READS BOTH. A tree carrying the declaration
	// and no icons answers an error just the same, and the queue is then narrowed
	// by nothing. The blast radius of a missing icons file is a group box handed
	// every bucket, which is the one thing its branch says not to do.
	for _, name := range []string{"parameters.json", "icons.json"} {
		raw, err := os.ReadFile(filepath.Join(SpecAt(filepath.Join("..", ".."), "config"), name))
		if err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(to, name), raw, 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

// A BOX ON A GROUP BRANCH IS HANDED THAT BUCKET, AND THE QUEUE PROVES IT.
//
// TestTheBranchNarrowsABoxNobodyTold beside this one asks theFilterInForce for
// the expression it derives, which is one level under the thing anybody cares
// about. It stays green if the queue never reads that expression, and it is the
// only test the design had.
//
// This one hands work out. Two buckets hold an open token each, the tree stands
// on the branch for one of them, and the queue is asked. What comes back decides
// the sentence, and no arrangement of the derivation can make this pass while a
// box on the branch is handed the wrong token.
//
// WRITTEN AT THE RETRO, for the reason the retro gives: this session proved the
// branch narrowing by reading the code and said so, and reading the code is what
// produced three green tests over a dead button earlier the same day.
func TestABoxOnAGroupBranchIsHandedThatBucketOnly(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	withTheParameters(t, r)
	for _, args := range [][]string{
		{"commit", "--allow-empty", "-m", "one"},
		{"checkout", "-b", aGroupBranch + "tests"},
	} {
		if _, err := gitHere(r, args...); err != nil {
			t.Fatalf("git %v: %v", args, err)
		}
	}

	mine := mintInBucket(t, r, "work the branch names", "tests")
	other := mintInBucket(t, r, "work in another bucket", "archive")

	// THE DERIVATION IS CHECKED FIRST, so a red here says which half is wrong.
	// An empty expression is this fixture failing to derive one, and a wrong
	// token after a right expression is the queue ignoring it. They are two
	// different defects and one assertion cannot tell them apart.
	said, from := theFilterInForce(r)
	if said != theGroupFilter("tests") {
		_, err := LoadValues(r)
		t.Fatalf("the branch derives %q from %q. The branch reads as %q, and the parameters answered %v",
			said, from, theGroupOnTheBranch(r), err)
	}

	got := Pull(r, "main", RoleWorker, Payload{})
	if got.Token == nil {
		t.Fatalf("the queue handed out nothing on a group branch. It said: %q", got.Notice)
	}
	if got.Token.ID == other.ID {
		t.Fatalf("the queue handed out %s from bucket %q, and the branch names tests",
			other.ID, other.Bucket)
	}
	if got.Token.ID != mine.ID {
		t.Fatalf("the queue handed out %s, and the only token in tests is %s", got.Token.ID, mine.ID)
	}
	if got.Token.Bucket != "tests" {
		t.Errorf("what came back is in bucket %q", got.Token.Bucket)
	}
	// AND THE READER IS TOLD WHY ITS QUEUE IS SMALL. A box handed two tokens out
	// of two hundred has nothing else to check the narrowing against.
	if got.Notice == "" || !strings.Contains(got.Notice, aGroupBranch+"tests") {
		t.Errorf("the pull does not name the branch that narrowed it: %q", got.Notice)
	}
}

// AND AN ORDINARY BRANCH NARROWS NOTHING, so the case above is about the group
// branch and not about the fixture holding one token the queue happens to like.
func TestABoxOffAGroupBranchIsHandedEitherBucket(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	withTheParameters(t, r)
	for _, args := range [][]string{
		{"commit", "--allow-empty", "-m", "one"},
		{"checkout", "-b", "v4"},
	} {
		if _, err := gitHere(r, args...); err != nil {
			t.Fatalf("git %v: %v", args, err)
		}
	}
	mintInBucket(t, r, "work in tests", "tests")
	mintInBucket(t, r, "work in archive", "archive")

	got := Pull(r, "main", RoleWorker, Payload{})
	if got.Token == nil {
		t.Fatalf("the queue handed out nothing on an ordinary branch: %q", got.Notice)
	}
	if strings.Contains(got.Notice, aGroupBranch) {
		t.Errorf("an ordinary branch narrowed the queue: %q", got.Notice)
	}
}

// mintInBucket is mintUnclaimed with the bucket the queue narrows on.
func mintInBucket(t *testing.T, r Roots, title, bucket string) Token {
	t.Helper()
	tok, err := Mint(r, Token{Tracked: tracked(), Process: "standard", Title: title, Status: "open",
		Bucket:   bucket,
		Detail:   "a change that wants an approach first and a verdict after",
		Criteria: []Criterion{{Says: "the check is green: go test -run TestX"}},
		Kept:     []KeptSection{{Head: "approach", Text: "One function, one test, nothing else moves."}}})
	if err != nil {
		t.Fatalf("minting into %s: %v", bucket, err)
	}
	return tok
}
