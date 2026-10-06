// The test verb: the words a run answers, and a branch changing no test.
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

// A branch changing no test answers missing. [[spec/design_output/pull#the-test-verb]]
func TestABranchChangingNoTestAnswersMissing(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if code := one.branchSays("test"); code != codeRed {
		t.Fatalf("the test verb answers %d", code)
	}
	holds(t, one.out.String(), "missing, because the branch changes no test since")
}

// A Go run answers green, assertion or build. [[spec/design_output/pull#the-test-verb]]
func TestAGoRunAnswersOneWord(t *testing.T) {
	t.Parallel()
	if goSays(Said{OK: true}, "src/x") != "green, src/x passes" {
		t.Fatal("a green run reads apart")
	}
	if goSays(Said{Out: "--- FAIL: TestX"}, "src/x") != "assertion, a test of src/x fails" {
		t.Fatal("a failing run reads apart")
	}
	if goSays(Said{Err: "x.go:1: undefined: y"}, "src/x") != "build, because src/x builds not: x.go:1: undefined: y" {
		t.Fatal("a broken build reads apart")
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

// A node run answers green with its count, or assertion with its failing cases above. [[spec/design_output/pull#the-test-verb]]
func TestANodeRunAnswersItsVerdict(t *testing.T) {
	t.Parallel()
	if testSays(Said{OK: true, Out: "# tests 3\n# pass 3\n"}, 1) != "green, 3 test(s) pass in 1 file(s)" {
		t.Fatal("a green run reads apart")
	}
	red := testSays(Said{Out: "not ok 1 - it adds\n# tests 1\n# fail 1\nAssertionError\n"}, 1)
	if red != "  not ok: it adds\nassertion, 1 test(s) fail on their own assertion" {
		t.Fatalf("a red run reads %q", red)
	}
}
