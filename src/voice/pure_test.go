// The pure half of the voice verbs, case by case: rows and texts go in, and
// each case reads the rows, numbers and tables that come back.
// [[spec/guidance/code/testing]]
package voice

import (
	"encoding/json"
	"reflect"
	"slices"
	"sort"
	"strings"
	"testing"
	"time"
)

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
