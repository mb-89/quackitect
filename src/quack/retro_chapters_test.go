// The retro's chapters over a seeded input: every timed line handed to one
// chapter, and a gap or a stray line refused.
// [[spec/guidance/retro/chapter]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

// Chapters hand every line to one chapter, as line ranges per file. [[spec/guidance/retro/chapter]]
func TestRetroChaptersHandEveryLineToOneChapterAsLineRangesPerFile(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	retroReadingLay(t, root, retroReadingName, retroReadingWith(retroReadingInput, map[string]string{"chapters.json": retroReadingCuts}))

	code, out, errs := retroReadingRun(retroChaptersVerb, root, "retro", "chapters", retroReadingName)

	if code != 0 {
		t.Fatalf("chapters answers %d: %s", code, errs)
	}
	printed := "c1  2026-09-19T08:00:00.000Z to 2026-09-19T14:00:00.000Z  3 line(s)  the morning\n" +
		"c2  2026-09-19T14:00:00.000Z to 2026-09-19T20:00:00.000Z  2 line(s)  the afternoon\n"
	if out != printed {
		t.Fatalf("chapters prints %q, want %q", out, printed)
	}
	var one, two struct{ Lines map[string][][2]int }
	if err := json.Unmarshal([]byte(retroReadingFile(t, root, retroReadingName, "chapters/c1.json")), &one); err != nil {
		t.Fatal(err)
	}
	want := map[string][][2]int{
		"log/session.jsonl":       {{1, 1}},
		"transcripts/one/a.jsonl": {{1, 2}},
	}
	if !reflect.DeepEqual(one.Lines, want) {
		t.Fatalf("c1 holds %v, want %v", one.Lines, want)
	}
	if err := json.Unmarshal([]byte(retroReadingFile(t, root, retroReadingName, "chapters/c2.json")), &two); err != nil {
		t.Fatal(err)
	}
	if got := two.Lines["transcripts/one/a.jsonl"]; !reflect.DeepEqual(got, [][2]int{{3, 3}}) {
		t.Fatalf("c2 holds %v of the transcript, want [[3 3]]", got)
	}
}

// Chapters refuse a gap between two cuts, and a line past every chapter. [[spec/guidance/retro/chapter]]
func TestRetroChaptersRefuseAGapBetweenTwoCutsAndALinePastEveryChapter(t *testing.T) {
	t.Parallel()
	morning := `{"id":"c1","title":"the morning","from":"2026-09-19T08:00:00.000Z","to":"2026-09-19T12:00:00.000Z"}`
	afternoon := `{"id":"c2","title":"the afternoon","from":"2026-09-19T14:00:00.000Z","to":"2026-09-19T15:00:00.000Z"}`
	root := t.TempDir()
	retroReadingLay(t, root, retroReadingName, retroReadingWith(retroReadingInput, map[string]string{"chapters.json": "[" + morning + "," + afternoon + "]"}))

	code, _, errs := retroReadingRun(retroChaptersVerb, root, "retro", "chapters", retroReadingName)

	if code != 1 || errs != "c1 ends apart from where c2 starts: a gap or an overlap\n" {
		t.Fatalf("a gap answers %d, %q", code, errs)
	}
	if _, err := hq2RetroDisk(root).stat(filepath.Join(retroHome(root, retroReadingName), "chapters", "c1.json")); err == nil {
		t.Fatal("a refused cut writes c1.json")
	}

	past := t.TempDir()
	retroReadingLay(t, past, retroReadingName, retroReadingWith(retroReadingInput, map[string]string{"chapters.json": "[" + morning + "]"}))
	code, _, errs = retroReadingRun(retroChaptersVerb, past, "retro", "chapters", retroReadingName)
	if code != 1 || errs != "2 timed line(s) fall past every chapter\n" {
		t.Fatalf("a line past every chapter answers %d, %q", code, errs)
	}
}

// Chapters read their commits through the box's run door, and a failing git warns where the record carries none. [[spec/tickets/retro-chapters-take-git-door]]
func TestRetroChaptersReadCommitsThroughTheRunDoor(t *testing.T) {
	t.Parallel()
	for said, want := range map[ranResult][]string{{stdout: "abc1234 one\ndef5678 two\n"}: {"abc1234 one", "def5678 two"}, {code: 128, stderr: "fatal: no repository"}: {}} {
		root := t.TempDir() // level0: FixtureOutsideHome - each case writes its chapters into a tree of its own
		retroReadingLay(t, root, retroReadingName, retroReadingWith(retroReadingInput, map[string]string{"chapters.json": retroReadingCuts}))
		box := func() boxDoors {
			d := retroBoxAt(root)()
			d.run = func([]string, runOpts) ranResult { return said }
			return d
		}
		code, _, errs := retroReadingRun(func(func() boxDoors) twin { return retroChaptersVerb(box) }, root, "retro", "chapters", retroReadingName)
		var read struct{ Commits []string }
		_ = json.Unmarshal([]byte(retroReadingFile(t, root, retroReadingName, "chapters/c1.json")), &read)
		if code != 0 || !reflect.DeepEqual(read.Commits, want) || strings.Contains(errs, "git log answers 128") != (said.code != 0) {
			t.Errorf("git answering %+v gives %d, the commits %v, and says %q", said, code, read.Commits, errs)
		}
	}
}
