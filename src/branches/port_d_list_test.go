// The listing, ported off test/level0/work-list.test.js: open work alone by
// default, everything under --all, and a group row behind main keeps its mark.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import "testing"

// A tree with work/one-group on the cloud holding an open and a closed child, work/landed inside main, and an open and a closed loose ticket on main. [[spec/tickets/work-verbs-port-to-go]]
func pdListing(t *testing.T, flags ...string) string {
	t.Helper()
	one := newTree(t, map[string]string{
		ticketAt("a-loose-one"):  pdLoose("open"),
		ticketAt("a-closed-one"): pdLoose("closed"),
	})
	one.branch("one-group", map[string]string{
		ticketAt("one-group"):    pdUnderKind(pdGroupNote, "cloud: true"),
		ticketAt("a-child"):      pdChild("one-group", "open"),
		ticketAt("a-done-child"): pdChild("one-group", "closed"),
	})
	one.branch("landed", map[string]string{ticketAt("landed"): pdGroupNote})
	one.mergeIn("origin/work/landed", "")
	one.land("landed closes", map[string]string{ticketAt("landed"): withField(pdGroupNote, "state", closedState)})
	one.push(trunk)
	one.fetch()
	if code := one.branchSays(append([]string{"list"}, flags...)...); code != codeOK {
		t.Fatalf("list answers %d: %s", code, one.errs.String())
	}
	return one.out.String()
}

// The listing shows open work alone by default. [[spec/tickets/work-verbs-port-to-go]]
func TestPDTheListingShowsOpenWorkByDefault(t *testing.T) {
	t.Parallel()
	said := pdListing(t)
	pdMatches(t, said, `work/one-group\s+todo`)
	pdMatches(t, said, `(?m)^ {2}a-child\s+ticket\s+open`)
	pdMatches(t, said, `(?m)^a-loose-one\s+ticket\s+open`)
	pdMisses(t, said, `a-done-child`)
	pdMisses(t, said, `a-closed-one`)
	pdMisses(t, said, `work/landed`)
}

// The listing shows everything under --all. [[spec/tickets/work-verbs-port-to-go]]
func TestPDTheListingShowsEverythingUnderAll(t *testing.T) {
	t.Parallel()
	said := pdListing(t, "--all")
	pdMatches(t, said, `(?m)^ {2}a-done-child\s+ticket\s+closed`)
	pdMatches(t, said, `(?m)^a-closed-one\s+ticket\s+closed`)
	pdMatches(t, said, `work/landed\s+merged`)
}

// A group row behind main keeps its mark after the behind. [[spec/tickets/work-verbs-port-to-go]]
func TestPDABehindRowKeepsItsMark(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{ticketAt("one-group"): pdGroupNote})
	pdMainMoves(one, 1)
	one.branchSays("list")
	pdMatches(t, one.out.String(), `work/one-group\s+todo\s+behind main, urgent`)
}
