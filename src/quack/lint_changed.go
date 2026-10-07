// The changed door: the files a branch changes since it left trunk, and the
// ones it changes in the working tree. A clone with no trunk ref, as CI's
// checkout at depth one, reads HEAD's own commit in place of the branch.
// [[spec/tickets/changed-lint-without-merge-base]]
package main

import (
	"os"
	"path/filepath"
	"slices"
	"strings"

	"quackitect/src/modules/hooks/command"
	"quackitect/src/proc"
)

// The folders the engine writes, where a hand fixes no warning. [[spec/tickets/rules-lint-changed-files-first]]
var engineWrites = []string{"spec/tickets/", "spec/retros/", ".se/"}

// The ref a merge in progress names the commit it brings in by. [[spec/tickets/rules-lint-changed-files-first]]
const mergeHeadRef = "MERGE_HEAD"

// The paths a hand writes, past every folder the engine writes. [[spec/tickets/rules-lint-changed-files-first]]
func handWritten(paths []string) []string {
	out := []string{}
	for _, one := range paths {
		if !slices.ContainsFunc(engineWrites, func(folder string) bool { return strings.HasPrefix(one, folder) }) {
			out = append(out, one)
		}
	}
	return out
}

// The files the staging adds, under the paths named or all where none is, and the ones staged already, past every deletion, read off the git door so nothing stages. [[spec/tickets/rules-lint-changed-files-first]]
func (d landingDoors) stagesTo(adds, only []string) []string {
	var paths []string
	changed, _ := d.git.Status(true)
	staged, _ := d.git.Staged(only)
	merged, merging := d.git.Resolve(mergeHeadRef)
	for _, one := range append(changed, staged...) {
		named := len(adds) == 0 || slices.ContainsFunc(adds, func(at string) bool {
			return one.Path == at || strings.HasPrefix(one.Path, strings.TrimSuffix(at, "/")+"/")
		})
		if (named || slices.Contains(staged, one)) && standsUnder(d.root, one.Path) && !(merging && d.asMerged(merged, one.Path)) {
			paths = append(paths, one.Path)
		}
	}
	slices.Sort(paths)
	return slices.Compact(paths)
}

// A git run: what it prints, and whether it exits 0. [[spec/tickets/changed-lint-without-merge-base]]
type gitAnswers func(args ...string) (string, bool)

// Git under the root. [[spec/tickets/changed-lint-without-merge-base]]
func gitAt(root string) gitAnswers {
	return func(args ...string) (string, bool) {
		said := proc.Real(proc.Command{Argv: append([]string{"git"}, args...), Dir: root, Wait: gitReadSpan})
		return said.Out, said.Code == 0
	}
}

// A deleted file leaves nothing to read, so every road filters it out. [[spec/tickets/changed-lint-without-merge-base]]
func changedOver(git gitAnswers, say func(line string)) []string {
	var paths []string
	read := func(args ...string) {
		if said, ok := git(args...); ok {
			for _, line := range strings.Split(said, "\n") {
				if line != "" {
					paths = append(paths, line)
				}
			}
		}
	}
	if base, ok := git("merge-base", "origin/"+command.Trunk, "HEAD"); ok && strings.TrimSpace(base) != "" {
		read("diff", "--name-only", "--diff-filter=d", strings.TrimSpace(base), "HEAD")
	} else {
		say("No merge base with origin/" + command.Trunk + " stands here, so the changed files are HEAD's own commit's and the working tree's.")
		read("diff-tree", "--no-commit-id", "--name-only", "-r", "--root", "--diff-filter=d", "HEAD")
	}
	// A merge in progress stages trunk's own files, so the working tree reads against MERGE_HEAD, leaving the hand's files and the resolutions. [[spec/tickets/rules-lint-changed-files-first]]
	if _, merging := git("rev-parse", "-q", "--verify", mergeHeadRef); merging {
		read("diff", "--name-only", "--diff-filter=d", mergeHeadRef)
	} else {
		read("diff", "--name-only", "--diff-filter=d", "HEAD")
	}
	read("ls-files", "--others", "--exclude-standard")
	slices.Sort(paths)
	return slices.Compact(paths)
}

// Whether the file on disk reads as the merged commit holds it, so a merge's strict lint passes trunk's own files. [[spec/tickets/rules-lint-changed-files-first]]
func (d landingDoors) asMerged(merged, path string) bool {
	there, held := d.git.Show(merged, path)
	text, err := os.ReadFile(filepath.Join(d.root, filepath.FromSlash(path)))
	return held && err == nil && there == string(text)
}
