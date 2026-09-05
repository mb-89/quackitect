package main

import (
	"context"
	"flag"
	"fmt"
	"strings"
	"time"
)

// ONE VERB PUTS THE TREE RIGHT, AND EVERY PART OF IT FAILS SOFT.
//
// WHY IT IS ONE VERB. The tidying was spread about: se archive --sweep did one
// job, a lapsed claim went until somebody noticed, and the snapshot refs a run
// leaves were swept by nobody. A list of jobs is a list somebody maintains, and
// the job nobody remembers is the one that rots.
//
// WHY EVERY PART FAILS SOFT. A cloud box cannot write what its git proxy
// refuses, and that is the ordinary case there rather than a fault. A part that
// took the caller down with it would mean a cloud box tidies nothing at all.
//
// WHY IT SAYS WHAT IT COULD NOT DO. A box that leaves a thing and says nothing
// leaves nobody knowing what is owed. Could and Why are what a desk reads to
// find the work a cloud box could not finish.

// TidyPart is one job the tidy does, and what it managed.
type TidyPart struct {
	Name  string `json:"name"`          // archive, claims or refs
	Did   int    `json:"did"`           // things it put right
	Could bool   `json:"could"`         // whether this box can do it
	Why   string `json:"why,omitempty"` // why it did no more
}

// aGitCall is how a part reaches git. A test hands one that refuses every call,
// because a refusal is the thing under test and no real remote can be made to
// answer 403 on demand.
type aGitCall func(args ...string) (string, error)

// runTidy is se tidy, which puts the tree right and says what it could not do.
func runTidy(c *call) int {
	fs := flag.NewFlagSet("tidy", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se tidy - archive what has closed, drop lapsed claims, sweep the refs a run left.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se tidy    do what this box can, and say what it could not")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "Every part fails soft, so a box that cannot do one part still does the rest.")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	if code, stop := c.parse(fs, "tidy"); stop {
		return code
	}
	c.answerJSON(map[string]any{"parts": Tidy(c.ctx, c.roots)})
	return 0
}

// Tidy runs every part and never answers an error.
func Tidy(ctx context.Context, r Roots) []TidyPart {
	return tidyWith(r, time.Now().UTC(), func(args ...string) (string, error) {
		return gitIn(ctx, r, "", args...)
	})
}

// tidyWith is Tidy with the clock and the git call handed in, which is how the
// tests drive a lapse and a refusal without waiting three hours for either.
func tidyWith(r Roots, now time.Time, git aGitCall) []TidyPart {
	return []TidyPart{tidyTheArchive(r), tidyTheClaims(r, now), tidyTheRefs(r, git)}
}

// tidyTheArchive folds every closed token into git. This is SweepClosed, which
// was already the right job behind the wrong door: a flag on se archive, which
// is a verb for reading the archive back.
//
// WHAT IT COUNTS IS ROWS THE ARCHIVE GAINED, NOT TOKENS SweepClosed WALKED.
//
// MEASURED, BY THE SECOND-RUN TEST ON THIS TOKEN. A closed local token stays on
// the disk until a retro reads it, on purpose, so it is archivable again every
// time and SweepClosed answers one swept on every run for ever. Counting its
// answer made a second tidy report work it had not done. The list only grows
// and holds one row per token, so its growth is what actually changed.
func tidyTheArchive(r Roots) TidyPart {
	before := howManyArchived(r)
	_, _, err := SweepClosed(r)
	part := TidyPart{Name: "archive", Did: howManyArchived(r) - before, Could: true}
	if err != nil {
		part.Could, part.Why = false, err.Error()
	}
	return part
}

// howManyArchived answers how many tokens the archive holds, or none where it
// cannot be read. A list that will not read is a sweep that reports nothing
// rather than a tidy that stops.
func howManyArchived(r Roots) int {
	rows, err := TheArchive(r)
	if err != nil {
		return 0
	}
	return len(rows)
}

// tidyTheClaims drops the claims that have lapsed.
//
// A LAPSED CLAIM IS ALREADY IGNORED, and that is exactly the problem. Every
// reader asks lapsed() again, so a stale claim stays in the frontmatter for
// ever and every list a person reads carries a holder who went home hours ago.
func tidyTheClaims(r Roots, now time.Time) TidyPart {
	part := TidyPart{Name: "claims", Could: true}
	for _, t := range Tokens(r) {
		if t.ClaimedBy == "" && t.ClaimedAt == "" {
			continue
		}
		if !lapsed(r, t.ClaimedAt, now) {
			continue
		}
		if !DropClaim(&t) {
			continue
		}
		if err := SaveToken(r, t); err != nil {
			// ONE TOKEN THAT WILL NOT SAVE IS NOT THE WHOLE PART. The rest are
			// still worth dropping, and the answer says the first thing that
			// went wrong rather than the last.
			if part.Why == "" {
				part.Why = err.Error()
			}
			continue
		}
		part.Did++
	}
	return part
}

// tidyTheRefs counts the snapshot refs no token names, and deletes none.
//
// A SNAPSHOT IS A TOKEN'S OWN began OR ended. One is written on every take-up
// and every put-down, so a busy day leaves hundreds and nothing removes one.
// Sweeping the unnamed ones is the obvious job and it is not safe yet.
//
// WHY IT DELETES NOTHING. An archived row carries id, title, process,
// disposition and the note's blobs. It carries neither began nor ended. So a
// closed token's snapshots are named by nothing this can read, and a sweep of
// the unnamed would take the objects a reviewer reads to see the change.
// Reviewers hit exactly that today, reporting a began..ended whose objects this
// box no longer holds. wk-e9df6b4eaa carries began and ended onto the row, and
// the sweep becomes decidable then.
//
// SO IT REPORTS, WHICH IS WHAT THE TOKEN ASKED FOR. A box that leaves a thing
// and says nothing leaves nobody knowing what is owed, and a count in Why is
// the smallest honest answer.
func tidyTheRefs(r Roots, git aGitCall) TidyPart {
	part := TidyPart{Name: "refs", Could: true}
	listed, err := git("for-each-ref", "--format=%(refname)", snapshotRefs)
	if err != nil {
		part.Could, part.Why = false, err.Error()
		return part
	}
	named := theSnapshotsTokensName(r)
	unnamed := 0
	for _, ref := range strings.Fields(listed) {
		if !strings.HasPrefix(ref, snapshotRefs) {
			continue
		}
		if !named[strings.TrimPrefix(ref, snapshotRefs)] {
			unnamed++
		}
	}
	if unnamed > 0 {
		part.Why = fmt.Sprintf("%d snapshot ref(s) are named by no open token, and none was deleted. "+
			"An archived row carries no began and no ended, so a closed token's steps "+
			"cannot be told from a step nothing needs. wk-e9df6b4eaa makes it decidable", unnamed)
	}
	return part
}

// theSnapshotsTokensName answers the snapshot names the open tokens still
// point at, by the short name the ref carries.
func theSnapshotsTokensName(r Roots) map[string]bool {
	out := map[string]bool{}
	for _, t := range Tokens(r) {
		for _, h := range append(append([]string{}, t.Began...), t.Finished...) {
			if len(h) >= 12 {
				out[h[:12]] = true
			}
			out[h] = true
		}
	}
	return out
}
