// The test verb: the package a changed Go test names.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it drives the unexported goPackagesOf, goSays and testSays

import (
	"slices"
	"testing"
)

// A changed golden names its own package and every package whose test reads its folder, and a golden nobody changes names none. [[spec/tickets/size-golden-drops-line-counts]]
func TestGoldenReadersNameEveryPackageReadingAChangedGolden(t *testing.T) {
	t.Parallel()
	tests := map[string]string{
		"src/quack/check_twins_test.go":        `var twinsAt = filepath.FromSlash("../modules/check/testdata")`,
		"src/modules/check/textfaults_test.go": `os.ReadFile(filepath.Join("testdata", "size.golden.json"))`,
		"src/pull/pull_test.go":                `os.ReadFile("testdata/other.json")`,
	}
	got := goldenReaders([]string{"src/modules/check/testdata/size.golden.json", "spec/a.md"}, tests)
	slices.Sort(got)
	if want := []string{"src/modules/check", "src/quack"}; !slices.Equal(got, want) {
		t.Errorf("the readers read %v, want %v", got, want)
	}
	if got := goldenReaders([]string{"spec/a.md"}, tests); len(got) != 0 {
		t.Errorf("a change touching no golden reads %v", got)
	}
}

// A changed Go test names its package folder, and a named folder names itself. [[spec/tickets/go-code-shares-one-module]]
func TestAChangedGoTestNamesItsPackage(t *testing.T) {
	t.Parallel()
	got := goPackagesOf([]string{"src/a/b_test.go", "src/c/", "src/d.go", "test/e_test.go"})
	if !slices.Equal(got, []string{"src/a", "src/c"}) {
		t.Fatalf("the packages read %v", got)
	}
}

// A source named twice goes aside once, and a named folder sets each file under it aside, so every working edit comes back. [[spec/tickets/red-test-keeps-named-sources]]
func TestRedSetsEachSourceAsideOnce(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{"c.js": "head c\n", "lib/a.js": "head a\n", "lib/b.js": "head b\n"}).desk()
	work := map[string]string{"c.js": "work c\n", "lib/a.js": "work a\n", "lib/new.js": "new\n"}
	one.write(work)
	one.d.setAside([]string{"c.js", "c.js", "lib"})
	for path, want := range map[string]string{"c.js": "head c\n", "lib/a.js": "head a\n", "lib/b.js": "head b\n"} {
		if got := one.read(path); got != want {
			t.Fatalf("%s reads %q aside, and wants HEAD's text", path, got)
		}
	}
	one.d.putBack()
	work["lib/b.js"] = "head b\n"
	for path, want := range work {
		if got := one.read(path); got != want {
			t.Fatalf("%s reads %q after the put back, and wants %q", path, got, want)
		}
	}
}
