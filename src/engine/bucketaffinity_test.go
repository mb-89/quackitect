package main

import "testing"

// AN AGENT GETS A BUCKET TO ITSELF, WHERE THERE ARE ENOUGH TO GO ROUND.
//
// THE OWNER'S WORDS: the engine will prefer to make agents work on a bucket
// alone, as long as that is possible.
func TestAnAgentStaysInItsOwnBucket(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	// THE AGENT IS ALREADY IN ONE, holding a token filed under it.
	mine := bucketed(t, r, "held in mine", "alpha")
	if _, err := TakeUp(r, mine.ID, "main"); err != nil {
		t.Fatal(err)
	}
	other := bucketed(t, r, "more of mine", "alpha")
	elsewhere := bucketed(t, r, "someone elses", "beta")

	got := byBucketAffinity(r, "main", []Token{elsewhere, other})
	if got[0].ID != other.ID {
		t.Errorf("the agent was offered %s before its own bucket's %s", got[0].ID, other.ID)
	}
}

// AND TWO AGENTS PREFER DIFFERENT BUCKETS, so a bucket somebody is in comes
// after one nobody is in.
func TestAFreeBucketBeatsABusyOne(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	// ANOTHER AGENT IS IN beta, AND ITS TOKEN IS NOT IN THE LIST BEING RANKED.
	// That is the case this exists for: the list is narrowed before the sort
	// sees it, so who is where has to be read off the tree.
	busy := bucketed(t, r, "held by another", "beta")
	if _, err := TakeUp(r, busy.ID, "worker-ada"); err != nil {
		t.Fatal(err)
	}
	moreBusy := bucketed(t, r, "more of beta", "beta")
	free := bucketed(t, r, "nobody is here", "gamma")

	got := byBucketAffinity(r, "main", []Token{moreBusy, free})
	if got[0].ID != free.ID {
		t.Errorf("a busy bucket was offered before a free one: %s came first", got[0].ID)
	}
}

// A TOKEN IN NO BUCKET SORTS LAST, because it is the one most likely to
// collide with anything and the least worth handing out while grouped work is
// waiting.
func TestUnbucketedWorkGoesLast(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	loose := mintStandard(t, r, "in no bucket")
	grouped := bucketed(t, r, "in a bucket", "alpha")

	got := byBucketAffinity(r, "main", []Token{loose, grouped})
	if got[0].ID != grouped.ID {
		t.Errorf("ungrouped work was offered first: %s", got[0].ID)
	}
}

// AND NOTHING IS EVER REFUSED. A preference that can refuse deadlocks the day
// every free bucket is empty, so the list only ever changes order.
func TestTheSortTakesNothingAway(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	one := bucketed(t, r, "one of them", "alpha")
	two := bucketed(t, r, "two of them", "beta")
	three := mintStandard(t, r, "three of them")

	in := []Token{one, two, three}
	got := byBucketAffinity(r, "main", in)
	if len(got) != len(in) {
		t.Fatalf("the sort handed back %d of %d tokens", len(got), len(in))
	}
	seen := map[string]bool{}
	for _, t2 := range got {
		seen[t2.ID] = true
	}
	for _, t2 := range in {
		if !seen[t2.ID] {
			t.Errorf("%s went in and did not come out", t2.ID)
		}
	}
}

// bucketed mints a token and files it, the way a person does.
func bucketed(t *testing.T, r Roots, title, bucket string) Token {
	t.Helper()
	tok := mintStandard(t, r, title)
	if _, err := FileInBucket(r, []string{tok.ID}, bucket, "person"); err != nil {
		t.Fatalf("filing %s under %s: %v", tok.ID, bucket, err)
	}
	got, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	return got
}
