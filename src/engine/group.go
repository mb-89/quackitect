package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"quackitect/engine/internal/sessionlog"
	"sort"
	"strings"
	"sync"
	"time"
)

// A GROUP A CLOUD BOX TAKES ON ITS OWN.
//
// A group branch lies in the cloud ready to work. A scheduler wakes, finds one
// nobody holds and nobody has finished, and starts a box on it. The box works
// the whole group and then says so, and a retro merges what is done.
//
// THE READER HAS NO ENGINE, AND THAT DECIDES THE SHAPE. The scheduler runs
// before any box exists. It has no engine, no index and no clone, so the state
// cannot be derived from the record. It is a file plain git reads cold.
//
// IT RIDES THE CLAIMS REF, which is the one namespace a cloud box may push. See
// claimsBranch in claim.go for why that is a branch and not a ref of its own.

// groupsFile is the one file a reader with no engine opens.
const groupsFile = "groups.json"

// The three states an entry may be in. Anything else is a file this build
// cannot read, and it is left alone rather than guessed at.
const (
	GroupHeld    = "held"
	GroupDone    = "done"
	GroupBlocked = "blocked"
)

// GroupEntry is one group, as the file carries it.
//
// lapses IS AN ABSOLUTE TIMESTAMP AND NEVER A DURATION. A reader with no engine
// cannot apply a configured number of hours, so the writer resolves it.
//
// done AND blocked CARRY NO lapses. A lease expires and a finished thing does
// not become unfinished, so the field is left out rather than written empty.
type GroupEntry struct {
	State  string `json:"state"`
	By     string `json:"by,omitempty"`
	At     string `json:"at,omitempty"`
	Lapses string `json:"lapses,omitempty"`
	Why    string `json:"why,omitempty"`
}

// TheGroups is the whole file, keyed by the branch name without refs/heads.
//
// NO ENTRY MEANS FREE. Absence is the default, so nothing has to be written to
// make a group workable and a new branch is workable the moment it exists.
type TheGroups map[string]GroupEntry

// aGroupName answers the key a group is filed under. A person types voice and a
// scheduler reads refs/heads/group/voice, and both mean one group.
func aGroupName(said string) string {
	name := strings.TrimSpace(said)
	name = strings.TrimPrefix(name, "refs/heads/")
	name = strings.TrimPrefix(name, "refs/remotes/origin/")
	name = strings.TrimPrefix(name, "origin/")
	if name == "" {
		return ""
	}
	if !strings.HasPrefix(name, aGroupBranch) {
		name = aGroupBranch + name
	}
	return name
}

// theBucketOfAGroup answers the bucket a group branch stands for.
func theBucketOfAGroup(name string) string {
	return strings.TrimPrefix(name, aGroupBranch)
}

// theGroupLease is how long a group is held for.
//
// THERE IS ONE NUMBER AND NOT TWO. Three hours of silence frees a group, which
// is the same stretch that frees a token claim, so limits.claim_hours says both.
func theGroupLease(r Roots) time.Duration {
	return time.Duration(LoadConfig(r).ClaimHours) * time.Hour
}

// theGroupIsLive answers whether a held entry still stands at this moment.
//
// A CLOCK RUNNING FAST CANNOT HOLD A GROUP FOR EVER. A stamp further ahead than
// one whole lease plus ordinary skew is not honoured at all, which is the answer
// lapsed already gives a token claim it cannot believe.
func theGroupIsLive(r Roots, e GroupEntry, now time.Time) bool {
	if e.State != GroupHeld {
		return false
	}
	ends, err := time.Parse(ClaimStamp, e.Lapses)
	if err != nil {
		return false // a hold that cannot end is no hold at all
	}
	if ends.After(now.Add(theGroupLease(r) + claimSkew)) {
		return false
	}
	return now.Before(ends)
}

// readGroupsIn answers the groups a commit on the claims ref carries.
//
// A COMMIT WITH NO SUCH FILE IS EVERY GROUP FREE, which is the first rule of
// chapter 3 read straight off git. A file that will not parse answers the same,
// because a reader with no engine would make nothing of it either.
func readGroupsIn(ctx context.Context, r Roots, head string) TheGroups {
	out := TheGroups{}
	if head == "" {
		return out
	}
	text, err := gitIn(ctx, r, "", "show", head+":"+groupsFile)
	if err != nil || strings.TrimSpace(text) == "" {
		return out
	}
	if json.Unmarshal([]byte(text), &out) != nil {
		return TheGroups{}
	}
	return out
}

// theGroupsText is the file as it goes to git: sorted keys, two spaces, and a
// newline at the end, so a person reading a diff of it reads one line changing.
func theGroupsText(g TheGroups) string {
	b, err := json.MarshalIndent(g, "", "  ")
	if err != nil {
		return "{}\n"
	}
	return string(b) + "\n"
}

func sortedGroupNames(g TheGroups) []string {
	out := make([]string, 0, len(g))
	for name := range g {
		out = append(out, name)
	}
	sort.Strings(out)
	return out
}

// theGroupsEverybodySees answers the file as the other boxes can read it.
//
// THE REMOTE IS THE AUTHORITY, because a claim is only real once every box can
// see it. The local ref answers where the remote carries no file yet, which is
// the state of a repository nobody has published a group into.
func theGroupsEverybodySees(ctx context.Context, r Roots) TheGroups {
	for _, ref := range []string{remoteClaimsRef, claimsRef} {
		head, err := gitIn(ctx, r, "", "rev-parse", "--verify", "--quiet", ref)
		if err != nil || head == "" {
			continue
		}
		if got := readGroupsIn(ctx, r, head); len(got) > 0 {
			return got
		}
	}
	return TheGroups{}
}

// TheGroupThisBoxHolds names the group this box has written itself against, and
// nothing where it holds none. It reads this box's own ref, because that is what
// this box last wrote whether or not the push landed.
func TheGroupThisBoxHolds(ctx context.Context, r Roots, now time.Time) (string, GroupEntry) {
	head, err := gitIn(ctx, r, "", "rev-parse", "--verify", "--quiet", claimsRef)
	if err != nil || head == "" {
		return "", GroupEntry{}
	}
	mine := Box(r)
	here := readGroupsIn(ctx, r, head)
	for _, name := range sortedGroupNames(here) {
		e := here[name]
		if e.By == mine && theGroupIsLive(r, e, now) {
			return name, e
		}
	}
	return "", GroupEntry{}
}

// whoElseHolds names the box holding this group, where it is not this one.
func whoElseHolds(r Roots, have TheGroups, name string, now time.Time) string {
	e, ok := have[name]
	if !ok || e.By == "" || e.By == Box(r) {
		return ""
	}
	if e.State == GroupHeld && !theGroupIsLive(r, e, now) {
		return "" // a lease that ran out holds nobody off
	}
	return e.By
}

// whyTheGroupIsNotWorkable names what stops a box taking this group, or nothing.
//
// A GROUP IS WORKABLE WHEN ITS ENTRY IS ABSENT OR LAPSED. That is a date
// comparison, and it is the whole of what a scheduler has to understand.
func whyTheGroupIsNotWorkable(r Roots, have TheGroups, name string, now time.Time) string {
	e, ok := have[name]
	if !ok {
		return ""
	}
	switch e.State {
	case GroupDone:
		return name + " is finished, and a finished group does not become unfinished. " +
			"Ask for another: se group --next"
	case GroupBlocked:
		return name + " is blocked: " + orElse(e.Why, "no reason was written") +
			". A person settles that before a box takes it"
	}
	if by := whoElseHolds(r, have, name, now); by != "" {
		return name + " is held by " + by + " until " + e.Lapses +
			". Ask for another group: se group --next"
	}
	return ""
}

// GroupChange is one entry a publish writes into the file.
//
// IT CARRIES THE INSTANT THAT DECIDED IT. The workability check and the write
// ask the same question — does another box hold this — and they used to ask it
// of two different clocks: the caller's now on the read, and time.Now() inside
// the write. Both answers are right about their own instant and they disagree
// about the lease, so a caller that moved time was told the group was free and
// then refused it as another box's.
//
// A zero value means the write may take its own instant, which is what a caller
// with no opinion wants.
type GroupChange struct {
	Name  string
	Entry GroupEntry
	Now   time.Time
}

// groupLost is what a write answers when the file already names another box.
type groupLost struct{ name, by string }

func (e *groupLost) Error() string {
	return e.name + " is held by " + e.by + ", which is another box"
}

// applyTheGroupChange writes one entry over what the parent commit held.
//
// THE PUSH IS THE ARBITER AND THIS IS THE READ BEHIND IT. Two boxes racing are
// two writes to one ref, and the loser reads the winner's file here before it
// writes again. Without this the loser would put its own entry over the
// winner's, and both boxes would work one branch.
func applyTheGroupChange(r Roots, have TheGroups, change *GroupChange, now time.Time) error {
	if change == nil {
		return nil
	}
	if by := whoElseHolds(r, have, change.Name, now); by != "" {
		return &groupLost{name: change.Name, by: by}
	}
	have[change.Name] = change.Entry
	return nil
}

// GroupResult is what one call of se group came to.
type GroupResult struct {
	Group     string     `json:"group,omitempty"`
	State     string     `json:"state,omitempty"`
	By        string     `json:"by,omitempty"`
	Lapses    string     `json:"lapses,omitempty"`
	Why       string     `json:"why,omitempty"`
	Published *Published `json:"published,omitempty"`
	Refused   string     `json:"refused,omitempty"`
	Notice    string     `json:"notice,omitempty"`
}

// ClaimTheGroup takes a group for this box and publishes that.
//
// THE PICK IS A HINT AND THE CLAIM IS THE DECISION. A scheduler read a snapshot,
// so between reading it and starting a box another box may have taken the group.
// The push settles it, because a push is already a compare and swap.
func ClaimTheGroup(ctx context.Context, r Roots, said string, now time.Time) GroupResult {
	name := aGroupName(said)
	if name == "" {
		return GroupResult{Refused: "name the group to take: se group --claim group/voice"}
	}
	// ONE FETCH OF ONE REF, so a box that has just started can ask at once.
	_ = fetchTheRemoteClaims(ctx, r, "") // a box with no network still writes here, and the answer says the push did not run
	if why := whyTheGroupIsNotWorkable(r, theGroupsEverybodySees(ctx, r), name, now); why != "" {
		return GroupResult{Group: name, Refused: why}
	}
	entry := GroupEntry{State: GroupHeld, By: Box(r),
		Lapses: now.Add(theGroupLease(r)).UTC().Format(ClaimStamp)}
	res := GroupResult{Group: name, State: GroupHeld, By: entry.By, Lapses: entry.Lapses}
	p := PublishTheGroup(ctx, r, &GroupChange{Name: name, Entry: entry, Now: now}, entry.By+" took "+name)
	res.Published = &p
	if !p.Pushed {
		res.Refused = "the hold on " + name + " reached no other box: " + p.Says
		if p.Lost != "" {
			res.Refused = name + " went to " + p.Lost + " while this box was writing. " +
				"Ask for another group: se group --next"
		}
		sayTheGroupHere(r, GroupHere{})
		return res
	}
	sayTheGroupHere(r, GroupHere{Name: name, By: entry.By, Lapses: entry.Lapses})
	res.Notice = name + " is this box's until " + entry.Lapses +
		". It is renewed while you keep calling the engine, and freed by silence."
	return res
}

// FinishTheGroup writes done, and refuses while the bucket still holds work.
//
// A GROUP WITH AN OPEN TOKEN IN IT IS NOT DONE. The retro merges a done group
// and prunes its entry, so saying done early loses the rest of the group behind
// a state that never expires.
func FinishTheGroup(ctx context.Context, r Roots, said string, now time.Time) GroupResult {
	name := aGroupName(said)
	if name == "" {
		return GroupResult{Refused: "name the group that is done: se group --done group/voice"}
	}
	if open := theBucketHolds(r, theBucketOfAGroup(name)); open > 0 {
		return GroupResult{Group: name, Refused: fmt.Sprintf(
			"%s still holds %d open token(s), so it is not done. Close them, or say what "+
				"stopped you: se group --blocked %s --why \"...\"", name, open, name)}
	}
	entry := GroupEntry{State: GroupDone, By: Box(r), At: now.UTC().Format(ClaimStamp)}
	return theGroupWrite(ctx, r, name, entry, "finished", now)
}

// BlockTheGroup writes blocked with the reason a person will read.
//
// IT IS THE MIRROR OF THE REFUSAL AT BRANCH CREATION. An agent reaching
// something only a person can settle marks that token, pushes, and blocks the
// group with the reason. Those are one rule from both ends.
func BlockTheGroup(ctx context.Context, r Roots, said, why string, now time.Time) GroupResult {
	name := aGroupName(said)
	if name == "" {
		return GroupResult{Refused: "name the group that is blocked: se group --blocked group/voice --why \"...\""}
	}
	if strings.TrimSpace(why) == "" {
		return GroupResult{Group: name, Refused: "say what stopped you: se group --blocked " +
			name + " --why \"a token needs a person\""}
	}
	entry := GroupEntry{State: GroupBlocked, By: Box(r), Why: strings.TrimSpace(why)}
	res := theGroupWrite(ctx, r, name, entry, "blocked", now)
	res.Why = entry.Why
	return res
}

// theGroupWrite is the half done and blocked share: write the entry, publish it,
// and say what reached the other boxes.
// The instant comes from the caller for the reason on GroupChange: the read
// that decided the group was workable and the write that takes it must ask one
// clock. There is a package-level now() in token.go, so an unnamed one here is
// a function rather than a time, which the compiler said out loud.
func theGroupWrite(ctx context.Context, r Roots, name string, entry GroupEntry, verb string, now time.Time) GroupResult {
	res := GroupResult{Group: name, State: entry.State, By: entry.By}
	p := PublishTheGroup(ctx, r, &GroupChange{Name: name, Entry: entry, Now: now}, entry.By+" "+verb+" "+name)
	res.Published = &p
	if !p.Pushed {
		res.Refused = name + " was written here and reached no other box: " + p.Says
		if p.Lost != "" {
			res.Refused = name + " is held by " + p.Lost + " now, so this box does not speak for it"
		}
		return res
	}
	// THE GROUP IS OFF THIS BOX'S HANDS, so the register says it holds none.
	sayTheGroupHere(r, GroupHere{})
	res.Notice = name + " is " + entry.State + " on " + claimsBranch + ", and the retro brings it in"
	return res
}

// TheNextGroup answers one group a box could take now, and nothing when there is
// none.
//
// IT IS A SET DIFFERENCE AND A DATE COMPARISON, and that is the whole of it. A
// group is workable when it has a branch and its entry is absent or lapsed.
//
// NOTHING HERE READS A TOKEN OR BUILDS AN INDEX. A box asks this the moment its
// engine starts, so it is a listing of branch names and one fetch of one ref.
func TheNextGroup(ctx context.Context, r Roots, now time.Time) (string, string) {
	branches := theGroupBranches(ctx, r)
	if len(branches) == 0 {
		return "", "no branch under refs/heads/" + aGroupBranch +
			" reached this box, so there is no cloud group to work"
	}
	_ = fetchTheRemoteClaims(ctx, r, "") // a box with no network answers off what it last saw
	have := theGroupsEverybodySees(ctx, r)
	for _, name := range branches {
		if whyTheGroupIsNotWorkable(r, have, name, now) == "" {
			return name, ""
		}
	}
	return "", "every group with a branch is held, finished or blocked, so there is nothing to take"
}

// theGroupBranches lists the branches under refs/heads/group/, in order.
//
// THE REMOTE IS ASKED FIRST, because a branch another box pushed is one this box
// has never fetched. ls-remote names refs/heads/group/<bucket> exactly, which is
// the name a scheduler with no clone reads.
//
// AND WHAT IS ALREADY HERE ANSWERS WHEN THE NETWORK DOES NOT. A box with no
// remote still works the group branches on its own disk.
func theGroupBranches(ctx context.Context, r Roots) []string {
	under := "refs/heads/" + aGroupBranch
	found := map[string]bool{}
	if listed, err := gitIn(ctx, r, "", "ls-remote", "--heads", "origin", under+"*"); err == nil {
		for _, line := range strings.Split(listed, "\n") {
			f := strings.Fields(line)
			if len(f) == 2 && strings.HasPrefix(f[1], under) {
				found[strings.TrimPrefix(f[1], "refs/heads/")] = true
			}
		}
	}
	if len(found) == 0 {
		if listed, err := gitIn(ctx, r, "", "for-each-ref", "--format=%(refname)",
			under, "refs/remotes/origin/"+aGroupBranch); err == nil {
			for _, line := range strings.Fields(listed) {
				if name := aGroupName(line); strings.HasPrefix(name, aGroupBranch) && name != aGroupBranch {
					found[name] = true
				}
			}
		}
	}
	out := make([]string, 0, len(found))
	for name := range found {
		out = append(out, name)
	}
	sort.Strings(out)
	return out
}

// ---- what this box holds, where a verb can read it ----

// GroupHere is what this box holds, written where a verb reads it without
// touching git.
//
// THE LOSING CHECK CANNOT COST A GIT CALL PER VERB. Reading the two refs is tens
// of milliseconds and every call an agent makes would pay it. The watch already
// fetches on its own clock, so it writes what it found and a verb reads a file.
type GroupHere struct {
	Name   string `json:"name,omitempty"`
	By     string `json:"by,omitempty"`
	Lapses string `json:"lapses,omitempty"`
	Lost   string `json:"lost,omitempty"` // the box holding it now, where this one lost it
}

func groupHerePath(r Roots) string { return r.Runtime("group.json") }

func LoadGroupHere(r Roots) GroupHere {
	var g GroupHere
	b, err := os.ReadFile(groupHerePath(r))
	if err != nil || json.Unmarshal(b, &g) != nil {
		return GroupHere{} // a register that will not read is a box holding no group
	}
	return g
}

func sayTheGroupHere(r Roots, g GroupHere) {
	if err := os.MkdirAll(r.Runtime(), 0o755); err != nil {
		return
	}
	b, err := json.MarshalIndent(g, "", "  ")
	if err != nil {
		return
	}
	_ = writeAtomic(groupHerePath(r), append(b, '\n'), 0o644) // a register it cannot write is one the watch writes again
}

// WhyTheGroupIsLost names the group this box was working and the box that holds
// it now, or nothing.
//
// LOSING TELLS YOU. Where the entry names somebody else the old holder stops at
// its next call. Without that it carries on pushing into a branch another box
// owns, which is the state the lock exists to prevent.
func WhyTheGroupIsLost(r Roots) string {
	g := LoadGroupHere(r)
	if g.Lost == "" || g.Name == "" {
		return ""
	}
	return g.Name + " is held by " + g.Lost + " now, and this box was working it. " +
		"Stop here and ask for another group: se group --next"
}

// ---- the watchdog, and the agent that feeds it ----

// THE AGENT FEEDS THE WATCHDOG, NOT THE ENGINE.
//
// An engine alive with no agent beside it would hold a group for as long as the
// process ran, and an idle box would own a branch all day. So the engine renews
// only when it has heard from the agent inside this window.
//
// NOTHING RECORDED WHEN THE ENGINE LAST HEARD FROM AN AGENT. The record carries
// a line for some calls and not for all of them, and gone.go reads it for a
// window of minutes rather than seconds. So it is marked at the verb door, where
// every call an agent makes arrives. See runVerbInside in client.go.
const agentSpokeWithin = 30 * time.Second

var theAgentWasHeard struct {
	sync.Mutex
	at time.Time
}

// AnAgentSpoke marks the moment a call from an agent reached the engine.
func AnAgentSpoke(now time.Time) {
	theAgentWasHeard.Lock()
	defer theAgentWasHeard.Unlock()
	if now.After(theAgentWasHeard.at) {
		theAgentWasHeard.at = now
	}
}

// AnAgentSpokeRecently answers whether the engine heard from an agent inside the
// window. A process nobody has spoken to has heard nothing, and answers no.
func AnAgentSpokeRecently(now time.Time) bool {
	theAgentWasHeard.Lock()
	defer theAgentWasHeard.Unlock()
	if theAgentWasHeard.at.IsZero() {
		return false
	}
	return now.Sub(theAgentWasHeard.at) <= agentSpokeWithin
}

// theRenewal remembers what has been said about renewal, so one failure is
// reported once rather than on every look.
var theRenewal struct {
	sync.Mutex
	warned bool
}

// TimeToRenew answers whether a held group should be renewed now.
//
// BOTH THINGS HAVE TO HOLD. The agent has spoken inside the window, and the
// lease is more than half spent. The first stops an idle box holding a group for
// ever. The second makes this a push about every ninety minutes rather than one
// on every beat.
//
// THERE IS NO CAP AND NO GRACE. A box that keeps working keeps the group, and
// three hours of silence is the whole of the grace.
func TimeToRenew(r Roots, e GroupEntry, now time.Time) bool {
	if !AnAgentSpokeRecently(now) {
		return false
	}
	ends, err := time.Parse(ClaimStamp, e.Lapses)
	if err != nil {
		return false
	}
	return !now.Before(ends.Add(-theGroupLease(r) / 2))
}

// theGroupThisBoxIsWorking answers the group this box took, whether or not the
// lease it took it under has run out.
//
// THE REGISTER IS WHAT THIS BOX BELIEVES, AND BELIEVING A STALE THING IS THE
// CASE THIS EXISTS FOR. A box whose renewals all failed still has a checkout on
// that branch and still means to push to it. Reading only a live lease would
// leave it working a group it can no longer be told it lost.
//
// THE REF ANSWERS FOR AN ENGINE THAT RESTARTED, because the register is one of
// this box's own runtime files and the ref is what it published.
func theGroupThisBoxIsWorking(ctx context.Context, r Roots, now time.Time) (string, GroupEntry) {
	if g := LoadGroupHere(r); g.Name != "" && g.By == Box(r) {
		return g.Name, GroupEntry{State: GroupHeld, By: g.By, Lapses: g.Lapses}
	}
	return TheGroupThisBoxHolds(ctx, r, now)
}

// RenewTheGroup keeps this box's group while an agent is working, and notices
// when another box has taken it.
func RenewTheGroup(ctx context.Context, r Roots, log *sessionlog.Log, now time.Time) {
	name, entry := theGroupThisBoxIsWorking(ctx, r, now)
	if name == "" {
		sayTheGroupHere(r, GroupHere{})
		return
	}
	// LOSING TELLS YOU, AND IT IS ASKED FIRST. The fetch that reads it has already
	// happened, and a box that lost the branch has to be told before anything else
	// is decided about it.
	if by := whoElseHolds(r, theGroupsEverybodySees(ctx, r), name, now); by != "" {
		sayTheGroupHere(r, GroupHere{Name: name, By: Box(r), Lapses: entry.Lapses, Lost: by})
		return
	}
	// AND THERE IS NO GRACE AFTER THE LEASE. A hold that ran out is not this box's
	// any more, so the register stops saying it is.
	if !theGroupIsLive(r, entry, now) {
		sayTheGroupHere(r, GroupHere{})
		return
	}
	sayTheGroupHere(r, GroupHere{Name: name, By: Box(r), Lapses: entry.Lapses})
	if !TimeToRenew(r, entry, now) {
		return
	}
	next := entry
	next.Lapses = now.Add(theGroupLease(r)).UTC().Format(ClaimStamp)
	p := PublishTheGroup(ctx, r, &GroupChange{Name: name, Entry: next, Now: now}, Box(r)+" renewed "+name)
	if p.Pushed {
		sayTheGroupHere(r, GroupHere{Name: name, By: Box(r), Lapses: next.Lapses})
	}
	sayTheRenewal(log, name, entry.Lapses, p)
}

// sayTheRenewal writes the one warning there is: a renewal that failed.
//
// NOTHING IS SAID WHILE RENEWAL WORKS, because there is nothing to act on. A
// push refused or a network gone is the only way a working box drifts toward
// lapsing, and it is the only warning it can act on.
//
// AND IT IS SAID ONCE PER STRETCH. The lease stays more than half spent from
// here to the end of it, so an unguarded warning would be written on every look.
func sayTheRenewal(log *sessionlog.Log, name, lapses string, p Published) {
	theRenewal.Lock()
	defer theRenewal.Unlock()
	if p.Pushed {
		theRenewal.warned = false
		return
	}
	if theRenewal.warned {
		return
	}
	theRenewal.warned = true
	record(log, "engine", "group", "engine",
		"the hold on "+name+" was not renewed, so it lapses at "+lapses+" and another box may take it",
		sessionlog.No(), map[string]any{"group": name, "lapses": lapses, "says": p.Says})
}
