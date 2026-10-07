// A folder belongs to the tree it names, the way the retro's collect reads
// the harness's own folders under home and under temp.
// [[spec/guidance/retro/collect]]
package main // level0: InPackageTest - a main package admits no outside test package

import "testing"

// [[spec/guidance/retro/collect]]
func TestRetroOutsideFolderBelongsToTheTreeByItsNameWhateverTheCaseOfTheDriveLetter(t *testing.T) {
	t.Parallel()
	if got := retroSlugOf(`c:\work\tree\quackitect-v5`); got != "c--work-tree-quackitect-v5" {
		t.Fatalf("the slug reads %q", got)
	}
	const slug = "c--work-tree-quackitect-v5"
	for _, one := range []struct {
		name   string
		inside []string
		want   bool
		why    string
	}{
		{"C--work-tree-quackitect-v5", nil, true, "the tree's own folder belongs"},
		{"C--Temp-c--work-tree-quackitect-v5-stub", nil, true, "a scratch folder named off the tree belongs"},
		{"c--work-tree-quackitect-v50", nil, false, "a longer name is another tree"},
		{"c--work-tree-quackitect-v4", nil, false, "another name is another tree"},
		{"c--work-tree-quackitect-v5-old", []string{"src"}, false, "a sibling tree names a folder the tree holds nowhere"},
		{"c--work-tree-quackitect-v5-src-bridge", []string{"src"}, true, "a session run from a folder inside the tree belongs"},
		{"c--work-tree-quackitect-v5--claude-worktrees-a", nil, true, "a worktree under a dot folder belongs"},
		{"c--other-c--work-tree-quackitect-v5x", nil, false, "a name running past the slug is another tree"},
	} {
		if got := retroBelongs(one.name, slug, one.inside); got != one.want {
			t.Fatalf("%s belongs %v, want %v: %s", one.name, got, one.want, one.why)
		}
	}
}
