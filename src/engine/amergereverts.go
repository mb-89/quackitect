package main

import "strings"

// A MERGE RESOLVES, AND IT DOES NOT REVERT.
//
// A merge writes content matching neither parent all the time: that is what
// resolving a conflict looks like. It is a REVERT only where one side never
// moved the file. There was nothing to choose between, and the merge wrote a
// third thing anyway, so the work on the side that did move is gone.
//
// IT ANSWERS ONE MERGE. util/checks/a-merge-reverts-nothing walked every merge
// on HEAD instead, four git processes per touched file, carrying a hand-written
// ledger of two ruled shas. MEASURED: 176 merges, 1,324 seconds, 92 per cent of
// a whole battery run. Its input was whatever the repository happened to hold,
// so what it asserted changed whenever anybody merged, and it grew slower
// forever. The class is this function; the sweep was the instances.
func AMergeReverts(r Roots, merge string) []string {
	parents := strings.Fields(gitSaid(r, "rev-list", "--parents", "-n1", merge))
	if len(parents) != 3 {
		return nil // not an ordinary two-parent merge
	}
	a, b := parents[1], parents[2]
	base := strings.TrimSpace(gitSaid(r, "merge-base", a, b))
	if base == "" {
		return nil
	}

	touched := map[string]bool{}
	for _, p := range []string{a, b} {
		for _, f := range strings.Split(gitSaid(r, "diff", "--name-only", p, merge), "\n") {
			if f = strings.TrimSpace(f); f != "" {
				touched[f] = true
			}
		}
	}

	var reverts []string
	for f := range touched {
		mm, aa, bb, ba := blobIn(r, merge, f), blobIn(r, a, f), blobIn(r, b, f), blobIn(r, base, f)
		if mm == aa || mm == bb {
			continue // one side's content survived, so nothing was lost
		}
		if (aa == ba) != (bb == ba) {
			reverts = append(reverts, f) // only one side moved it, and neither is here
		}
	}
	return reverts
}

// gitSaid runs git and answers what it said, empty where it failed. A question
// git cannot answer is a file that is not there, which is a hash of its own.
func gitSaid(r Roots, args ...string) string {
	out, err := gitHere(r, args...)
	if err != nil {
		return ""
	}
	return out
}

// blobIn is the object a rev holds at a path, empty where it holds none.
func blobIn(r Roots, rev, path string) string {
	return strings.TrimSpace(gitSaid(r, "rev-parse", rev+":"+path))
}
