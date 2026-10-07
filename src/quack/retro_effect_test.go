// The effect step: the last retro's class patterns counted again, each with
// its verdict, and this retro's battery read against the last one's.
// [[spec/guidance/retro/effect]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"strings"
	"testing"
)

// The later battery report. [[spec/guidance/retro/effect]]
const retroEffectLater = `{"parts":{"tests":1400,"rules":200},"total":1600,"slowest":[{"name":"steady","ms":110},{"name":"arrives","ms":90}]}`

// The next retro counts the last one's patterns again, and names each verdict. [[spec/guidance/retro/effect]]
// The second retro's collect time and its log: four active hours, the pattern matching once. [[spec/guidance/retro/effect]]
var retroEffectSecond = map[string]string{
	"collected.json": `{"at":"2026-09-26T21:00:00.000Z"}`,
	"input/log/session.jsonl": `{"at":"2026-09-26T08:10:00.000Z","said":"PastTense refused"}` + "\n" +
		`{"at":"2026-09-26T09:10:00.000Z","said":"a quiet line"}` + "\n" +
		`{"at":"2026-09-26T10:10:00.000Z","said":"a quiet line"}` + "\n" +
		`{"at":"2026-09-26T11:10:00.000Z","said":"a quiet line"}`,
}

// A fresh box finds the last retro's classes in the tracked folder, where no private folder holds them. [[spec/tickets/retro-read-reads-every-record]]
func TestRetroEffectFindsTheLastRetrosClassesInATrackedFolder(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	kept := "spec/retros/" + retroClassesFirst + "/"
	retroMintWrite(t, root, kept+"classes.json", retroClassesWhole)
	retroMintWrite(t, root, kept+"rates.json", `{"hours":2,"classes":{"k1":{"count":2,"rate":1}}}`)
	retroMintWrite(t, root, kept+"collected.json", `{"at":"2026-09-19T21:00:00.000Z"}`)
	retroReadingLay(t, root, retroClassesSecond, retroEffectSecond)

	code, out, errs := retroReadingRun(retroEffectVerb, root, "retro", "effect", retroClassesSecond)

	printed := "k1  1 to 0.25 an hour  falls  commit messages meet the voice rules late\n"
	if code != 0 || out != printed {
		t.Fatalf("effect answers %d, %q, %q, want %q", code, out, errs, printed)
	}
}

func TestRetroEffectCountsTheLastRetrosPatternsAgainAndNamesEachVerdict(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	retroReadingLay(t, root, retroClassesFirst, retroClassesTree(retroClassesWhole, map[string]string{
		"collected.json": `{"at":"2026-09-19T21:00:00.000Z"}`,
	}))
	retroReadingLay(t, root, retroClassesSecond, retroEffectSecond)
	retroReadingRun(retroClassesVerb, root, "retro", "classes", retroClassesFirst)

	code, out, errs := retroReadingRun(retroEffectVerb, root, "retro", "effect", retroClassesSecond)

	printed := "k1  1 to 0.25 an hour  falls  commit messages meet the voice rules late\n"
	if code != 0 || out != printed {
		t.Fatalf("effect answers %d, %q, %q, want %q", code, out, errs, printed)
	}
	var effect retroEffectRecord
	if err := json.Unmarshal([]byte(retroReadingFile(t, root, retroClassesSecond, "effect.json")), &effect); err != nil {
		t.Fatal(err)
	}
	if effect.Last != retroClassesFirst || len(effect.Classes) != 1 {
		t.Fatalf("effect.json holds %+v", effect)
	}
	one := effect.Classes[0]
	if one.ID != "k1" || one.Before.Rate != 1 || one.Now.Rate != 0.25 || one.Verdict != "falls" {
		t.Fatalf("effect.json reads k1 as %+v", one)
	}
}

// A verdict reads gone, falls, holds or grows. [[spec/guidance/retro/effect]]
func TestRetroEffectReadsAVerdictGoneFallsHoldsOrGrows(t *testing.T) {
	t.Parallel()
	before := retroRate{Count: 4, Rate: 1}
	for _, one := range []struct {
		now  retroRate
		want string
	}{
		{retroRate{Count: 0, Rate: 0}, "gone"},
		{retroRate{Count: 2, Rate: 0.5}, "falls"},
		{retroRate{Count: 4, Rate: 1}, "holds"},
		{retroRate{Count: 8, Rate: 2}, "grows"},
	} {
		if got := retroVerdictOf(before, one.now); got != one.want {
			t.Fatalf("%+v reads %q, want %q", one.now, got, one.want)
		}
	}
}

// A retro with no earlier class fixes measures nothing, and says so. [[spec/guidance/retro/effect]]
func TestRetroEffectWithNoEarlierClassFixesMeasuresNothingAndSaysSo(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	retroReadingLay(t, root, retroClassesSecond, map[string]string{"collected.json": `{"at":"2026-09-26T21:00:00.000Z"}`})

	code, out, _ := retroReadingRun(retroEffectVerb, root, "retro", "effect", retroClassesSecond)

	if code != 0 || !strings.Contains(out, "No earlier retro holds class fixes") {
		t.Fatalf("effect answers %d, %q", code, out)
	}
}

// The first retro has nothing to read against, so its battery stands as the baseline the next one reads. [[spec/guidance/retro/effect]]
func TestRetroEffectOfAFirstRetroWritesItsBatteryAsTheBaselineAndNamesIt(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	retroReadingLay(t, root, "retro-b", map[string]string{retroBattery: retroEffectLater})

	code, out, errs := retroReadingRun(retroEffectVerb, root, "retro", "effect", "retro-b")

	printed := "No earlier retro holds class fixes, so nothing stands to measure.\n" +
		"battery  baseline 1600 ms, which the next retro reads against\n"
	if code != 0 || out != printed {
		t.Fatalf("effect answers %d, %q, %q, want %q", code, out, errs, printed)
	}
	var written retroEffectRecord
	if err := json.Unmarshal([]byte(retroReadingFile(t, root, "retro-b", "effect.json")), &written); err != nil {
		t.Fatal(err)
	}
	if written.Last != "" || written.Battery == nil || !written.Battery.Baseline || written.Battery.Total.Now != 1600 {
		t.Fatalf("effect.json holds %+v", written)
	}
}
