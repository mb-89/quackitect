// The ticket a name finds: a live note before a ticket, a ticket before a
// closed note, and a path where no name answers.
// [[spec/design_output/pull#the-private-queue]]
package pull

import "testing"

// A ticket's name reads as a ticket, and a todo's title or a bare path reads as none. [[spec/tickets/pull-hands-the-working-ticket]]
func TestNamesTicket(t *testing.T) {
	t.Parallel()
	disk := FakeDisk{
		"spec/tickets/alpha.md": "---\nstate: open\n---\n",
		".se/tickets/note.md":   "---\nstate: open\n---\n",
	}
	for name, want := range map[string]bool{"alpha": true, "note": true, "alpha.md": true, "mend the lint": false, "spec/tickets/alpha.md": false, "": false} {
		if got := namesTicket(disk, name); got != want {
			t.Errorf("namesTicket(%q) reads %v, want %v", name, got, want)
		}
	}
}

func TestTicketAt(t *testing.T) {
	t.Parallel()
	disk := FakeDisk{
		".se/tickets/both.md":   "---\nstate: closed\n---\n",
		"spec/tickets/both.md":  "---\nstate: open\n---\n",
		".se/tickets/live.md":   "---\nstate: open\n---\n",
		"spec/tickets/live.md":  "---\nstate: open\n---\n",
		".se/tickets/gone.md":   "---\nstate: closed\n---\n",
		"spec/tickets/other.md": "---\nstate: open\n---\n",
	}
	for name, want := range map[string]string{
		"both": "spec/tickets/both.md", "live.md": ".se/tickets/live.md", "gone": ".se/tickets/gone.md",
		"spec/tickets/other.md": "spec/tickets/other.md",
	} {
		if got, ok := TicketAt(disk, name); !ok || got != want {
			t.Errorf("%s finds %q, %v, and wants %s", name, got, ok, want)
		}
	}
	if got, ok := TicketAt(disk, "nope"); ok {
		t.Errorf("a name nothing holds finds %q", got)
	}
}
