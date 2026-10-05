// The retro's backlog read: every prose criterion a ticket the window closes
// carries, printed for a verdict, and the verb green once each holds one.
// [[spec/tickets/the-retro-reads-the-backlog]]
package main

import (
	"os"
	"path/filepath"
	"reflect"
	"regexp"
	"sort"
	"strings"
	"testing"
)

// The retro the backlog reads, a prose criterion and one naming a command. [[spec/tickets/the-retro-reads-the-backlog]]
const (
	retroBacklogName    = "retro-a1b2c3"
	retroBacklogProse   = "the owner reads the queue in one glance"
	retroBacklogCommand = "`./RUNME.sh check` exits 0"
)

// A ticket in a state, with more front lines and the bullets of its ask. [[spec/tickets/the-retro-reads-the-backlog]]
func retroBacklogTicket(state string, front []string, ask []string) string {
	rows := append([]string{"---", "kind: [[ticket]]", "state: " + state}, front...)
	rows = append(rows, "---", "", "# Ask", "", "The queue reads at a glance.", "")
	for _, one := range ask {
		rows = append(rows, "- "+one)
	}
	rows = append(rows, "", "# do", "", "- a line outside the ask", "")
	return strings.Join(rows, "\n")
}

// The trunk every case reads: a close before the window, a backlog ticket, a group's member and a group. [[spec/tickets/the-retro-reads-the-backlog]]
func retroBacklogTrunk() *retroTrunk {
	both := []string{retroBacklogProse, retroBacklogCommand}
	return retroFakeTrunk(
		retroCommit{sha: "old1", at: "2026-09-05T09:00:00+00:00", trunk: true, changes: map[string]string{retroTicketPath("an-old-one"): retroBacklogTicket("closed", nil, []string{"an old criterion"})}},
		retroCommit{sha: "c1", at: "2026-09-12T09:00:00+00:00", trunk: true, changes: map[string]string{retroTicketPath("a-backlog-one"): retroBacklogTicket("closed", nil, both)}},
		retroCommit{sha: "c2", at: "2026-09-13T09:00:00+00:00", trunk: true, changes: map[string]string{retroTicketPath("a-member"): retroBacklogTicket("closed", []string{"group: a-group"}, []string{"a member's criterion"})}},
		retroCommit{sha: "c3", at: "2026-09-14T09:00:00+00:00", trunk: true, changes: map[string]string{retroTicketPath("a-group"): retroBacklogTicket("closed", []string{"process: [[spec/processes/group]]"}, []string{"a group's criterion"})}},
	)
}

// Runs retro backlog over a tree holding the retro's record and the verdicts given, and answers its code and everything it says. [[spec/tickets/the-retro-reads-the-backlog]]
func retroRunBacklog(t *testing.T, verdicts string) (int, string) {
	t.Helper()
	root := t.TempDir()
	home := retroHome(root, retroBacklogName)
	if err := os.MkdirAll(home, 0o755); err != nil {
		t.Fatal(err)
	}
	files := map[string]string{"collected.json": `{"at":"2026-09-20T00:00:00.000Z","since":"2026-09-10T00:00:00.000Z"}`}
	if verdicts != "" {
		files["backlog.json"] = verdicts
	}
	for name, text := range files {
		if err := os.WriteFile(filepath.Join(home, name), []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	doors := retroBacklogDoors{root: root, git: retroBacklogTrunk().run}
	var said strings.Builder
	code := retroBacklogVerb(func() retroBacklogDoors { return doors })([]string{"retro", "backlog", retroBacklogName}, false, &said, &said)
	return code, said.String()
}

// [[spec/tickets/the-retro-reads-the-backlog]]
func TestRetroBacklogPrintsEachProseCriterionOfABacklogTicketTheWindowCloses(t *testing.T) {
	t.Parallel()
	_, said := retroRunBacklog(t, "")

	if !regexp.MustCompile(`a-backlog-one {2}` + regexp.QuoteMeta(retroBacklogProse)).MatchString(said) {
		t.Fatalf("backlog says %q", said)
	}
	if strings.Contains(said, "an old criterion") {
		t.Fatal("a close before the window stays out")
	}
	if strings.Contains(said, "a line outside the ask") {
		t.Fatal("a line outside the ask stays out")
	}
}

// [[spec/tickets/the-retro-reads-the-backlog]]
func TestRetroBacklogAnswersOneWhileACriterionHoldsNoVerdictAndZeroOnceEachDoes(t *testing.T) {
	t.Parallel()
	if code, said := retroRunBacklog(t, ""); code != 1 {
		t.Fatalf("backlog with no verdict answers %d: %s", code, said)
	}
	if code, _ := retroRunBacklog(t, `{"a-backlog-one":{"`+retroBacklogProse+`":"holds"}}`); code != 1 {
		t.Fatalf("a verdict with no reason stands short, and backlog answers %d", code)
	}
	for _, verdict := range []string{"holds: the queue view shows it", "falls short: the view scrolls"} {
		if code, said := retroRunBacklog(t, `{"a-backlog-one":{"`+retroBacklogProse+`":"`+verdict+`"}}`); code != 0 {
			t.Fatalf("%s: backlog answers %d: %s", verdict, code, said)
		}
	}
}

// [[spec/tickets/the-retro-reads-the-backlog]]
func TestRetroBacklogLeavesAGroupsTicketAndACriterionNamingACommandOut(t *testing.T) {
	t.Parallel()
	_, said := retroRunBacklog(t, "")

	if !strings.Contains(said, retroBacklogProse) {
		t.Fatalf("backlog prints the prose criterion: %q", said)
	}
	for _, out := range []string{"a member's criterion", "a group's criterion", "RUNME.sh check"} {
		if strings.Contains(said, out) {
			t.Fatalf("%s stays out: %q", out, said)
		}
	}
}

// [[spec/tickets/the-retro-reads-the-backlog]]
func TestRetroBacklogProseCriterionIsAnAskBulletNamingNoCommandUnderEitherMark(t *testing.T) {
	t.Parallel()
	text := strings.Replace(retroBacklogTicket("closed", nil, []string{retroBacklogProse, retroBacklogCommand}), "- "+retroBacklogProse, "* "+retroBacklogProse, 1)

	if got := retroCriteriaOf(text); !reflect.DeepEqual(got, []string{retroBacklogProse}) {
		t.Fatalf("the criteria read %q", got)
	}
	if got := retroCriteriaOf("---\nstate: closed\n---\n\n# Ask\n\nProse alone.\n"); len(got) != 0 {
		t.Fatalf("an ask with no bullet reads %q", got)
	}
}

// [[spec/tickets/the-retro-reads-the-backlog]]
func TestRetroBacklogClosedInAnswersEveryTicketTrunkClosesInsideTheWindowWithItsCommit(t *testing.T) {
	t.Parallel()
	closed := retroClosedIn(retroBacklogTrunk().run, retroWhen("2026-09-10T00:00:00Z"))

	if !closed.ok {
		t.Fatalf("closedIn answers %q", closed.err)
	}
	names := []string{}
	sha := ""
	for _, one := range closed.landings {
		names = append(names, one.name)
		if one.name == "a-backlog-one" {
			sha = one.sha
		}
	}
	sort.Strings(names)
	if !reflect.DeepEqual(names, []string{"a-backlog-one", "a-group", "a-member"}) {
		t.Fatalf("the window closes %v", names)
	}
	if sha != "c1" {
		t.Fatalf("a-backlog-one lands at %q", sha)
	}
}
