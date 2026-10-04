// The pure reads behind the work verbs, as test/level0/work.test.js holds
// them: the mark, the dependencies, what waits, the branches close reaches,
// and the path a status row names.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"regexp"
	"slices"
	"sort"
	"testing"
)

// The mark reads from the frontmatter, and a note carrying none reads unmarked. [[spec/tickets/work-verbs-port-to-go]]
func TestPAMarkReadsFromTheFront(t *testing.T) {
	if !urgent("---\nstatus: todo\nurgent: true\n---\n") {
		t.Fatal("a marked note reads unmarked")
	}
	if urgent("---\nstatus: todo\nurgent: false\n---\n") || urgent("---\nstatus: todo\n---\n") {
		t.Fatal("an unmarked note reads marked")
	}
}

// A dependency reads as a list or on one line, with the prefix dropped. [[spec/tickets/work-verbs-port-to-go]]
func TestPADependencyReadsListOrLine(t *testing.T) {
	if said := dependsOnText("---\ndepends_on:\n  - one\n  - work/two\n---\n"); !slices.Equal(said, []string{"one", "two"}) {
		t.Fatalf("the list reads %q", said)
	}
	if said := dependsOnText("---\ndepends_on: a, work/b\n---\n"); !slices.Equal(said, []string{"a", "b"}) {
		t.Fatalf("the line reads %q", said)
	}
	if said := dependsOnText("---\nstatus: todo\n---\n"); len(said) != 0 {
		t.Fatalf("no dependency reads %q", said)
	}
}

// A dependency in a flow list reads without its brackets or its quotes. [[spec/tickets/work-verbs-port-to-go]]
func TestPADependencyFlowList(t *testing.T) {
	cases := map[string][]string{
		"---\ndepends_on: [one, work/two]\n---\n":  {"one", "two"},
		"---\ndepends_on: [\"one\", 'two']\n---\n": {"one", "two"},
		"---\ndepends_on: []\n---\n":               {},
		"---\ndepends_on:\n  - \"one\"\n---\n":     {"one"},
	}
	for text, want := range cases {
		if said := dependsOnText(text); !slices.Equal(said, want) && !(len(said) == 0 && len(want) == 0) {
			t.Fatalf("%q reads %q", text, said)
		}
	}
}

// A branch waits for a dependency until trunk holds it. [[spec/tickets/work-verbs-port-to-go]]
func TestPAWaitsUntilTrunkHoldsIt(t *testing.T) {
	ticket := "---\ndepends_on:\n  - open\n  - busy\n  - ready\n  - merged\n  - gone\n---\n"
	standing := map[string]string{"work/open": todo, "work/busy": held, "work/ready": done, "work/merged": merged}
	if said := waitingOn(ticket, standing, nil); !slices.Equal(said, []string{"open", "busy", "ready"}) {
		t.Fatalf("the waits read %q", said)
	}
}

// The mark orders a marked note over an unmarked one. [[spec/tickets/work-verbs-port-to-go]]
func TestPAMarkOrdersFirst(t *testing.T) {
	marked := "---\nstatus: todo\nurgent: true\n---\n"
	bareNote := "---\nstatus: todo\n---\n"
	order := []string{bareNote, marked}
	sort.SliceStable(order, func(a, b int) bool { return urgent(order[a]) && !urgent(order[b]) })
	if !slices.Equal(order, []string{marked, bareNote}) {
		t.Fatalf("the order reads %q", order)
	}
}

// Close reaches a work branch and a branch the platform cut, and no other. [[spec/tickets/work-verbs-port-to-go]]
func TestPACloseReachesOwnBranches(t *testing.T) {
	for _, one := range []string{"work/fix-lsp", "claude/gracious-hawking-zepc6h"} {
		if !ownBranch.MatchString(one) {
			t.Fatalf("%s reads as no branch of ours", one)
		}
	}
	for _, one := range []string{"main", "v4", "se/claims"} {
		if ownBranch.MatchString(one) {
			t.Fatalf("%s reads as a branch of ours", one)
		}
	}
}

// A porcelain row names its file, with the status gone and a rename at its end. [[spec/tickets/work-verbs-port-to-go]]
func TestPAPorcelainRowNamesItsFile(t *testing.T) {
	cases := map[string]string{
		" M spec/tickets/slow-lint.md": "spec/tickets/slow-lint.md",
		"M spec/tickets/slow-lint.md":  "spec/tickets/slow-lint.md",
		"?? .se/tickets/slow-lint.md":  ".se/tickets/slow-lint.md",
		"R  old.md -> new.md":          "new.md",
		`A  "spec/one two.md"`:         "spec/one two.md",
	}
	for row, want := range cases {
		if said := changedIn(row); said != want {
			t.Fatalf("%q names %q", row, said)
		}
	}
}

// A ticket says the step it stands at, and one naming no step and carrying no mark says nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPAWhyReadsTheStep(t *testing.T) {
	if said := whyOf(paChild("one-group", "open")); said != "do" {
		t.Fatalf("the child says %q", said)
	}
	stepless := regexp.MustCompile(`steps:[\s\S]*?\n---`).ReplaceAllString(paChild("one-group", "open"), "---")
	if said := whyOf(stepless); said != "" {
		t.Fatalf("a stepless child says %q", said)
	}
}
