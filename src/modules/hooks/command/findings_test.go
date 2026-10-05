// The findings over the commands the shared table names, each by its rule,
// and the refusal text they make.
// [[spec/tickets/cage-command-rules-port]]
package command

import (
	"reflect"
	"strings"
	"testing"
)

// The words a name holds in the cases. [[spec/tickets/cage-command-rules-port]]
const caseWords = 5

func rulesOf(rows []Row) []string {
	var out []string
	for _, one := range rows {
		out = append(out, one.Rule)
	}
	return out
}

func TestFindingsAnswerTheSharedCases(t *testing.T) {
	scripts := map[string]string{".se/w.sh": "echo x > spec/y.md"}
	it := It{Script: func(path string) string { return scripts[path] }}
	for _, one := range []struct {
		command string
		want    []string
	}{
		{"echo hi > spec/notes.md", []string{ShellWrites}},
		{"echo hi >> src/a.js", []string{ShellWrites}},
		{"echo hi > /tmp/x.md", nil},
		{"echo hi | tee README.md", []string{ShellWrites}},
		{"sed -i s/a/b/ src/a.go", nil},
		{"cp /tmp/x.md spec/x.md", []string{ShellWrites}},
		{"python3 - <<EOF\nopen('spec/x.md', 'w').write('x')\nEOF", []string{ShellWrites}},
		{`node -e "require('fs').writeFileSync('src/a.js', 'x')"`, []string{ShellWrites}},
		{"F=spec/a.md; echo x > $F", []string{ShellWrites}},
		{"sh .se/w.sh", []string{ShellWrites}},
		{`./RUNME.sh check; ./RUNME.sh commit "a-ticket: x"`, []string{LandingGate}},
		{"./RUNME.sh check || ./RUNME.sh ticket pull", []string{LandingGate}},
		{"git status; ./RUNME.sh ticket pull", nil},
		{"./RUNME.sh check && ./RUNME.sh ticket pull", nil},
		{"git add .", []string{GitWrite}},
		{"git stash", []string{GitWrite}},
		{"git mv spec/tickets/a.md spec/tickets/b.md", []string{TicketRename}},
		{"git log --oneline -3", nil},
		{"git checkout -b one-two-three-four-five-six", []string{BranchCap}},
		{"git checkout -b one-two", nil},
		{"node --test", []string{TestRun}},
		{"node --test test/a.test.js", nil},
		{"npm test", []string{TestRun}},
		{"git add .se/notes/x.md", []string{PrivateHome, GitWrite}},
		{"git commit", []string{CommitMessage, GitWrite}},
		{`git commit -m "a-ticket: x"`, []string{GitWrite}},
	} {
		if got := rulesOf(Findings(one.command, caseWords, it)); !reflect.DeepEqual(got, one.want) {
			t.Errorf("Findings(%q) name %v, want %v", one.command, got, one.want)
		}
	}
}

func TestTheCloudRefusesAHookSkipped(t *testing.T) {
	if got := rulesOf(Findings("git commit --no-verify -m x", caseWords, It{Cloud: true})); !reflect.DeepEqual(got, []string{CommitDoor, GitWrite}) {
		t.Fatalf("a cloud commit past the hook names %v", got)
	}
	if got := rulesOf(Findings("git commit --no-verify -m x", caseWords, It{})); !reflect.DeepEqual(got, []string{GitWrite}) {
		t.Fatalf("a desk commit past the hook names %v", got)
	}
}

func TestAnUndoOverAPullCommitNamesTheTakeBack(t *testing.T) {
	it := It{
		Script:   func(path string) string { return map[string]string{"spec/tickets/a-ticket.md": "x"}[path] },
		Subjects: func(Undo) []string { return []string{"a-ticket: passes design/draft"} },
	}
	found := Findings("git revert abc", caseWords, it)
	if len(found) == 0 || found[0].Rule != PullCommitStand || !strings.Contains(found[0].Message, "./RUNME.sh ticket pull a-ticket --back design/draft") {
		t.Fatalf("the revert finds %+v, and wants the take-back verb named", found)
	}
}

func TestTheFreeVerbsNameNoTicket(t *testing.T) {
	for _, one := range []struct {
		command string
		want    bool
	}{
		{"./RUNME.sh ticket pull", true},
		{"cd /tree && ./RUNME.sh branch take 2>&1 | tail -20", true},
		{"ls", false},
		{"./RUNME.sh ticket pull; ls", true},
		{"./RUNME.sh commit x", false},
	} {
		if got := FreeOfTicket(one.command); got != one.want {
			t.Errorf("FreeOfTicket(%q) reads %v, want %v", one.command, got, one.want)
		}
	}
}

func TestTheGuardsReadTheBlessAndTheVersions(t *testing.T) {
	if said := BlessGuard("export SE_CLOUD=1", nil); !strings.HasPrefix(said, "SE_CLOUD name the hand") {
		t.Fatalf("the bless guard says %q", said)
	}
	if said := BlessGuard("SE_MINTED=x ./RUNME.sh ticket pull x", nil); !strings.HasPrefix(said, "SE_MINTED name the hand") {
		t.Fatalf("the bless guard says %q over SE_MINTED", said)
	}
	if said := BlessGuard("ls", nil); said != "" {
		t.Fatalf("the bless guard says %q over a read", said)
	}
	if said := VersionGuard("git push origin :v3"); !strings.HasPrefix(said, "v3 is a version branch, and this command would delete it.") {
		t.Fatalf("the version guard says %q", said)
	}
	if said := VersionGuard("git push origin v3"); said != "" {
		t.Fatalf("the version guard says %q over a plain push", said)
	}
}

func TestARefusalNamesEveryRule(t *testing.T) {
	said := RefusedCommand("x", []Row{{Rule: "A", Said: "a", Message: "m"}, {Rule: "B", Message: "n"}, {Rule: "A", Message: "o"}})
	want := "Level zero refuses this command.\n\n  ran: x\n\n  A\n    reads: a\n    m\n\n  B\n    n\n\n  A\n    o\n\nHold A and B for the rest of this turn."
	if said != want {
		t.Fatalf("the refusal reads\n%s\nwant\n%s", said, want)
	}
}
