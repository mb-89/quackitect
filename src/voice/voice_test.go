// The voice verbs over rows and a fake disk. Each case hands a fixture in and
// reads the lines the verb prints, line for line as the JS prints them.
// [[spec/guidance/code/testing]]
package voice

import (
	"encoding/json"
	"errors"
	"path"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/hooks/brief"
)

const (
	testRoot = "/tree"
	ten      = "one two three four five six seven eight nine ten"
)

// A disk held in a map of files, whose folders stand where a file stands under them. [[spec/guidance/code/testing]]
type fakeDisk struct{ files map[string]string }

// A Windows disk reads either separator, so the fake reads each path slashed. [[spec/tickets/window-verbs-windows-green]]
func (f *fakeDisk) exists(path string) bool {
	path = filepath.ToSlash(path)
	if _, ok := f.files[path]; ok {
		return true
	}
	for key := range f.files {
		if strings.HasPrefix(key, path+"/") {
			return true
		}
	}
	return false
}

func (f *fakeDisk) list(path string) ([]Entry, error) {
	path = filepath.ToSlash(path)
	if _, ok := f.files[path]; ok {
		return nil, errors.New("not a folder: " + path)
	}
	seen := map[string]bool{}
	for key := range f.files {
		if !strings.HasPrefix(key, path+"/") {
			continue
		}
		rest := key[len(path)+1:]
		name, _, dir := strings.Cut(rest, "/")
		seen[name] = seen[name] || dir
	}
	out := []Entry{}
	for name, dir := range seen {
		out = append(out, Entry{Name: name, Dir: dir})
	}
	return out, nil
}

func (f *fakeDisk) read(path string) (string, error) {
	path = filepath.ToSlash(path)
	text, ok := f.files[path]
	if !ok {
		return "", errors.New("no file: " + path)
	}
	return text, nil
}

// The doors over a fake disk, rules taught the findings of each file, which keep every path they read, and a clock fixed at now. [[spec/guidance/code/testing]]
func doorsOf(files map[string]string, lint map[string][]Finding, now string) (Doors, *fakeDisk, *[]string) {
	disk := &fakeDisk{files: files}
	ran := &[]string{}
	at, _ := time.Parse(time.RFC3339Nano, now)
	return Doors{
		Root:    testRoot,
		Exists:  disk.exists,
		List:    disk.list,
		Read:    disk.read,
		Write:   func(path, text string) error { disk.files[filepath.ToSlash(path)] = text; return nil },
		MakeDir: func(string) error { return nil },
		Lint: func(path, _ string) []Finding {
			*ran = append(*ran, path)
			return lint[path]
		},
		Now: func() time.Time { return at },
	}, disk, ran
}

// What the verb prints to each stream, and its exit code. [[spec/guidance/code/testing]]
type said struct {
	code      int
	out, errs string
}

func run(d Doors, dry bool, words ...string) said {
	var out, errs strings.Builder
	code := Run(d, words, dry, &out, &errs)
	return said{code, out.String(), errs.String()}
}

func finding(rule string) Finding {
	return Finding{Rule: rule, Line: 1, Column: 1, Said: "x", Message: "m", Severity: "error"}
}

func jsonOf(t *testing.T, v any) string {
	t.Helper()
	text, err := json.Marshal(v)
	if err != nil {
		t.Fatal(err)
	}
	return string(text)
}

func long(n int) string { return strings.TrimSpace(strings.Repeat("word ", n)) }

func spoke(t *testing.T, text string, more map[string]any) string {
	row := map[string]any{"type": "assistant", "message": map[string]any{"content": []any{map[string]any{"type": "text", "text": text}}}}
	for key, value := range more {
		row[key] = value
	}
	return jsonOf(t, row)
}

func owner(t *testing.T, content any) string {
	return jsonOf(t, map[string]any{"type": "user", "message": map[string]any{"content": content}})
}

const usage = "Usage: ./RUNME.sh voice <verb>\n\n" +
	"  measure <folder>           score every markdown file under a folder\n" +
	"  measure --transcripts <f>  pull the answers out of the transcripts first\n" +
	"  refused [days]             rank what the doors turn away, seven by default\n"

func TestVoiceMeasureScoresAFolderLineForLine(t *testing.T) {
	lint := map[string][]Finding{
		"docs/a.md":  {finding("VoiceVale.LongSentence"), finding("VoiceParagraph.Passive"), finding("Schema.Kind")},
		"docs/c.txt": {finding("VoiceVale.LongSentence")},
		"docs/z.md":  {finding("Other.Rule")},
	}
	d, _, ran := doorsOf(map[string]string{
		"/tree/docs/a.md":  ten + "\n",
		"/tree/docs/b.md":  ten + "\n",
		"/tree/docs/_x.md": ten,
		"/tree/docs/c.txt": ten + " " + ten,
	}, lint, "2026-09-12T00:00:00Z")

	got := run(d, false, "measure", "docs")
	want := "file        words  findings  per 1000 words  top rules\n" +
		"docs/a.md      10         3           300.0  Kind 1, LongSentence 1, Passive 1\n" +
		"docs/b.md      10         0             0.0\n" +
		"docs/c.txt     20         1            50.0  LongSentence 1\n" +
		"TOTAL          40         4           100.0\n" +
		"\n" +
		"rule          fires\n" +
		"LongSentence      2\n" +
		"Kind              1\n" +
		"Passive           1\n"
	if got != (said{0, want, ""}) {
		t.Fatalf("measure answers %+v, want %q", got, want)
	}
	if want := []string{"docs/a.md", "docs/b.md", "docs/c.txt"}; !reflect.DeepEqual(*ran, want) {
		t.Fatalf("the rules read %q, want %q", *ran, want)
	}
}

// The measure reads the Go rules a file at a time, so no binary stands in its road. [[spec/tickets/vale-leaves-the-tree]]
func TestVoiceMeasureReadsTheRulesAndRunsNoBinary(t *testing.T) {
	d, _, ran := doorsOf(map[string]string{"/tree/docs/a.md": ten + "\n", "/tree/docs/b.md": ten + "\n"}, nil, "2026-09-12T00:00:00Z")
	var read []string
	d.Lint = func(path, text string) []Finding {
		read = append(read, path)
		if path == "docs/a.md" {
			return []Finding{{File: path, Rule: "VoiceVale.Passive", Line: 1}}
		}
		return nil
	}
	got := run(d, false, "measure", "docs")
	if got.code != 0 || !strings.Contains(got.out, "docs/a.md     10         1") || !strings.Contains(got.out, "Passive      1") {
		t.Fatalf("measure answers %+v", got)
	}
	if len(*ran) != 0 || !reflect.DeepEqual(read, []string{"docs/a.md", "docs/b.md"}) {
		t.Fatalf("measure runs %q and reads %q", *ran, read)
	}
}

func TestVoiceMeasureExitsOneWhereAnAnswerRunsPastTheCeiling(t *testing.T) {
	t.Parallel()
	const past = ".se/.runtime/measure/a/001-answer.md"
	const within = ".se/.runtime/measure/b/001-answer.md"
	three := []Finding{finding("VoiceVale.LongSentence"), finding("VoiceParagraph.Passive"), finding("Schema.Kind")}
	d, _, _ := doorsOf(map[string]string{
		"/tree/logs/a.jsonl": spoke(t, ten+" "+ten+" "+ten, nil),
		"/tree/logs/b.jsonl": spoke(t, ten+" "+ten+" "+ten, nil),
		"/tree/docs/a.md":    ten + "\n",
	}, map[string][]Finding{past: three, "docs/a.md": three}, "2026-09-12T00:00:00Z")
	d.Ceiling = 50

	got := run(d, false, "measure", "--transcripts", "logs")
	if got.code != 1 {
		t.Fatalf("measure --transcripts past the ceiling exits %d, want 1: %+v", got.code, got)
	}
	if !strings.Contains(got.errs, past) || strings.Contains(got.errs, within) {
		t.Fatalf("measure past the ceiling names %q, want %s alone", got.errs, past)
	}

	if folder := run(d, false, "measure", "docs"); folder.code != 0 {
		t.Fatalf("a plain folder run past the ceiling exits %d, want 0: %+v", folder.code, folder)
	}

	d.Ceiling = 0
	if off := run(d, false, "measure", "--transcripts", "logs"); off.code != 0 {
		t.Fatalf("a ceiling of 0 exits %d, want 0: %+v", off.code, off)
	}
}

func TestVoiceMeasureTranscriptsWritesTheAnswers(t *testing.T) {
	rows := strings.Join([]string{
		spoke(t, ten+" "+ten+" "+ten, nil),
		spoke(t, ten+" "+ten+" "+ten, map[string]any{"isSidechain": true}),
		owner(t, []any{map[string]any{"type": "text", "text": ten}}),
	}, "\n")
	d, disk, ran := doorsOf(map[string]string{"/tree/logs/sess.jsonl": rows}, nil, "2026-09-12T00:00:00Z")

	got := run(d, false, "measure", "--transcripts", "logs")
	want := "1 answer(s) under .se/.runtime/measure.\n\n" +
		"file                                     words  findings  per 1000 words  top rules\n" +
		".se/.runtime/measure/sess/001-answer.md     30         0             0.0\n" +
		"TOTAL                                       30         0             0.0\n"
	if got != (said{0, want, ""}) {
		t.Fatalf("measure --transcripts answers %+v, want %q", got, want)
	}
	if text := disk.files["/tree/.se/.runtime/measure/sess/001-answer.md"]; text != ten+" "+ten+" "+ten+"\n" {
		t.Fatalf("the answer lands as %q", text)
	}
	if disk.exists("/tree/.se/.runtime/measure/sess/002-answer.md") {
		t.Fatal("the sidechain and the user turn write nothing")
	}
	if want := []string{".se/.runtime/measure/sess/001-answer.md"}; !reflect.DeepEqual(*ran, want) {
		t.Fatalf("the rules read %q, want the measured answer", *ran)
	}
}

func TestVoiceMeasureDryWritesNothing(t *testing.T) {
	rows := spoke(t, ten+" "+ten+" "+ten, nil)
	d, disk, _ := doorsOf(map[string]string{"/tree/logs/sess.jsonl": rows}, nil, "2026-09-12T00:00:00Z")
	got := run(d, true, "measure", "--transcripts", "logs")
	if _, wrote := disk.files["/tree/.se/.runtime/measure/sess/001-answer.md"]; wrote {
		t.Fatal("a dry run writes no answer file")
	}
	if !strings.HasPrefix(got.out, "1 answer(s) under .se/.runtime/measure.\n\n") {
		t.Fatalf("a dry run still counts the answers, got %+v", got)
	}
}

func TestVoiceRefusedRanksTheLogLineForLine(t *testing.T) {
	row := func(at string, more map[string]any) string {
		one := map[string]any{"at": at, "level": "warn", "kind": "write"}
		for key, value := range more {
			one[key] = value
		}
		return jsonOf(t, one)
	}
	var rows []string
	for range 3 {
		rows = append(rows, row("2026-09-11T00:00:00.000Z", map[string]any{"rule": "VoiceVale.PastTense", "phrase": "bold"}))
	}
	for range 2 {
		rows = append(rows, row("2026-09-10T00:00:00.000Z", map[string]any{"rule": "Shell.WritesNothing", "tool": "Bash"}))
	}
	rows = append(rows,
		row("2026-09-10T00:00:00.000Z", map[string]any{"rule": "VoiceVale.pastTense", "phrase": "bold"}),
		row("2026-08-01T00:00:00.000Z", map[string]any{"rule": "VoiceVale.Passive", "phrase": "old"}),
		row("2026-09-11T00:00:00.000Z", map[string]any{"said": "this row names no rule"}),
	)
	d, _, _ := doorsOf(map[string]string{"/tree/.se/.log/session.jsonl": strings.Join(rows, "\n")}, nil, "2026-09-12T00:00:00Z")

	want := "rule           fires  phrase\nPastTense          3  bold\nWritesNothing      2  Bash\npastTense          1  bold\n"
	for _, words := range [][]string{{"refused"}, {"refused", "1.5"}, {"refused", "0x10"}} {
		if got := run(d, false, words...); got != (said{0, want, ""}) {
			t.Fatalf("%v answers %+v, want %q", words, got, want)
		}
	}
}

func TestVoiceRefusedWiderDaysReachTheOldFolder(t *testing.T) {
	row := `{"at":"2026-08-01T00:00:00.000Z","level":"warn","rule":"VoiceVale.Passive","phrase":"old"}`
	d, _, _ := doorsOf(map[string]string{"/tree/.se/.log/old/one.jsonl": row}, nil, "2026-09-12T00:00:00Z")

	if got := run(d, false, "refused"); got != (said{0, "No door refuses anything in 7 day(s).\n", ""}) {
		t.Fatalf("a week answers %+v", got)
	}
	if got := run(d, false, "refused", "nonsense"); got.out != "No door refuses anything in 7 day(s).\n" {
		t.Fatalf("a day count nobody reads falls back to the week, got %+v", got)
	}
	if got := run(d, false, "refused", "1.5"); got.out != "No door refuses anything in 1.5 day(s).\n" {
		t.Fatalf("a fractional day count prints as JS prints it, got %+v", got)
	}
	want := "rule     fires  phrase\nPassive      1  old\n"
	if got := run(d, false, "refused", "365"); got != (said{0, want, ""}) {
		t.Fatalf("a year answers %+v, want %q", got, want)
	}
}

func TestVoiceRefusedPastTheDateRangeFails(t *testing.T) {
	d, _, _ := doorsOf(map[string]string{}, nil, "2026-09-12T00:00:00Z")
	got := run(d, false, "refused", "1e300")
	if got.code != 1 || got.errs != "RangeError: Invalid time value\n" {
		t.Fatalf("a day count past the date range answers %+v", got)
	}
}

func TestVoiceHelpNamesBothVerbsAndRefusesAnUnknownOne(t *testing.T) {
	d, _, _ := doorsOf(map[string]string{}, nil, "2026-09-12T00:00:00Z")
	if got := run(d, false); got != (said{0, usage, ""}) {
		t.Fatalf("help answers %+v", got)
	}
	if got := run(d, false, "nobody"); got != (said{2, usage, ""}) {
		t.Fatalf("a verb nobody holds answers %+v", got)
	}
}

func TestVoiceMeasureSaysSoWhereNoFileStands(t *testing.T) {
	d, _, _ := doorsOf(map[string]string{"/tree/docs/a.md": ten}, nil, "2026-09-12T00:00:00Z")

	if got := run(d, false, "measure", "nothing"); got != (said{1, "", "No markdown file stands under nothing.\n"}) {
		t.Fatalf("an empty folder answers %+v", got)
	}
	if got := run(d, false, "measure", "--transcripts", "logs"); got != (said{1, "", "No answer of 25 words or more stands under logs.\n"}) {
		t.Fatalf("no transcript answers %+v", got)
	}
}

func TestVoiceMeasureReadsOneFileAndSkipsTheNoise(t *testing.T) {
	d, _, ran := doorsOf(map[string]string{
		"/tree/a.md":                ten,
		"/tree/.se/b.md":            ten,
		"/tree/.git/c.md":           ten,
		"/tree/node_modules/d.md":   ten,
		"/tree/sub/_hid/e.md":       ten,
		"/tree/sub/F.MARKDOWN":      ten,
		"/tree/.se/.runtime/x.json": "",
	}, nil, "2026-09-12T00:00:00Z")

	got := run(d, false, "measure")
	if !strings.Contains(got.out, "\na.md ") || !strings.Contains(got.out, "\nsub/F.MARKDOWN ") || strings.Contains(got.out, "b.md") ||
		strings.Contains(got.out, "c.md") || strings.Contains(got.out, "d.md") || strings.Contains(got.out, "e.md") {
		t.Fatalf("the root folder reads past the noise, got %q", got.out)
	}
	if want := []string{"a.md", "sub/F.MARKDOWN"}; !reflect.DeepEqual(*ran, want) {
		t.Fatalf("the rules read %q over the root, want %q", *ran, want)
	}
	if got := run(d, false, "measure", ".se"); !strings.Contains(got.out, "\n.se/b.md ") {
		t.Fatalf("a folder under .se reads .se, got %q", got.out)
	}
	if got := run(d, false, "measure", "/tree/a.md"); !strings.Contains(got.out, "\na.md ") || got.code != 0 {
		t.Fatalf("a file path reads the file alone, got %+v", got)
	}
}

// The measured answers stand under the runtime folder brief.ToolsFile names, which src/modules/check/folders.go owns. [[spec/design_input/the-runtime-files-stand-apart]]
func TestMeasuredStandsInTheRuntimeFolder(t *testing.T) {
	if !strings.HasPrefix(Measured, path.Dir(brief.ToolsFile)+"/") {
		t.Errorf("%s stands outside %s", Measured, path.Dir(brief.ToolsFile))
	}
}

// A user row whose meta flag reads false opens a turn, and a sidechain row opens none. [[spec/tickets/shared-helpers-stand-once]]
func TestAFalseFlagLeavesTheTurnOpen(t *testing.T) {
	if !opensTurn(Row{"type": "user", "isMeta": false, "agentId": ""}) || opensTurn(Row{"type": "user", "isSidechain": true}) {
		t.Fatal("a row opens a turn otherwise than its flags read")
	}
}
