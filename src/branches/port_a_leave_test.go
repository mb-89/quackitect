// The leave over a real clone through fake doors: done and its log row,
// release over an unpushed branch, and read.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it reads the unexported checkStamp, entryField and recordIn after leave runs

import (
	"fmt"
	"strings"
	"testing"
)

// One log row a verb leaves. [[spec/tickets/work-verbs-port-to-go]]
type paRow struct {
	Level, Kind, Said string
	More              map[string]any
}

// Done says one line to the log, naming the branch and the code, and closes the take at HEAD. [[spec/tickets/work-verbs-port-to-go]]
func TestPADoneLogsOneLine(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{ticketAt("one-group"): withField(paTaken(), "state", closedState)})
	paOn(one, "one-group")
	head := one.rev("HEAD")
	one.write(map[string]string{checkStamp: fmt.Sprintf(`{"sha":%q,"ok":true,"clean":true,"at":"now"}`, head)})
	var rows []paRow
	one.d.Log = func(level, kind, said string, more map[string]any) {
		rows = append(rows, paRow{level, kind, said, more})
	}
	if code := one.branchSays("done"); code != codeOK {
		t.Fatalf("done answers %d: %s", code, paSaid(one))
	}
	record := recordIn(one.read(ticketAt("one-group")))
	if len(record) == 0 || entryField(record[len(record)-1], "hash_after") != head {
		t.Fatalf("the last take closes at %v, not %s", record, head)
	}
	if len(rows) != 1 || rows[0].Level != "debug" || rows[0].Kind != "work" || rows[0].Said != "done answered 0" || rows[0].More["branch"] != "work/one-group" {
		t.Fatalf("the log reads %+v", rows)
	}
}

// Done off a work branch refuses, and moves nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPADoneOffAWorkBranchRefuses(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{ticketAt("one-group"): paGroupNote})
	before := one.rev("HEAD")
	if code := one.branchSays("done"); code != codeRefused {
		t.Fatalf("done on main answers %d", code)
	}
	holds(t, paSaid(one), "branch done runs on a work branch")
	if one.rev("HEAD") != before || one.read(ticketAt("one-group")) != paGroupNote {
		t.Fatal("the refused done moves the tree")
	}
}

// Done with no group on the tree refuses, because the group is what comes back. [[spec/tickets/work-verbs-port-to-go]]
func TestPADoneWithNoGroupRefuses(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("fix-lsp", map[string]string{"a.md": "a\n"})
	paOn(one, "fix-lsp")
	if code := one.branchSays("done"); code != codeRefused {
		t.Fatalf("done answers %d", code)
	}
	holds(t, paSaid(one), "carries no spec/tickets/fix-lsp.md")
}

// Release refuses where the branch holds a commit origin lacks, and leaves those commits standing. [[spec/tickets/work-verbs-port-to-go]]
func TestPAReleaseRefusesUnpushedCommits(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{ticketAt("one-group"): paGroupNote})
	paOn(one, "one-group")
	one.land("first", map[string]string{"a.md": "a\n"})
	one.land("second", map[string]string{"b.md": "b\n"})
	tip := one.rev("HEAD")
	if code := one.branchSays("release"); code != codeRefused {
		t.Fatalf("release answers %d: %s", code, paSaid(one))
	}
	said := paSaid(one)
	holds(t, said, "holds 2 commit(s) origin lacks")
	holds(t, said, "git push origin work/one-group")
	if one.rev("HEAD") != tip {
		t.Fatal("the release resets the commits away")
	}
	if one.read(ticketAt("one-group")) != paGroupNote {
		t.Fatal("the group on the tree moves")
	}
}

// Release refuses a branch already standing at done, and leaves the group untouched. [[spec/tickets/work-verbs-port-to-go]]
func TestPAReleaseRefusesDone(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	shut := withField(paGroupNote, "state", closedState)
	one.branch("one-group", map[string]string{ticketAt("one-group"): shut})
	paOn(one, "one-group")
	tip := one.rev("HEAD")
	if code := one.branchSays("release"); code != codeRed {
		t.Fatalf("release answers %d: %s", code, paSaid(one))
	}
	holds(t, paSaid(one), "Read it before you reopen it")
	if one.read(ticketAt("one-group")) != shut || one.rev("HEAD") != tip {
		t.Fatal("the group on the tree moves")
	}
}

// Read prints the group a branch carries, and refuses a branch carrying none. [[spec/tickets/work-verbs-port-to-go]]
func TestPAReadPrintsTheGroup(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{ticketAt("one-group"): paGroupNote})
	if code := one.branchSays("read", "one-group"); code != codeOK {
		t.Fatalf("read answers %d", code)
	}
	holds(t, paSaid(one), "Two tickets that land as one")
	if code := one.branchSays("read", "fix-lsp"); code != codeRed {
		t.Fatalf("a read of nothing answers %d", code)
	}
	holds(t, paSaid(one), "carries no group at spec/tickets/fix-lsp.md")
	if strings.Contains(paSaid(one), "Two tickets") {
		t.Fatal("the refusal prints a group")
	}
}
