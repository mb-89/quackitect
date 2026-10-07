// A tag parks a ticket for the next pull, and a work branch takes its own
// group's tagged tickets alone. [[spec/tickets/box-opens-its-pr]]
package pull

import (
	"strings"
	"testing"
)

// A pull on work/g hands g's leaf ahead of a tagged ticket of another group. [[spec/tickets/box-opens-its-pr]]
func TestAWorkBranchPassesAnotherGroupsTaggedTicket(t *testing.T) {
	t.Parallel()
	it, out, _ := cloudPull(t)
	_ = it.Disk.Write("spec/tickets/stray.md", strings.Replace(childTicket, "group: g\n", "group: other\ntodo: true\n", 1))
	if code := it.Pulling([]string{"pull"}); code != 0 || !strings.HasPrefix(out.String(), "work  alpha at do") {
		t.Fatalf("the pull answers %d:\n%s", code, out)
	}
}

// A pull on work/g hands g's own tagged child first. [[spec/tickets/box-opens-its-pr]]
func TestAWorkBranchTakesItsOwnTaggedChildFirst(t *testing.T) {
	t.Parallel()
	it, out, _ := cloudPull(t)
	_ = it.Disk.Write("spec/tickets/beta.md", strings.Replace(childTicket, "group: g\n", "group: g\ntodo: true\n", 1))
	if code := it.Pulling([]string{"pull"}); code != 0 || !strings.HasPrefix(out.String(), "work  beta at do") {
		t.Fatalf("the pull answers %d:\n%s", code, out)
	}
}
