// What a group leaves open: each open child, and each open loose ticket the
// branch adds, past the person route.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it drives the unexported fix readers addedHere, leftOpen and onPersonRoute

import (
	"slices"
	"strings"
	"testing"
)

// leftOpen names each open child and each open loose ticket the branch adds, and passes the person route, a closed one and another group's. [[spec/tickets/work-verbs-port-to-go]]
func TestPCLeftOpenNamesOpenChildrenAndLooseAdds(t *testing.T) {
	t.Parallel()
	one := pcOnGroup(newTree(t, map[string]string{
		ticketAt("a-child"):   pcChild(pcGroup, "open"),
		ticketAt("a-draft"):   pcChild(pcGroup, "draft"),
		ticketAt("one-group"): pcGroupNote,
	}), map[string]string{
		ticketAt("left"):  pcLoose(),
		ticketAt("shut"):  strings.Replace(pcChild("", "closed"), "group: \n", "", 1),
		ticketAt("kept"):  pcChild("another-group", "open"),
		ticketAt("trial"): pcPersonChild(""),
	})
	if said := one.d.leftOpen(pcGroup); !slices.Equal(said, []string{"a-child", "a-draft", "left"}) {
		t.Fatalf("leftOpen reads %v", said)
	}
}

// leftOpen leaves out a draft the branch adds with no group. [[spec/tickets/work-verbs-port-to-go]]
func TestPCLeftOpenPassesALooseDraft(t *testing.T) {
	t.Parallel()
	sketch := strings.Replace(pcChild("", "draft"), "group: \n", "", 1)
	one := pcOnGroup(newTree(t, map[string]string{ticketAt("one-group"): pcGroupNote}), map[string]string{
		ticketAt("sketch"): sketch,
		ticketAt("left"):   pcLoose(),
	})
	if said := one.d.leftOpen(pcGroup); !slices.Equal(said, []string{"left"}) {
		t.Fatalf("leftOpen reads %v", said)
	}
}

// onPersonRoute reads the process in either spelling, and nothing else. [[spec/tickets/work-verbs-port-to-go]]
func TestPCOnPersonRouteReadsEitherSpelling(t *testing.T) {
	t.Parallel()
	loose := pcLoose()
	with := func(process string) string {
		return withField(loose, "process", process)
	}
	if !onPersonRoute(pcPersonChild("")) {
		t.Fatal("the linked spelling reads off the person route")
	}
	if !onPersonRoute(with("person")) {
		t.Fatal("the bare spelling reads off the person route")
	}
	if onPersonRoute(with("[[spec/processes/question]]")) {
		t.Fatal("the question route reads as the person route")
	}
	if onPersonRoute(loose) {
		t.Fatal("a ticket naming no process reads as the person route")
	}
}

// addedHere reads each ticket the branch adds off the disk, and passes one the disk lacks. [[spec/tickets/work-verbs-port-to-go]]
func TestPCAddedHereReadsTheDisk(t *testing.T) {
	t.Parallel()
	one := pcOnGroup(newTree(t, nil), map[string]string{
		ticketAt("left"): pcLoose(),
		ticketAt("gone"): pcLoose(),
	})
	one.d.remove(ticketAt("gone"))
	said := one.d.addedHere()
	if len(said) != 1 || said[0].Name != "left" || said[0].Text != pcLoose() {
		t.Fatalf("addedHere reads %+v", said)
	}
}
