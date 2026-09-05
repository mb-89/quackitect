package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"quackitect/engine/internal/quiet"
	"strings"
	"sync"
	"time"
)

// THE CLAIM. A block of work one agent has taken, and every other agent leaves
// it alone until the claim lapses.
//
// A HOLD IS NOT A CLAIM. A hold says who is working a token right now, it is
// this tree's own business, and holdstore.go keeps it under .se where a hold
// can be dropped when the agent holding it is gone. A claim says which agent on
// which box has taken a block of work, and that has to reach a box which is not
// this one. So a claim travels in version control.
//
// IT LIVES ON THE TOKEN AND NEVER IN A LEDGER. Two claimants taking different
// tokens touch different files, and git merges them without a word. Two
// claimants taking the same token touch the same file, and git raises a
// conflict. That conflict is the collision report, and git is the arbiter. One
// ledger file would make every claim conflict with every other claim.
//
// A CLAIM THAT WAS NEVER PUT DOWN IS WHY THE HOLDER LEFT THE TOKEN. A name
// written into a file that nothing reopens is a name that stays forever. So a
// claim carries when it was made, the engine reads the limit, and a claim older
// than the limit is no claim at all. Nothing has to come back to end it.

// WHEN IT WAS CLAIMED, AND NEVER UNTIL WHEN.
//
// The token says the fact and the engine says what follows from it. Writing the
// lapse would freeze the limit at the moment of the claim: moving
// limits.claim_hours would then leave every standing claim on the old number,
// and two tokens claimed a minute apart could disagree about how long a claim
// lasts.
//
// A TOKEN CARRIES NO OTHER TIME. The record holds when things happened, and it
// never travels. This one travels because the box that wrote it may be gone,
// and its work has to come back to the pool without anybody deciding so.
const ClaimStamp = time.RFC3339

// BoxLength is how much of the hash names this installation.
const BoxLength = 8

// claimSkew is how far ahead of this box's clock another box's stamp may be and
// still be believed. Beyond it the stamp is not honoured at all.
const claimSkew = 5 * time.Minute

// Box is what makes this installation's claims its own.
//
// A NAME AN AGENT TYPED IS NOT AN IDENTITY. Two boxes running one clone of one
// repository both call their agent main. Both write main, both read main, and
// each walks through the other's claims believing they are its own. From inside
// either box the ledger looks right, so nothing would say so.
//
// So the box comes first and the engine works it out. THE AGENT NEVER SAYS
// WHICH BOX IT IS ON, because an agent that could name a box could name another
// one.
//
// THE BOX IS DERIVED AND NOT COPIED. It is a hash over this machine's own id
// and the method root. The machine id is private and never travels, only the
// hash does, and a hash does not run backwards. The method root is in the hash
// because one machine runs two instances out of two folders, and those are two
// boxes.
func Box(r Roots) string {
	theBox.Lock()
	defer theBox.Unlock()
	if was, ok := theBox.byRoot[r.Method]; ok {
		return was
	}
	got := workOutTheBox(r)
	theBox.byRoot[r.Method] = got
	return got
}

// ONE ANSWER PER PROCESS, PER TREE. The queue asks who is pulling on every
// hand-out, and working it out reads files and mints an installation identity
// where there is none. That put a write on the pull path, which is a read.
var theBox = struct {
	sync.Mutex
	byRoot map[string]string
}{byRoot: map[string]string{}}

func workOutTheBox(r Roots) string {
	h := sha256.New()
	for _, path := range []string{"/etc/machine-id", "/var/lib/dbus/machine-id"} {
		if b, err := os.ReadFile(path); err == nil {
			h.Write(bytes.TrimSpace(b))
			break
		}
	}
	// A MACHINE WITH NO ID OF ITS OWN STILL NEEDS ONE. Windows has no
	// machine-id file, so the name it answers to goes in, hashed like the rest,
	// and the copy identity carries the difference between two installations.
	if name, err := os.Hostname(); err == nil {
		h.Write([]byte(name))
	}
	if id, err := CopyID(r.Method); err == nil {
		h.Write([]byte(id))
	}
	h.Write([]byte(filepath.ToSlash(r.Method)))
	return hex.EncodeToString(h.Sum(nil))[:BoxLength]
}

// Claimant is what goes on the token: this box, then the agent that asked. An
// agent that names no actor is main, which is what every agent already pulls as.
func Claimant(r Roots, actor string) string {
	if actor = strings.TrimSpace(actor); actor == "" {
		actor = "main"
	}
	return Box(r) + "/" + actor
}

// ClaimedNow says which claimant holds this token, and empty when nobody does.
//
// IT READS THE OTHER BOXES TOO. A claim made here is on the note; a claim made
// elsewhere reached this box through git and sits in the sync's own store. Both
// are claims, and the queue has to pass over either. See claimsync.go.
func ClaimedNow(r Roots, t Token, now time.Time) string {
	if by, at := standingClaim(r, t); by != "" && !lapsed(r, at, now) {
		return by
	}
	return ""
}

// standingClaim answers the claim this box knows about, whichever side wrote
// it. The later stamp wins, because a claim made after another is the one that
// happened: a box that took a token this minute did so knowing what the note
// said last hour.
func standingClaim(r Roots, t Token) (by, at string) {
	by, at = t.ClaimedBy, t.ClaimedAt
	if far, ok := ClaimFromElsewhere(r, t.ID); ok && far.At > at {
		by, at = far.By, far.At
	}
	return by, at
}

func lapsed(r Roots, at string, now time.Time) bool {
	made, err := time.Parse(ClaimStamp, at)
	if err != nil {
		return true // a claim that cannot end is not a claim
	}
	// A STAMP IS UTC, SO TWO TIME ZONES ARE NOT A DISAGREEMENT. RFC3339 carries
	// the offset and Parse reads it, so a box in one zone and a box in another
	// write the same instant however each of them displays it.
	//
	// AND A CLOCK THAT IS WRONG CANNOT HOLD WORK LONGER THAN THE LIMIT.
	//
	// There is no shared clock to appeal to. Reading a future stamp as now looks
	// generous and is worse: every later read clamps it again, so a box running
	// a day fast would hold its tokens for ever. A stamp this box cannot believe
	// is one it does not honour, which is the same answer it already gives a
	// stamp it cannot read.
	//
	// A LITTLE SKEW IS ORDINARY. Two machines are never exactly together, so a
	// stamp a few minutes ahead is read as now rather than thrown away.
	if made.After(now.Add(claimSkew)) {
		return true
	}
	if made.After(now) {
		made = now
	}
	return !now.Before(made.Add(time.Duration(LoadConfig(r).ClaimHours) * time.Hour))
}

// DropClaim takes the claim off a token. It answers whether anything moved, so
// a caller writes the note only when there is something to write.
func DropClaim(t *Token) bool {
	if t.ClaimedBy == "" && t.ClaimedAt == "" {
		return false
	}
	t.ClaimedBy, t.ClaimedAt = "", ""
	return true
}

// ClaimRefused says why one token could not be claimed. It has the shape of a
// rejection for the same reason a rejection has it: the caller acts on it
// mechanically rather than reading prose.
type ClaimRefused struct {
	ID        string `json:"id"`
	Wrong     string `json:"wrong"`
	Satisfies string `json:"satisfies"`
}

// ClaimResult is what a claim or a release came to.
type ClaimResult struct {
	Claimant  string         `json:"claimant"`
	Taken     []string       `json:"taken,omitempty"`
	Freed     []string       `json:"freed,omitempty"`
	At        string         `json:"at,omitempty"`
	Lapses    string         `json:"lapses,omitempty"`
	Files     []string       `json:"-"`
	Refused   []ClaimRefused `json:"refused,omitempty"`
	Published *Published     `json:"published,omitempty"`
	Notice    string         `json:"notice,omitempty"`
}

// ClaimedHere says whether a claim belongs to this box, whichever agent on it
// wrote the claim.
//
// WHAT A CLAIM KEEPS OUT IS ANOTHER MACHINE. Two agents here already have the
// holder between them, so reading a claim as one agent's would hide work from
// the box that took it.
func ClaimedHere(r Roots, by string) bool {
	return by != "" && strings.HasPrefix(by, Box(r)+"/")
}

// NoClaimHere names why this box may not work this token, or nothing.
//
// CLAIMING WAS OPT-IN AND WORK WAS NOT. A box took a tracked token, worked it
// and closed it, with nothing in git saying so. Another box reading the tree
// saw an open token and took the same one.
//
// A LOCAL TOKEN IS EXEMPT. .se/work is not in git, so nothing else can see it
// or take it. A claim there would cost a call and buy nothing.
//
// THE CLAIM IS THE BOX'S AND NOT THE AGENT'S. What it keeps out is another
// machine. Two agents here already have the holder between them.
func NoClaimHere(r Roots, t Token, now time.Time) string {
	if filepath.Dir(noteAt(r, t.ID)) != TrackedDir(r) {
		return ""
	}
	by := ClaimedNow(r, t, now)
	if by == "" {
		return t.ID + " travels, and this box holds no claim on it. " +
			"Claim it and take it in one call: se claim --these " + t.ID + " --take"
	}
	if !ClaimedHere(r, by) {
		return t.ID + " is claimed by " + by + ", which is another box. " +
			"Take work nobody has claimed, or wait for that claim to lapse"
	}
	return ""
}

// WhyNotClaimable names what stops this claimant taking this token, or nothing.
func WhyNotClaimable(r Roots, t Token, claimant string, now time.Time) *ClaimRefused {
	if t.Ended() {
		return &ClaimRefused{ID: t.ID, Wrong: "it has ended: " + string(t.Disposition),
			Satisfies: "a token that is still open"}
	}
	if by := ClaimedNow(r, t, now); by != "" && by != claimant {
		return &ClaimRefused{ID: t.ID, Wrong: "it is claimed by " + by,
			Satisfies: "wait for that claim to lapse, or take a token nobody has claimed"}
	}
	return nil
}

// Claim takes the named tokens for a claimant. Every id is answered, in taken
// or in refused, so a caller never has to work out which of its ids landed.
func Claim(r Roots, claimant string, ids []string, now time.Time) (ClaimResult, error) {
	res := ClaimResult{Claimant: claimant, At: now.UTC().Format(ClaimStamp)}
	res.Lapses = now.Add(time.Duration(LoadConfig(r).ClaimHours) * time.Hour).UTC().Format(ClaimStamp)
	if len(ids) == 0 {
		return res, fmt.Errorf("a claim needs tokens: name them, or say how many to take")
	}
	for _, id := range ids {
		t, err := LoadToken(r, id)
		if err != nil {
			res.Refused = append(res.Refused, ClaimRefused{ID: id, Wrong: err.Error(),
				Satisfies: "an id the engine minted"})
			continue
		}
		if bad := WhyNotClaimable(r, t, claimant, now); bad != nil {
			res.Refused = append(res.Refused, *bad)
			continue
		}
		t.ClaimedBy, t.ClaimedAt = claimant, res.At
		if err := SaveToken(r, t); err != nil {
			res.Refused = append(res.Refused, ClaimRefused{ID: id, Wrong: err.Error(),
				Satisfies: "a writable work folder"})
			continue
		}
		res.Taken = append(res.Taken, t.ID)
		res.Files = append(res.Files, filepath.Join(dirFor(r, t), t.ID+".md"))
	}
	return res, nil
}

// Release gives tokens back. A claimant releases its own and nothing else:
// taking somebody's claim away is a person's act, at the note, rather than a
// verb an agent reaches for. Naming no id releases everything this claimant
// holds.
func Release(r Roots, claimant string, ids []string, now time.Time) (ClaimResult, error) {
	res := ClaimResult{Claimant: claimant}
	if len(ids) == 0 {
		for _, t := range Tokens(r) {
			if t.ClaimedBy == claimant {
				ids = append(ids, t.ID)
			}
		}
	}
	for _, id := range ids {
		t, err := LoadToken(r, id)
		if err != nil {
			res.Refused = append(res.Refused, ClaimRefused{ID: id, Wrong: err.Error(),
				Satisfies: "an id the engine minted"})
			continue
		}
		if t.ClaimedBy != claimant {
			res.Refused = append(res.Refused, ClaimRefused{ID: id,
				Wrong:     "it is not claimed by " + claimant,
				Satisfies: "release what you took"})
			continue
		}
		DropClaim(&t)
		if err := SaveToken(r, t); err != nil {
			res.Refused = append(res.Refused, ClaimRefused{ID: id, Wrong: err.Error(),
				Satisfies: "a writable work folder"})
			continue
		}
		res.Freed = append(res.Freed, t.ID)
		res.Files = append(res.Files, filepath.Join(dirFor(r, t), t.ID+".md"))
	}
	return res, nil
}

// Claimed is one row of what --list answers.
type Claimed struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Claimant  string `json:"claimant"`
	At        string `json:"at"`
	Lapsed    bool   `json:"lapsed"`
	Elsewhere bool   `json:"elsewhere,omitempty"` // it reached here through git
}

// Claims answers every claim this box knows about, its own and the ones that
// came from elsewhere. A lapsed one is shown rather than hidden: it is still on
// the note until the next hand takes the token, and a person reading the list
// wants to see that.
func Claims(r Roots, now time.Time) []Claimed {
	var out []Claimed
	for _, t := range Tokens(r) {
		by, at := standingClaim(r, t)
		if by == "" {
			continue
		}
		out = append(out, Claimed{ID: t.ID, Title: t.Title, Claimant: by, At: at,
			Lapsed: lapsed(r, at, now), Elsewhere: by != t.ClaimedBy})
	}
	return out
}

// PUBLISHING, WHICH IS WHAT MAKES A CLAIM REAL.
//
// A claim on this box is a claim nobody else can see. It reaches another box
// through git and through nothing else, so every claim tries to publish and
// none of them has to be asked to.
//
// IT GOES ON A REF OF ITS OWN, AND NEVER ON A BRANCH.
//
// THE OWNER'S RULING: only claims go onto git, and nothing uncontrolled comes
// back onto the disc. A commit on the working branch cannot hold that. It stages
// paths in the person's own index, it moves HEAD, and a rejected push wants a
// rebase, which drags every other commit on that branch into the working tree.
// That is the opposite of the ruling, and it was the first thing built here.
//
// So a claim is a commit under refs/se/claims, built from a temporary index the
// way snapshot.go builds one. The person's staging is untouched, HEAD does not
// move, no file on disc changes, and the push carries that one ref. There is
// nothing to rebase because there is no branch involved: two boxes racing are
// two writes to one ref, and the loser reads the winner's and writes again.
//
// THE REF IS THE MARKING. A claim commit is one under refs/se/claims and
// nothing else is, so "which commits are claims" is answered by where they are
// rather than by reading a message and hoping.
const claimsRef = "refs/se/claims"

// remoteClaimsRef is where the remote's claims land, and it is a ref of its own.
//
// A FETCH INTO THE LOCAL REF IS A FAST-FORWARD, AND THIS BOX IS AHEAD. Both
// readers fetched origin's claims straight over refs/se/claims, which git
// refuses the moment this box holds a claim it has not pushed, which is the
// state of every box that has just claimed anything. So the push's own recovery
// never ran, and a box that lost one race never published again; and the sync
// stopped reading other boxes the moment this one had a claim of its own, and
// said so with an empty reason, because --quiet had eaten git's.
//
// SO THE REMOTE GETS ITS OWN REF AND THE LOCAL ONE IS NEVER OVERWRITTEN BY A
// FETCH. It is forced, because this ref is a copy of the remote's and holds
// nothing of ours to lose. Where the two have to be joined, the claim is
// written again on top of the remote's head, which is what the ref is for.
// Measured on a cloud box: wk-c698d46866.
const remoteClaimsRef = "refs/se/remote-claims"

// claimsBranch is where claims live on the remote, and it is a branch because
// the sandbox allows nothing else.
//
// THE BRANCH IS FORCED, NOT CHOSEN. Measured on a cloud box in September 2026:
// a push to refs/se/*, refs/tags/* or refs/notes/* answers HTTP 403 from the
// session's git proxy, and a push to refs/heads/* is accepted. So a box in the
// sandbox could not publish a claim at all. Its claim stood on its own disc and
// reached nobody, while the queue on every other box went on offering the token,
// which is the one thing claims exist to prevent. Two boxes took the same token.
//
// THE OWNER RULED THE BRANCH KNOWING THE COST. A branch is listed, offered in a
// pull request, checked out by accident and merged by a tidy-up. Against that:
// the engine must publish a claim with nothing else present, no agent, no lane
// and no workflow, and this is the only design that holds. The branch is swept
// from time to time on purpose, and a claim lapses in three hours, so a stale
// one ages out rather than needing a delete a cloud box cannot make. Measured
// and decided on wk-4759d90994, from doc/spec/claims-relay-trial.md.
//
// ONLY THE FAR SIDE MOVED. Locally a claim is still refs/se/claims, off every
// branch listing, and the remote's copy still lands on refs/se/remote-claims.
const claimsBranch = "refs/heads/se/claims"

// theRemoteClaims is the fetch both readers make. It is one place so the two
// cannot drift into fetching different things, which is how one of them ended
// up overwriting the ref the other depended on.
//
// IT IS A LIST BECAUSE A REMOTE MAY STILL BE ON THE OLD REF. Every box that ran
// before the branch published onto refs/se/claims, and a reader that asked only
// for the branch would call those tokens nobody's and hand out work that is
// held. So the branch is asked for first and the old ref is the fallback. The
// old ref is read and never written, so once the branch exists it is never
// reached again.
func theRemoteClaims() [][]string {
	return [][]string{
		{"fetch", "origin", "+" + claimsBranch + ":" + remoteClaimsRef},
		{"fetch", "origin", "+" + claimsRef + ":" + remoteClaimsRef},
	}
}

// fetchTheRemoteClaims asks for them in order and stops at the first that
// answers. Where none does it answers the last reason, so what git said reaches
// the agent rather than an empty string.
func fetchTheRemoteClaims(r Roots, index string) error {
	var last error
	for _, args := range theRemoteClaims() {
		_, err := gitIn(r, index, args...)
		if err == nil {
			return nil
		}
		last = err
	}
	return last
}

// Published says what reached the other boxes.
type Published struct {
	Committed bool   `json:"committed"`
	Pushed    bool   `json:"pushed"`
	Rebased   bool   `json:"rebased,omitempty"` // it read another box's claims and wrote again
	Says      string `json:"says"`
}

// HOW THE ENGINE REACHES GIT, AND THE SEAM A TEST FEEDS BY HAND.
//
// The tree already does this for the filesystem watcher, for the same reason: a
// test that drives the real thing is a test of the real thing, and it is slow,
// it needs a remote, and it fails for reasons that are not the program's. So
// git is a variable. ONE TEST DRIVES THE REAL GIT and holds this contract; every
// other test feeds one and decides what it answers.
var gitRuns = realGit

// gitBudget is how long one git call may take. The network ones are the only
// ones that can hang, and a claim is never worth waiting on.
func gitBudget(args []string) time.Duration {
	for _, a := range args {
		if a == "fetch" || a == "push" {
			return 20 * time.Second
		}
	}
	return 30 * time.Second
}

// gitIn runs git over this tree with an index of its own, so nothing it does
// can reach the person's staging or their working tree.
func gitIn(r Roots, index string, args ...string) (string, error) {
	return gitRuns(r, index, args...)
}

func realGit(r Roots, index string, args ...string) (string, error) {
	// A NETWORK CALL GETS A CEILING, so a fetch to a host that never answers
	// cannot leave the engine's claim loop waiting for ever. Everything else is
	// local and answers in milliseconds.
	ctx, done := context.WithTimeout(context.Background(), gitBudget(args))
	defer done()
	cmd := quiet.Quietly(exec.CommandContext(ctx, "git", args...))
	cmd.Dir = r.Work
	cmd.Env = append(os.Environ(),
		"GIT_INDEX_FILE="+index,
		// The claim's author is the engine, so nothing depends on a name being
		// configured on the box.
		"GIT_AUTHOR_NAME=quackitect", "GIT_AUTHOR_EMAIL=engine@quackitect",
		"GIT_COMMITTER_NAME=quackitect", "GIT_COMMITTER_EMAIL=engine@quackitect",
		// A FETCH THAT ASKS FOR A PASSWORD WAITS FOR EVER, and this runs with
		// nobody at a terminal. It fails instead, and the answer says so.
		"GIT_TERMINAL_PROMPT=0")
	out, err := cmd.Output()
	if err != nil {
		if ee, ok := err.(*exec.ExitError); ok {
			return "", fmt.Errorf("git %s: %s", args[0], strings.TrimSpace(string(ee.Stderr)))
		}
		return "", fmt.Errorf("git %s: %w", args[0], err)
	}
	return strings.TrimSpace(string(out)), nil
}

// Publish writes the claim notes into refs/se/claims and pushes that ref.
func Publish(r Roots, files []string, message string) Published {
	var p Published
	if len(files) == 0 {
		p.Says = "nothing changed, so nothing was published"
		return p
	}
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		p.Says = "the claim stands here. There is nowhere to build the commit: " + err.Error()
		return p
	}
	// IT ENDS .tmp SO THE SWEEP KNOWS IT, the way the snapshot's index does.
	index, err := os.CreateTemp(r.Private(), "claim.*.index.tmp")
	if err != nil {
		p.Says = "the claim stands here. There is nowhere to build the commit: " + err.Error()
		return p
	}
	index.Close()
	// THE NAME IS KEPT AND THE FILE IS NOT. git refuses an index of no bytes
	// and makes one of its own where none is.
	os.Remove(index.Name())
	defer os.Remove(index.Name())

	if _, err := writeTheClaims(r, index.Name(), files, message); err != nil {
		p.Says = "the claim stands here. It could not be committed: " + err.Error()
		return p
	}
	p.Committed = true
	if _, err := gitIn(r, index.Name(), "push", "origin", claimsRef+":"+claimsBranch); err == nil {
		p.Pushed = true
		p.Says = "published on " + claimsBranch + ". Other boxes see this claim now"
		return p
	}
	// ANOTHER BOX WROTE THE REF FIRST. Read what it wrote and write again on
	// top of it. Nothing is rebased, because nothing is on a branch: this is
	// two writes to one ref and the second one reads the first.
	if err := fetchTheRemoteClaims(r, index.Name()); err != nil {
		p.Says = "published here, on " + claimsRef + ". The push did not run: " + err.Error()
		return p
	}
	// THE REMOTE'S HEAD BECOMES THE PARENT, and the claim is written again on
	// top of it. What the local ref held that the remote lacks comes across the
	// move, because writeTheClaims adds only the paths it is handed and the ref
	// is about to stop being where the rest lived.
	if head, err := gitIn(r, index.Name(), "rev-parse", "--verify", "--quiet", remoteClaimsRef); err == nil && head != "" {
		files = withTheNotesOnlyHereHolds(r, index.Name(), head, files)
		if _, err := gitIn(r, index.Name(), "update-ref", claimsRef, head); err != nil {
			p.Says = "published here. The other box's claims could not be taken up: " + err.Error()
			return p
		}
	}
	p.Rebased = true
	if _, err := writeTheClaims(r, index.Name(), files, message); err != nil {
		p.Says = "published here. Another box's claims were read and this one could not be written again: " + err.Error()
		return p
	}
	if _, err := gitIn(r, index.Name(), "push", "origin", claimsRef+":"+claimsBranch); err != nil {
		p.Says = "published here, on " + claimsRef + ". The push still did not run: " + err.Error()
		return p
	}
	p.Pushed = true
	p.Says = "published on " + claimsBranch + ", after reading another box's claims. Other boxes see this claim now"
	return p
}

// withTheNotesOnlyHereHolds adds the claim notes the local ref carries and the
// remote's head does not, so the move onto that head keeps them.
//
// A CLAIM THIS BOX HAS NOT PUSHED LIVES ON THE LOCAL REF AND NOWHERE ELSE. The
// recovery moves that ref to the remote's head, and writeTheClaims adds back
// only the paths this call was handed, so an earlier claim was dropped from the
// ref and never published. A box that claimed A, then B, then C published C
// alone, and held A and B where nobody could see them, which is the one thing
// claims exist to prevent. It was not a rare state: a box whose push is refused
// for a reason that is not a race takes this path on every claim after the
// first. Measured on a cloud box whose proxy answered HTTP 403 on every push.
//
// A PATH THE WORKING TREE NO LONGER HAS IS LEFT OUT, because git add would fail
// on it and take the whole claim down with it. A note that has been archived
// away is already off the ref by somebody's decision.
func withTheNotesOnlyHereHolds(r Roots, index, head string, files []string) []string {
	listed, err := gitIn(r, index, "diff", "--name-only", head, claimsRef)
	if err != nil || listed == "" {
		return files
	}
	have := map[string]bool{}
	for _, f := range files {
		have[f] = true
	}
	for _, path := range strings.Fields(listed) {
		if have[path] {
			continue
		}
		if _, err := os.Stat(filepath.Join(r.Work, filepath.FromSlash(path))); err != nil {
			continue
		}
		files = append(files, path)
		have[path] = true
	}
	return files
}

// writeTheClaims builds the next claims commit: whatever the ref already holds,
// with these notes written over it.
//
// THE TREE HOLDS CLAIM NOTES AND NOTHING ELSE. It is read from the ref rather
// than from HEAD, so a source file can never ride along however the working
// tree stands.
func writeTheClaims(r Roots, index string, files []string, message string) (string, error) {
	_ = os.Remove(index) // a fresh index per attempt, so a failed one leaves nothing behind
	parent, _ := gitIn(r, index, "rev-parse", "--verify", "--quiet", claimsRef)
	if parent != "" {
		if _, err := gitIn(r, index, "read-tree", parent); err != nil {
			return "", err
		}
	}
	// ONLY THE NOTES THIS CLAIM TOUCHED, BY PATH. A sweep would publish
	// whatever else the tree is holding, and this ref is claims or nothing.
	args := append([]string{"-c", "core.safecrlf=false", "add", "--"}, files...)
	if _, err := gitIn(r, index, args...); err != nil {
		return "", err
	}
	tree, err := gitIn(r, index, "write-tree")
	if err != nil {
		return "", err
	}
	made := []string{"commit-tree", tree, "-m", message}
	if parent != "" {
		made = append(made, "-p", parent)
	}
	hash, err := gitIn(r, index, made...)
	if err != nil {
		return "", err
	}
	if _, err := gitIn(r, index, "update-ref", claimsRef, hash); err != nil {
		return "", err
	}
	return hash, nil
}

// The message says what a person reading the history needs: which claimant,
// what it did, and to which tokens.
func ClaimMessage(claimant, verb string, ids []string) string {
	return fmt.Sprintf("%s %s %d token(s)\n\n  %s\n",
		claimant, verb, len(ids), strings.Join(ids, "\n  "))
}
