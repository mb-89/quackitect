package main

import (
	"fmt"
	"strings"
	"sync"
	"testing"
	"time"
)

func mustTime(t *testing.T, s string) time.Time {
	t.Helper()
	got, err := time.Parse(ClaimStamp, s)
	if err != nil {
		t.Fatal(err)
	}
	return got
}

// A FED GIT, SO A TEST OF OUR BEHAVIOUR IS NOT A TEST OF GIT'S.
//
// THE OWNER'S RULING: an external system is tested once, and everything else
// goes against a mock. A suite that drives the real git is slow, wants a remote,
// and goes red for reasons that are not the program's.
//
// The tree already does this for the filesystem watcher, and this is the same
// seam for the same reason: the test decides what git answers, so the behaviour
// under test is ours.
type fedGit struct {
	sync.Mutex
	ran    []string          // every call, as one line, in order
	args   [][]string        // and as its own arguments, for an exact question
	says   map[string]string // what a call answers, matched on a substring of it
	fails  map[string]string // what a call fails with, matched the same way
	failed int
}

func aFedGit(t *testing.T) *fedGit {
	t.Helper()
	fed := &fedGit{says: map[string]string{}, fails: map[string]string{}}
	was := gitRuns
	gitRuns = fed.run
	t.Cleanup(func() { gitRuns = was })
	return fed
}

func (f *fedGit) run(r Roots, index string, args ...string) (string, error) {
	f.Lock()
	defer f.Unlock()
	line := strings.Join(args, " ")
	f.ran = append(f.ran, line)
	f.args = append(f.args, append([]string(nil), args...))
	for want, why := range f.fails {
		if strings.Contains(line, want) {
			f.failed++
			return "", fmt.Errorf("%s", why)
		}
	}
	for want, said := range f.says {
		if strings.Contains(line, want) {
			return said, nil
		}
	}
	return "", nil
}

// asked answers whether any call carried all of these words.
func (f *fedGit) asked(words ...string) bool {
	f.Lock()
	defer f.Unlock()
	for _, line := range f.ran {
		all := true
		for _, w := range words {
			if !strings.Contains(line, w) {
				all = false
				break
			}
		}
		if all {
			return true
		}
	}
	return false
}

// carried answers whether any call had this exact argument. A substring match
// is no good for a word like ".", which is inside every path.
func (f *fedGit) carried(word string) bool {
	f.Lock()
	defer f.Unlock()
	for _, call := range f.args {
		for _, a := range call {
			if a == word {
				return true
			}
		}
	}
	return false
}

// A CLAIM GOES ONTO A REF OF ITS OWN, AND NOTHING ELSE GOES ANYWHERE.
//
// THE OWNER'S RULING: only claims go onto git, and nothing uncontrolled comes
// back onto the disc. A commit on the working branch cannot hold that: it stages
// paths in the person's index, moves HEAD, and a rejected push wants a rebase,
// which drags every other commit on that branch into the working tree. The first
// version of this did exactly that.
func TestAClaimTouchesNoBranchAndNoWorkingTree(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	fed := aFedGit(t)
	fed.says["write-tree"] = "aaaa"
	fed.says["commit-tree"] = "bbbb"

	got := Publish(r, []string{"doc/work/wk-1.md"}, "a claim")
	if !got.Committed || !got.Pushed {
		t.Fatalf("the claim did not publish: %+v", got)
	}

	// IT WROTE THE REF AND PUSHED THAT REF, and nothing else.
	if !fed.asked("update-ref", claimsRef) {
		t.Error("the claim was not written to the claims ref")
	}
	if !fed.asked("push", "origin", claimsRef+":"+claimsBranch) {
		t.Error("the push did not carry the claims ref alone, onto the branch a remote takes")
	}
	// AND NOTHING THAT REACHES THE WORKING TREE OR THE BRANCH.
	for _, forbidden := range []string{"commit -m", "checkout", "merge", "reset", "rebase", "pull", "stash"} {
		if fed.asked(forbidden) {
			t.Errorf("a claim ran %q, which reaches the branch or the working tree", forbidden)
		}
	}
	// AND ONLY THE NOTES IT WAS GIVEN WERE ADDED. A sweep would publish
	// whatever else the tree is holding.
	if fed.carried("-A") || fed.carried(".") {
		t.Error("the claim swept the tree into the commit")
	}
	if !fed.asked("add", "doc/work/wk-1.md") {
		t.Error("the claim did not add the note it was given")
	}
}

// A PUSH ANOTHER BOX WON IS READ AND WRITTEN AGAIN, NEVER REBASED.
func TestALostRaceReadsTheOtherBoxRatherThanRebasing(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	fed := aFedGit(t)
	fed.says["write-tree"] = "aaaa"
	fed.says["commit-tree"] = "bbbb"
	fed.fails["push"] = "rejected: the ref moved"

	got := Publish(r, []string{"doc/work/wk-1.md"}, "a claim")
	if got.Pushed {
		t.Fatal("a push that was refused twice reported as pushed")
	}
	if !fed.asked("fetch", claimsRef) {
		t.Error("the loser did not read what the winner wrote")
	}
	if fed.asked("rebase") || fed.asked("pull") {
		t.Error("a lost race rebased, which is what puts other commits on the disc")
	}
}

// THE SYNC ASKS FOR THE CLAIMS REF AND NOTHING ELSE, so no other commit can
// reach this box even into .git.
func TestTheSyncFetchesOnlyTheClaimsRef(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	fed := aFedGit(t)
	fed.says["rev-parse"] = "cafe1234"
	fed.says["ls-tree"] = "doc/work/wk-far.md"
	fed.says["show"] = "---\nkind: [[work-token]]\nclaimed_by: 0badc0de/worker-far\n" +
		"claimed_at: 2026-09-04T06:00:00Z\n---\n\n## detail\n\nsomething\n"

	got := SyncClaims(r)
	if got.Says != "" {
		t.Fatalf("the sync did not read the ref: %s", got.Says)
	}
	if len(got.Claims) != 1 || got.Claims["wk-far"].By != "0badc0de/worker-far" {
		t.Fatalf("the sync read %+v", got.Claims)
	}
	// THE REMOTE'S CLAIMS LAND ON A REF OF THEIR OWN, never over this box's. A
	// fetch into the local ref is a fast-forward, and a box holding an unpushed
	// claim is ahead of the remote, so git refuses it. See remoteClaimsRef.
	if !fed.asked("fetch", "+"+claimsBranch+":"+remoteClaimsRef) {
		t.Error("the sync did not ask for the claims branch by name, into a ref of the remote's own")
	}
	// A FETCH OF THE WORKING BRANCH WOULD BRING EVERY COMMIT ON IT DOWN. Two ref
	// names may be asked for and no others: the claims branch, and the old ref
	// behind it that a remote from before this change still carries.
	for _, line := range fed.ran {
		if !strings.HasPrefix(line, "fetch") {
			continue
		}
		if !strings.Contains(line, claimsBranch) && !strings.Contains(line, claimsRef) {
			t.Errorf("the sync fetched something that is not a claims ref: %q", line)
		}
	}
	for _, forbidden := range []string{"merge", "checkout", "reset", "pull", "rebase"} {
		if fed.asked(forbidden) {
			t.Errorf("the sync ran %q, which puts commits on the disc", forbidden)
		}
	}
}

// A CLOCK THAT IS WRONG CANNOT HOLD WORK LONGER THAN THE LIMIT, and two time
// zones are not a disagreement.
func TestAClaimIsReadTheSameInAnyTimeZoneAndOnAWrongClock(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	hours := LoadConfig(r).ClaimHours
	now := mustTime(t, "2026-09-04T12:00:00Z")

	// THE SAME INSTANT, WRITTEN IN THREE ZONES, IS ONE INSTANT.
	for _, at := range []string{
		"2026-09-04T11:00:00Z", "2026-09-04T13:00:00+02:00", "2026-09-04T06:00:00-05:00",
	} {
		if lapsed(r, at, now) {
			t.Errorf("a claim made an hour ago, written as %s, reads as lapsed", at)
		}
	}

	// A LITTLE SKEW IS ORDINARY, because two machines are never exactly
	// together, and a stamp a few minutes ahead is read as now.
	nearly := now.Add(claimSkew / 2)
	if lapsed(r, nearly.Format(ClaimStamp), now) {
		t.Error("a stamp a couple of minutes ahead was thrown away, so ordinary skew breaks a claim")
	}

	// A CLOCK RUNNING FAST CANNOT HOLD WORK FOR EVER. Reading a future stamp as
	// now looks generous and is worse: every later read would clamp it again.
	far := now.Add(48 * time.Hour)
	if !lapsed(r, far.Format(ClaimStamp), now) {
		t.Error("a claim stamped two days ahead was honoured, so a fast clock holds work for ever")
	}
	if !lapsed(r, far.Format(ClaimStamp), now.Add(time.Duration(hours+1)*time.Hour)) {
		t.Error("a claim from a fast clock outlived the limit as this box counts it")
	}
}

// A BOX THAT IS AHEAD OF THE REMOTE STILL PUBLISHES.
//
// Both readers fetched origin's claims straight over refs/se/claims. That is a
// fast-forward, and a box holding a claim it has not pushed is ahead, so git
// refuses it. Measured on a cloud box: the local ref held one commit the remote
// lacked, the fetch exited non-zero, and the push's own recovery never ran. A
// box that lost one race never published again.
//
// AND THE REFUSAL SAID NOTHING. The fetch carried --quiet, so git's reason was
// suppressed and the engine answered "The push did not run: " with an empty
// string after the colon, on every claim.
func TestPublishReachesItsSecondPushWhenThisBoxIsAhead(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	fed := aFedGit(t)
	fed.says["write-tree"] = "aaaa"
	fed.says["commit-tree"] = "bbbb"
	fed.says["rev-parse --verify --quiet "+remoteClaimsRef] = "cafe1234"
	// THE FIRST PUSH LOSES THE RACE AND THE SECOND WINS, which is the whole
	// path this test exists for. The fed answers a push by the ref it names, so
	// both are the same call and the count below is what tells them apart.
	pushes := 0
	was := gitRuns
	gitRuns = func(r Roots, index string, args ...string) (string, error) {
		if args[0] == "push" {
			pushes++
			if pushes == 1 {
				return "", fmt.Errorf("git push: rejected: the ref moved")
			}
			return "", nil
		}
		return fed.run(r, index, args...)
	}
	t.Cleanup(func() { gitRuns = was })

	got := Publish(r, []string{"doc/work/wk-1.md"}, "a claim")
	if !fed.asked("fetch", "+"+claimsBranch+":"+remoteClaimsRef) {
		t.Error("the loser fetched over its own ref, which git refuses while this box is ahead")
	}
	if fed.asked("fetch", "--quiet") {
		t.Error("the fetch is quiet, so a refusal reaches the agent with nothing after the colon")
	}
	if !got.Rebased {
		t.Errorf("the other box's claims were never taken up: %s", got.Says)
	}
	if !got.Pushed {
		t.Errorf("the second push never ran, so a box that lost one race never publishes again: %s", got.Says)
	}
	if pushes != 2 {
		t.Errorf("the push ran %d time(s), and losing a race then winning is two", pushes)
	}
}

// AND IT STILL READS THE OTHER BOXES.
//
// SyncClaims stopped the moment this box had one claim of its own, for the same
// fetch and with the same empty reason: "no claims reached this box, so these
// are the ones from before: ". A box that has claimed anything then never sees
// anybody else's claim, which is the one thing the ref is for.
func TestSyncClaimsReadsFarClaimsWhenThisBoxIsAhead(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	fed := aFedGit(t)
	// THE LOCAL REF IS AHEAD, so a fetch into it would be refused. Only a fetch
	// into the remote's own ref answers here, and the head below is read off
	// that ref rather than off this box's.
	fed.says["rev-parse --verify --quiet "+remoteClaimsRef] = "cafe1234"
	fed.says["ls-tree"] = "doc/work/wk-far.md"
	fed.says["show"] = "---\nkind: [[work-token]]\nclaimed_by: 0badc0de/worker-far\n" +
		"claimed_at: 2026-09-04T06:00:00Z\n---\n\n## detail\n\nsomething\n"

	got := SyncClaims(r)
	if got.Says != "" {
		t.Fatalf("a box with a claim of its own read nothing: %s", got.Says)
	}
	if len(got.Claims) != 1 || got.Claims["wk-far"].By != "0badc0de/worker-far" {
		t.Fatalf("the sync read %+v", got.Claims)
	}
	// AND NO FETCH WRITES OVER THE LOCAL REF, which is the update git refuses
	// while this box holds a claim the remote lacks.
	if fed.asked("fetch", claimsRef+":"+claimsRef) {
		t.Error("a fetch still writes over the local ref, so a box that is ahead reads nobody")
	}
}

// AND A FETCH GIT DOES REFUSE SAYS WHY.
//
// The reason is git's own and it reaches the agent, because the fetch no longer
// carries --quiet. An answer that ends at the colon tells nobody anything, and
// that is what every claim on that box got.
func TestARefusedFetchCarriesGitsReason(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	fed := aFedGit(t)
	fed.fails["fetch"] = "git fetch: ! [rejected] " + claimsRef + " (non-fast-forward)"

	got := SyncClaims(r)
	if !strings.Contains(got.Says, "non-fast-forward") {
		t.Errorf("the refusal does not carry git's reason: %q", got.Says)
	}
}
