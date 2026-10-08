// The probe verb over fake doors: the compaction probe's reading and its run,
// the dry and smoke roads run in Go, and the usage.
// [[spec/tickets/box-verbs-port-to-go]] [[spec/tickets/probes-leave-node]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"errors"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"quackitect/src/modules/hooks"
)

// A row of the session log, as rowOf in the level0 lib writes one. [[spec/tickets/box-verbs-port-to-go]]
func probeRowOf(level, kind, said string, more map[string]any) probeRow {
	row := probeRow{"at": "2026-09-12T08:00:00.000Z", "level": level, "kind": kind, "said": said}
	for key, value := range more {
		row[key] = value
	}
	return row
}

// The rows as the log's text, one JSON line a row. [[spec/tickets/box-verbs-port-to-go]]
func logText(rows ...probeRow) string {
	var said strings.Builder
	for _, one := range rows {
		line, _ := json.Marshal(one)
		said.Write(append(line, '\n'))
	}
	return said.String()
}

// Writes the text as the session log under the root, through the disk door. [[spec/tickets/test-walks-move-onto-fakes]]
func writeLog(t *testing.T, disk diskDoors, root, text string) {
	t.Helper()
	hq2Seed(t, disk, filepath.Join(root, filepath.FromSlash(sessionLog)), text)
}

// Hands the client's runs to the answer, the runner recording each run first. [[spec/tickets/box-verbs-port-to-go]]
func clientAnswers(d *boxDoors, answer func(argv []string, o runOpts) ranResult) {
	inner := d.run
	d.run = func(argv []string, o runOpts) ranResult {
		said := inner(argv, o)
		if filepath.Base(argv[0]) == "claude" {
			return answer(argv, o)
		}
		return said
	}
}

func compactContext(reason string) probeRow {
	return probeRowOf("info", "context", "5 block(s) reach the session", map[string]any{"detail": "level0-canary", "reason": reason})
}

func compactRun() probeRow {
	return probeRowOf("info", "compact", "a compaction runs", map[string]any{"trigger": "manual", "messages": 3})
}

func compactHeard(said string) probeRow {
	row := coldHeard(said)
	row["detail"] = ""
	return row
}

func TestTheCompactionReadsEveryRoad(t *testing.T) {
	t.Parallel()
	cases := []struct {
		name   string
		rows   []probeRow
		answer string
		reads  int
		why    string
	}{
		{"two reads and a whole canary survive", []probeRow{compactContext("first"), compactHeard(heardSame), compactRun(), compactContext("re-read"), compactHeard(heardSame)}, probeSurvives, 2, heardSame},
		{"other numbers after the compaction drop", []probeRow{compactContext("first"), compactHeard(heardSame), compactRun(), compactContext("re-read"), compactHeard(heardOther)}, probeDrops, 2, heardOther},
		{"the first read's canary counts for no second read", []probeRow{compactContext("first"), compactHeard(heardSame), compactRun()}, probeDrops, 1, "second time"},
		{"a re-read carrying no canary drops", []probeRow{compactContext("first"), compactRun(), compactContext("re-read")}, probeDrops, 2, "carries a canary"},
		{"no compaction leaves the road unproven", []probeRow{compactContext("first"), compactHeard(heardSame)}, probeUnproven, 1, "unproven"},
		{"a refused compaction at warn leaves the road unproven", []probeRow{compactContext("first"), probeRowOf("warn", "compact", "the command road refuses a compaction", map[string]any{"detail": "no such command"})}, probeUnproven, 1, "unproven"},
		{"an empty log names no read", nil, probeUnproven, 0, "unproven"},
		// The repeat saying lands only once the line stands paid, so the first saying after a compaction still decides. [[spec/tickets/callers-name-both-readers]]
		{"a repeat after the paying line still survives", []probeRow{compactContext("first"), compactHeard(heardSame), compactRun(), compactContext("re-read"), compactHeard(heardSame), compactHeard(heardAgain)}, probeSurvives, 2, heardSame},
	}
	for _, one := range cases {
		read := readsCompaction(one.rows)
		if read.answer != one.answer || read.reads != one.reads || !strings.Contains(read.why, one.why) {
			t.Errorf("%s: reads %+v", one.name, read)
		}
	}
}

func TestTheCompactProbeRunsTheClientAndPrintsTheRowsItReads(t *testing.T) {
	t.Parallel()
	d, runner, out, errs := fakeBoxDoors(t)
	clientAnswers(&d, func([]string, runOpts) ranResult {
		writeLog(t, d.disk, d.root, logText(compactContext("first"), compactHeard(heardSame), compactRun(), compactContext("re-read"), compactHeard(heardSame)))
		return ranResult{code: 3}
	})
	if code := probeVerb(d, []string{"compact"}); code != 0 {
		t.Fatalf("the probe answers %d\n%s%s", code, out, errs)
	}
	argv, o := runner.ran[0], runner.opts[0]
	if !slices.Equal(argv, []string{"claude", "-p", compactOpens, "--plugin-dir", filepath.Join(d.root, ".claude", "skills", "level0")}) {
		t.Errorf("the client runs as %v", argv)
	}
	if o.cwd != d.root || o.env[compactVariable] != "1" || o.timeout != probeWait {
		t.Errorf("the client runs under %+v", o)
	}
	want := "  context  first 5 block(s) reach the session\n  compact  manual a compaction runs\n  context  re-read 5 block(s) reach the session\n\nsurvives: " + heardSame + "\nThe layer reaches the session 2 time(s).\n"
	if out.String() != want {
		t.Errorf("the probe prints\n%s", out)
	}
	if errs.String() != "The client answers 3.\n" {
		t.Errorf("the probe says %q", errs)
	}
}

func TestTheCompactProbeAnswersOneWhereTheLayerDropsOrNoClientStands(t *testing.T) {
	t.Parallel()
	d, _, _, _ := fakeBoxDoors(t)
	clientAnswers(&d, func([]string, runOpts) ranResult {
		writeLog(t, d.disk, d.root, logText(compactContext("first"), compactRun()))
		return ranResult{}
	})
	if code := probeVerb(d, []string{"compact"}); code != 1 {
		t.Errorf("a dropped layer answers %d", code)
	}
	for _, word := range []string{"compact", "reply"} {
		gone, _, _, errs := fakeBoxDoors(t)
		clientAnswers(&gone, func([]string, runOpts) ranResult { return ranResult{code: 1, missing: true} })
		if code := probeVerb(gone, []string{word}); code != 1 || !strings.Contains(errs.String(), "claude stands nowhere") {
			t.Errorf("a missing client under %s answers %d: %s", word, code, errs)
		}
	}
}

// The client stands where the survey finds it. [[spec/design_output/tools#where-a-caller-looks]]
func TestTheProbeRunsTheClientTheSurveyNames(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t, "claude")
	at := filepath.Join(d.env("PATH"), "claude")
	hq2Seed(t, d.disk, filepath.Join(d.root, filepath.FromSlash(toolsFile)), `{"claude":{"path":`+jsonString(at)+`}}`)
	hq2Seed(t, d.disk, at, "")
	probeVerb(d, []string{"compact"})
	if runner.ran[0][0] != at {
		t.Errorf("the probe runs %s", runner.ran[0][0])
	}
}

// The dry road with the working change reads the diff, then clones, and starts no node. [[spec/tickets/probes-leave-node]]
func TestTheDryProbeRunsItsRoadInGo(t *testing.T) {
	t.Parallel()
	for road, clone := range map[string]string{"dry": "git clone --quiet --no-hardlinks ", "smoke": "git clone --quiet --shared "} {
		d, runner, _, _ := fakeBoxDoors(t)
		probeVerb(d, []string{road, "--working"})
		ran := ranWords(runner)
		if len(ran) < 2 || ran[0] != "git diff HEAD --binary --no-renames" || !strings.HasPrefix(ran[1], clone) {
			t.Errorf("the %s road runs %v", road, ran)
		}
		for _, one := range runner.ran {
			if filepath.Base(one[0]) == "node" {
				t.Errorf("the %s road starts node: %v", road, one)
			}
		}
	}
}

// The dry road at a revision resolves it to a commit, and checks the clone out there. [[spec/tickets/probe-at-revision-guards-merges]]
func TestTheDryProbeRunsAtARevision(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t)
	runner.answers["git rev-parse"] = ranResult{stdout: "abc123\n"}
	probeVerb(d, []string{"dry", "--at", "HEAD~1"})
	if len(runner.ran) < 2 || !slices.Equal(runner.ran[0][1:], []string{"rev-parse", "--verify", "--quiet", "HEAD~1^{commit}"}) {
		t.Fatalf("the dry road runs %v", runner.ran)
	}
	if !slices.Contains(ranWords(runner), "git checkout --quiet --detach abc123") {
		t.Errorf("the clone never checks out the commit: %v", ranWords(runner))
	}
}

// A revision git cannot resolve stops the road before node starts. The smoke stands on the tree as it is, so it takes no revision, and neither does the working change. [[spec/tickets/probe-at-revision-guards-merges]] [[spec/tickets/probe-at-stays-dry]]
func TestTheDryProbeRefusesARevisionGitCannotResolve(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		argv       []string
		code, runs int
		says       string
	}{
		{[]string{"dry", "--at", "nowhere"}, exitFailed, 1, "nowhere"},
		{[]string{"smoke", "--at", "HEAD~1"}, exitUsage, 0, "dry road alone"},
		{[]string{"dry", "--working", "--at", "HEAD~1"}, exitUsage, 0, "--working"},
	} {
		d, runner, _, errs := fakeBoxDoors(t)
		runner.answers["git rev-parse"] = ranResult{code: 1}
		if code := probeVerb(d, one.argv); code != one.code || len(runner.ran) != one.runs || !strings.Contains(errs.String(), one.says) {
			t.Errorf("%v answers %d, runs %v, says %q", one.argv, code, runner.ran, errs)
		}
	}
}

func TestAnUnknownWordPrintsTheUsage(t *testing.T) {
	t.Parallel()
	for _, argv := range [][]string{nil, {"nothing"}} {
		d, runner, out, errs := fakeBoxDoors(t)
		if code := probeVerb(d, argv); code != exitUsage {
			t.Errorf("%v answers %d", argv, code)
		}
		if errs.String() != probeUsage+"\n" || out.Len() != 0 || len(runner.ran) != 0 {
			t.Errorf("%v says %q and runs %v", argv, errs, runner.ran)
		}
	}
}

// Two writers appending at once tear one line, and a probe reads the rest. [[spec/design_output/log#every-writer-appends]]
func TestATornLineDropsAloneAndAMissingLogReadsAsNoRow(t *testing.T) {
	t.Parallel()
	root, disk := "/tree", newFakeDisk()
	writeLog(t, disk, root, logText(probeRowOf("info", "context", "read", nil))+"{\"at\":\"2026\n"+logText(probeRowOf("info", "compact", "ran", nil)))
	rows := probeRows(disk, filepath.Join(root, filepath.FromSlash(sessionLog)))
	if len(rows) != 2 || rows[0].text("kind") != "context" || rows[1].text("kind") != "compact" {
		t.Errorf("the rows read %v", rows)
	}
	if got := probeRows(disk, filepath.Join(root, "gone")); len(got) != 0 {
		t.Errorf("a missing log reads %v", got)
	}
}

// The row the bridgehead writes for the first call after a marked prompt. [[spec/tickets/the-reply-probe-runs]]
func replyCalled(fields string) probeRow {
	return probeRowOf("info", "bridge", replyEvent, map[string]any{"detail": fields})
}

func replyFields(pairs ...string) string {
	said := map[string]string{}
	for i := 0; i+1 < len(pairs); i += 2 {
		said[pairs[i]] = pairs[i+1]
	}
	text, _ := json.Marshal(said)
	return string(text)
}

// The prompt asks for the line the door's probe names. [[spec/tickets/guidance-lib-leaves]]
func TestTheReplyPromptAsksForTheDoorsLine(t *testing.T) {
	t.Parallel()
	if !strings.HasPrefix(replyOpens, hooks.ReplyMarker+".") || !strings.Contains(replyOpens, "`"+hooks.ReplySays+"`") {
		t.Errorf("the prompt reads %q", replyOpens)
	}
}

func TestTheReplyReadsWhichFieldCarriesTheLine(t *testing.T) {
	t.Parallel()
	read := readsReply([]probeRow{replyCalled(`{"tool":"Read","text":"` + replySays + `."}`)}, "")
	if !slices.Equal(read.carries, []string{"text"}) || read.fields.values["tool"] != "Read" || !strings.Contains(read.why, "carries the message's text on text") {
		t.Errorf("the read reads %+v", read)
	}
	none := readsReply([]probeRow{replyCalled(replyFields("tool", "Read", "input", "README.md"))}, "")
	if len(none.carries) != 0 || none.why != "no field of the call carries the message's text" {
		t.Errorf("the read reads %+v", none)
	}
}

func TestTheReplyReadsWhetherTheAnswerQuotesTheWarning(t *testing.T) {
	t.Parallel()
	if !readsReply(nil, `"`+promptWhy+`, and nothing has answered it yet."`).warned {
		t.Error("the warning reads as no warning")
	}
	if readsReply(nil, `"`+replyMarker+`."`).warned {
		t.Error("the probe's own line reads as the warning")
	}
}

func TestTheReplyProbePrintsTheFieldsTheRunAdds(t *testing.T) {
	t.Parallel()
	d, runner, out, _ := fakeBoxDoors(t)
	writeLog(t, d.disk, d.root, logText(replyCalled(replyFields("tool", "Read", "old", "x"))))
	clientAnswers(&d, func([]string, runOpts) ranResult {
		writeLog(t, d.disk, d.root, logText(replyCalled(replyFields("tool", "Read", "old", "x")), replyCalled(`{"tool":"Read","text":"`+replySays+`"}`)))
		return ranResult{stdout: `"` + promptWhy + `, and nothing has answered it yet."`}
	})
	if code := probeVerb(d, []string{"reply"}); code != 0 {
		t.Fatalf("the reply probe answers %d\n%s", code, out)
	}
	want := "  tool         Read\n  text         " + replySays + "\n\nthe call carries the message's text on text.\nThe prompt reaches the session opening on the warning: yes.\n"
	if out.String() != want {
		t.Errorf("the probe prints\n%s", out)
	}
	if argv := runner.ran[0]; !slices.Equal(argv, []string{"claude", "-p", replyOpens, "--plugin-dir", filepath.Join(d.root, ".claude", "skills", "level0")}) || runner.opts[0].cwd != d.root {
		t.Errorf("the client runs as %v", argv)
	}
}

func TestTheReplyProbeAnswersOneWhereTheRunWritesNoRow(t *testing.T) {
	t.Parallel()
	d, _, out, errs := fakeBoxDoors(t)
	clientAnswers(&d, func([]string, runOpts) ranResult { return ranResult{code: 2} })
	if code := probeVerb(d, []string{"reply"}); code != 1 || !strings.Contains(out.String(), "loads no function hooks") || errs.String() != "The client answers 2.\n" {
		t.Errorf("no row answers %d\n%s%s", code, out, errs)
	}
}

const serveDoorText = `{"port":7001,"token":"t"}`

// What a fake box records: every run and its folder. [[spec/design_output/level0#a-desk-serve-returns]]
type serveBox struct {
	root  string
	disk  diskDoors
	ran   [][]string
	cwds  []string
	code  int
	said  string
	fault error
	door  string
	env   map[string]string
	self  string
}

func serveBoxAt(t *testing.T) *serveBox {
	t.Helper()
	return &serveBox{root: "/tree", disk: newFakeDisk(), door: serveDoorText}
}

func (box *serveBox) hooks() string {
	return filepath.Join(box.root, ".se", ".runtime", "hooks.json")
}

// Writes the hooks door's standing file, as the index does once its door listens. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func (box *serveBox) stands(t *testing.T, text string) {
	t.Helper()
	hq2Seed(t, box.disk, box.hooks(), text)
}

func (box *serveBox) runs(t *testing.T, argv ...string) (int, string, string) {
	t.Helper()
	doors := func() serveDoors {
		return serveDoors{
			root: box.root,
			disk: box.disk,
			run: func(argv []string, cwd string) (int, string, error) {
				box.ran = append(box.ran, argv)
				box.cwds = append(box.cwds, cwd)
				if box.fault != nil {
					return 0, "", box.fault
				}
				if box.code == 0 {
					box.stands(t, box.door)
				}
				return box.code, box.said, nil
			},
			env:  func(name string) string { return box.env[name] },
			self: box.self,
		}
	}
	var out, errs strings.Builder
	code := serveVerb(doors)(append([]string{"serve"}, argv...), false, &out, &errs)
	return code, out.String(), errs.String()
}

// The serve starts the index standing alone where no door stands, and takes no debugger. [[spec/design_output/level0#a-desk-serve-returns]]
func TestServeStartsTheIndexWhereNoDoorStands(t *testing.T) {
	t.Parallel()
	for _, argv := range [][]string{nil, {"--inspect"}} {
		box := serveBoxAt(t)
		code, out, _ := box.runs(t, argv...)
		if code != 0 || out != "The index starts at port 7001, because no door stood.\n" {
			t.Fatalf("code %d, out %q", code, out)
		}
		want := [][]string{{box.root + "/.se/.runtime/bin/se-index", "standing"}}
		if !slices.EqualFunc(box.ran, want, slices.Equal[[]string]) || box.cwds[0] != box.root {
			t.Errorf("ran %v in %v", box.ran, box.cwds)
		}
	}
}

// A door answering stands, and a door the start rewrites stands fresh, so the verb names the start. [[spec/design_output/level0#a-desk-serve-returns]]
func TestServeOverAStandingDoorSaysItAnswersAndOverAMovedOneSaysItStarts(t *testing.T) {
	t.Parallel()
	for door, want := range map[string]string{serveDoorText: "The index answers at port 7001.\n", `{"port":7000,"token":"old"}`: "The index starts at port 7001, because no door stood.\n"} {
		box := serveBoxAt(t)
		box.stands(t, door)
		if code, out, _ := box.runs(t); code != 0 || out != want {
			t.Fatalf("code %d, out %q", code, out)
		}
	}
}

// A door naming no number reads as port 0, as Number answers NaN and the JavaScript falls back. [[spec/design_output/level0#a-desk-serve-returns]]
func TestServeReadsAPortOfNoNumberAsZero(t *testing.T) {
	t.Parallel()
	for door, want := range map[string]string{
		`{"token":"t"}`:     "0",
		`not json`:          "0",
		`{"port":"7002"}`:   "7002",
		`{"port":"x"}`:      "0",
		`{"port":7001.5}`:   "7001.5",
		`{"port":null}`:     "0",
		`{"port":" 7003 "}`: "7003",
	} {
		box := serveBoxAt(t)
		box.door = door
		if _, out, _ := box.runs(t); out != "The index starts at port "+want+", because no door stood.\n" {
			t.Errorf("%s answers %q", door, out)
		}
	}
}

// The index falling names what it said, its exit where it says nothing, or the fault where no index runs, as node exits 1. [[spec/design_output/level0#a-desk-serve-returns]]
func TestServeWhoseIndexFallsNamesWhy(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		code       int
		said, want string
		fault      error
	}{
		{1, "the index door does not answer\n", "the index door does not answer", nil},
		{1, "no door", "no door", nil},
		{3, "", "it exits 3", nil},
		{0, "", "no such file", errors.New("no such file")},
	} {
		box := serveBoxAt(t)
		box.code, box.said, box.fault = one.code, one.said, one.fault
		if code, out, _ := box.runs(t); code != 1 || out != "The index falls: "+one.want+"\n" {
			t.Fatalf("code %d, out %q", code, out)
		}
	}
}

// A box no cloud variable marks runs nothing under the bridge flag and prints nothing, because a person starts the index there. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func TestServeBridgeOffTheCloudRunsNothing(t *testing.T) {
	t.Parallel()
	box := serveBoxAt(t)
	box.self = "/method/.se/.runtime/bin/se-index"
	if code, out, _ := box.runs(t, serveBridge); code != 0 || out != "" || len(box.ran) != 0 {
		t.Fatalf("code %d, out %q, ran %v", code, out, box.ran)
	}
}

// Either cloud variable starts the binary running the verb standing in the work root, and one info row names the port. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func TestServeBridgeOnTheCloudStandsTheIndexAndSaysOneRow(t *testing.T) {
	t.Parallel()
	for _, name := range serveCloudVars {
		box := serveBoxAt(t)
		box.env = map[string]string{name: "1"}
		box.self = "/method/.se/.runtime/bin/se-index"
		code, out, _ := box.runs(t, serveBridge)
		want := `{"level":"info","said":"no index answered, so the bridgehead starts one","event":"session.start","detail":"The index starts at port 7001, because no door stood."}` + "\n"
		if code != 0 || out != want {
			t.Fatalf("%s: code %d, out %q", name, code, out)
		}
		ran := [][]string{{box.self, "standing"}}
		if !slices.EqualFunc(box.ran, ran, slices.Equal[[]string]) || box.cwds[0] != box.root {
			t.Errorf("%s: ran %v in %v", name, box.ran, box.cwds)
		}
	}
}

// An index failing its standing reads as one warn row naming what it said, and the verb exits 1. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
func TestServeBridgeWhoseIndexFallsWarns(t *testing.T) {
	t.Parallel()
	box := serveBoxAt(t)
	box.env = map[string]string{"CLAUDE_CODE_REMOTE": "true"}
	box.code, box.said = 1, "the index door does not answer\n"
	code, out, _ := box.runs(t, serveBridge)
	want := `{"level":"warn","said":"the index fails its standing, so no door stands","event":"session.start","detail":"The index falls: the index door does not answer"}` + "\n"
	if code != 1 || out != want {
		t.Fatalf("code %d, out %q", code, out)
	}
	if box.ran[0][0] != box.root+"/.se/.runtime/bin/se-index" {
		t.Errorf("a verb naming no binary of its own runs the root's, and ran %v", box.ran)
	}
}
