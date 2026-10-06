// The changed door: the files a branch changes since it left trunk, and the
// ones it changes in the working tree. A clone with no trunk ref, as CI's
// checkout at depth one, reads HEAD's own commit in place of the branch.
// [[spec/tickets/changed-lint-without-merge-base]]
package main

import (
	"os/exec"
	"slices"
	"strings"

	"quackitect/src/modules/hooks/command"
)

// The folders the engine writes, where a hand fixes no warning. [[spec/tickets/rules-lint-changed-files-first]]
var engineWrites = []string{"spec/tickets/", "spec/retros/", ".se/"}

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

// The files the staging adds and the ones staged already, read through a dry run so nothing stages, past every deletion. [[spec/tickets/rules-lint-changed-files-first]]
func stagesTo(root string, addArgs, only []string) []string {
	var paths []string
	for _, line := range strings.Split(gitRun(root, append([]string{addArgs[0], "--dry-run"}, addArgs[1:]...)...).out, "\n") {
		if at, ok := strings.CutPrefix(line, "add '"); ok {
			paths = append(paths, strings.TrimSuffix(at, "'"))
		}
	}
	for _, line := range strings.Split(gitRun(root, append([]string{"diff", "--cached", "--name-only", "--diff-filter=d"}, only...)...).out, "\n") {
		if line != "" {
			paths = append(paths, line)
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
		said, err := exec.Command("git", append([]string{"-C", root}, args...)...).Output()
		return string(said), err == nil
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
	read("diff", "--name-only", "--diff-filter=d", "HEAD")
	read("ls-files", "--others", "--exclude-standard")
	slices.Sort(paths)
	return slices.Compact(paths)
}
