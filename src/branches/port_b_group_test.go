// The standing, the listing and the trunk end over a real tree, ported from
// test/level0/work-group.test.js: list, the stale hold, merge, release, close.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"regexp"
	"strings"
	"testing"
	"time"

	"quackitect/src/front"
)

// A group holds where the record says so, and stands free where it says nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPBAGroupHoldsWhereTheRecordSaysSo(t *testing.T) {
	t.Parallel()
	took := pbTook()
	if groupStanding(pbGroupNote) != todo || groupStanding(took) != held {
		t.Fatal("the take reads apart from the record")
	}
	if groupStanding(withHashAfter(took, "d4e5f6")) != todo || groupStanding(withField(took, "state", closedState)) != done {
		t.Fatal("the close of a take reads apart from the record")
	}
	if groupStanding("") != "" {
		t.Fatal("nothing reads a standing")
	}
}

// The list names a group and a loose ticket, each on its own row. [[spec/tickets/work-verbs-port-to-go]]
func TestPBListNamesAGroupAndALooseTicket(t *testing.T) {
	t.Parallel()
	loose := strings.Replace(pbChild("one-group", "open"), "group: one-group\n", "", 1)
	one := newTree(t, map[string]string{ticketAt("a-loose-one"): loose, pbAt: pbGroupNote})
	one.branch("one-group", map[string]string{pbAt: pbTook()})
	pbClockAt(one, "origin/work/one-group", 3*time.Hour)
	if code := one.branchSays("list"); code != 0 {
		t.Fatalf("list answers %d: %s", code, pbSaid(one))
	}
	said := one.out.String()
	if !regexp.MustCompile(`work/one-group\s+held\s+urgent\s+3h`).MatchString(said) {
		t.Errorf("the group row reads apart: %s", said)
	}
	if !regexp.MustCompile(`a-loose-one\s+ticket\s+open`).MatchString(said) {
		t.Errorf("the loose row reads apart: %s", said)
	}
	if regexp.MustCompile(`(?m)^one-group\s+ticket`).MatchString(said) {
		t.Errorf("a group reads as a loose ticket: %s", said)
	}
}

// A group held past the stale span stands under Yours with its three answers, and a younger one asks nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPBAStaleGroupStandsUnderYours(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{pbAt: pbTook()})
	pbClockAt(one, "origin/work/one-group", 3*time.Hour)
	span := "12h"
	one.d.Config = func(key string) any {
		if key == staleKey {
			return span
		}
		return nil
	}
	one.branchSays("list")
	if strings.Contains(one.out.String(), "Yours") {
		t.Fatalf("a tip younger than the span asks: %s", one.out.String())
	}
	span = "90m"
	one.branchSays("list")
	holds(t, one.out.String(), "Yours")
	holds(t, one.out.String(), "one-group held 3h. Release it, take it over, or close it.")
}

// A desk tree with work/one-group standing done, the extra files on it, and the check the runme answers. [[spec/tickets/work-verbs-port-to-go]]
func pbMerging(t *testing.T, check string, files map[string]string) *tree {
	one := newTree(t, nil).desk()
	carried := map[string]string{pbAt: pbClosed(pbGroupNote)}
	for at, text := range files {
		carried[at] = text
	}
	one.branch("one-group", carried)
	one.d.Runme = []string{"sh", "-c", check, "runme"}
	return one
}

// A merge runs the check on the merge commit, and undoes the merge on red. [[spec/tickets/work-verbs-port-to-go]]
func TestPBMergeUndoesTheMergeOnRed(t *testing.T) {
	t.Parallel()
	one := pbMerging(t, "echo 'two tests fail'; exit 1", nil)
	was := one.git("rev-parse", "HEAD")
	if code := one.branchSays("merge", "one-group"); code != codeRed {
		t.Fatalf("the merge answers %d: %s", code, pbSaid(one))
	}
	holds(t, pbSaid(one), "answers red on the merge commit")
	holds(t, pbSaid(one), "two tests fail")
	if one.git("rev-parse", "HEAD") != was {
		t.Fatal("trunk moves on a red check")
	}
}

// A merge on a red check prints each failing case the check names. [[spec/tickets/work-verbs-port-to-go]]
func TestPBMergePrintsEachFailingCase(t *testing.T) {
	t.Parallel()
	one := pbMerging(t, "printf 'test/level0/one.test.js: a first case: it broke\\ntest/level0/two.test.js: a second case: it broke\\n'; exit 1", nil)
	if code := one.branchSays("merge", "one-group"); code != codeRed {
		t.Fatalf("the merge answers %d: %s", code, pbSaid(one))
	}
	holds(t, pbSaid(one), "one.test.js: a first case")
	holds(t, pbSaid(one), "two.test.js: a second case")
}

// A merge refuses where trunk moved a ticket the branch holds, names the lines, and merges nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPBMergeRefusesWhereTrunkMovedATicket(t *testing.T) {
	t.Parallel()
	now := strings.Replace(pbGroupNote, "Nothing yet.\n", "urgency: now\n", 1)
	one := newTree(t, map[string]string{pbAt: now}).desk()
	one.branch("one-group", map[string]string{pbAt: pbClosed(now)})
	one.land("main moves the group", map[string]string{pbAt: strings.Replace(now, "urgency: now", "urgency: whenever", 1)})
	one.git("push", "-q", "origin", "main")
	one.d.Runme = []string{"true"}
	was := one.git("rev-parse", "HEAD")
	if code := one.branchSays("merge", "one-group"); code != codeRed {
		t.Fatalf("the merge answers %d: %s", code, pbSaid(one))
	}
	said := pbSaid(one)
	holds(t, said, "main moved what work/one-group holds")
	holds(t, said, "-urgency: now")
	holds(t, said, "+urgency: whenever")
	if one.git("rev-parse", "HEAD") != was {
		t.Fatal("the refused merge moves trunk")
	}
}

// A merge frees an open ticket of the group it takes in, leaves a closed one, and amends the merge commit. [[spec/tickets/work-verbs-port-to-go]]
func TestPBMergeFreesAnOpenTicket(t *testing.T) {
	t.Parallel()
	one := pbMerging(t, "exit 0", map[string]string{ticketAt("a-child"): pbChild("one-group", "open"), ticketAt("shut-one"): pbChild("one-group", closedState)})
	if code := one.branchSays("merge", "one-group"); code != 0 {
		t.Fatalf("the merge answers %d: %s", code, pbSaid(one))
	}
	if fieldOf(one.read(ticketAt("a-child")), groupField) != "" || fieldOf(one.read(ticketAt("shut-one")), groupField) != "one-group" {
		t.Fatal("the merge frees the wrong tickets")
	}
	holds(t, pbSaid(one), "a-child lost its group")
	if len(strings.Fields(one.git("rev-list", "--parents", "-n", "1", "HEAD"))) != 3 {
		t.Fatal("HEAD stands on no merge commit")
	}
	if fieldOf(one.git("show", "HEAD:"+ticketAt("a-child")), groupField) != "" {
		t.Fatal("the merge commit carries the child's group")
	}
}

// A release writes hash_after onto a held group, pushes, and frees it for anybody. [[spec/tickets/work-verbs-port-to-go]]
func TestPBReleaseWritesHashAfter(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{pbAt: pbTook()})
	pbOnBranch(one, "one-group")
	tip := one.git("rev-parse", "HEAD")
	if code := one.branchSays("release"); code != 0 {
		t.Fatalf("the release answers %d: %s", code, pbSaid(one))
	}
	record := recordIn(one.read(pbAt))
	if len(record) == 0 || entryField(record[len(record)-1], "hash_after") != tip {
		t.Fatalf("the record reads %q", one.read(pbAt))
	}
	if groupStanding(one.read(pbAt)) != todo {
		t.Fatal("the released group holds")
	}
	holds(t, pbSaid(one), "free for anybody")
	if one.git("rev-parse", "origin/work/one-group") == tip {
		t.Fatal("the release pushes nothing")
	}
}

// A release closes every open take a merge left, so the group reads free. [[spec/tickets/work-verbs-port-to-go]]
func TestPBReleaseClosesEveryOpenTake(t *testing.T) {
	t.Parallel()
	first := withEntry(pbGroupNote, front.Ordered{{Key: "step", Value: "sync"}, {Key: "hand", Value: "box 3f9a"}, {Key: "hash_before", Value: "a1"}})
	both := withEntry(first, front.Ordered{{Key: "step", Value: "sync"}, {Key: "hand", Value: "box 7c1d"}, {Key: "hash_before", Value: "d4"}})
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{pbAt: both})
	pbOnBranch(one, "one-group")
	tip := one.git("rev-parse", "HEAD")
	if code := one.branchSays("release"); code != 0 {
		t.Fatalf("the release answers %d: %s", code, pbSaid(one))
	}
	text := one.read(pbAt)
	var after []string
	for _, row := range recordIn(text) {
		after = append(after, entryField(row, "hash_after"))
	}
	if strings.Join(after, ",") != tip+","+tip {
		t.Fatalf("the hashes after read %v", after)
	}
	if groupStanding(text) != todo || heldIn(text) != nil {
		t.Fatal("a take stands open after the release")
	}
}

// A release on a group nobody holds writes nothing, and says so. [[spec/tickets/work-verbs-port-to-go]]
func TestPBReleaseOnAFreeGroupWritesNothing(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{pbAt: pbGroupNote})
	pbOnBranch(one, "one-group")
	tip := one.git("rev-parse", "HEAD")
	if code := one.branchSays("release"); code != 0 {
		t.Fatalf("the release answers %d: %s", code, pbSaid(one))
	}
	holds(t, pbSaid(one), "holds nobody already")
	if one.git("rev-parse", "HEAD") != tip || one.git("rev-parse", "origin/work/one-group") != tip {
		t.Fatal("the release writes a line")
	}
}

// A close drops a group's branch once trunk holds it. [[spec/tickets/work-verbs-port-to-go]]
func TestPBCloseDropsABranchTrunkHolds(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil).desk()
	one.branch("one-group", map[string]string{pbAt: pbClosed(pbGroupNote)})
	one.git("merge", "-q", "--no-ff", "--no-edit", "origin/work/one-group")
	one.git("push", "-q", "origin", "main")
	if code := one.branchSays("close", "one-group"); code != 0 {
		t.Fatalf("the close answers %d: %s", code, pbSaid(one))
	}
	if one.git("ls-remote", "--heads", "origin", "work/one-group") != "" {
		t.Fatal("the branch stands on origin")
	}
}
