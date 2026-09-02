package main

import (
	"testing"
)

// FINISH BEFORE STARTING. Both queues used to hand out drafting
// before implementation. These tests pin the other order: a submission waiting
// is work already done but not yet counted, and an open implementation is work
// somebody already agreed to, so both come before anything new is started.
//
// EVERY TEST ASKS THE QUEUE RATHER THAN READING THE LOOPS, because the order
// is what the queue does and not what the source looks like.

// hold puts a minted token into an in-work state with its holder set, which
// is the state a pull leaves behind.
func hold(t *testing.T, r Roots, tok Token, status Status, by string) {
	t.Helper()
	after, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	after.Status, after.Holder = status, by
	if err := SaveToken(r, after); err != nil {
		t.Fatal(err)
	}
}
