package main

import (
	"context"
	"fmt"
	"os"
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

func (f *fedGit) run(ctx context.Context, r Roots, index string, args ...string) (string, error) {
	// THE FAKE ANSWERS THE CONTEXT THE WAY THE REAL GIT DOES. exec refuses to
	// start a process for a context that is already done, so a fake that ran
	// anyway let a caller thread no context at all and still pass every claim
	// test that comes through this seam. The call is refused before it is
	// recorded, because a call the real git never started never happened.
	if err := ctx.Err(); err != nil {
		return "", err
	}
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

	got := Publish(t.Context(), r, []string{"doc/work/wk-1.md"}, "a claim")
	if !got.Committed || !got.Pushed {
		t.Fatalf("the claim did not publish: %+v", got)
	}

	// IT WROTE THE REF AND PUSHED THAT REF, and nothing else.
	if !fed.asked("update-ref", claimsRef) {
		t.Error("the claim was not written to the claims ref")
	}
	if !fed.asked("push", "origin", claimsRef+":"+claimsBranch) {
		t.Error("the push did not carry the claims ref alone")
	}
	// AND NOTHING THAT REACHES THE WORKING TREE OR THE BRANCH.
	for _, forbidden := range []string{"commit -m", "checkout", "merge", "reset", "rebase", "pull", "stash"} {
		if fed.asked(forbidden) {
			t.Errorf("a claim ran %q, which reaches the branch or the working tree", forbidden)
		}
	}
	// AND NO NOTE WAS ADDED. The ref carries one file of claim lines, written
	// as a blob into a fresh index, so nothing from the tree is staged and a
	// sweep has nothing to sweep.
	if fed.carried("-A") || fed.carried(".") || fed.asked("add", "doc/work") {
		t.Error("the claim staged the tree's notes into the commit")
	}
	if !fed.asked("update-index", "--cacheinfo", claimsFile) {
		t.Error("the claim did not write the one claims file into the index")
	}
}

// A PUSH ANOTHER BOX WON IS READ AND WRITTEN AGAIN, NEVER REBASED.
func TestALostRaceReadsTheOtherBoxRatherThanRebasing(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	fed := aFedGit(t)
	fed.says["write-tree"] = "aaaa"
	fed.says["commit-tree"] = "bbbb"
	fed.fails["push"] = "rejected: the ref moved"

	got := Publish(t.Context(), r, []string{"doc/work/wk-1.md"}, "a claim")
	if got.Pushed {
		t.Fatal("a push that was refused twice reported as pushed")
	}
	if !fed.asked("fetch", claimsBranch) {
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

	got := SyncClaims(t.Context(), r)
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
	// A FETCH OF THE WORKING BRANCH WOULD BRING EVERY COMMIT ON IT DOWN. Two
	// ref names may be asked for and no others: the claims branch, and the old
	// ref behind it that a remote from before the branch still carries.
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
	gitRuns = func(ctx context.Context, r Roots, index string, args ...string) (string, error) {
		if args[0] == "push" {
			pushes++
			if pushes == 1 {
				return "", fmt.Errorf("git push: rejected: the ref moved")
			}
			return "", nil
		}
		return fed.run(ctx, r, index, args...)
	}
	t.Cleanup(func() { gitRuns = was })

	got := Publish(t.Context(), r, []string{"doc/work/wk-1.md"}, "a claim")
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

	got := SyncClaims(t.Context(), r)
	if got.Says != "" {
		t.Fatalf("a box with a claim of its own read nothing: %s", got.Says)
	}
	if len(got.Claims) != 1 || got.Claims["wk-far"].By != "0badc0de/worker-far" {
		t.Fatalf("the sync read %+v", got.Claims)
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

	got := SyncClaims(t.Context(), r)
	if !strings.Contains(got.Says, "non-fast-forward") {
		t.Errorf("the refusal does not carry git's reason: %q", got.Says)
	}
}

// A REF THIS BOX WROTE AND COULD NOT PUSH STILL HOLDS WHAT IT WROTE.
//
// Publish moves refs/se/claims to the remote's head when the push loses, and
// writes this call's claim again on top. What the local ref held that the
// remote does not is then gone: writeTheClaims carries forward the parent's
// claims, and the new parent is the remote's. On a box whose push is refused
// every time, that is every claim but the last.
//
// THE DAMAGE LANDS WHEN THE PUSH WORKS AGAIN. The other boxes are handed one
// claim where thirty are live, and take work this box is already on.
//
// A REF OF ITS OWN, FED BY HAND. The fake here is a ref and the blobs behind
// it, so what the second publish writes can be read back the way git would
// read it, rather than guessed from the calls.
type fedRef struct {
	t       *testing.T
	commits map[string]string // commit -> the claims file it carries
	staged  string            // the text staged for the next tree
	refs    map[string]string
	made    int
	last    string // the claims file most recently written
}

func (f *fedRef) run(_ context.Context, r Roots, index string, args ...string) (string, error) {
	switch args[0] {
	case "hash-object":
		b, err := os.ReadFile(args[len(args)-1])
		if err != nil {
			return "", err
		}
		f.made++
		blob := fmt.Sprintf("blob%d", f.made)
		f.commits[blob] = string(b)
		f.last = string(b)
		return blob, nil
	case "update-index":
		last := args[len(args)-1] // 100644,<blob>,<path>
		parts := strings.Split(last, ",")
		if len(parts) == 3 {
			f.staged = f.commits[parts[1]]
		}
		return "", nil
	case "write-tree":
		f.made++
		tree := fmt.Sprintf("tree%d", f.made)
		f.commits[tree] = f.staged
		return tree, nil
	case "commit-tree":
		f.made++
		commit := fmt.Sprintf("commit%d", f.made)
		f.commits[commit] = f.commits[args[1]]
		return commit, nil
	case "update-ref":
		f.refs[args[1]] = args[2]
		return "", nil
	case "rev-parse":
		return f.refs[args[len(args)-1]], nil
	case "show":
		at := args[1]
		if i := strings.Index(at, ":"); i >= 0 {
			at = at[:i]
		}
		// A REF NAMES A COMMIT, the way it does at a real prompt, so a reader
		// asking for refs/se/claims gets what the ref points at.
		if commit, ok := f.refs[at]; ok {
			at = commit
		}
		text, ok := f.commits[at]
		if !ok {
			return "", fmt.Errorf("git show: %s is not here", args[1])
		}
		return text, nil
	case "push":
		return "", fmt.Errorf("git push: rejected: this box may not write that ref")
	case "fetch":
		return "", nil
	}
	return "", nil
}

func TestAPushThatNeverLandsKeepsEveryClaimThisBoxWrote(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	// THE REMOTE HAS CLAIMS OF ITS OWN AND NONE OF THIS BOX'S, which is what
	// makes the move to its head a loss rather than a no-op.
	fed := &fedRef{t: t, commits: map[string]string{"cafe1234": ""},
		refs: map[string]string{remoteClaimsRef: "cafe1234"}}
	was := gitRuns
	gitRuns = fed.run
	t.Cleanup(func() { gitRuns = was })

	first := mintUnclaimed(t, r, "the first claim")
	second := mintUnclaimed(t, r, "the second claim")
	now := time.Now().UTC()
	for _, id := range []string{first.ID, second.ID} {
		if _, err := Claim(r, Claimant(r, "worker-one"), []string{id}, now); err != nil {
			t.Fatal(err)
		}
	}

	if got := Publish(t.Context(), r, []string{"doc/work/" + first.ID + ".md"}, "the first"); got.Pushed {
		t.Fatal("the push was meant to be refused, and this test is about what happens then")
	}
	if !strings.Contains(fed.last, first.ID) {
		t.Fatalf("the first claim never reached the ref: %q", fed.last)
	}
	Publish(t.Context(), r, []string{"doc/work/" + second.ID + ".md"}, "the second")

	for _, id := range []string{first.ID, second.ID} {
		if !strings.Contains(fed.last, id) {
			t.Errorf("the ref no longer holds %s, so a box whose push is refused publishes one claim "+
				"where two are live:\n%s", id, fed.last)
		}
	}
}
