// The changed door reads the files since the merge base with trunk and the
// working tree, and a clone with no trunk ref reads HEAD's own commit.
// [[spec/tickets/changed-lint-without-merge-base]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"reflect"
	"strings"
	"testing"
)

// A git answering each argument line it holds, and failing every other. [[spec/tickets/changed-lint-without-merge-base]]
func gitHolding(answers map[string]string) gitAnswers {
	return func(args ...string) (string, bool) {
		said, ok := answers[strings.Join(args, " ")]
		return said, ok
	}
}

// The working tree's changes and the new files, which both roads read. [[spec/tickets/changed-lint-without-merge-base]]
var workingTree = map[string]string{
	"diff --name-only --diff-filter=d HEAD": "src/b.go\nspec/a.md\n",
	"ls-files --others --exclude-standard":  "spec/new.md\n",
}

func TestChangedOver(t *testing.T) {
	t.Parallel()
	t.Run("a merge base reads the branch's files and the working tree's, once each and sorted", func(t *testing.T) {
		answers := map[string]string{
			"merge-base origin/main HEAD":                  "abc123\n",
			"diff --name-only --diff-filter=d abc123 HEAD": "spec/a.md\nsrc/c.go\n",
		}
		for args, said := range workingTree {
			answers[args] = said
		}
		var lines []string
		got := changedOver(gitHolding(answers), func(line string) { lines = append(lines, line) })
		if want := []string{"spec/a.md", "spec/new.md", "src/b.go", "src/c.go"}; !reflect.DeepEqual(got, want) || len(lines) != 0 {
			t.Fatalf("the door reads %v and says %v, and wants %v and no line", got, lines, want)
		}
	})
	t.Run("a merge in progress reads the working tree against MERGE_HEAD in place of HEAD", func(t *testing.T) {
		answers := map[string]string{
			"merge-base origin/main HEAD":                  "abc123\n",
			"diff --name-only --diff-filter=d abc123 HEAD": "src/c.go\n",
			"rev-parse -q --verify MERGE_HEAD":             "def456\n",
			"diff --name-only --diff-filter=d MERGE_HEAD":  "src/c.go\nsrc/resolved.go\n",
			"diff --name-only --diff-filter=d HEAD":        "src/trunk.go\nsrc/resolved.go\n",
			"ls-files --others --exclude-standard":         "",
		}
		got := changedOver(gitHolding(answers), func(string) {})
		if want := []string{"src/c.go", "src/resolved.go"}; !reflect.DeepEqual(got, want) {
			t.Fatalf("the door reads %v, and wants %v with trunk's own file left out", got, want)
		}
	})
	t.Run("a clone with no trunk ref reads HEAD's own commit and the working tree, and says so", func(t *testing.T) {
		answers := map[string]string{
			"diff-tree --no-commit-id --name-only -r --root --diff-filter=d HEAD": "src/c.go\n",
		}
		for args, said := range workingTree {
			answers[args] = said
		}
		var lines []string
		got := changedOver(gitHolding(answers), func(line string) { lines = append(lines, line) })
		if want := []string{"spec/a.md", "spec/new.md", "src/b.go", "src/c.go"}; !reflect.DeepEqual(got, want) {
			t.Fatalf("the door reads %v, and wants %v", got, want)
		}
		if len(lines) != 1 || !strings.Contains(lines[0], "origin/main") || !strings.Contains(lines[0], "HEAD") {
			t.Fatalf("the door says %v, and wants one line naming origin/main and HEAD", lines)
		}
	})
}
