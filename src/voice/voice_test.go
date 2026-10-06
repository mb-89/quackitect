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
	"slices"
	"sort"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/hooks/brief"
)

const (
	testRoot = "/tree"
	testBin  = "/tree/.se/.runtime/bin/vale"
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

// The doors over a fake disk, a Vale taught one answer a folder, and a clock fixed at now. [[spec/guidance/code/testing]]
func doorsOf(files map[string]string, vale map[string]string, now string) (Doors, *fakeDisk, *[]string) {
	disk := &fakeDisk{files: files}
	ran := &[]string{}
	at, _ := time.Parse(time.RFC3339Nano, now)
	return Doors{
		Root:    testRoot,
		Bin:     testBin,
		Exists:  disk.exists,
		List:    disk.list,
		Read:    disk.read,
		Write:   func(path, text string) error { disk.files[filepath.ToSlash(path)] = text; return nil },
		MakeDir: func(string) error { return nil },
		Vale: func(argv []string, cwd string) (string, error) {
			*ran = append(*ran, cwd+" "+strings.Join(argv, " "))
			return vale[argv[len(argv)-1]], nil
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

func finding(rule string) map[string]any {
	return map[string]any{"Check": rule, "Line": 1, "Span": []int{1, 4}, "Match": "x", "Message": "m", "Severity": "error"}
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
	stdout := jsonOf(t, map[string]any{
		"docs/a.md":        []any{finding("VoiceVale.LongSentence"), finding("VoiceParagraph.Passive"), finding("Schema.Kind")},
		"/tree/docs/c.txt": []any{finding("VoiceVale.LongSentence")},
		"docs/z.md":        []any{finding("Other.Rule")},
	})
	d, _, ran := doorsOf(map[string]string{
		"/tree/docs/a.md":  ten + "\n",
		"/tree/docs/b.md":  ten + "\n",
		"/tree/docs/_x.md": ten,
		"/tree/docs/c.txt": ten + " " + ten,
		testBin:            "",
	}, map[string]string{"docs": stdout}, "2026-09-12T00:00:00Z")

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
	if call := "/tree " + testBin + " --config=.vale.ini --output=JSON --no-exit docs"; !reflect.DeepEqual(*ran, []string{call}) {
		t.Fatalf("Vale runs %q, want %q", *ran, call)
	}
}

func TestVoiceMeasureExitsOneWhereAnAnswerRunsPastTheCeiling(t *testing.T) {
	t.Parallel()
	stdout := jsonOf(t, map[string]any{
		"docs/a.md": []any{finding("VoiceVale.LongSentence"), finding("VoiceParagraph.Passive"), finding("Schema.Kind")},
	})
	d, _, _ := doorsOf(map[string]string{
		"/tree/docs/a.md": ten + "\n",
		"/tree/docs/b.md": ten + "\n",
		testBin:           "",
	}, map[string]string{"docs": stdout}, "2026-09-12T00:00:00Z")
	d.Ceiling = 100

	got := run(d, false, "measure", "docs")
	if got.code != 1 {
		t.Fatalf("measure past the ceiling exits %d, want 1: %+v", got.code, got)
	}
	if !strings.Contains(got.errs, "docs/a.md") || strings.Contains(got.errs, "docs/b.md") {
		t.Fatalf("measure past the ceiling names %q, want docs/a.md alone", got.errs)
	}
}

func TestVoiceMeasureTranscriptsWritesTheAnswers(t *testing.T) {
	rows := strings.Join([]string{
		spoke(t, ten+" "+ten+" "+ten, nil),
		spoke(t, ten+" "+ten+" "+ten, map[string]any{"isSidechain": true}),
		owner(t, []any{map[string]any{"type": "text", "text": ten}}),
	}, "\n")
	d, disk, ran := doorsOf(map[string]string{"/tree/logs/sess.jsonl": rows, testBin: ""},
		map[string]string{".se/.runtime/measure": "{}"}, "2026-09-12T00:00:00Z")

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
	if len(*ran) != 1 || !strings.HasSuffix((*ran)[0], " .se/.runtime/measure") {
		t.Fatalf("Vale runs over %q, want the measured folder", *ran)
	}
}

func TestVoiceMeasureDryWritesNothing(t *testing.T) {
	rows := spoke(t, ten+" "+ten+" "+ten, nil)
	d, disk, _ := doorsOf(map[string]string{"/tree/logs/sess.jsonl": rows, testBin: ""}, nil, "2026-09-12T00:00:00Z")
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

func TestVoiceMeasureSaysSoWhereValeOrFilesAreAbsent(t *testing.T) {
	d, _, _ := doorsOf(map[string]string{"/tree/docs/a.md": ten, testBin: ""}, nil, "2026-09-12T00:00:00Z")

	gone := d
	gone.Bin = "/nowhere/vale"
	if got := run(gone, false, "measure", "docs"); got != (said{2, "", "Vale is missing. Run ./RUNME.sh once and it installs.\n"}) {
		t.Fatalf("no Vale answers %+v", got)
	}
	none := d
	none.Bin = ""
	if got := run(none, false, "measure", "docs"); got.code != 2 {
		t.Fatalf("an empty Vale path answers %+v", got)
	}
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
		testBin:                     "",
		"/tree/.se/.runtime/x.json": "",
	}, nil, "2026-09-12T00:00:00Z")

	got := run(d, false, "measure")
	if !strings.Contains(got.out, "\na.md ") || !strings.Contains(got.out, "\nsub/F.MARKDOWN ") || strings.Contains(got.out, "b.md") ||
		strings.Contains(got.out, "c.md") || strings.Contains(got.out, "d.md") || strings.Contains(got.out, "e.md") {
		t.Fatalf("the root folder reads past the noise, got %q", got.out)
	}
	if !strings.HasSuffix((*ran)[0], " .") {
		t.Fatalf("Vale runs over the root, got %q", *ran)
	}
	if got := run(d, false, "measure", ".se"); !strings.Contains(got.out, "\n.se/b.md ") {
		t.Fatalf("a folder under .se reads .se, got %q", got.out)
	}
	if got := run(d, false, "measure", "/tree/a.md"); !strings.Contains(got.out, "\na.md ") || got.code != 0 {
		t.Fatalf("a file path reads the file alone, got %+v", got)
	}
}

func TestVoiceWordsInReadsLettersAndDigits(t *testing.T) {
	for text, want := range map[string]int{"one two three": 3, "one, two. three!": 3, "a well-made thing": 3, "it's": 1, "": 0} {
		if got := WordsIn(text); got != want {
			t.Fatalf("WordsIn(%q) = %d, want %d", text, got, want)
		}
	}
}

func TestVoiceRowsInDropsALineNobodyReads(t *testing.T) {
	got := RowsIn(strings.Join([]string{`{"a":1}`, "", "{ this is not json", `{"a":2}`}, "\r\n"))
	if !reflect.DeepEqual(got, []Row{{"a": 1.0}, {"a": 2.0}}) {
		t.Fatalf("RowsIn answers %v", got)
	}
	if got := RowsIn(""); len(got) != 0 {
		t.Fatalf("RowsIn of nothing answers %v", got)
	}
	if got := RowsIn(`{"a":1}`, `{"b":2}`); len(got) != 2 {
		t.Fatalf("RowsIn over two texts answers %v", got)
	}
}

func TestVoiceAnswersInKeepsTheMainLineAndDropsTheHelpers(t *testing.T) {
	text := strings.Join([]string{
		spoke(t, long(Shortest), map[string]any{"isSidechain": true}),
		spoke(t, long(Shortest), map[string]any{"agentId": "one"}),
		spoke(t, long(Shortest+5), nil),
		owner(t, []any{map[string]any{"type": "text", "text": long(40)}}),
	}, "\n")
	found := AnswersIn(text)
	if len(found) != 1 || WordsIn(found[0]) != Shortest+5 {
		t.Fatalf("AnswersIn answers %q", found)
	}
}

func TestVoiceAnswersInReadsTheLastTextOfATurn(t *testing.T) {
	answer := long(Shortest + 3)
	text := strings.Join([]string{
		owner(t, "Fix the door."),
		spoke(t, "Reading the door first, then "+long(Shortest)+".", nil),
		owner(t, []any{map[string]any{"type": "tool_result", "content": "a line"}}),
		spoke(t, answer, nil),
		owner(t, []any{map[string]any{"type": "text", "text": "Next."}}),
		spoke(t, long(Shortest+1), nil),
	}, "\n")
	if got := AnswersIn(text); !reflect.DeepEqual(got, []string{answer, long(Shortest + 1)}) {
		t.Fatalf("AnswersIn answers %q", got)
	}

	meta := strings.Join([]string{
		owner(t, "Fix the door."),
		spoke(t, long(Shortest+2), nil),
		owner(t, []any{map[string]any{"type": "tool_result", "content": "a line"}}),
		`{"type":"user","isMeta":true,"message":{"content":"a caveat"}}`,
		`{"type":"user","isCompactSummary":true,"message":{"content":"a summary"}}`,
		spoke(t, answer, nil),
	}, "\n")
	if got := AnswersIn(meta); !reflect.DeepEqual(got, []string{answer}) {
		t.Fatalf("a tool result and a meta row open no turn, got %q", got)
	}

	short := strings.Join([]string{owner(t, "Go."), spoke(t, long(Shortest+4), nil), spoke(t, "Done.", nil)}, "\n")
	if got := AnswersIn(short); len(got) != 0 {
		t.Fatalf("a short last text gives nothing back, got %q", got)
	}

	two := spoke(t, "", nil)
	var row map[string]any
	_ = json.Unmarshal([]byte(two), &row)
	row["message"] = map[string]any{"content": []any{
		map[string]any{"type": "text", "text": "  " + long(20)},
		map[string]any{"type": "tool_use", "text": "skipped"},
		map[string]any{"type": "text", "text": long(10) + "  "},
	}}
	if got := AnswersIn(jsonOf(t, row)); !reflect.DeepEqual(got, []string{long(20) + "\n\n" + long(10)}) {
		t.Fatalf("the text blocks join by a blank line, got %q", got)
	}
}

func TestVoiceAnswerFilesNumberEachAnswer(t *testing.T) {
	files := AnswerFiles("one-session", []string{"first  \n", "second"})
	want := []File{
		{Path: ".se/.runtime/measure/one-session/001-answer.md", Text: "first\n"},
		{Path: ".se/.runtime/measure/one-session/002-answer.md", Text: "second\n"},
	}
	if !reflect.DeepEqual(files, want) {
		t.Fatalf("AnswerFiles answers %+v", files)
	}
}

func TestVoiceScoreIsFindingsAThousandWords(t *testing.T) {
	for _, one := range []struct {
		words, findings int
		want            float64
	}{{1000, 6, 6}, {517, 6, 11.6}, {0, 4, 0}, {200, 0, 0}, {250, 1, 4}} {
		if got := ScoreOf(one.words, one.findings); got != one.want {
			t.Fatalf("ScoreOf(%d, %d) = %v, want %v", one.words, one.findings, got, one.want)
		}
	}
}

func TestVoiceLeafOfDropsTheStyle(t *testing.T) {
	for said, want := range map[string]string{"VoiceVale.PastTense": "PastTense", "Schema.Kind": "Kind", "ShellWritesNothing": "ShellWritesNothing", "": "", " a.b ": "b"} {
		if got := LeafOf(said); got != want {
			t.Fatalf("LeafOf(%q) = %q, want %q", said, got, want)
		}
	}
}

func TestVoiceRuleCountsRankByFires(t *testing.T) {
	found := []Finding{{Rule: "VoiceVale.LongSentence"}, {Rule: "VoiceVale.LongSentence"}, {Rule: "VoiceVale.Passive"}, {Rule: "VoiceVale.LongSentence"}, {Rule: "VoiceVale.Passive"}, {Rule: ""}}
	if got := RuleCounts(found); !reflect.DeepEqual(got, []Count{{"LongSentence", 3}, {"Passive", 2}}) {
		t.Fatalf("RuleCounts answers %v", got)
	}
	if got := RuleCounts(nil); len(got) != 0 {
		t.Fatalf("RuleCounts of nothing answers %v", got)
	}
	tied := []Finding{{Rule: "b"}, {Rule: "B"}, {Rule: "a_b"}, {Rule: "ab"}, {Rule: "A"}}
	if got := RuleCounts(tied); !reflect.DeepEqual(got, []Count{{"A", 1}, {"a_b", 1}, {"ab", 1}, {"b", 1}, {"B", 1}}) {
		t.Fatalf("a tie sorts as localeCompare does, got %v", got)
	}
}

func TestVoiceMeasuredRowsScoreAndTotal(t *testing.T) {
	var dirty []Finding
	for range 4 {
		dirty = append(dirty, Finding{Rule: "VoiceVale.LongSentence"})
	}
	for range 2 {
		dirty = append(dirty, Finding{Rule: "VoiceVale.Passive"})
	}
	rows := MeasuredRows([]Scored{{File: "003-answer.md", Words: 517, Found: dirty}, {File: "004-answer.md", Words: 483}})
	if rows[0].Findings != 6 || rows[0].Score != 11.6 || !reflect.DeepEqual(rows[0].Top, []Count{{"LongSentence", 4}, {"Passive", 2}}) {
		t.Fatalf("the dirty row reads %+v", rows[0])
	}
	if rows[1].Findings != 0 || rows[1].Score != 0 {
		t.Fatalf("the clean row reads %+v", rows[1])
	}
	if all := TotalOf(rows); all.File != "TOTAL" || all.Words != 1000 || all.Findings != 6 || all.Score != 6 {
		t.Fatalf("the total reads %+v", all)
	}

	drawn := strings.Split(MeasureTable(rows[:1]), "\n")
	if drawn[0] != "file           words  findings  per 1000 words  top rules" ||
		drawn[1] != "003-answer.md    517         6            11.6  LongSentence 4, Passive 2" {
		t.Fatalf("the measure table reads %q", drawn)
	}
}

func TestVoiceSinceOfWalksTheClockBack(t *testing.T) {
	now := time.Date(2026, 9, 12, 6, 30, 15, 123456789, time.UTC)
	for days, want := range map[float64]string{
		7: "2026-09-05T06:30:15.123Z", 1.5: "2026-09-10T06:30:15.123Z", 0.5: "2026-09-11T06:30:15.123Z",
		12: "2026-08-31T06:30:15.123Z", 12.5: "2026-08-31T06:30:15.123Z", 365: "2025-09-12T06:30:15.123Z",
		1e8: "-271765-12-31T06:30:15.123Z",
	} {
		if got, err := SinceOf(now, days); err != nil || got != want {
			t.Fatalf("SinceOf(%v) = %q %v, want %q", days, got, err, want)
		}
	}
	if got, _ := SinceOf(time.Date(2026, 1, 3, 0, 0, 0, 0, time.UTC), Days); got != "2025-12-27T00:00:00.000Z" {
		t.Fatalf("SinceOf over a year end = %q", got)
	}
	if _, err := SinceOf(now, 1.01e8); err == nil {
		t.Fatal("a day count past the date range fails as toISOString does")
	}
}

func TestVoiceDaysOfReadsAsNumberDoes(t *testing.T) {
	for said, want := range map[string]float64{"": 7, " 5 ": 5, "1e2": 100, "0x10": 16, "-0x10": 7, "0b11": 3, "0o7": 7, "Infinity": 7, "1_0": 7, ".5": 0.5, "5.": 5, "abc": 7, "+3": 3, "-3": 7, "0": 7} {
		if got := DaysOf(said); got != want {
			t.Fatalf("DaysOf(%q) = %v, want %v", said, got, want)
		}
	}
}

func TestVoiceRefusalsInKeepsWarnRowsInsideTheDays(t *testing.T) {
	rows := []Row{
		{"at": "2026-09-11T00:00:00.000Z", "level": "warn", "rule": "VoiceVale.PastTense"},
		{"at": "2026-09-11T00:00:00.000Z", "level": "info", "rule": "VoiceVale.PastTense"},
		{"at": "2026-09-11T00:00:00.000Z", "level": "warn", "said": "no rule here"},
		{"at": "2026-08-01T00:00:00.000Z", "level": "warn", "rule": "VoiceVale.Passive"},
	}
	since, _ := SinceOf(time.Date(2026, 9, 12, 0, 0, 0, 0, time.UTC), Days)
	if got := RefusalsIn(rows, since); len(got) != 1 || got[0]["rule"] != "VoiceVale.PastTense" {
		t.Fatalf("RefusalsIn answers %v", got)
	}
	if got := RefusalsIn(rows, ""); len(got) != 2 {
		t.Fatalf("no day count keeps the old row too, got %v", got)
	}
}

func TestVoiceRankedRefusalsOrderByFires(t *testing.T) {
	var rows []Row
	for range 14 {
		rows = append(rows, Row{"level": "warn", "rule": "VoiceVale.PastTense", "phrase": "bold"})
	}
	for range 11 {
		rows = append(rows, Row{"level": "warn", "rule": "VoiceVale.LongSentence", "phrase": "..."})
	}
	for range 3 {
		rows = append(rows, Row{"level": "warn", "rule": "ShellWritesNothing", "tool": "Bash"})
	}
	want := []Refusal{{"PastTense", "bold", 14}, {"LongSentence", "...", 11}, {"ShellWritesNothing", "Bash", 3}}
	if got := RankedRefusals(rows); !reflect.DeepEqual(got, want) {
		t.Fatalf("RankedRefusals answers %v", got)
	}

	fell := RankedRefusals([]Row{{"level": "warn", "rule": "VoiceVale.Passive", "tool": "Write"}, {"level": "warn", "rule": "VoiceVale.Passive", "phrase": "a phrase"}})
	var phrases []string
	for _, one := range fell {
		phrases = append(phrases, one.Phrase)
	}
	sort.Strings(phrases)
	if !slices.Equal(phrases, []string{"Write", "a phrase"}) {
		t.Fatalf("the phrase wins where the row carries one, got %v", phrases)
	}

	drawn := strings.Split(RefusedTable(RankedRefusals([]Row{{"level": "warn", "rule": "A.B", "phrase": "x"}})), "\n")
	if !slices.Equal(drawn, []string{"rule  fires  phrase", "B         1  x"}) {
		t.Fatalf("the refused table reads %q", drawn)
	}
}

func TestVoiceTabledPadsByUTF16AndTrims(t *testing.T) {
	drawn := Tabled([]string{"rule", "fires"}, [][]string{{"PastTense", "14"}, {"X", "3"}}, []int{1})
	if !slices.Equal(strings.Split(drawn, "\n"), []string{"rule       fires", "PastTense     14", "X              3"}) {
		t.Fatalf("Tabled answers %q", drawn)
	}
	wide := Tabled([]string{"a", "b"}, [][]string{{"é€😀", "1"}, {"x", "22"}}, []int{1})
	if !slices.Equal(strings.Split(wide, "\n"), []string{"a      b", "é€😀   1", "x     22"}) {
		t.Fatalf("Tabled pads by UTF-16 length, got %q", wide)
	}
}

func TestVoiceFromJSONReadsValeRows(t *testing.T) {
	got := FromJSON(`{"b.md":[{"Check":"VoiceVale.X","Line":3,"Span":[2,4],"Match":"m","Message":"say","Severity":"warning","Action":{"Name":"replace"}}],` +
		`"a.md":[{"Check":"Other.Y","Line":1}],"c.md":"not rows"}`)
	want := []Finding{
		{File: "a.md", Rule: "Other.Y", Line: 1, Column: 1, Severity: "error"},
		{File: "b.md", Rule: "X", Line: 3, Column: 2, Said: "m", Message: "say", Severity: "warning", Fixable: true},
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("FromJSON answers %+v", got)
	}
	if got := FromJSON("not json"); len(got) != 0 {
		t.Fatalf("FromJSON of no JSON answers %v", got)
	}
	if got := FromJSON(""); len(got) != 0 {
		t.Fatalf("FromJSON of nothing answers %v", got)
	}
}

// The measured answers stand under the runtime folder brief.ToolsFile names, which .claude/skills/level0/lib/folders.js owns. [[spec/design_input/the-runtime-files-stand-apart]]
func TestMeasuredStandsInTheRuntimeFolder(t *testing.T) {
	if !strings.HasPrefix(Measured, path.Dir(brief.ToolsFile)+"/") {
		t.Errorf("%s stands outside %s", Measured, path.Dir(brief.ToolsFile))
	}
}
