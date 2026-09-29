// The badge the window draws, over the cases the sidebar's test reads too, so
// both surfaces draw one text off one row.
// [[spec/tickets/the-sidebar-renders-generically]]
package work

import (
	"encoding/json"
	"os"
	"testing"
)

// The cases test/level0/sidebar-views.test.js reads as well. [[spec/tickets/the-sidebar-renders-generically]]
const badgeCasesAt = "testdata/badges.json"

func TestBadgeOfReadsTheSharedCases(t *testing.T) {
	text, err := os.ReadFile(badgeCasesAt)
	if err != nil {
		t.Fatal(err)
	}
	var cases []struct {
		Says  string    `json:"says"`
		Names []NameRow `json:"names"`
		Name  string    `json:"name"`
		Want  string    `json:"want"`
	}
	if err := json.Unmarshal(text, &cases); err != nil {
		t.Fatal(err)
	}
	if len(cases) == 0 {
		t.Fatalf("%s holds no case", badgeCasesAt)
	}
	for _, one := range cases {
		if said := BadgeOf(one.Names, one.Name); said != one.Want {
			t.Errorf("%s: the badge reads %q, and wants %q", one.Says, said, one.Want)
		}
	}
}
