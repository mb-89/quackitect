// The badge's own verb: it says the count the work tab carries in its
// brackets, so the badge and the header read one value.
// [[spec/tickets/the-badge-reads-open-tasks]]

package main

import (
	"testing"

	"quackitect/src/tui/work"
)

func TestTheBadgeVerbSaysTheTakeableCount(t *testing.T) {
	was := placesAt
	t.Cleanup(func() { placesAt = was })
	placesAt = func(string) (work.Places, error) { return work.Places{Takeable: 5}, nil }
	said, err := countSaid(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	if tab := (&work.Tab{Places: &work.Places{Takeable: 5}}); said != `{"count":5}` || tab.Label(nil) != "work (5)" {
		t.Fatalf("the badge says %s, and the header %q", said, tab.Label(nil))
	}
}
