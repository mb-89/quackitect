package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"quackitect/engine/internal/quiet"
	"strings"
)

// A CHANGE IS THE TREE BEFORE AND THE TREE AFTER, AS TWO HASHES.
//
// A list of files a token names is a list a person typed, and it goes stale
// the first time somebody touches a file beside it. What the tree looked like
// when the work was taken up, and what it looked like when the work closed,
// are facts git can hold, so the engine takes a snapshot at each and writes
// the two hashes on the token. The change is the diff between them, and a
// reviewer reads it the way a reviewer reads any diff.
//
// A SNAPSHOT IS A COMMIT NOBODY SEES. It is made from a temporary index over
// the whole working tree, ignored files left out, and parented on the branch
// as it stands. It goes under refs/se/steps, which no push carries and no log
// of the branch shows, so the person's history stays theirs: the commits they
// make are the commits there are. The refs keep the snapshots from being
// collected, and a retro may prune them.
//
// TWO AGENTS ON ONE TREE SHARE ONE TREE. A snapshot taken by one carries
// what the other had written by then. The owner accepted that: a hash pair
// that sometimes holds a neighbour's line beats a list of files that is
// wrong the day after.

// snapshotRefs is where the snapshots live, outside heads and tags.
const snapshotRefs = "refs/se/steps/"

// Snapshot answers the hash of the working tree as it stands, or nothing when
// the folder is not a repository. Nothing about the branch, the index or the
// person's own staging changes.
func Snapshot(r Roots, label string) (string, error) {
	if _, err := os.Stat(filepath.Join(r.Work, ".git")); err != nil {
		return "", nil // a folder with no history has no before and after to hold
	}
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return "", err
	}
	// A TEMPORARY INDEX, so the person's staging is untouched, and one per
	// snapshot, so two agents snapshotting at once do not share it.
	//
	// IT ENDS .tmp SO THE SWEEP KNOWS IT. The remove below is deferred, and a
	// process killed before it runs leaves the file in .se for ever. A swap kills
	// the engine on purpose, so that is the ordinary case. See atomic.go.
	index, err := os.CreateTemp(r.Private(), "snapshot.*.index.tmp")
	if err != nil {
		return "", err
	}
	index.Close()
	// THE NAME IS KEPT AND THE FILE IS NOT. git refuses an index file of no
	// bytes, and makes one of its own where none is.
	os.Remove(index.Name())
	defer os.Remove(index.Name())
	git := func(args ...string) (string, error) {
		cmd := quiet.Quietly(exec.Command("git", args...))
		cmd.Dir = r.Work
		cmd.Env = append(os.Environ(),
			"GIT_INDEX_FILE="+index.Name(),
			// The snapshot's author is the engine, so nothing depends on a
			// name being configured on the box.
			"GIT_AUTHOR_NAME=quackitect", "GIT_AUTHOR_EMAIL=engine@quackitect",
			"GIT_COMMITTER_NAME=quackitect", "GIT_COMMITTER_EMAIL=engine@quackitect")
		out, err := cmd.Output()
		if err != nil {
			if ee, ok := err.(*exec.ExitError); ok {
				return "", fmt.Errorf("git %s: %s", args[0], strings.TrimSpace(string(ee.Stderr)))
			}
			return "", fmt.Errorf("git %s: %w", args[0], err)
		}
		return strings.TrimSpace(string(out)), nil
	}
	// A FILE GIT CANNOT READ DOES NOT COST THE SNAPSHOT. A shell on Windows
	// that was told > nul leaves a file named nul, which is a device name
	// and reads as nothing, and git add stopped on it: "unable to index
	// file 'nul', fatal: adding files failed", and every take-up for an
	// afternoon had no began. --ignore-errors adds the rest and goes on.
	// safecrlf off keeps the line-ending warnings out of the record, which
	// is where they were landing, twenty per snapshot.
	if _, err := git("-c", "core.safecrlf=false", "add", "-A", "--ignore-errors", "--", "."); err != nil {
		return "", err
	}
	tree, err := git("write-tree")
	if err != nil {
		return "", err
	}
	args := []string{"commit-tree", tree, "-m", label}
	if parent, err := git("rev-parse", "--verify", "--quiet", "HEAD"); err == nil && parent != "" {
		args = append(args, "-p", parent)
	}
	hash, err := git(args...)
	if err != nil {
		return "", err
	}
	if _, err := git("update-ref", snapshotRefs+hash[:12], hash); err != nil {
		return "", err
	}
	return hash, nil
}

// EVERY PROCESS SNAPSHOTS INHERENTLY, and none says so. A token taken up or
// handed out opens a stretch with a snapshot into began; a token put down,
// closed or dropped ends the stretch with one into ended. The lists run in
// step, and a process file mentions none of it: the engine does it for
// every process there is, which is what lets a later stage read its own
// change as the earliest began against the latest ended.

// openStretch snapshots the tree into began, when no stretch is open.
func openStretch(r Roots, t Token) Token {
	if len(t.Began) == len(t.Finished) {
		t.Began = appendHash(t.Began, snapshotFor(r, t, "began"))
	}
	return t
}

// closeStretch snapshots the tree into ended, when a stretch is open.
func closeStretch(r Roots, t Token) Token {
	if len(t.Began) > len(t.Finished) {
		t.Finished = appendHash(t.Finished, snapshotFor(r, t, "ended"))
	}
	return t
}

// appendHash adds a snapshot to a list, and nothing when there was none:
// a folder with no history writes no hash, and an empty entry would put
// the two lists out of step.
func appendHash(list []string, hash string) []string {
	if hash == "" {
		return list
	}
	return append(list, hash)
}

// snapshotFor takes a snapshot for a token and answers the hash. A tree that
// cannot be snapshotted is said in the record and the work goes on, because
// the snapshot is evidence about the change and not a condition of it.
func snapshotFor(r Roots, t Token, when string) string {
	hash, err := Snapshot(r, t.ID+" "+when)
	if err != nil {
		inSession(r, "work", orElse(t.Holder, "engine"), t.ID+": no snapshot "+when+": "+err.Error(), No(),
			map[string]any{"id": t.ID, "when": when})
		return ""
	}
	return hash
}
