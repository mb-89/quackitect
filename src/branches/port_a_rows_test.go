// The listing's rows under a group over a real clone, as
// test/level0/work-rows.test.js and the list case of work.test.js read them:
// each child, what it waits on, and a group row naming a branch behind main.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"strings"
	"testing"
)

// A child of the group at open, standing at its do step. [[spec/tickets/work-verbs-port-to-go]]
func paChildAtDo(group string) string {
	return strings.Replace(paChild(group, "open"), "group: "+group, "group: "+group+"\nstep: do", 1)
}

// Runs the listing, and fails where it answers anything but zero. [[spec/tickets/work-verbs-port-to-go]]
func paListed(t *testing.T, one *tree) string {
	t.Helper()
	if code := one.branchSays("list"); code != codeOK {
		t.Fatalf("list answers %d: %s", code, paSaid(one))
	}
	return paSaid(one)
}

// List reads the group on a branch a root handover also stands on, with no brief column. [[spec/tickets/work-verbs-port-to-go]]
func TestPAListReadsGroupBesideHandover(t *testing.T) {
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{"HANDOVER.md": "---\nstatus: held\n---\n", ticketAt("one-group"): paGroupNote})
	said := paListed(t, one)
	paMatch(t, said, `work/one-group\s+todo\s+urgent`)
	paNoMatch(t, said, `brief`)
}

// A group row carries a row per ticket naming it, off the branch tip. [[spec/tickets/work-verbs-port-to-go]]
func TestPAGroupRowCarriesItsTickets(t *testing.T) {
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{
		ticketAt("one-group"):  paGroupNote,
		ticketAt("a-child"):    paChildAtDo("one-group"),
		ticketAt("other-work"): paChild("another-group", "open"),
	})
	said := paListed(t, one)
	paMatch(t, said, `work/one-group\s+todo`)
	paMatch(t, said, `(?m)^ {2}a-child\s+ticket\s+open\s+do$`)
	paNoMatch(t, said, `other-work`)
	paNoMatch(t, said, `(?m)^ {2}one-group\s+ticket`)
}

// A branch carrying no group names no ticket, and reads at no status. [[spec/tickets/work-verbs-port-to-go]]
func TestPABranchWithNoGroupNamesNoTicket(t *testing.T) {
	one := newTree(t, nil)
	one.branch("no-group", map[string]string{ticketAt("a-child"): paChild("no-group", "open")})
	said := paListed(t, one)
	paMatch(t, said, `work/no-group\s+no status`)
	paNoMatch(t, said, `a-child`)
}

// A child row names the tickets it waits on, and a child waiting on nothing names its step. [[spec/tickets/work-verbs-port-to-go]]
func TestPAChildRowNamesItsWaits(t *testing.T) {
	waiting := strings.Replace(paChild("one-group", "open"), "group: one-group", "group: one-group\ndepends_on: b-child, c-shut, d-nowhere\nstep: do", 1)
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{
		ticketAt("one-group"): paGroupNote,
		ticketAt("a-child"):   waiting,
		ticketAt("b-child"):   paChild("one-group", "open"),
		ticketAt("c-shut"):    paChild("one-group", "closed"),
		ticketAt("e-free"):    paChildAtDo("one-group"),
	})
	said := paListed(t, one)
	paMatch(t, said, `(?m)^ {2}a-child\s+ticket\s+open\s+waits for b-child$`)
	paMatch(t, said, `(?m)^ {2}e-free\s+ticket\s+open\s+do$`)
}

// A group row names a branch behind main, and a branch on the trunk tip stands level. [[spec/tickets/work-verbs-port-to-go]]
func TestPAGroupRowNamesBehindMain(t *testing.T) {
	level := newTree(t, nil)
	level.branch("one-group", map[string]string{ticketAt("one-group"): paGroupNote})
	paNoMatch(t, paListed(t, level), `behind main`)

	behind := newTree(t, nil)
	behind.branch("one-group", map[string]string{ticketAt("one-group"): paGroupNote})
	behind.land("trunk moves", map[string]string{"t.md": "t\n"})
	behind.git("push", "-q", "origin", "main")
	paMatch(t, paListed(t, behind), `work/one-group\s+todo\s+behind main`)
}
