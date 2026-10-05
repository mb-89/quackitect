// The review: the refusals, the retro read, the report and the cases a red
// check names.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import "testing"

// A review names its branch, and a branch standing nowhere refuses. [[spec/design_output/review#what-the-verb-gathers]]
func TestAReviewWantsABranchThatStands(t *testing.T) {
	one := newTree(t, nil)
	if code := one.branchSays("review"); code != codeRefused {
		t.Fatalf("a bare review answers %d", code)
	}
	if code := one.branchSays("review", "none"); code != codeRed {
		t.Fatalf("a review of nothing answers %d", code)
	}
	holds(t, one.errs.String(), "work/none stands nowhere, here or on origin.")
}

// A retro chapter carrying a filled line reads present, and one holding comments alone reads absent. [[spec/design_output/review#the-questions]]
func TestTheRetroReadsPresentWhereALineStands(t *testing.T) {
	if !retroOnTicket("# retro\n\n## write\n\nIt went well.\n") || retroOnTicket("# retro\n\n<!-- empty -->\n\n# Discussion\n\nx\n") {
		t.Fatal("the retro reads apart")
	}
}

// A clean branch reads nothing to fix, and a red check names its code and what it says. [[spec/design_output/review#what-the-report-looks-like]]
func TestTheReportNamesWhatToFix(t *testing.T) {
	code := 1
	if report(material{Branch: "work/a", Retro: true, Check: checked{OK: true}}) != "work/a   nothing to fix. Run branch merge to take it in." {
		t.Fatal("a clean branch reads apart")
	}
	want := "work/a\n\ncheck      answers 1:\n           not ok 1\nretro      absent from the handback\n\n2 things to fix. Run branch merge once every fix lands."
	if got := report(material{Branch: "work/a", Check: checked{Code: &code, Says: "not ok 1"}}); got != want {
		t.Fatalf("the report reads\n%s", got)
	}
}

// A red run names each failing case once, or its last lines. [[spec/design_output/review#a-worktree-runs-the-check]]
func TestARedRunNamesItsCases(t *testing.T) {
	if got := whatFailed("not ok 1 - a\nnot ok 1 - a\nnot ok 2 - b\n", ""); got != "not ok 1 - a\nnot ok 2 - b" {
		t.Fatalf("the cases read %q", got)
	}
	if got := whatFailed("one\ntwo\n", "three"); got != "one\ntwo\nthree" {
		t.Fatalf("the last lines read %q", got)
	}
}
