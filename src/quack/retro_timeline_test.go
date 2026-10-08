// The retro's timeline over a seeded input, and the helpers every reading case
// lays its tree with.
// [[spec/guidance/retro/chapter]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"reflect"
	"strings"
	"sync"
	"testing"
)

// The fake disk each retro case's root stands on, keyed by the root so parallel cases stay apart. [[spec/tickets/test-walks-move-onto-fakes]]
var hq2RetroDisks sync.Map

// The one fake disk under a root, which the seed helpers and retroBoxAt share. [[spec/tickets/test-walks-move-onto-fakes]]
func hq2RetroDisk(root string) diskDoors {
	if held, ok := hq2RetroDisks.Load(root); ok {
		return held.(diskDoors)
	}
	held, _ := hq2RetroDisks.LoadOrStore(root, newFakeDisk())
	return held.(diskDoors)
}

// Writes a file on a disk door, its folders made, and the case stops where the door refuses. [[spec/tickets/test-walks-move-onto-fakes]]
func hq2Seed(t *testing.T, disk diskDoors, at, text string) {
	t.Helper()
	hq1SeedDisk(t, disk, filepath.Dir(at), map[string]string{filepath.Base(at): text})
}

// The retro every reading case names. [[spec/guidance/retro/chapter]]
const retroReadingName = "retro-a1b2c3"

// The input the reading cases seed: a transcript and a log, one line with no time. [[spec/guidance/retro/chapter]]
var retroReadingInput = map[string]string{
	"input/transcripts/one/a.jsonl": `{"timestamp":"2026-09-19T08:10:00.000Z"}` + "\n" +
		`{"type":"no time here"}` + "\n" +
		`{"timestamp":"2026-09-19T15:20:00.000Z","is_error":true}`,
	"input/log/session.jsonl": `{"at":"2026-09-19T08:30:00.000Z"}` + "\n" +
		`{"at":"2026-09-19T16:00:00.000Z","level":"warn"}`,
}

// The cuts the reading cases write: the morning, then the afternoon. [[spec/guidance/retro/chapter]]
const retroReadingCuts = `[{"id":"c1","title":"the morning","from":"2026-09-19T08:00:00.000Z","to":"2026-09-19T14:00:00.000Z"},` +
	`{"id":"c2","title":"the afternoon","from":"2026-09-19T14:00:00.000Z","to":"2026-09-19T20:00:00.000Z"}]`

// Writes each file under the retro's home in the root. [[spec/guidance/retro/chapter]]
func retroReadingLay(t *testing.T, root, name string, files map[string]string) {
	t.Helper()
	for rel, body := range files {
		hq2Seed(t, hq2RetroDisk(root), filepath.Join(retroHome(root, name), filepath.FromSlash(rel)), body)
	}
}

// The files of the first map with the second's over them. [[spec/guidance/retro/chapter]]
func retroReadingWith(base, more map[string]string) map[string]string {
	out := map[string]string{}
	for rel, body := range base {
		out[rel] = body
	}
	for rel, body := range more {
		out[rel] = body
	}
	return out
}

// A file under the retro's home, read, and the case stops where none stands. [[spec/guidance/retro/chapter]]
func retroReadingFile(t *testing.T, root, name, rel string) string {
	t.Helper()
	body, err := hq2RetroDisk(root).read(filepath.Join(retroHome(root, name), filepath.FromSlash(rel)))
	if err != nil {
		t.Fatalf("the verb writes no %s: %v", rel, err)
	}
	return string(body)
}

// Runs a verb over the root, and answers its code, its output and its errors. [[spec/guidance/retro/chapter]]
func retroReadingRun(verb func(func() boxDoors) twin, root string, argv ...string) (int, string, string) {
	var out, errs strings.Builder
	code := verb(retroBoxAt(root))(argv, false, &out, &errs)
	return code, out.String(), errs.String()
}

// A findings file holding a section per row, with the items the case names. [[spec/guidance/retro/read]]
func retroReadingFindings(rows map[string][]string) string {
	sections := []string{}
	for _, row := range retroRows {
		items := []string{}
		for _, one := range rows[row] {
			items = append(items, "- "+one)
		}
		sections = append(sections, "## "+row+"\n\n"+strings.Join(items, "\n")+"\n")
	}
	return strings.Join(sections, "\n")
}

// The timeline counts every timed line by hour, and a line with no time takes the time before it. [[spec/guidance/retro/chapter]]
func TestRetroTimelineCountsEveryTimedLineByHourAndAnUntimedLineTakesTheTimeBefore(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	retroReadingLay(t, root, retroReadingName, retroReadingInput)

	code, out, errs := retroReadingRun(retroTimelineVerb, root, "retro", "timeline", retroReadingName)

	if code != 0 {
		t.Fatalf("timeline answers %d: %s", code, errs)
	}
	var hours []struct {
		Hour                               string
		Transcripts, Log, Faults, Sessions int
	}
	if err := json.Unmarshal([]byte(retroReadingFile(t, root, retroReadingName, "timeline.json")), &hours); err != nil {
		t.Fatal(err)
	}
	got := []string{}
	for _, one := range hours {
		got = append(got, fmt.Sprintf("%s %d %d %d", one.Hour, one.Transcripts, one.Log, one.Faults))
	}
	want := []string{"2026-09-19T08 2 1 0", "2026-09-19T15 1 0 1", "2026-09-19T16 0 1 1"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("timeline.json holds %v, want %v", got, want)
	}
	row := func(hour string, transcripts, log, sessions, faults int) string {
		return fmt.Sprintf("%s   %10d  %3d  %8d  %6d\n", hour, transcripts, log, sessions, faults)
	}
	printed := "hour (UTC)      transcript  log  sessions  faults\n" +
		row("2026-09-19T08", 2, 1, 1, 0) +
		"  ... 6 idle hour(s)\n" +
		row("2026-09-19T15", 1, 0, 1, 1) +
		row("2026-09-19T16", 0, 1, 0, 1)
	if out != printed {
		t.Fatalf("timeline prints %q, want %q", out, printed)
	}
}
