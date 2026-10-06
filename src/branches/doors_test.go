// The disk doors: the names in a folder, the files under one, and a link.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it drives the unexported file doors: filesUnder, link, unlink, readFile and names

import (
	"path/filepath"
	"slices"
	"testing"
)

// A folder names its files in name order and leaves its folders out, and a walk names every file under it. [[spec/design_output/doors#one-door-per-outside-thing]]
func TestTheDiskDoorsNameTheFiles(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{"notes/b.md": "b", "notes/a.md": "a", "notes/deep/c.md": "c"})
	if got := one.d.names("notes"); !slices.Equal(got, []string{"a.md", "b.md"}) {
		t.Fatalf("the folder names %v", got)
	}
	if got := one.d.filesUnder("notes"); !slices.Equal(got, []string{"notes/a.md", "notes/b.md", "notes/deep/c.md"}) {
		t.Fatalf("the walk names %v", got)
	}
	if got := one.d.names("none"); got != nil {
		t.Fatalf("a missing folder names %v", got)
	}
}

// A link reads what it names, and its removal leaves that standing. [[spec/design_output/review#a-worktree-runs-the-check]]
func TestALinkLeavesWhatItNames(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{"lib/x.txt": "held"})
	to := filepath.Join(t.TempDir(), "deep", "lib")
	if !one.d.link("lib", to) || readFile(filepath.Join(to, "x.txt")) != "held" {
		t.Fatal("the link reads nothing")
	}
	unlink(to)
	if one.read("lib/x.txt") != "held" || readFile(filepath.Join(to, "x.txt")) != "" {
		t.Fatal("the removal reaches past the link")
	}
}
