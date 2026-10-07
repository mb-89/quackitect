// The review: the retro read and the report.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import "testing"

// A retro chapter carrying a filled line reads present, and one holding comments alone reads absent. [[spec/design_output/review#the-questions]]
func TestTheRetroReadsPresentWhereALineStands(t *testing.T) {
	t.Parallel()
	if !retroOnTicket("# retro\n\n## write\n\nIt went well.\n") || retroOnTicket("# retro\n\n<!-- empty -->\n\n# Discussion\n\nx\n") {
		t.Fatal("the retro reads apart")
	}
}

// A clean branch reads nothing to fix, and a red check names its code and what it says. [[spec/design_output/review#what-the-report-looks-like]]
func TestTheReportNamesWhatToFix(t *testing.T) {
	t.Parallel()
	code := 1
	if report(material{Branch: "work/a", Retro: true, Check: checked{OK: true}}) != "work/a   nothing to fix. Run branch merge to take it in." {
		t.Fatal("a clean branch reads apart")
	}
	want := "work/a\n\ncheck      answers 1:\n           not ok 1\nretro      absent from the handback\n\n2 things to fix. Run branch merge once every fix lands."
	if got := report(material{Branch: "work/a", Check: checked{Code: &code, Says: "not ok 1"}}); got != want {
		t.Fatalf("the report reads\n%s", got)
	}
}
