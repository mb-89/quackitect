// The pure reads behind the work verbs: the mark, the dependencies, what
// waits, the branches close reaches, and the paths the standing read names.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it drives the unexported standing marks: whyOf, waitingOn, changedIn and ownBranch

import (
	"regexp"
	"slices"
	"sort"
	"testing"
)

// The mark reads from the frontmatter, and a note carrying none reads unmarked. [[spec/tickets/work-verbs-port-to-go]]
func TestPAMarkReadsFromTheFront(t *testing.T) {
	t.Parallel()
	if !urgent("---\nstatus: todo\nurgent: true\n---\n") {
		t.Fatal("a marked note reads unmarked")
	}
	if urgent("---\nstatus: todo\nurgent: false\n---\n") || urgent("---\nstatus: todo\n---\n") {
		t.Fatal("an unmarked note reads marked")
	}
}

// A dependency reads as a list or on one line, with the prefix dropped. [[spec/tickets/work-verbs-port-to-go]]
func TestPADependencyReadsListOrLine(t *testing.T) {
	t.Parallel()
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
	t.Parallel()
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
	t.Parallel()
	ticket := "---\ndepends_on:\n  - open\n  - busy\n  - ready\n  - merged\n  - gone\n---\n"
	standing := map[string]string{"work/open": todo, "work/busy": held, "work/ready": done, "work/merged": merged}
	if said := waitingOn(ticket, standing, nil); !slices.Equal(said, []string{"open", "busy", "ready"}) {
		t.Fatalf("the waits read %q", said)
	}
}

// The mark orders a marked note over an unmarked one. [[spec/tickets/work-verbs-port-to-go]]
func TestPAMarkOrdersFirst(t *testing.T) {
	t.Parallel()
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
	t.Parallel()
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

// The standing read names each changed path, a move by the path it lands at. [[spec/tickets/work-verbs-port-to-go]]
func TestPAStandingNamesEachChangedPath(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{"spec/tickets/slow-lint.md": "slow\n", "old.md": "moving\n"})
	one.write(map[string]string{"spec/tickets/slow-lint.md": "slower\n", "spec/one two.md": "two\n", "new.md": "moving\n"})
	one.erase("old.md")
	one.must(one.repo.Add([]string{"old.md", "new.md"}))
	var names []string
	for _, each := range one.d.standingIn() {
		names = append(names, each.Name)
	}
	sort.Strings(names)
	if want := []string{"new.md", "spec/one two.md", "spec/tickets/slow-lint.md"}; !slices.Equal(names, want) {
		t.Fatalf("the standing names %v, and wants %v", names, want)
	}
}

// A ticket says the step it stands at, and one naming no step and carrying no mark says nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPAWhyReadsTheStep(t *testing.T) {
	t.Parallel()
	if said := whyOf(paChild("one-group", "open")); said != "do" {
		t.Fatalf("the child says %q", said)
	}
	stepless := regexp.MustCompile(`steps:[\s\S]*?\n---`).ReplaceAllString(paChild("one-group", "open"), "---")
	if said := whyOf(stepless); said != "" {
		t.Fatalf("a stepless child says %q", said)
	}
}
