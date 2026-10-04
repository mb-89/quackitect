// The tui verb in Go, over fake doors: the tab the caller names, the plain
// rows, the handover to a standing window, the launch, and the viewer build
// with its source stamp, each held to what the JavaScript answers.
// [[spec/design_output/tui#the-verb-builds-it]]
package main

import (
	"errors"
	"io"
	"net"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"testing"

	"quackitect/src/index"
	"quackitect/src/tui/frame"
)

// What a fake box records: the builds it ran, the launches, and the tabs it told. [[spec/design_output/tui#the-verb-builds-it]]
type tuiBox struct {
	root     string
	builds   [][]string
	cwds     []string
	launched [][]string
	told     []string
	build    func(argv []string) (int, string, error)
	stands   bool
	code     int
	windows  bool
}

// A box whose go writes the binary it is asked for. [[spec/design_output/tui#the-verb-builds-it]]
func tuiBoxAt(t *testing.T) *tuiBox {
	t.Helper()
	box := &tuiBox{root: filepath.ToSlash(t.TempDir())}
	box.build = func(argv []string) (int, string, error) {
		if err := os.MkdirAll(filepath.Dir(argv[3]), 0o755); err != nil {
			return 0, "", err
		}
		return 0, "", os.WriteFile(argv[3], []byte("binary"), 0o755)
	}
	tuiWrites(t, box.root, map[string]string{
		"src/tui/main.go":    "package main\n\nimport \"quackitect/src/yaml\"\n",
		"go.mod":             "module quackitect",
		"src/tui/ui_test.go": "package main",
	})
	return box
}

func tuiWrites(t *testing.T, root string, files map[string]string) {
	t.Helper()
	for rel, text := range files {
		at := filepath.Join(root, filepath.FromSlash(rel))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

func tuiReads(t *testing.T, path string) string {
	t.Helper()
	body, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	return string(body)
}

func (box *tuiBox) doors() tuiDoors {
	return tuiDoors{
		root:    box.root,
		windows: box.windows,
		goTool:  "go",
		run: func(argv []string, cwd string) (int, string, error) {
			box.builds = append(box.builds, argv)
			box.cwds = append(box.cwds, cwd)
			return box.build(argv)
		},
		launch: func(argv []string, cwd string, _, _ io.Writer) (int, error) {
			box.launched = append(box.launched, argv)
			return box.code, nil
		},
		tell: func(tab string) bool {
			box.told = append(box.told, tab)
			return box.stands
		},
	}
}

func (box *tuiBox) exe() string { return box.root + "/.se/.runtime/bin/logview" }

// Runs the verb over the box, and answers its code, its output and its error stream. [[spec/design_output/tui#the-verb-builds-it]]
func (box *tuiBox) runs(argv ...string) (int, string, string) {
	var out, errs strings.Builder
	code := tuiVerb(box.doors)(append([]string{"tui"}, argv...), false, &out, &errs)
	return code, out.String(), errs.String()
}

const tuiRowText = `{"at":"2026-01-02T03:04:05.678Z","level":"warn","kind":"note","said":"hello","2":"two","detail":"d","1":1.50,"list":[1,null,[2,3]],"obj":{"a":1},"n":null,"b":true,"big":1e21,"small":0.0000001}
{torn
{"at":"2026-01-02T03:04:05.678Z","level":"info","kind":"status","said":"plain"}
{"said":"no at"}`

// The rows asRow in .claude/skills/level0/lib/log.js prints over tuiRowText. [[spec/design_output/log#one-verb-reads-the-log]]
var tuiRowsSaid = []string{
	"03:04:05.678 warn  note   hello\n             1=1.5 2=two detail=d list=1,,2,3 obj=[object Object] n=null b=true big=1e+21 small=1e-7",
	"03:04:05.678 info  status plain",
	" undefined undefined no at",
}

// [[spec/design_output/tui#a-tab-the-caller-names]]
func TestTuiTabWanted(t *testing.T) {
	for _, one := range []struct {
		argv []string
		want string
	}{
		{[]string{"tui", "--tab", "work"}, "work"},
		{[]string{"tui", "log"}, "log"},
		{[]string{"tui", "work", "--count"}, "work"},
		{[]string{"tui", "--tab", "nope", "work"}, ""},
		{[]string{"tui", "--tab"}, ""},
		{[]string{"tui"}, ""},
	} {
		if said := tuiTabWanted(one.argv); said != one.want {
			t.Errorf("%v answers %q, want %q", one.argv, said, one.want)
		}
	}
}

// [[spec/tickets/the-count-chain-leaves]]
func TestTuiWorkCountPrintsNoCountAndLaunchesNothing(t *testing.T) {
	box := tuiBoxAt(t)
	box.build = func([]string) (int, string, error) { return 1, "", nil }
	code, out, errs := box.runs("work", "--count")
	if code != 0 || strings.Contains(out, `"count"`) {
		t.Fatalf("code %d, out %q", code, out)
	}
	if out != tuiNoLog+"\n" {
		t.Errorf("out %q, want the empty log line", out)
	}
	if errs != "go builds no viewer here\n" {
		t.Errorf("errs %q", errs)
	}
	if len(box.launched) != 0 || len(box.told) != 0 {
		t.Errorf("launched %v, told %v", box.launched, box.told)
	}
}

// [[spec/design_output/tui#the-verb-builds-it]]
func TestTuiPlainPrintsTheSessionRows(t *testing.T) {
	box := tuiBoxAt(t)
	tuiWrites(t, box.root, map[string]string{".se/.log/session.jsonl": tuiRowText})
	code, out, errs := box.runs("--plain")
	want := ".se/.log/session.jsonl\n" + strings.Join(tuiRowsSaid, "\n") + "\n"
	if code != 0 || out != want || errs != "" {
		t.Fatalf("code %d\nout %q\nwant %q\nerrs %q", code, out, want, errs)
	}
	if len(box.builds) != 0 {
		t.Errorf("a plain run builds %v", box.builds)
	}
}

// [[spec/design_output/log#a-session-rotates-its-file]]
func TestTuiPlainAllReadsTheRotatedFilesFirst(t *testing.T) {
	box := tuiBoxAt(t)
	row := func(said string) string {
		return `{"at":"2026-01-02T03:04:05.678Z","level":"info","kind":"k","said":"` + said + `"}`
	}
	tuiWrites(t, box.root, map[string]string{
		".se/.log/session.jsonl":                        row("now"),
		".se/.log/old/2026-01-02T03-04-05-b.jsonl":      row("later"),
		".se/.log/old/2026-01-01T03-04-05-a.jsonl":      row("first"),
		".se/.log/old/notes.txt":                        "skip",
		".se/.log/old/2026-01-03T03-04-05-c.jsonl/x.go": "a folder, skipped",
	})
	code, out, _ := box.runs("--plain", "--all")
	line := func(said string) string { return "03:04:05.678 info  k      " + said + "\n" }
	want := ".se/.log/old/2026-01-01T03-04-05-a.jsonl\n" + line("first") +
		".se/.log/old/2026-01-02T03-04-05-b.jsonl\n" + line("later") +
		".se/.log/session.jsonl\n" + line("now")
	if code != 0 || out != want {
		t.Fatalf("code %d\nout %q\nwant %q", code, out, want)
	}
}

// [[spec/design_output/tui#the-verb-builds-it]]
func TestTuiNoGoPrintsTheRowsAndAsksForGo(t *testing.T) {
	box := tuiBoxAt(t)
	box.build = func([]string) (int, string, error) { return 0, "", errors.New("no go here") }
	tuiWrites(t, box.root, map[string]string{".se/.log/session.jsonl": tuiRowText})
	code, out, errs := box.runs()
	want := ".se/.log/session.jsonl\n" + strings.Join(tuiRowsSaid, "\n") +
		"\n\nGo builds the viewer these rows open in. Install Go, and run this again.\n"
	if code != 0 || out != want || errs != "no go here\n" {
		t.Fatalf("code %d\nout %q\nwant %q\nerrs %q", code, out, want, errs)
	}
}

// [[spec/design_output/tui#a-second-launch-hands-over]]
func TestTuiHandsTheTabToAStandingWindow(t *testing.T) {
	for _, one := range []struct {
		argv []string
		tab  string
	}{{[]string{"--tab", "work"}, "work"}, {nil, "log"}} {
		box := tuiBoxAt(t)
		box.stands = true
		code, out, _ := box.runs(one.argv...)
		want := "A window already stands, and it opens the " + one.tab + " tab.\n"
		if code != 0 || out != want {
			t.Errorf("code %d, out %q, want %q", code, out, want)
		}
		if !slices.Equal(box.told, []string{one.tab}) || len(box.launched) != 0 {
			t.Errorf("told %v, launched %v", box.told, box.launched)
		}
		if held, err := os.Stat(filepath.Join(box.root, ".se", ".log")); err != nil || !held.IsDir() {
			t.Errorf("the log folder stands not: %v", err)
		}
	}
}

// [[spec/design_output/tui#the-verb-builds-it]]
func TestTuiLaunchesTheViewerOnTheTab(t *testing.T) {
	box := tuiBoxAt(t)
	box.code = 3
	session := filepath.Join(box.root, ".se", ".log", "session.jsonl")
	if code, out, _ := box.runs("work"); code != 3 || out != "" {
		t.Fatalf("code %d, out %q", code, out)
	}
	if code, _, _ := box.runs(); code != 3 {
		t.Fatalf("code %d", code)
	}
	want := [][]string{{box.exe(), "--tab", "work", session}, {box.exe(), session}}
	if !slices.EqualFunc(box.launched, want, slices.Equal[[]string]) {
		t.Errorf("launched %v, want %v", box.launched, want)
	}
}

// [[spec/design_output/tui#the-verb-builds-it]]
func TestTuiBuildsTheViewerAtTheRootAndStampsItsSource(t *testing.T) {
	box := tuiBoxAt(t)
	exe, why := tuiViewerOf(box.doors())
	if exe != box.exe() || why != "" {
		t.Fatalf("exe %q, why %q", exe, why)
	}
	want := []string{"go", "build", "-o", box.exe() + ".new", "./src/tui"}
	if len(box.builds) != 1 || !slices.Equal(box.builds[0], want) || box.cwds[0] != box.root {
		t.Fatalf("builds %v in %v", box.builds, box.cwds)
	}
	stamp := tuiReads(t, box.root+"/.se/.runtime/bin/.logview-source")
	if !regexp.MustCompile(`^[0-9a-f]{16}\n$`).MatchString(stamp) {
		t.Errorf("stamp %q", stamp)
	}
	if stamp != index.HashText(tuiSourceText(box.root))+"\n" {
		t.Errorf("stamp %q answers no hash of the source", stamp)
	}
}

// [[spec/design_output/tui#the-verb-builds-it]]
func TestTuiBuildLandsBesideTheOldBinary(t *testing.T) {
	box := tuiBoxAt(t)
	tuiWrites(t, box.root, map[string]string{".se/.runtime/bin/logview": "old binary"})
	if exe, why := tuiViewerOf(box.doors()); exe != box.exe() || why != "" {
		t.Fatalf("exe %q, why %q", exe, why)
	}
	if tuiReads(t, box.exe()) != "binary" || tuiReads(t, box.exe()+".old") != "old binary" {
		t.Error("the old binary stepped not aside")
	}
	if _, err := os.Stat(box.exe() + ".new"); err == nil {
		t.Error("the fresh build stands beside under its own name")
	}
}

// A folder full of files refuses its removal, the way a binary a window holds refuses on Windows. [[spec/design_output/tui#the-verb-builds-it]]
func TestTuiBuildLandsWhileTheLastAsideStandsHeld(t *testing.T) {
	box := tuiBoxAt(t)
	tuiWrites(t, box.root, map[string]string{
		".se/.runtime/bin/logview":          "running binary",
		".se/.runtime/bin/logview.old/held": "older binary",
	})
	if exe, _ := tuiViewerOf(box.doors()); exe != box.exe() {
		t.Fatalf("exe %q", exe)
	}
	if tuiReads(t, box.exe()) != "binary" || tuiReads(t, box.exe()+".old1") != "running binary" {
		t.Error("the running binary stepped not aside to the next name")
	}
}

// [[spec/design_output/tui#the-verb-builds-it]]
func TestTuiRebuildsOnlyWhereTheSourceMoves(t *testing.T) {
	box := tuiBoxAt(t)
	builds := func() int {
		tuiViewerOf(box.doors())
		return len(box.builds)
	}
	for _, one := range []struct {
		files map[string]string
		want  int
	}{
		{nil, 1},
		{nil, 1},
		{map[string]string{"src/tui/main.go": "package main // moved\n\nimport \"quackitect/src/yaml\"\n"}, 2},
		{map[string]string{"src/tui/ui_test.go": "package main // moved"}, 2},
		{map[string]string{"src/yaml/yaml.go": "package yaml"}, 3},
		{map[string]string{"src/yaml/yaml.go": "package yaml // moved"}, 4},
		{map[string]string{"src/tui/work/work.go": "package work"}, 5},
		{map[string]string{"src/tui/work/work.go": "package work // moved"}, 6},
		{map[string]string{"src/tui/work/work_test.go": "package work // moved"}, 6},
		{map[string]string{"src/other/other.go": "package other"}, 6},
		{map[string]string{"go.sum": "sum"}, 7},
	} {
		tuiWrites(t, box.root, one.files)
		if said := builds(); said != one.want {
			t.Fatalf("after %v the box ran %d builds, want %d", one.files, said, one.want)
		}
	}
}

// [[spec/design_output/tui#the-verb-builds-it]]
func TestTuiFailedBuildSaysWhy(t *testing.T) {
	box := tuiBoxAt(t)
	box.build = func([]string) (int, string, error) { return 1, "main.go:1: syntax error\n", nil }
	if exe, why := tuiViewerOf(box.doors()); exe != "" || why != "main.go:1: syntax error" {
		t.Errorf("exe %q, why %q", exe, why)
	}
	if _, err := os.Stat(box.root + "/.se/.runtime/bin/.logview-source"); err == nil {
		t.Error("a failed build stamps its source")
	}
	tuiWrites(t, box.root, map[string]string{".se/.runtime/bin/logview": "old binary"})
	exe, why := tuiViewerOf(box.doors())
	if exe != box.exe() || why != "the build fails, so the last one runs: main.go:1: syntax error" {
		t.Errorf("exe %q, why %q", exe, why)
	}
}

// [[spec/design_output/tui#the-verb-builds-it]]
func TestTuiNoGoAnswersNoViewerAndNamesTheFault(t *testing.T) {
	box := tuiBoxAt(t)
	box.build = func([]string) (int, string, error) { return 0, "", errors.New("exec: go: not found") }
	if exe, why := tuiViewerOf(box.doors()); exe != "" || why != "exec: go: not found" {
		t.Errorf("exe %q, why %q", exe, why)
	}
}

// [[spec/design_output/tui#the-verb-builds-it]]
func TestTuiWindowsBuildsTheExe(t *testing.T) {
	box := tuiBoxAt(t)
	box.windows = true
	if exe, _ := tuiViewerOf(box.doors()); exe != box.exe()+".exe" || box.builds[0][3] != box.exe()+".exe.new" {
		t.Errorf("exe %q, builds %v", exe, box.builds)
	}
}

// The order localeCompare in Node answers, which the stamp walks its folders in. [[spec/design_output/tui#the-verb-builds-it]]
func TestTuiCollatesAsLocaleCompare(t *testing.T) {
	names := []string{"model_view.go", "model.go", "Model2.go", "a-b.go", "a.go", "a_b.go", "B.go", "b.go", "frame", "frame.go", "x1.go", "x10.go", "x2.go"}
	want := []string{"a_b.go", "a-b.go", "a.go", "b.go", "B.go", "frame", "frame.go", "model_view.go", "model.go", "Model2.go", "x1.go", "x10.go", "x2.go"}
	slices.SortFunc(names, tuiCollate)
	if !slices.Equal(names, want) {
		t.Errorf("order %v, want %v", names, want)
	}
}

// The text the stamp hashes: each source's path and text, joined on the unit separator. [[spec/design_output/tui#the-verb-builds-it]]
func TestTuiSourceTextJoinsPathsAndTexts(t *testing.T) {
	box := tuiBoxAt(t)
	tuiWrites(t, box.root, map[string]string{"src/yaml/yaml.go": "package yaml", "src/yaml/notes.txt": "skip"})
	r := box.root
	want := strings.Join([]string{
		r + "/src/tui/main.go", "package main\n\nimport \"quackitect/src/yaml\"\n",
		r + "/src/yaml/yaml.go", "package yaml",
		r + "/go.mod", "module quackitect",
	}, "\x1f")
	if said := tuiSourceText(r); said != want {
		t.Errorf("text %q\nwant %q", said, want)
	}
}

// The window's door stands one below the bridge's base, 6510 in .claude/skills/level0/lib/vehicle.js. [[spec/design_output/tui#a-second-launch-hands-over]]
func TestTuiWindowListensOneBelowTheBridge(t *testing.T) {
	if frame.WindowPort != 6510-1 {
		t.Errorf("the window listens at %d", frame.WindowPort)
	}
}

// The real tell reaches a window standing on the port, and answers false where none stands. [[spec/design_output/tui#a-second-launch-hands-over]]
func TestTuiTellReachesAStandingWindow(t *testing.T) {
	free, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	port := free.Addr().(*net.TCPAddr).Port
	free.Close()
	if tuiTellAt(port)("work") {
		t.Fatal("a port where nothing listens takes the tab")
	}
	took := make(chan any, 1)
	server, err := frame.OpenDoor(port, func(msg any) { took <- msg })
	if err != nil {
		t.Fatal(err)
	}
	defer server.Close()
	if !tuiTellAt(port)("work") {
		t.Fatal("the standing window takes no tab")
	}
	if msg := <-took; msg != (frame.TabMsg{Name: "work"}) {
		t.Errorf("the window took %v", msg)
	}
}

// The registered verb answers the tui words. [[spec/tickets/quack-registers-each-verb]]
func TestTuiRegisters(t *testing.T) {
	if registry["tui"] == nil {
		t.Error("no tui verb stands in the registry")
	}
}
