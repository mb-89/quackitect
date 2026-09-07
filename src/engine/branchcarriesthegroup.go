package main

import "strings"

// THE BRANCH IS THE INSTRUCTION.
//
// A box is cut for one bucket, and on a cloud box nobody is there to say which.
// The queue filter already narrows the pull, and somebody has to type it. That
// works on a desk and nowhere else.
//
// THE NAME CANNOT DRIFT FROM THE BRANCH, BECAUSE IT IS THE BRANCH. group/cloud
// means bucket: cloud, read at the moment the filter is read. Nothing is
// written into the parameter, so a checkout of another branch changes the queue
// and nothing has to be cleared afterwards.
//
// THE OBVIOUS ALTERNATIVE IS A BRIEF FILE ON THE BRANCH, and it is worse. It is
// a second writer over a fact the bucket already owns, and a generated file on
// a branch is how two branches learn to conflict. What the branch carries
// besides its name is a group token, which is a token like any other and merges
// like one.
//
// A PERSON WHO TYPED A FILTER GETS WHAT THEY TYPED. The keyword stays the
// manual override and the branch is only the default, so this narrows a box
// that was told nothing and overrules nobody.

// aGroupBranch is what marks a branch as standing for a bucket.
const aGroupBranch = "group/"

// theGroupOnTheBranch answers the bucket this checkout is for, or nothing.
//
// IT READS HEAD AND NOT THE UPSTREAM. A box works on the branch it is on, and a
// branch with no upstream yet is still the instruction.
func theGroupOnTheBranch(r Roots) string {
	name, err := gitHere(r, "rev-parse", "--abbrev-ref", "HEAD")
	if err != nil {
		return ""
	}
	return theGroupInAName(name)
}

// theGroupInAName is the reading itself, with no git in it, so the rule can be
// driven over names rather than over checkouts.
func theGroupInAName(branch string) string {
	name := strings.TrimSpace(branch)
	if !strings.HasPrefix(name, aGroupBranch) {
		return ""
	}
	return strings.TrimPrefix(name, aGroupBranch)
}

// theGroupFilter is what a group branch stands for, in the filter language the
// queue already reads.
func theGroupFilter(group string) string { return "bucket: " + group }

// TakeTheGroupBranch puts this tree on the branch that stands for a bucket, and
// answers what it did.
//
// IT IS THE SHAPE boxbranch.go ALREADY USES, deliberately. Taking a box branch
// and taking a group branch are one act with two names, and a second way of
// taking a branch is a second thing to get wrong. What differs is the name and
// what triggers it, and nothing else.
//
// IT IS NEVER FATAL, for the reason TakeTheBoxBranch gives. A tree with no git,
// a detached head, or a checkout git refuses leaves the box where it stands and
// says why. A box that cannot reach git goes on working.
//
// THE BRANCH IS THE INSTRUCTION FROM THIS MOMENT. Nothing is written into the
// queue filter, because the branch is read every time the filter is read. So
// the next pull is narrowed with nothing typed, and it says the branch did it.
func TakeTheGroupBranch(r Roots, bucket string) BranchTaken {
	bucket = strings.TrimSpace(bucket)
	if bucket == "" {
		return BranchTaken{Says: "no bucket was named, so no group branch was taken"}
	}
	want := aGroupBranch + bucket
	was, err := gitHere(r, "rev-parse", "--abbrev-ref", "HEAD")
	if err != nil {
		return BranchTaken{Says: "this tree has no branch to take: " + err.Error()}
	}
	if was == want {
		return BranchTaken{On: want, Says: "this tree already works on " + want}
	}
	// A DETACHED HEAD IS SOMEBODY'S BISECT OR SOMEBODY'S OLD CHECKOUT. Taking a
	// branch off it would strand what they are doing.
	if was == "HEAD" {
		return BranchTaken{Says: "this tree is on no branch, so " + want + " was not taken"}
	}
	// THE BRANCH IS MADE ONCE AND TAKEN AFTERWARDS. A tree that has worked this
	// group before carries it, and -b on an existing branch is an error rather
	// than a checkout, so which of the two runs is answered by asking for the ref.
	args := []string{"checkout", "--quiet", want}
	if _, err := gitHere(r, "rev-parse", "--verify", "--quiet", "refs/heads/"+want); err != nil {
		args = []string{"checkout", "--quiet", "-b", want}
	}
	if _, err := gitHere(r, args...); err != nil {
		return BranchTaken{On: was, Says: want + " was not taken: " + err.Error()}
	}
	return BranchTaken{On: want, Was: was, Moved: true,
		Says: "this tree works on " + want + ", off " + was +
			", so the queue is now narrowed to " + theGroupFilter(bucket)}
}

// theFilterNotice says what the queue is narrowed by, on every pull that is
// narrowed by anything.
//
// A SMALL QUEUE WITH NO REASON READS AS AN EMPTY TREE. On a cloud box nobody
// set the filter and no panel draws it, so a box handed two tokens out of two
// hundred has nothing to tell it why. It says the branch did it, by name, so
// the reader can check the branch rather than believe the box.
func theFilterNotice(r Roots) string {
	said, from := theFilterInForce(r)
	if said == "" {
		return ""
	}
	return "\n\nTHE QUEUE IS NARROWED TO " + said + ", and " + from + "."
}

// theFilterInForce answers the expression the queue is narrowed by, and who
// narrowed it. An empty expression is the whole queue.
//
// WHERE IT CAME FROM IS PART OF THE ANSWER. A box handed nothing has to be able
// to say why its queue is small, and a person who set nothing has to be able to
// see that the branch did.
func theFilterInForce(r Roots) (said, from string) {
	if v, err := LoadValues(r); err == nil {
		typed, _ := v.Value["work.queue_filter"].(string)
		if strings.TrimSpace(typed) != "" {
			return typed, "a person set it"
		}
	}
	if group := theGroupOnTheBranch(r); group != "" {
		return theGroupFilter(group), "the branch " + aGroupBranch + group + " carries it"
	}
	return "", ""
}
