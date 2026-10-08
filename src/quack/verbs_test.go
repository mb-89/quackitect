// The road hands each verb by the verbs slice's mode, and a twin in shadow
// writes a shadow row where it answers apart from the verb's program.
// [[spec/tickets/runme-hands-verbs-to-quack]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"fmt"
	"io"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/proc"
	"quackitect/src/pull"
)

// A twin answering the words it holds, and recording whether it ran dry. [[spec/tickets/runme-hands-verbs-to-quack]]
func twinSaying(said string, dry *[]bool) twin {
	return func(_ []string, isDry bool, out, _ io.Writer) int {
		*dry = append(*dry, isDry)
		fmt.Fprint(out, said)
		return 0
	}
}

func TestTheRoadHandsEachVerbByItsMode(t *testing.T) {
	t.Parallel()
	twins := map[string]twin{"ticket yours": twinSaying("", &[]bool{})}
	cases := []struct {
		mode string
		argv []string
		want road
	}{
		{"old", []string{"get", "t/n"}, toQuack},
		{"old", []string{"run", "t/add"}, toQuack},
		{"old", []string{"ticket", "yours"}, toNode},
		{"old", []string{"config"}, toNode},
		{"", []string{"ticket", "yours"}, toNode},
		{"shadow", []string{"get", "t/n"}, toQuack},
		{"shadow", []string{"run", "t/add"}, toQuack},
		{"shadow", []string{"ticket", "yours", "--all"}, toBoth},
		{"shadow", []string{"ticket", "pull"}, toNode},
		{"shadow", []string{"config"}, toNode},
		{"new", []string{"get", "t/n"}, toQuack},
		{"new", []string{"ticket", "yours"}, toQuack},
		{"new", []string{"config"}, toNode},
	}
	for _, one := range cases {
		if said := roadOf(one.mode, one.argv, twins); said != one.want {
			t.Fatalf("under %q the road hands %v to %d, and wants %d", one.mode, one.argv, said, one.want)
		}
	}
}

// The doors of a road whose the verb's program answers old, and whose log gathers its rows. [[spec/tickets/runme-hands-verbs-to-quack]]
func roadOver(mode, old string, twins map[string]twin) (verbDoors, *strings.Builder, *[]map[string]any) {
	out, rows := &strings.Builder{}, &[]map[string]any{}
	return verbDoors{
		mode: mode,
		old: func(into io.Writer) int {
			fmt.Fprint(into, old)
			return 0
		},
		twins: twins,
		log: func(row map[string]any) error {
			*rows = append(*rows, row)
			return nil
		},
		out:  out,
		errs: io.Discard,
	}, out, rows
}

func TestATwinAnsweringApartWritesAShadowRow(t *testing.T) {
	t.Parallel()
	dry := []bool{}
	doors, out, rows := roadOver("shadow", "old\n", map[string]twin{"ticket yours": twinSaying("new\n", &dry)})
	if code := verbs(doors, []string{"ticket", "yours"}); code != 0 || out.String() != "old\n" {
		t.Fatalf("the caller reads %d, %q, and wants the old answer alone", code, out.String())
	}
	if len(dry) != 1 || !dry[0] {
		t.Fatalf("the twin runs %v, and wants one dry run", dry)
	}
	if len(*rows) != 1 {
		t.Fatalf("the log holds %v, and wants one shadow row", *rows)
	}
	row := (*rows)[0]
	if row["kind"] != "shadow" || row["slice"] != "verbs" || row["verb"] != "ticket yours" || row["old"] != "old\n" || row["new"] != "new\n" {
		t.Fatalf("the shadow row reads %v", row)
	}
}

// A twin agreeing in shadow writes no row, and the new road runs the twin for real. [[spec/tickets/runme-hands-verbs-to-quack]]
func TestATwinAgreeingWritesNoRowAndTheNewRoadRunsItForReal(t *testing.T) {
	t.Parallel()
	for _, one := range []struct{ mode, old, said string }{{"shadow", "same\n", "same\n"}, {"new", "old\n", "new\n"}} {
		dry := []bool{}
		doors, out, rows := roadOver(one.mode, one.old, map[string]twin{"ticket yours": twinSaying(one.said, &dry)})
		if code := verbs(doors, []string{"ticket", "yours"}); code != 0 || out.String() != one.said || len(*rows) != 0 || len(dry) != 1 || (one.mode == "new" && dry[0]) {
			t.Fatalf("the %s road answers %d, %q, rows %v, runs %v", one.mode, code, out.String(), *rows, dry)
		}
	}
}

// The mode reads the verbs key off the tracked file under the root, and none where the file sets none. [[spec/tickets/runme-hands-verbs-to-quack]]
func TestTheModeReadsTheVerbsKeyOffTheTrackedFile(t *testing.T) {
	t.Parallel()
	disk := newFakeDisk()
	if said := modeOf(disk, "/tree"); said != "" {
		t.Fatalf("a bare root reads %q", said)
	}
	hq1SeedDisk(t, disk, "/tree", map[string]string{"spec/config/level0.json": `{"migration": {"verbs": "new"}}`})
	if said := modeOf(disk, "/tree"); said != "new" {
		t.Fatalf("the root reads %q, and wants new", said)
	}
}

// A verb the registry leaves out runs the verb's program alone in shadow, and the log holds no row for it. A port registers every verb in time, so the case names words no file registers. [[spec/tickets/vehicle-verbs-become-actions]] [[spec/tickets/window-verbs-port-to-go]]
func TestAVerbWithNoTwinWritesNoShadowRow(t *testing.T) {
	t.Parallel()
	doors, out, rows := roadOver("shadow", "old\n", registry)
	for _, argv := range [][]string{{"unregistered", "here"}, {"unregistered", "into", "elsewhere"}} {
		out.Reset()
		if code := verbs(doors, argv); code != 0 || out.String() != "old\n" || len(*rows) != 0 {
			t.Fatalf("%v answers %d, %q, rows %v", argv, code, out.String(), *rows)
		}
	}
}

// A verb the verb's program answers too takes the verb's program, even where quack's verb table holds it. [[spec/tickets/quack-tools-spares-runme-tools]]
func TestAVerbCliJsAnswersRunsNeverAlone(t *testing.T) {
	t.Parallel()
	table := map[string]bool{"run": true, "act": true}
	if aloneOf([]string{"act"}, table) {
		t.Fatal("act runs in quack alone, and the verb's program stops answering it")
	}
	if !aloneOf([]string{"run"}, table) {
		t.Fatal("run, which the verb's program lacks, runs in the verb's program")
	}
}

// A verb Go registers whole takes quack under old, shadow and new, since no program stands beside it, and a twin of a verb's words keeps its shadow. [[spec/tickets/registered-verb-skips-the-mode]]
func TestAWholeVerbTakesQuackUnderEveryMode(t *testing.T) {
	t.Parallel()
	answers := func(argv []string, _ bool, out, _ io.Writer) int {
		fmt.Fprint(out, "go\n")
		return 0
	}
	twins := map[string]twin{"whole": answers, "part words": answers}
	for _, mode := range []string{"old", modeShadow, modeNew} {
		doors, out, rows := roadOver(mode, "old\n", twins)
		if code := verbs(doors, []string{"whole", "into"}); code != 0 || out.String() != "go\n" || len(*rows) != 0 {
			t.Fatalf("under %s the whole verb answers %d, %q, rows %v", mode, code, out.String(), *rows)
		}
	}
	if roadOf(modeShadow, []string{"part", "words"}, twins) != toBoth || roadOf("old", []string{"part", "words"}, twins) != toNode {
		t.Fatal("a twin of a verb's words leaves its shadow road")
	}
}

// A registered verb takes its Go answer ahead of quack's own verb of the same word, so ./RUNME.sh tools keeps writing tools.json, and takes it under old too, since tools.js left the tree. [[spec/tickets/box-verbs-port-to-go]] [[spec/tickets/registered-verb-skips-the-mode]]
func TestARegisteredVerbRunsAheadOfQuacksOwn(t *testing.T) {
	t.Parallel()
	twins := map[string]twin{"tools": twinSaying("", &[]bool{})}
	if got := roadOf(modeNew, []string{"tools"}, twins); got != toQuack {
		t.Fatalf("tools takes road %d under new, and wants its twin", got)
	}
	if got := roadOf("", []string{"tools"}, twins); got != toQuack {
		t.Fatalf("tools takes road %d under old, and wants its twin, since no program stands", got)
	}
	ran := false
	doors, _, _ := roadOver(modeNew, "", twins)
	doors.alone = func([]string) int { ran = true; return 0 }
	verbs(doors, []string{"tools"})
	if ran {
		t.Fatal("quack's own tools answers, and the registered verb waits")
	}
}

// Help and no word answer the usage and zero, and a word nothing registers answers the usage and refuses. [[spec/tickets/program-of-drops-node]]
func TestHelpAndNoWordAnswerTheUsageAndZero(t *testing.T) {
	t.Parallel()
	for _, argv := range [][]string{{"help"}, {}, {"--quiet"}, {"--quiet", "help"}, {"--quiet", "unclaimed", "spec"}} {
		var out, errs strings.Builder
		code, want := usageDoor(argv, &errs)(&out), ""
		if len(argv) == 3 {
			code, want = code-exitUsage, "se: there is no verb called unclaimed\n\n"
		}
		if code != 0 || out.String() != usageText() || errs.String() != want {
			t.Fatalf("%v answers %d, %q, %q", argv, code, out.String(), errs.String())
		}
	}
}

func TestHelpPrintsTheUsageOffCommands(t *testing.T) {
	t.Parallel()
	said := usageText()
	if len(verbsmodule.Commands) == 0 || !strings.HasPrefix(said, "Usage: ./RUNME.sh <verb>") {
		t.Fatalf("the usage reads %q", said)
	}
	for _, one := range verbsmodule.Commands {
		if !strings.Contains(said, one.Name) || !strings.Contains(said, one.Doc) {
			t.Fatalf("the usage names no %s with its doc", one.Name)
		}
	}
}

// A fake runner taught one program, which records each command it meets and answers the same. [[spec/tickets/quack-spawns-all-take-the-runner]]
func teaches(program string, said proc.Said) (*proc.FakeRunner, *[]proc.Command) {
	ran := &[]proc.Command{}
	return &proc.FakeRunner{Programs: map[string]proc.Program{program: func(one proc.Command) proc.Said {
		*ran = append(*ran, one)
		return said
	}}}, ran
}

// The one command a case's fake met. [[spec/tickets/quack-spawns-all-take-the-runner]]
func ranOnce(t *testing.T, ran []proc.Command) proc.Command {
	t.Helper()
	if len(ran) != 1 {
		t.Fatalf("the fake meets %d commands, and wants one", len(ran))
	}
	return ran[0]
}

func TestToolRunsHandsTheStreamsThrough(t *testing.T) {
	t.Parallel()
	fake, ran := teaches("/fake/tool", proc.Said{Out: "out", Err: "err", Code: 3})
	var out, errs strings.Builder
	dir := sharedFolder()
	if code := toolRunsOver(fake.Run, strings.NewReader("keys"))(dir, &out, &errs, "/fake/tool", "--fix"); code != 3 || out.String() != "out" || errs.String() != "err" {
		t.Fatalf("a tool run answers %d and writes %q, %q, and wants 3 and the tool's streams", code, out.String(), errs.String())
	}
	if one := ranOnce(t, *ran); !slices.Equal(one.Argv, []string{"/fake/tool", "--fix"}) || one.Dir != dir || one.Stdin != "keys" {
		t.Fatalf("the tool runs %q in %s reading %q, and wants the argv in %s reading the input", one.Argv, one.Dir, one.Stdin, dir)
	}
	errs.Reset()
	if code := toolRunsOver((&proc.FakeRunner{}).Run, strings.NewReader(""))(dir, &out, &errs, "/fake/none"); code != exitFailed || errs.Len() == 0 {
		t.Fatalf("a tool that never starts answers %d and writes %q, and wants exitFailed and its fault", code, errs.String())
	}
}

func TestARoadVerbAnswersItsStreamsAsOneText(t *testing.T) {
	t.Parallel()
	fake, ran := teaches(fakeQuack, proc.Said{Out: "said\n", Err: "warned\n", Code: 3})
	root := sharedFolder()
	code, said := roadVerbOver(fake.Run, fakeSelf, root)("ticket", "pull")
	if code != 3 || said != "said\nwarned" {
		t.Fatalf("the road answers %d, %q, and wants 3 and both streams as one text", code, said)
	}
	want := []string{fakeQuack, "verb", filepath.Join(root, "src", "scripts"), "ticket", "pull"}
	if one := ranOnce(t, *ran); !slices.Equal(one.Argv, want) || one.Dir != root {
		t.Fatalf("the road runs %q in %s, and wants %q in %s", one.Argv, one.Dir, want, root)
	}
}

func TestTheBranchTakeRunsTheRoadOnTheCallersStreams(t *testing.T) {
	t.Parallel()
	fake, ran := teaches(fakeQuack, proc.Said{Out: "taken\n", Err: "note\n", Code: 2})
	var out, errs strings.Builder
	root := sharedFolder()
	it := &pull.It{Root: root, Out: &out, Err: &errs}
	if code := takesBranchOver(fake.Run, fakeSelf)("/scripts", "a-group", it); code != 2 || out.String() != "taken\n" || errs.String() != "note\n" {
		t.Fatalf("the take answers %d and writes %q, %q, and wants 2 and the road's streams", code, out.String(), errs.String())
	}
	want := []string{fakeQuack, "verb", "/scripts", "branch", "take", "a-group"}
	if one := ranOnce(t, *ran); !slices.Equal(one.Argv, want) || one.Dir != root {
		t.Fatalf("the take runs %q in %s, and wants %q in %s", one.Argv, one.Dir, want, root)
	}
}

func TestARetroMintRunReadsRunmeUnderTheRootAndItsEnv(t *testing.T) {
	t.Parallel()
	dir := sharedFolder()
	runme := filepath.Join(dir, "RUNME.sh")
	fake, ran := teaches(runme, proc.Said{Out: "out", Err: "err", Code: 4})
	got := retroMintRunmeOver(fake.Run)(dir, []string{retroMintRunmeAt, "ticket", "pull"}, map[string]string{"B": "2", "A": "1"})
	if got != (retroMintRan{out: "out", errs: "err", code: 4}) {
		t.Fatalf("the run answers %+v, and wants the program's streams and code", got)
	}
	if one := ranOnce(t, *ran); !slices.Equal(one.Argv, []string{runme, "ticket", "pull"}) || one.Dir != dir || !slices.Equal(one.Env, []string{"A=1", "B=2"}) {
		t.Fatalf("the run takes %q in %s under %q, and wants the root's RUNME.sh under the sorted pairs", one.Argv, one.Dir, one.Env)
	}
	if got := retroMintRunmeOver((&proc.FakeRunner{}).Run)(dir, []string{"/fake/none"}, nil); got.code != exitFailed || got.errs == "" {
		t.Fatalf("a program that never starts answers %+v, and wants exitFailed and its fault", got)
	}
}

func TestAReviewGathersOffTheBranchVerbUnderTheWorkRoot(t *testing.T) {
	t.Parallel()
	fake, ran := teaches(fakeQuack, proc.Said{Out: "working\n{\"branch\":\"work/a\"}\n"})
	method, root := filepath.Join(sharedFolder(), "method"), filepath.Join(sharedFolder(), "work")
	material, why := reviewRunOver(fake.Run, fakeSelf, method)(root, "work/a")
	if material.Branch != "work/a" || why != "" {
		t.Fatalf("the review gathers %+v, %q, and wants the branch's material", material, why)
	}
	want := []string{fakeQuack, "verb", filepath.Join(method, "src", "scripts"), "branch", "review", "work/a", "--json"}
	one := ranOnce(t, *ran)
	if !slices.Equal(one.Argv, want) || one.Dir != root || one.Wait != reviewGathering {
		t.Fatalf("the review runs %q in %s under %v, and wants %q in %s under %v", one.Argv, one.Dir, one.Wait, want, root, reviewGathering)
	}
	if env := []string{"QUACKITECT_ROOT=" + method, workRootVar + "=" + root}; !slices.Equal(one.Env, env) {
		t.Fatalf("the review adds %q, and wants %q", one.Env, env)
	}
}

func TestServeRunsReadsASignalAsOne(t *testing.T) {
	t.Parallel()
	for _, row := range []struct {
		name  string
		said  proc.Said
		code  int
		fault bool
	}{
		{"an exit answers its code and its errors", proc.Said{Err: "broke", Code: 3}, 3, false},
		{"a signal's end reads as 1", proc.Said{Err: "broke", Code: proc.Signalled}, 1, false},
		{"a program that never starts answers its fault", proc.Said{Err: "broke", Code: proc.NotStarted}, 0, true},
	} {
		fake, ran := teaches("/fake/serve", row.said)
		dir := sharedFolder()
		code, errs, err := serveRunsOver(fake.Run)([]string{"/fake/serve", "up"}, dir)
		if code != row.code || errs != "broke" || (err != nil) != row.fault {
			t.Fatalf("%s: the run answers %d, %q, %v", row.name, code, errs, err)
		}
		if one := ranOnce(t, *ran); !slices.Equal(one.Argv, []string{"/fake/serve", "up"}) || one.Dir != dir {
			t.Fatalf("%s: the run takes %q in %s", row.name, one.Argv, one.Dir)
		}
	}
}

func TestTheViewerLaunchHandsTheTerminalThrough(t *testing.T) {
	t.Parallel()
	fake, ran := teaches("/fake/viewer", proc.Said{Out: "frame", Err: "warn", Code: proc.Signalled})
	var out, errs strings.Builder
	dir := sharedFolder()
	code, err := tuiLaunchOver(fake.Run, strings.NewReader("keys"))([]string{"/fake/viewer"}, dir, &out, &errs)
	if code != 1 || err != nil || out.String() != "frame" || errs.String() != "warn" {
		t.Fatalf("the launch answers %d, %v and writes %q, %q, and wants a signal's end as 1 and the viewer's streams", code, err, out.String(), errs.String())
	}
	if one := ranOnce(t, *ran); one.Dir != dir || one.Stdin != "keys" {
		t.Fatalf("the viewer runs in %s reading %q, and wants %s and the terminal's input", one.Dir, one.Stdin, dir)
	}
	if _, err := tuiLaunchOver((&proc.FakeRunner{}).Run, strings.NewReader(""))([]string{"/fake/none"}, dir, &out, &errs); err == nil {
		t.Fatal("a viewer that never starts answers no fault")
	}
}

// [[spec/tickets/review-spawns-off-the-door]]
func TestTheSeamReadsTheNewestMaterialLine(t *testing.T) {
	t.Parallel()
	printed := "gathering\n{\"branch\":\"work/old\"}\r\n{\"branch\":\"work/a-group\",\"retro\":true}\n{not json\n"
	material, why := gatheredOf(printed, "")
	if why != "" || material.Branch != "work/a-group" || !material.Retro {
		t.Errorf("the seam reads %+v and %q, and wants work/a-group with its retro", material, why)
	}
}

// [[spec/tickets/review-spawns-off-the-door]]
func TestTheSeamSaysWhyItGatheredNothing(t *testing.T) {
	t.Parallel()
	for _, one := range []struct{ stdout, stderr, want string }{
		{"usage\n", " no such branch \n", "no such branch"},
		{" usage \n", "", "usage"},
		{"", "", saidNothing},
	} {
		if _, why := gatheredOf(one.stdout, one.stderr); why != one.want {
			t.Errorf("the seam says %q over %q and %q, and wants %q", why, one.stdout, one.stderr, one.want)
		}
	}
}

func startFake(input string, env map[string]string, manifest bool) startOutside {
	return startOutside{
		root:   func() (string, error) { return "/home/one/tree", nil },
		input:  strings.NewReader(input),
		env:    func(key string) string { return env[key] },
		exists: func(path string) bool { return manifest && path == filepath.Join("/home/one/tree", startManifest) },
	}
}

func TestStartReadsItsInputEnvironmentAndDiskOffTheBox(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		name  string
		env   map[string]string
		stops bool
	}{
		{"a desk box in default mode with no plugin", nil, true},
		{"a cloud box", map[string]string{"CLAUDE_CODE_REMOTE": "true"}, false},
	} {
		box, _, _, _ := fakeBoxDoors(t)
		box = withEnv(box, one.env)
		box.input = strings.NewReader(`{"permission_mode":"default"}`)
		var out strings.Builder
		startVerb(startOutsideOf(box))([]string{"start"}, false, &out, &out)
		if stops := strings.Contains(out.String(), `"continue":false`); stops != one.stops {
			t.Errorf("%s: prints %q, and the stop reads %v, want %v", one.name, out.String(), stops, one.stops)
		}
	}
}

func TestStartStopsADeskSessionWritingWithNoPlugin(t *testing.T) {
	t.Parallel()
	cases := []struct {
		name   string
		input  string
		env    map[string]string
		plugin bool
		stops  bool
	}{
		{"a desk session in default mode with no manifest", `{"permission_mode":"default"}`, nil, false, true},
		{"a desk session sending no input", ``, nil, false, true},
		{"a desk session in plan mode", `{"permission_mode":"plan"}`, nil, false, false},
		{"a desk session where the manifest stands, with no switch for mods", `{"permission_mode":"default"}`, nil, true, false},
		{"a cloud box with no plugin", `{}`, map[string]string{"CLAUDE_CODE_REMOTE": "true"}, false, false},
	}
	for _, one := range cases {
		var out, errs strings.Builder
		code := startVerb(startFake(one.input, one.env, one.plugin))([]string{"start"}, false, &out, &errs)
		if code != 0 {
			t.Errorf("%s: exits %d, want 0", one.name, code)
		}
		if !one.stops {
			if out.String() != "" {
				t.Errorf("%s: prints %q, want nothing", one.name, out.String())
			}
			continue
		}
		var said map[string]any
		if err := json.Unmarshal([]byte(out.String()), &said); err != nil {
			t.Fatalf("%s: prints %q, which reads as no JSON: %v", one.name, out.String(), err)
		}
		reason, _ := said["stopReason"].(string)
		if said["continue"] != false || !strings.Contains(reason, "/home/one/tree") || !strings.Contains(reason, "./RUNME.sh") {
			t.Errorf("%s: prints %v, want continue false and a reason naming the folder and ./RUNME.sh", one.name, said)
		}
	}
}
