package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"quackitect/engine/internal/frontmatter"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"time"
)

// OTHER BOXES' CLAIMS REACH THIS ONE WITHOUT ANYBODY TYPING A GIT COMMAND.
//
// THE OWNER'S ASK: every time an agent makes a claim it lands in git, and every
// time an agent pulls, the claims in git are checked and worked in. The person
// never uses git for it. Half a second is fine; longer is not.
//
// MEASURED, ON THIS TREE: a fetch over the network is 1.2 seconds, reading one
// note out of a ref already fetched is 45 milliseconds, and asking which notes
// changed between two refs is 52 milliseconds. So the fetch cannot sit on the
// pull path and the reading can.
//
// SO THE FETCH IS THE ENGINE'S AND THE READING IS THE PULL'S. The engine is
// resident and already beats, so it fetches on its own clock and writes what it
// found under .se. A pull reads that file. Nothing on the pull path touches the
// network, and a box that is offline pulls at full speed off whatever it last
// saw.
//
// NOTHING IS MERGED, AND NOTHING LANDS ON THE DISC. A claim is read out of the
// fetched ref with git show. The working tree is never touched, so uncommitted
// work is never at risk and a conflict is impossible: this is a read.
//
// AND ONLY THE CLAIMS REF IS FETCHED. Asking for the branch would bring every
// commit on it down, and the owner's ruling is that only claims travel. See
// claimsRef in claim.go: the ref is what marks a commit as a claim, so which
// commits are claims is answered by where they are.

// FarClaim is one claim another box published.
type FarClaim struct {
	By string `json:"by"`
	At string `json:"at"`
}

// TheFarClaims is what the last fetch saw, by token id, with when it was taken.
type TheFarClaims struct {
	Looked string              `json:"looked"`         // when this box last managed a fetch
	Ref    string              `json:"ref,omitempty"`  // the commit the claims were read from
	Says   string              `json:"says,omitempty"` // why the last look found nothing, when it did not
	Claims map[string]FarClaim `json:"claims"`
}

func farClaimsPath(r Roots) string { return r.Private("claims.json") }

// ClaimFromElsewhere answers what another box published about this token.
func ClaimFromElsewhere(r Roots, id string) (FarClaim, bool) {
	all := loadFarClaims(r)
	c, ok := all.Claims[id]
	return c, ok && c.By != ""
}

func loadFarClaims(r Roots) TheFarClaims {
	out := TheFarClaims{Claims: map[string]FarClaim{}}
	b, err := os.ReadFile(farClaimsPath(r))
	if err != nil {
		return out
	}
	_ = json.Unmarshal(b, &out) // a store that will not read is nobody having claimed anything
	if out.Claims == nil {
		out.Claims = map[string]FarClaim{}
	}
	return out
}

// SyncClaims fetches the branch this tree is on and reads every claim off it.
// It answers what it wrote down, and it never touches the working tree.
//
// IT IS NEVER FATAL. A box with no remote, no network or no permission goes on
// working with the claims it has, and the answer says why it saw nothing new.
func SyncClaims(ctx context.Context, r Roots) TheFarClaims {
	out := loadFarClaims(r)
	out.Looked = time.Now().UTC().Format(ClaimStamp)
	// ONLY THE CLAIMS REF IS FETCHED, so nothing else can arrive. A fetch of the
	// branch would bring every commit on it into .git, and a later mistake could
	// put those on the disc. This asks for one ref and gets one ref.
	if err := fetchTheRemoteClaims(ctx, r, ""); err != nil {
		out.Says = "no claims reached this box, so these are the ones from before: " + err.Error()
		saveFarClaims(r, out)
		return out
	}
	head, err := gitIn(ctx, r, "", "rev-parse", "--verify", "--quiet", remoteClaimsRef)
	if err != nil || head == "" {
		out.Says = "no box has published a claim yet"
		saveFarClaims(r, out)
		return out
	}
	if head == out.Ref {
		out.Says = "" // nothing new, and the claims already here stand
		saveFarClaims(r, out)
		return out
	}
	found, err := readClaimsIn(ctx, r, head)
	// WHAT DID READ STANDS, AND WHAT DID NOT IS SAID. A read that answers
	// nothing at all leaves the claims from before, because a ref this box
	// cannot read is not a ref saying nobody has claimed anything.
	if err != nil && len(found) == 0 {
		out.Says = "the claims could not be read: " + err.Error()
		saveFarClaims(r, out)
		return out
	}
	out.Claims, out.Ref, out.Says = found, head, ""
	if err != nil {
		out.Says = "some of the claims would not read, and the rest stand: " + err.Error()
	}
	saveFarClaims(r, out)
	return out
}

// readClaimsIn answers the claims a commit on the ref holds.
//
// THE REF CARRIES ONE FILE, one line per live claim, and this reads it with one
// git show. It carried the whole note of every token ever claimed, and this
// listed the tree and showed each note to parse two frontmatter fields, which
// at tens of thousands of tokens is tens of thousands of entries on every read.
//
// A COMMIT WITH NO SUCH FILE IS THE OLD SHAPE, and it is read the old way,
// once: the tree is listed and each note parsed for claimed_by and claimed_at.
// The next write folds what was read into the file, so a box holding claims
// written the old way is migrated by its own first claim, and nobody types
// anything.
//
// AND A FILE THAT IS THERE IS THE FILE, whatever one of its lines says. It
// answers the claims it could read, with an error naming the lines it could
// not, so a caller keeps what is live and can still say the file is damaged.
// One bad line used to send the read to the old shape, which lists a tree
// holding no notes and answers an empty set with no error: every box then read
// the ref as nobody having claimed anything.
func readClaimsIn(ctx context.Context, r Roots, head string) (map[string]FarClaim, error) {
	if text, err := gitIn(ctx, r, "", "show", head+":"+claimsFile); err == nil {
		found, bad := parseClaimLines(text)
		if bad > 0 {
			return found, fmt.Errorf("%d line(s) of %s would not read, and %d claim(s) were kept",
				bad, claimsFile, len(found))
		}
		return found, nil
	}
	found := map[string]FarClaim{}
	listed, err := gitIn(ctx, r, "", "ls-tree", "-r", "--name-only", head)
	if err != nil {
		return found, err
	}
	for _, path := range strings.Fields(listed) {
		if !strings.HasSuffix(path, ".md") {
			continue
		}
		text, err := gitIn(ctx, r, "", "show", head+":"+path)
		if err != nil {
			continue // a file the ref does not carry any more
		}
		front, _ := frontmatter.Split(text)
		f, err := frontmatter.Parse(front)
		if err != nil {
			continue // a note this build cannot read is not a claim it can honour
		}
		by := frontmatter.Str(f, "claimed_by")
		if by == "" {
			continue
		}
		id := strings.TrimSuffix(path[strings.LastIndex(path, "/")+1:], ".md")
		found[id] = FarClaim{By: by, At: frontmatter.Str(f, "claimed_at")}
	}
	return found, nil
}

// parseClaimLines reads the claims file: one claim per line, the id, the
// claimant and the stamp. It answers the claims it could read, and how many
// lines it could not.
//
// A LINE THAT WILL NOT READ TAKES ONLY ITSELF. It used to answer nothing for
// the whole file, and one line then cost every live claim on the ref.
func parseClaimLines(text string) (map[string]FarClaim, int) {
	out := map[string]FarClaim{}
	bad := 0
	for _, line := range strings.Split(text, "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		f := strings.Fields(line)
		if len(f) != 3 {
			bad++
			continue
		}
		out[f[0]] = FarClaim{By: f[1], At: f[2]}
	}
	return out, bad
}

func saveFarClaims(r Roots, all TheFarClaims) {
	if b, err := json.MarshalIndent(all, "", "  "); err == nil {
		_ = writeAtomic(farClaimsPath(r), b, 0o644) // a look it cannot write is a look taken again
	}
}

// WatchForClaims keeps the store in step on the engine's own clock, until the
// engine stops. It is the resident engine's job because it is the one process
// that lives long enough to have a clock. The context is the engine's, and
// its end is the watch's end, fetch in flight included.
func WatchForClaims(ctx context.Context, r Roots, log *sessionlog.Log) {
	every := LoadConfig(r).ClaimSyncSeconds
	if every <= 0 {
		return // turned off
	}
	tick := time.NewTicker(time.Duration(every) * time.Second)
	defer tick.Stop()
	was := ""
	for {
		// THE FIRST LOOK IS AT ONCE, so an engine that has just started knows
		// what the other boxes took while it was down.
		got := SyncClaims(ctx, r)
		if got.Ref != "" && got.Ref != was {
			was = got.Ref
			log.Write("engine", "claim", "engine", "the claims other boxes published were read", sessionlog.Yes(),
				map[string]any{"claims": len(got.Claims), "ref": got.Ref})
		}
		select {
		case <-ctx.Done():
			return
		case <-tick.C:
		}
	}
}
