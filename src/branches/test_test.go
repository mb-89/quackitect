// The test verb: the package a changed Go test names.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

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
