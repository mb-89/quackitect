// A closed ticket is history, the way standsClosed and pastHistory in the
// bridge's findings reader read it, so the rows past it read here alone.
// [[spec/tickets/bridge-library-leaves]]
package check

import (
	"reflect"
	"testing"
)

// A closed ticket on disk keeps no row but its conflict marker, and every other path keeps its rows. [[spec/tickets/bridge-library-leaves]]
func TestAClosedTicketKeepsNoRowButItsConflictMarker(t *testing.T) {
	t.Parallel()
	closedTicket := "---\nkind: [[ticket]]\nstate: closed\n---\n\n# Ask\n"
	openTicket := "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n"
	tree := TreeOver("/tree", Texts{
		"spec/tickets/done.md":  closedTicket,
		"spec/tickets/open.md":  openTicket,
		"spec/notes/done.md":    closedTicket,
		"spec/tickets/done.txt": closedTicket,
	})
	// A buffer writing the close keeps its rows, because the disk decides.
	tree.Holds("spec/tickets/open.md", closedTicket)
	found := []Finding{
		fault("SomeRule", "spec/tickets/done.md", 1, "a row on the closed ticket"),
		fault("SomeRule", "/tree/spec/tickets/done.md", 2, "a row on the closed ticket under the root"),
		fault(conflictMarkers, "spec/tickets/done.md", 3, "a conflict marker on the closed ticket"),
		fault("SomeRule", "spec/tickets/open.md", 1, "a row on the open ticket"),
		fault("SomeRule", "spec/notes/done.md", 1, "a row on a note saying closed"),
		fault("SomeRule", "spec/tickets/done.txt", 1, "a row on a text file saying closed"),
		fault("SomeRule", "spec/tickets/gone.md", 1, "a row on a ticket the disk holds nowhere"),
	}
	want := []Finding{found[2], found[3], found[4], found[5], found[6]}
	if got := pastHistory(tree, found); !reflect.DeepEqual(got, want) {
		t.Errorf("the rows past history read %+v, and want %+v", got, want)
	}
}
