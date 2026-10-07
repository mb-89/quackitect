// The listing's reads off the git door: the tickets a tip holds, read in one
// ask, and the second each tip was made.
// [[spec/design_output/work#the-listing-reads-git-once]]
package branches

import (
	"slices"
	"testing"
	"time"
)

// A tip names the tickets straight under the folder, and the read carries each one's text. [[spec/design_output/work#the-listing-reads-git-once]]
func TestTheListingReadsEachTicketATipHolds(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("g", map[string]string{ticketAt("g"): groupNote, ticketAt("kid"): childNote, ticketsFolder + "/deep/x.md": "x\n", ticketsFolder + "/notes.txt": "n\n"})
	stood, _ := one.d.readWork(false)
	if len(stood) != 1 || stood[0].Ticket != groupNote {
		t.Fatalf("the listing reads %+v", stood)
	}
	var names []string
	for _, each := range stood[0].Tickets {
		names = append(names, each.Name)
		if each.Name == "kid" && each.Text != childNote {
			t.Fatalf("kid reads %q", each.Text)
		}
	}
	if !slices.Equal(names, []string{"g", "kid"}) {
		t.Fatalf("the tip names %v", names)
	}
}

// A ref reads the second its tip was made. [[spec/design_output/work#the-listing-reads-git-once]]
func TestARefReadsTheSecondItsTipWasMade(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	at := testNow.Add(-time.Hour)
	one.branchAt("g", map[string]string{ticketAt("g"): groupNote}, at)
	refs := one.d.refsHere()
	if len(refs) != 1 || refs[0].Branch != "work/g" || refs[0].When != at.Unix() || refs[0].Tip != one.rev("origin/work/g") {
		t.Fatalf("the refs read %+v", refs)
	}
}
