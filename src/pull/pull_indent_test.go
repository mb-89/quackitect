// A hand-back writes a command field indented four spaces, whatever indent
// the hand passes, so the commit hook reads the tests a ticket carries.
// [[spec/design_output/pull#the-fields-ride-the-payload]]
package pull // level0: InPackageTest - reaches the in-package helpers cloudPull and must

import (
	"strings"
	"testing"
)

func TestACommandFieldLandsIndented(t *testing.T) {
	t.Parallel()
	for _, passed := range []string{"echo green", "  echo green"} {
		it, _, errs := cloudPull(t)
		it.Pulling([]string{"pull"})
		fields := `{"tests":"` + passed + `","says":"It changes one thing."}`
		if code := it.Pulling([]string{"pull", "alpha", "--pass", "--fields", fields}); code != 0 {
			t.Fatalf("the hand-back of %q answers %d:\n%s", passed, code, errs)
		}
		text, _ := it.Disk.Read("spec/tickets/alpha.md")
		if !strings.Contains(text, "\n    echo green\n") || !strings.Contains(text, "\nIt changes one thing.\n") {
			t.Fatalf("the hand-back of %q writes:\n%s", passed, text)
		}
	}
}
