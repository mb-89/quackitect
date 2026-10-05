// The retro's class fixes over a seeded retro: every finding, note and memory
// carries a disposition, and each class a rate.
// [[spec/guidance/retro/classify]]
package main

import (
	"encoding/json"
	"reflect"
	"strings"
	"testing"
)

// The first retro the class cases name, and the one after it. [[spec/guidance/retro/classify]]
const (
	retroClassesFirst  = "retro-one"
	retroClassesSecond = "retro-two"
)

// One chapter over the whole day. [[spec/guidance/retro/classify]]
const retroClassesCuts = `[{"id":"c1","title":"the day","from":"2026-09-19T08:00:00.000Z","to":"2026-09-19T20:00:00.000Z"}]`

// A log over two active hours, the pattern matching twice. [[spec/guidance/retro/classify]]
const retroClassesLog = `{"at":"2026-09-19T08:10:00.000Z","said":"PastTense refused"}` + "\n" +
	`{"at":"2026-09-19T09:10:00.000Z","said":"PastTense refused"}` + "\n" +
	`{"at":"2026-09-19T09:20:00.000Z","said":"a quiet line"}`

// The class every case writes. [[spec/guidance/retro/classify]]
const retroClassesClass = `{"id":"k1","category":"mechanize","class":"commit messages meet the voice rules late",` +
	`"defect":"a commit message fails the tense rule at the commit","fix":"a commit verb lints the message first",` +
	`"measure":{"source":"log","pattern":"PastTense"},"tickets":["the-commit-lints-first"]}`

// The dispositions of both findings of the chapter. [[spec/guidance/retro/classify]]
const retroClassesDispositions = `"c1.stop.1":"k1","c1.keep.1":"dropped: a practice, and nothing to change"`

// The promotion every whole record carries. [[spec/guidance/retro/classify]]
const retroClassesPromotions = `"promotions":[{"what":"the log reader script","from":".se/scripts","to":"a log verb"}]`

// A record holding every disposition the chapter needs. [[spec/guidance/retro/classify]]
const retroClassesWhole = `{"classes":[` + retroClassesClass + `],"dispositions":{` + retroClassesDispositions + `},` + retroClassesPromotions + `}`

// A retro's files: its log, its cut, its findings and its record, with more over them. [[spec/guidance/retro/classify]]
func retroClassesTree(record string, more map[string]string) map[string]string {
	return retroReadingWith(map[string]string{
		"input/log/session.jsonl": retroClassesLog,
		"chapters.json":           retroClassesCuts,
		"findings/c1.md": retroReadingFindings(map[string][]string{
			"stop": {"a message fails"},
			"keep": {"the tests"},
		}),
		"classes.json": record,
	}, more)
}

// Classes refuse a finding with no disposition, and a disposition naming nothing. [[spec/guidance/retro/classify]]
func TestRetroClassesRefuseAFindingWithNoDispositionAndADispositionNamingNothing(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	record := `{"classes":[` + retroClassesClass + `],"dispositions":{"c1.stop.1":"k9"},"promotions":[]}`
	retroReadingLay(t, root, retroClassesFirst, retroClassesTree(record, nil))

	code, _, errs := retroReadingRun(retroClassesVerb, root, "retro", "classes", retroClassesFirst)

	want := "c1.keep.1 carries no disposition\n" +
		"c1.stop.1 names k9, which is no class and no dropped: or done: or ticket: with its reason\n"
	if code != 1 || errs != want {
		t.Fatalf("classes answers %d, %q, want 1, %q", code, errs, want)
	}
}

// Every collected note and memory answers where it goes, and the report lists them with the checklist and the limits. [[spec/guidance/retro/classify]]
func TestRetroClassesHoldEveryNoteAndMemoryAndTheReportListsThemWithTheChecklistAndTheLimits(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	retroReadingLay(t, root, retroClassesFirst, retroClassesTree(retroClassesWhole, map[string]string{
		"input/tickets/a-parked-thought.md":  "---\nkind: [[ticket]]\n---\n",
		"input/memory/the-project/MEMORY.md": "- an index line\n",
		"input/memory/the-project/a-rule.md": "a remembered rule\n",
	}))

	code, _, errs := retroReadingRun(retroClassesVerb, root, "retro", "classes", retroClassesFirst)
	if code != 1 || !strings.Contains(errs, "note:a-parked-thought carries no disposition") || !strings.Contains(errs, "memory:a-rule carries no disposition") {
		t.Fatalf("an undisposed note and memory answer %d, %q", code, errs)
	}
	if strings.Contains(errs, "memory:MEMORY") {
		t.Fatalf("the memory index asks a disposition: %q", errs)
	}

	retroReadingLay(t, root, retroClassesFirst, map[string]string{"classes.json": `{"classes":[` + retroClassesClass + `],` +
		`"dispositions":{` + retroClassesDispositions + `,"note:a-parked-thought":"done: the land verb carries it","memory:a-rule":"ticket: the-rule-moves-home"},` +
		retroClassesPromotions + `,` +
		`"checklist":[{"item":"Does every change reach the running system?","why":"three classes share it"}],` +
		`"limits":[{"what":"the thinking","why":"the transcripts keep it empty"}]}`})
	if code, _, errs := retroReadingRun(retroClassesVerb, root, "retro", "classes", retroClassesFirst); code != 0 {
		t.Fatalf("classes answers %d: %s", code, errs)
	}
	retroReadingRun(retroMatrixVerb, root, "retro", "matrix", retroClassesFirst)
	report := retroReadingFile(t, root, retroClassesFirst, "report.md")
	retroReportHolds(t, report,
		`\| note:a-parked-thought \| done: the land verb carries it \|`,
		`## New checklist items[\s\S]*Does every change reach the running system\?`,
		`## Limits[\s\S]*\| the thinking \| the transcripts keep it empty \|`,
	)
}

// An auditor's column joins the matrix beside the chapters. [[spec/guidance/retro/audit]]
func TestRetroClassesTakeAnAuditorsColumnBesideTheChapters(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	retroReadingLay(t, root, retroClassesFirst, retroClassesTree(retroClassesWhole, map[string]string{
		"findings/audit-code.md": retroReadingFindings(map[string][]string{"stop": {"a header retells its pointer"}}),
	}))

	_, _, errs := retroReadingRun(retroClassesVerb, root, "retro", "classes", retroClassesFirst)

	if !strings.Contains(errs, "audit-code.stop.1 carries no disposition") {
		t.Fatalf("classes leaves the auditor's finding undisposed unnamed: %q", errs)
	}
}

// Classes count each pattern per active hour, and the report opens on them. [[spec/guidance/retro/classify]]
func TestRetroClassesCountEachPatternPerActiveHourAndTheReportOpensOnThem(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	retroReadingLay(t, root, retroClassesFirst, retroClassesTree(retroClassesWhole, nil))

	code, out, errs := retroReadingRun(retroClassesVerb, root, "retro", "classes", retroClassesFirst)

	printed := "k1  mechanize  2 match(es), 1 an hour  commit messages meet the voice rules late\n" +
		"2 active hour(s), and every finding, note and memory carries a disposition.\n"
	if code != 0 || out != printed {
		t.Fatalf("classes answers %d, %q, %q, want %q", code, out, errs, printed)
	}
	var rates retroRates
	if err := json.Unmarshal([]byte(retroReadingFile(t, root, retroClassesFirst, "rates.json")), &rates); err != nil {
		t.Fatal(err)
	}
	want := retroRates{Hours: 2, Classes: map[string]retroRate{"k1": {Count: 2, Rate: 1}}}
	if !reflect.DeepEqual(rates, want) {
		t.Fatalf("rates.json holds %+v, want %+v", rates, want)
	}

	retroReadingRun(retroMatrixVerb, root, "retro", "matrix", retroClassesFirst)
	report := retroReadingFile(t, root, retroClassesFirst, "report.md")
	if strings.Index(report, "## Bottom line") >= strings.Index(report, "## The matrix") {
		t.Fatalf("the report opens on no bottom line:\n%s", report)
	}
	retroReportHolds(t, report,
		`### mechanize`,
		`\| k1 · commit messages meet the voice rules late \|.*\| 1 \| the check step stands open \| the-commit-lints-first \| 1 \|`,
		`\| the log reader script \| \.se/scripts \| a log verb \|`,
		"- `c1\\.keep\\.1` the tests → dropped: a practice",
	)
}
