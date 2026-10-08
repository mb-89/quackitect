// The retro's reader verb over a seeded chapter: every owner prompt, fault and
// command, each with its file and line.
// [[spec/tickets/the-retro-finishes-its-asks]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"fmt"
	"path/filepath"
	"reflect"
	"regexp"
	"slices"
	"sort"
	"strings"
	"testing"

	"quackitect/src/modules/check"
	verbsmodule "quackitect/src/modules/verbs"
)

// The time every line of the reader's input carries. [[spec/tickets/the-retro-finishes-its-asks]]
const retroReaderWhen = "2026-09-19T08:10:00.000Z"

// A transcript line of the given type, its content raw JSON. [[spec/tickets/the-retro-finishes-its-asks]]
func retroReaderSaid(kind, content string) string {
	return fmt.Sprintf(`{"type":%q,"timestamp":%q,"message":{"role":%q,"content":%s}}`, kind, retroReaderWhen, kind, content)
}

// The reader's tree: a transcript, a helper's transcript, a log, and the chapter holding their lines. [[spec/tickets/the-retro-finishes-its-asks]]
func retroReaderTree(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	retroReadingLay(t, root, retroReadingName, map[string]string{
		"input/transcripts/one/a.jsonl": retroReaderSaid("user", `"fix the land verb"`) + "\n" +
			retroReaderSaid("assistant", `[{"type":"tool_use","name":"Bash","input":{"command":"./RUNME.sh check"}}]`) + "\n" +
			retroReaderSaid("user", `[{"type":"tool_result","is_error":true,"content":"the check answers red"}]`) + "\n" +
			retroReaderSaid("assistant", `[{"type":"text","text":"a reply"}]`) + "\n" +
			retroReaderSaid("user", `[{"type":"text","text":"a prompt past the chapter"}]`),
		"input/transcripts/one/a/subagents/b.jsonl": retroReaderSaid("user", `"a helper's prompt"`),
		"input/log/session.jsonl": fmt.Sprintf(`{"at":%q,"level":"info","msg":"a quiet line"}`, retroReaderWhen) + "\n" +
			fmt.Sprintf(`{"at":%q,"level":"error","msg":"the door refuses"}`, retroReaderWhen),
		"chapters/c1.json": `{"id":"c1","lines":{` +
			`"transcripts/one/a.jsonl":[[1,4]],` +
			`"transcripts/one/a/subagents/b.jsonl":[[1,1]],` +
			`"log/session.jsonl":[[1,2]]}}`,
	})
	return root
}

// retro read prints every owner prompt, fault and command of the chapter with its file and line, in the chapter's order. [[spec/tickets/the-retro-finishes-its-asks]]
func TestRetroReadPrintsEveryOwnerPromptFaultAndCommandOfTheChapterWithItsFileAndLine(t *testing.T) {
	t.Parallel()
	root := retroReaderTree(t)

	code, out, errs := retroReadingRun(retroReadVerb, root, "retro", "read", retroReadingName, "c1")

	want := "transcripts/one/a.jsonl:1  prompt  fix the land verb\n" +
		"transcripts/one/a.jsonl:2  command  ./RUNME.sh check\n" +
		"transcripts/one/a.jsonl:3  fault  the check answers red\n" +
		"log/session.jsonl:2  fault  the door refuses\n"
	if code != 0 || out != want {
		t.Fatalf("read answers %d, %q, %q, want %q", code, out, errs, want)
	}
}

// retro read refuses a chapter the retro holds nowhere. [[spec/tickets/the-retro-finishes-its-asks]]
func TestRetroReadRefusesAChapterTheRetroHoldsNowhere(t *testing.T) {
	t.Parallel()
	root := retroReaderTree(t)

	code, _, errs := retroReadingRun(retroReadVerb, root, "retro", "read", retroReadingName, "c9")

	want := "retro read names a chapter the retro holds, and c9 stands nowhere under chapters.\n" +
		"  ./RUNME.sh retro read <retro> <chapter>\n"
	if code != 2 || errs != want {
		t.Fatalf("read answers %d, %q, want 2, %q", code, errs, want)
	}
}

// retro read counts a prompt the owner queues mid-turn and lists a refusal that carries no error mark; the queue's own line and a task's queued line earn none. [[spec/tickets/retro-read-reads-every-record]]
// level0: FixtureOutsideHome - the case lays a retro's records into a tree of its own
func TestRetroReadCountsAQueuedOwnerPromptAndListsAQuietRefusal(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	retroReadingLay(t, root, retroReadingName, map[string]string{
		"input/transcripts/one/a.jsonl": fmt.Sprintf(`{"type":"queue-operation","operation":"enqueue","timestamp":%q,"content":"stop and land it"}`, retroReaderWhen) + "\n" +
			fmt.Sprintf(`{"type":"attachment","timestamp":%q,"attachment":{"type":"queued_command","prompt":"stop and land it","origin":{"kind":"human"}}}`, retroReaderWhen) + "\n" +
			fmt.Sprintf(`{"type":"attachment","timestamp":%q,"attachment":{"type":"queued_command","prompt":"a task ends","origin":{"kind":"task-notification"}}}`, retroReaderWhen) + "\n" +
			retroReaderSaid("user", `[{"type":"tool_result","content":"refused\n  the leaf holds no hand"}]`) + "\n" +
			retroReaderSaid("user", `[{"type":"tool_result","content":"the leaf passes"}]`),
		"chapters/c1.json": `{"id":"c1","lines":{"transcripts/one/a.jsonl":[[1,5]]}}`,
	})

	code, out, errs := retroReadingRun(retroReadVerb, root, "retro", "read", retroReadingName, "c1")

	want := "transcripts/one/a.jsonl:2  prompt  stop and land it\n" +
		"transcripts/one/a.jsonl:4  refusal  the leaf holds no hand\n"
	if code != 0 || out != want {
		t.Fatalf("read answers %d, %q, %q, want %q", code, out, errs, want)
	}
}

// The reader marks a fault the way the timeline counts it, and a line of no JSON or a blank prompt earns no row. A queued prompt naming no origin earns a prompt row unless marked meta, and a helper's earns none. [[spec/tickets/the-retro-finishes-its-asks]] [[spec/tickets/retro-read-reads-every-record]]
func TestRetroReadCountsAQueuedPromptOfNoOriginAndNoneOfAHelper(t *testing.T) {
	t.Parallel()
	warn := fmt.Sprintf(`{"at":%q,"level":"warn","msg":"a slow door"}`, retroReaderWhen)
	bare := fmt.Sprintf(`{"type":"attachment","timestamp":%q,"attachment":{"type":"queued_command","prompt":"land it"}}`, retroReaderWhen)
	meta := fmt.Sprintf(`{"type":"attachment","isMeta":true,"timestamp":%q,"attachment":{"type":"queued_command","prompt":"land it"}}`, retroReaderWhen)
	human := fmt.Sprintf(`{"type":"attachment","timestamp":%q,"attachment":{"type":"queued_command","prompt":"land it","origin":{"kind":"human"}}}`, retroReaderWhen)
	for _, one := range []struct {
		path, line string
		want       []retroRow
	}{
		{"log/session.jsonl", warn, []retroRow{{kind: "fault", text: "a slow door"}}},
		{"log/session.jsonl", "not json", nil},
		{"transcripts/one/a.jsonl", retroReaderSaid("user", `"   "`), nil},
		{"transcripts/one/a.jsonl", bare, []retroRow{{kind: "prompt", text: "land it"}}},
		{"transcripts/one/a.jsonl", meta, nil},
		{"transcripts/one/a/subagents/b.jsonl", human, nil},
	} {
		if got := retroRowsOf(one.path, one.line); !reflect.DeepEqual(got, one.want) && (len(got) != 0 || len(one.want) != 0) {
			t.Fatalf("%s earns %v under %s, and wants %v", one.line, got, one.path, one.want)
		}
	}
	if !retroFault.MatchString(warn) {
		t.Fatal("a warn line reads as no fault")
	}
}

// A findings file reads a section per row, and a missing section reads nil, whatever line ending a Windows editor writes. [[spec/guidance/retro/read]]
func TestRetroFindingsReadASectionPerRowAndAMissingSectionReadsNil(t *testing.T) {
	t.Parallel()
	for _, end := range []string{"\n", "\r\n"} {
		read := retroFindingsOf(strings.ReplaceAll("## stop\n\n- the panel waits for a file\n\n## keep\n", "\n", end))
		if !reflect.DeepEqual(read["stop"], []string{"the panel waits for a file"}) {
			t.Fatalf("stop reads %q", read["stop"])
		}
		if read["keep"] == nil || len(read["keep"]) != 0 || read["more"] != nil {
			t.Fatalf("keep reads %#v and more %#v, want an empty row and nil", read["keep"], read["more"])
		}
	}
}

// A tree registering foo and bar, an example showing foo alone, and a test beside each verb file: bar stands unshown, and TestFooLands beside a shown verb. [[spec/guidance/retro/audit]]
func TestRetroGapsNamesEachUnshownVerbAndEachTestBesideAShownOne(t *testing.T) {
	t.Parallel()
	texts := check.Texts{
		"src/quack/foo.go":             "package main\n\nfunc init() { register(\"foo\", nil) }\n",
		"src/quack/foo_test.go":        "package main\n\nfunc TestFooLands(t *testing.T) {}\n",
		"src/quack/bar.go":             "package main\n\nfunc init() { register(\"bar\", nil) }\n",
		"src/quack/bar_test.go":        "package main\n\nfunc TestBarLands(t *testing.T) {}\n",
		"spec/examples/110_foo/foo.md": "---\nkind: [[example]]\ntitle: A foo lands\nkeywords: [\"foo\"]\ninterface: [\"foo\"]\n---\n\nA hand runs foo.\n\n```sh\n./RUNME.sh foo\n# expect: exit 0\n```\n",
	}
	code, out, _ := retroMintHeard(retroGapsVerb(func() *check.Tree { return check.TreeOver("", texts) }), "retro", "gaps")
	for _, part := range []string{"1 feature(s) stand with no example", "./RUNME.sh bar  src/quack/bar.go:3", "1 test(s) stand beside a verb an example shows", "src/quack/foo_test.go TestFooLands"} {
		if code != 0 || !strings.Contains(out, part) || strings.Contains(out, "./RUNME.sh foo ") || strings.Contains(out, "TestBarLands") {
			t.Fatalf("retro gaps answers %d and says no %q, or names foo or TestBarLands:\n%s", code, part, out)
		}
	}
}

// The usage prints one line a verb, audit among them, each name as RetroVerbs lists it. [[spec/tickets/retro-usage-names-every-verb]]
func TestRetroUsageNamesEveryVerb(t *testing.T) {
	t.Parallel()
	code, out, _ := retroMintHeard(retroUsageVerb(), "retro")
	if code != 0 {
		t.Fatalf("the bare retro answers %d", code)
	}
	named := []string{}
	for _, line := range strings.Split(out, "\n") {
		if found := regexp.MustCompile(`^ {2}(\S+)`).FindStringSubmatch(line); found != nil {
			named = append(named, found[1])
		}
	}
	want := []string{}
	for _, one := range verbsmodule.RetroVerbs {
		want = append(want, one.Name)
	}
	slices.Sort(named)
	slices.Sort(want)
	if !slices.Equal(named, want) {
		t.Fatalf("the usage names %v, want %v", named, want)
	}
}

// A word no verb answers prints the usage, and exits 2. [[spec/tickets/retro-usage-names-every-verb]]
func TestRetroUsageExitsTwoOnAWordNoVerbAnswers(t *testing.T) {
	t.Parallel()
	code, out, _ := retroMintHeard(retroUsageVerb(), "retro", "nothing")
	want := "Usage: ./RUNME.sh retro <verb>\n\n" +
		"  notes            the private notes still open on this box, and 0 when none stands\n" +
		"  audit            the experiments still open, and 0 once each stands decided\n" +
		"  gaps             each verb no example shows, and each test beside a verb an example shows\n" +
		"  collect <ticket> copies this box into the retro's folder, and writes its manifest; --again merges what arrived since\n" +
		"  new              mints a retro off its route, opens it, and hands out its first leaf\n" +
		"  timeline <retro> the hours holding work, per source, with the idle stretches between\n" +
		"  chapters <retro> checks the cuts, and hands every chapter its lines\n" +
		"  read <retro> <chapter>  every owner prompt, fault, refusal and command of the chapter, with its file and line\n" +
		"  matrix <retro>   draws the report: the class fixes first, then the matrix\n" +
		"  effect <retro>   counts the last retro's class patterns over this input\n" +
		"  classes <retro>  counts each class's rate, and refuses a finding with no disposition\n" +
		"  backlog <retro>  every prose criterion the window closes, and 0 once each holds a verdict\n" +
		"  mint <retro>     mints one ticket a class standing open, and opens each draft\n" +
		"  score            the improvements earlier retros mint, and how many stay open\n"
	if code != 2 || out != want {
		t.Fatalf("retro nothing answers %d and prints %q", code, out)
	}
}

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
	root := "/tree"
	disk := newFakeDisk()
	home := retroHome(root, retroBacklogName)
	files := map[string]string{"collected.json": `{"at":"2026-09-20T00:00:00.000Z","since":"2026-09-10T00:00:00.000Z"}`}
	if verdicts != "" {
		files["backlog.json"] = verdicts
	}
	for name, text := range files {
		hq2Seed(t, disk, filepath.Join(home, name), text)
	}
	doors := retroBacklogDoors{root: root, disk: disk, git: retroBacklogTrunk().run}
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
