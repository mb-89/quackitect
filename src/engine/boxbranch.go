package main

// A BOX WORKS ON A BRANCH OF ITS OWN.
//
// THE OWNER'S RULE: every box works on a branch of its own, and finishing up
// merges it back. Every box commits and pushes to the trunk instead, so two
// boxes race one ref. A push is refused as non-fast-forward, the hand that made
// it spends its turn on a merge, and the clone that loses drifts behind the
// queue it reads.
//
// THE ENGINE TAKES THE BRANCH, BECAUSE THE ENGINE IS WHAT STARTS. A hand cannot
// be relied on to type a checkout before its first commit, and the first commit
// is where the race is. The engine comes up once per session and before any
// hand does anything, so the branch is taken there.
//
// IT IS NEVER FATAL. A tree with no git, a detached HEAD, or a checkout git
// refuses leaves the box where it stands and says why. SyncClaims answers that
// way for the same reason: a box that cannot reach git goes on working.
//
// THE NAME SITS OUTSIDE se/. Claims ride refs/heads/se/claims, which claim.go
// says is swept from time to time on purpose. A box's own commits must not live
// under a prefix somebody sweeps, so they live under box/.

// boxBranch is the branch this box works on. The name carries the box's own id,
// so two clones on one machine are two branches and a restart is the same one.
func boxBranch(r Roots) string { return "box/" + Box(r) }

// BranchTaken is what a start did about the branch.
type BranchTaken struct {
	On    string `json:"on,omitempty"`  // the branch the tree is on now
	Was   string `json:"was,omitempty"` // where it was, when this moved it
	Moved bool   `json:"moved"`         // whether this call moved it
	Says  string `json:"says"`          // what happened, for the record
}

// TakeTheBoxBranch puts this tree on the box's own branch, off the trunk as it
// stands, and answers what it did.
func TakeTheBoxBranch(r Roots) BranchTaken {
	want := boxBranch(r)
	was, err := gitHere(r, "rev-parse", "--abbrev-ref", "HEAD")
	if err != nil {
		return BranchTaken{Says: "this tree has no branch to take: " + err.Error()}
	}
	if was == want {
		return BranchTaken{On: want, Says: "this box already works on " + want}
	}
	// A DETACHED HEAD IS SOMEBODY'S BISECT OR SOMEBODY'S OLD CHECKOUT. Taking a
	// branch off it would strand what they are doing, so it is left where it is.
	if was == "HEAD" {
		return BranchTaken{Says: "this tree is on no branch, so " + want + " was not taken"}
	}
	// THE BRANCH IS MADE ONCE AND TAKEN AFTERWARDS. A clone that has worked here
	// before carries it, and -b on an existing branch is an error rather than a
	// checkout, so which of the two runs is answered by asking for the ref.
	args := []string{"checkout", "--quiet", want}
	if _, err := gitHere(r, "rev-parse", "--verify", "--quiet", "refs/heads/"+want); err != nil {
		args = []string{"checkout", "--quiet", "-b", want}
	}
	if _, err := gitHere(r, args...); err != nil {
		return BranchTaken{On: was, Says: want + " was not taken: " + err.Error()}
	}
	return BranchTaken{On: want, Was: was, Moved: true,
		Says: "this box works on " + want + ", off " + was}
}
