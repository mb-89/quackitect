package main

import "sort"

// AN AGENT GETS A BUCKET TO ITSELF, WHERE THERE ARE ENOUGH TO GO ROUND.
//
// THE OWNER'S WORDS: the engine will prefer to make agents work on a bucket
// alone, as long as that is possible. If I give one cloud box a filter naming
// three buckets and it spawns three agents, each works its own.
//
// TWO PREFERENCES, AND NEITHER IS A RULE.
//
// An agent stays in the bucket it is already working, so it does not wander
// between them and touch three sets of files in an afternoon.
//
// And two agents prefer different buckets, so the one thing that stops them
// meeting in a file is the thing the queue is choosing on.
//
// NEITHER EVER REFUSES. A preference that can refuse is a deadlock waiting for
// the day every free bucket is empty. When there is no bucket of its own left,
// an agent takes from one somebody else is in, and when nothing matches at all
// it takes whatever is next. Ordering is all this does.
//
// A TOKEN IN NO BUCKET IS NOBODY'S, and sorts last among equals rather than
// first. It is work nobody grouped, so it is the most likely to collide with
// anything, and the least worth handing out while grouped work is waiting.

// WHO IS IN WHICH BUCKET IS READ OFF THE TREE, NOT OFF THE LIST BEING RANKED.
//
// The list handed to the sort has already been narrowed: by the queue filter, by
// what the fetched branch has closed, and by what is workable at all. A token
// somebody else is holding may be missing from it for any of those reasons, and
// then the bucket it is in reads as free and two agents are sent into it.
//
// Measured by the test below, which ranks a two-token list while a third token,
// held by another agent, sits outside it.

// theirBucket answers the bucket this actor is already working, and whether it
// has one. What is in its hands is what it is on.
func theirBucket(r Roots, actor string) (string, bool) {
	for _, t := range Tokens(r) {
		if t.Holder == actor && !t.Ended() && t.Bucket != "" {
			return t.Bucket, true
		}
	}
	return "", false
}

// bucketsInOtherHands answers which buckets somebody else is working, so this
// actor can prefer one nobody is in.
func bucketsInOtherHands(r Roots, actor string) map[string]bool {
	taken := map[string]bool{}
	for _, t := range Tokens(r) {
		if t.Holder != "" && t.Holder != actor && !t.Ended() && t.Bucket != "" {
			taken[t.Bucket] = true
		}
	}
	return taken
}

// byBucketAffinity reorders what the queue would hand out, so an agent meets
// its own bucket first, a free bucket next, and somebody else's last.
//
// IT IS A SORT AND NOT A FILTER. Nothing leaves the list, so every rule above
// this one still decides what is workable and every rule below still decides
// among equals. This only says which of two workable tokens comes first.
func byBucketAffinity(r Roots, actor string, all []Token) []Token {
	mine, hasMine := theirBucket(r, actor)
	taken := bucketsInOtherHands(r, actor)

	// FOUR RANKS, BEST FIRST. A lower number is handed out sooner.
	rank := func(t Token) int {
		switch {
		case hasMine && t.Bucket == mine:
			return 0 // the bucket this agent is already in
		case t.Bucket != "" && !taken[t.Bucket]:
			return 1 // a bucket nobody is in
		case t.Bucket != "":
			return 2 // a bucket somebody else is in
		default:
			return 3 // no bucket at all
		}
	}

	// THE ORDER IT ARRIVED IN IS KEPT AMONG EQUALS. Everything above this has
	// already sorted the list, by what blocks, what is urgent and what is oldest.
	// A stable sort adds a preference without taking those away.
	out := make([]Token, len(all))
	copy(out, all)
	sort.SliceStable(out, func(i, j int) bool { return rank(out[i]) < rank(out[j]) })
	return out
}
