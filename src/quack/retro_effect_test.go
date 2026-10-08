// The effect step: the last retro's class patterns counted again, each with
// its verdict, and this retro's battery read against the last one's.
// [[spec/guidance/retro/effect]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"reflect"
	"regexp"
	"slices"
	"strings"
	"sync"
	"testing"
	"time"
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
// level0: FixtureOutsideHome - the case writes a retro's records into a tree of its own
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

// A clock standing still until the case moves it, telling the case of each read. [[spec/guidance/code/testing]]
type heldClock struct {
	held  sync.Mutex
	at    time.Time
	count int
	reads chan struct{}
}

func newHeldClock(most int) *heldClock {
	return &heldClock{at: time.Date(2026, 9, 20, 10, 0, 0, 0, time.UTC), reads: make(chan struct{}, most)}
}

func (c *heldClock) now() time.Time {
	c.held.Lock()
	defer c.held.Unlock()
	c.count++
	c.reads <- struct{}{}
	return c.at
}

func (c *heldClock) move(by time.Duration) {
	c.held.Lock()
	defer c.held.Unlock()
	c.at = c.at.Add(by)
}

func (c *heldClock) read() int {
	c.held.Lock()
	defer c.held.Unlock()
	return c.count
}

func TestReadyStep(t *testing.T) {
	t.Parallel()
	t.Run("the ready step runs the install, then asks the index standing through its own binary", func(t *testing.T) {
		fake := &checkFake{}
		doors := fake.doors()
		doors.self = "/bin/se-index"
		if code := readyOf(doors, false).run(); code != 0 {
			t.Fatalf("the ready step answers %d", code)
		}
		if want := [][]string{{"sh", installer}, {"/bin/se-index", "standing"}}; !reflect.DeepEqual(fake.runs, want) {
			t.Fatalf("the ready step ran %v, and wants %v", fake.runs, want)
		}
	})
	t.Run("an index standing no door turns the ready step red, and a red install alone carries on", func(t *testing.T) {
		fake := &checkFake{codes: map[string]int{"sh": 1}}
		doors := fake.doors()
		doors.self = "/bin/se-index"
		if code := readyOf(doors, false).run(); code != 0 {
			t.Fatalf("a red install answers %d", code)
		}
		fake.codes = map[string]int{"/bin/se-index": 1}
		if code := readyOf(doors, false).run(); code != 1 {
			t.Fatalf("an index standing no door answers %d", code)
		}
	})
}

func TestBatteryRun(t *testing.T) {
	t.Parallel()
	t.Run("the ready step ends before any part starts, and every part starts before any part ends", func(t *testing.T) {
		clock := newHeldClock(16)
		readied := false
		ready := part{name: "ready", run: func() int {
			clock.move(5 * time.Second)
			readied = true
			return 0
		}}
		names := []string{"tests", "go", "rules"}
		started := make(chan string, len(names))
		release := map[string]chan struct{}{}
		var held sync.Mutex
		early := []string{}
		parts := []part{}
		for _, name := range names {
			release[name] = make(chan struct{})
			parts = append(parts, part{name: name, run: func() int {
				held.Lock()
				if !readied || clock.read() < 2+len(names) || len(early) > 0 {
					early = append(early, name)
				}
				waits := len(early) == 0
				held.Unlock()
				started <- name
				if waits {
					<-release[name]
				}
				return 0
			}})
		}
		type answer struct {
			times map[string]float64
			total float64
		}
		answered := make(chan answer, 1)
		go func() {
			_, times, _, total := batteryRun(ready, parts, clock.now)
			answered <- answer{times, total}
		}()
		for range names {
			<-started
		}
		held.Lock()
		ran := slices.Clone(early)
		held.Unlock()
		if len(ran) > 0 {
			<-answered
			t.Fatalf("%v ran before the battery started every part", ran)
		}
		for range 2 + len(names) {
			<-clock.reads
		}
		for _, name := range names {
			clock.move(10 * time.Second)
			close(release[name])
			<-clock.reads
		}
		got := <-answered
		if want := map[string]float64{"ready": 5000, "tests": 10000, "go": 20000, "rules": 30000}; !reflect.DeepEqual(got.times, want) || got.total != 35000 {
			t.Fatalf("the run timed %v over %v, and wants %v over the ready step's 5000 and the slowest part's 30000", got.times, got.total, want)
		}
	})
	// [[spec/tickets/the-check-runs-beside]]
	t.Run("a lead part ends before any other part starts", func(t *testing.T) {
		var held sync.Mutex
		led, early := false, []string{}
		step := func(name string, lead bool) part {
			return part{name: name, lead: lead, run: func() int {
				held.Lock()
				defer held.Unlock()
				if lead {
					led = true
				} else if !led {
					early = append(early, name)
				}
				return 0
			}}
		}
		code, times, _, _ := batteryRun(part{name: "ready", run: func() int { return 0 }}, []part{step("tests", false), step("level0", true), step("rules", false)}, ticking(time.Millisecond))
		if code != 0 || len(early) > 0 || len(times) != 4 {
			t.Fatalf("the run answers %d, timed %v, and %v started before the lead part ended", code, times, early)
		}
	})
	// [[spec/tickets/the-check-runs-beside]]
	t.Run("the lead parts run one at a time, in part order", func(t *testing.T) {
		var held sync.Mutex
		busy, order, beside := false, []string{}, false
		lead := func(name string) part {
			return part{name: name, lead: true, run: func() int {
				held.Lock()
				beside = beside || busy
				busy = true
				order = append(order, name)
				held.Unlock()
				held.Lock()
				busy = false
				held.Unlock()
				return 0
			}}
		}
		batteryRun(part{name: "ready", run: func() int { return 0 }}, []part{lead("tests"), lead("level0"), {name: "go", run: func() int { return 0 }}}, ticking(time.Millisecond))
		if beside || !reflect.DeepEqual(order, []string{"tests", "level0"}) {
			t.Fatalf("the lead parts ran %v, one beside another %v", order, beside)
		}
	})
	t.Run("level zero and the tests lead, and no other part does", func(t *testing.T) {
		for _, one := range partsOf((&checkFake{}).doors(), nil, false) {
			if one.lead != (one.name == "level0" || one.name == "tests") {
				t.Fatalf("%s leads %v", one.name, one.lead)
			}
		}
	})
	t.Run("a red ready step answers first and names itself, and every part still runs", func(t *testing.T) {
		var held sync.Mutex
		ran := 0
		step := func(name string, code int) part {
			return part{name: name, run: func() int {
				held.Lock()
				defer held.Unlock()
				ran++
				return code
			}}
		}
		code, _, red, _ := batteryRun(step("ready", 3), []part{step("tests", 0), step("go", 1)}, ticking(time.Millisecond))
		if code != 3 || !reflect.DeepEqual(red, []string{"ready", "go"}) || ran != 3 {
			t.Fatalf("the run answers %d, names %v red, ran %d", code, red, ran)
		}
	})
}

const batteryAt = "2026-09-20T10:00:00.000Z"

func caseLine(row map[string]any) string {
	said, _ := json.Marshal(row)
	return string(said)
}

var caseLines = strings.Join([]string{
	caseLine(map[string]any{"file": "test/level0/one.test.js", "name": "a fast case", "nesting": 0, "ms": 2.5, "ok": true}),
	caseLine(map[string]any{"file": "test/level0/one.test.js", "name": "a slow case", "nesting": 0, "ms": 900.25, "ok": true}),
	caseLine(map[string]any{"file": "test/level0/one.test.js", "name": "inside a group", "nesting": 1, "ms": 30, "ok": true}),
	caseLine(map[string]any{"file": "test/level0/one.test.js", "name": "a group", "nesting": 0, "ms": 47.25, "ok": true}),
	caseLine(map[string]any{"file": "test/level0/two.test.js", "name": "a case", "nesting": 0, "ms": 40, "ok": true}),
	"",
	"not a row",
}, "\n")

var redLines = strings.Join([]string{
	caseLine(map[string]any{"file": "test/contract/stub.test.js", "name": "a stub holds its files", "nesting": 0, "ms": 13.8, "ok": false, "said": "ENOENT: no such file"}),
	caseLine(map[string]any{"file": "test/contract/stub.test.js", "name": "a todo case", "nesting": 0, "ms": 1, "ok": false, "todo": true, "said": "by design"}),
	caseLine(map[string]any{"file": "test/contract/stub.test.js", "name": "the shim hands a verb", "nesting": 0, "ms": 6.2, "ok": true}),
}, "\n")

func TestBatteryReport(t *testing.T) {
	t.Parallel()
	t.Run("the slowest cases come off the lines, slowest first, each with its file", func(t *testing.T) {
		want := []slowCase{{"a slow case", 900.25, "test/level0/one.test.js"}, {"a group", 47.25, "test/level0/one.test.js"}, {"a case", 40, "test/level0/two.test.js"}}
		if got := slowestIn(caseLines, 3); !reflect.DeepEqual(got, want) {
			t.Fatalf("the slowest read %v, and want %v", got, want)
		}
		if got := slowestIn("", 3); len(got) != 0 {
			t.Fatalf("no lines read %v", got)
		}
	})
	t.Run("a time a test file sums its cases at the top, the slowest first", func(t *testing.T) {
		want := []fileTime{{"test/level0/one.test.js", 950}, {"test/level0/two.test.js", 40}}
		if got := filesIn(caseLines); !reflect.DeepEqual(got, want) {
			t.Fatalf("the files read %v, and want %v", got, want)
		}
	})
	t.Run("a red case comes off the lines in its own words, and a todo case reads none", func(t *testing.T) {
		want := []redCase{{File: "test/contract/stub.test.js", Name: "a stub holds its files", Said: "ENOENT: no such file"}}
		if got := redIn(redLines); !reflect.DeepEqual(got, want) {
			t.Fatalf("the red read %v, and want %v", got, want)
		}
		if got := redIn(caseLines); len(got) != 0 {
			t.Fatalf("green lines read red %v", got)
		}
	})
	t.Run("a red Go test reads its file under its package, and a parent with no message of its own stays out", func(t *testing.T) {
		said := "--- FAIL: TestA (0.00s)\n    --- FAIL: TestA/inner (0.00s)\n        a_test.go:7: one is two\n        and more\n--- FAIL: TestB (0.00s)\n    b_test.go:3: three\nFAIL\nFAIL\tquackitect/src/one\t0.01s\nok  \tquackitect/src/two\t0.02s\nFAIL\n"
		want := []redCase{{File: "src/one/a_test.go", Name: "TestA/inner", Said: "one is two", Line: 7}, {File: "src/one/b_test.go", Name: "TestB", Said: "three", Line: 3}}
		if got := goRedIn(said); !reflect.DeepEqual(got, want) {
			t.Fatalf("the Go red read %v, and want %v", got, want)
		}
		if got := goRedIn("ok  \tquackitect/src/two\t0.02s\n"); len(got) != 0 {
			t.Fatalf("a green run reads red %v", got)
		}
	})
	t.Run("the red rows open on their header, a row a case, and a green run prints none", func(t *testing.T) {
		got := redSaid([]redCase{{File: "a.js", Name: "one", Said: "broke", Line: 2}, {Name: "two"}})
		if want := []string{"", "The red cases:", "  a.js:2: one: broke", "  two"}; !reflect.DeepEqual(got, want) {
			t.Fatalf("the rows read %q, and want %q", got, want)
		}
		if got := redSaid(nil); len(got) != 0 {
			t.Fatalf("a green run reads %q", got)
		}
	})
	t.Run("the tally counts a line a spawn", func(t *testing.T) {
		tally := strings.Join([]string{"/tree/.se/.runtime/bin/biome", "/usr/bin/node", `C:\tree\.se\.runtime\bin\biome.exe`, "sh", ""}, "\n")
		if got := spawnsIn(tally); got != (spawnTally{4}) {
			t.Fatalf("the tally reads %v, and wants 4", got)
		}
		if got := spawnsIn(""); got != (spawnTally{}) {
			t.Fatalf("no tally reads %v", got)
		}
	})
	t.Run("a report carries the span the run names", func(t *testing.T) {
		said := batteryOf(map[string]float64{"tests": 1000, "level0": 900, "go": 400.4}, "", 10, nil, nil, 1400.4)
		if said.Total != 1400 || !reflect.DeepEqual(said.Parts, map[string]int64{"tests": 1000, "level0": 900, "go": 400}) {
			t.Fatalf("the report reads %v and %v", said.Total, said.Parts)
		}
	})
	t.Run("a report carries each part rounded, their sum, the slowest, the files, the unrun, the red and the spawns", func(t *testing.T) {
		said := batteryOf(map[string]float64{"tests": 1200.6, "go": 300.2, "rules": 0}, redLines, 1, []string{"go", "rules"}, &spawnTally{4}, -1)
		if !reflect.DeepEqual(said.Parts, map[string]int64{"tests": 1201, "go": 300, "rules": 0}) || said.Total != 1501 {
			t.Fatalf("the parts read %v in %d", said.Parts, said.Total)
		}
		if len(said.Slowest) != 1 || !reflect.DeepEqual(said.Files, []fileTime{{"test/contract/stub.test.js", 21}}) {
			t.Fatalf("the slowest read %v, and the files %v", said.Slowest, said.Files)
		}
		if !reflect.DeepEqual(said.Unrun, []string{"go", "rules"}) || len(said.Red) != 1 || *said.Spawns != (spawnTally{4}) {
			t.Fatalf("the unrun read %v, the red %v, the spawns %v", said.Unrun, said.Red, said.Spawns)
		}
		bare := batteryOf(map[string]float64{"tests": 5}, caseLines, 10, nil, nil, -1)
		if bare.Unrun == nil || len(bare.Unrun) != 0 || bare.Spawns != nil {
			t.Fatalf("a bare report reads %v and %v", bare.Unrun, bare.Spawns)
		}
	})
	t.Run("the parts print the slowest first, and a run under its budget warns nothing", func(t *testing.T) {
		rows := partsSaid(batteryOf(map[string]float64{"go": 4200, "tests": 61000, "rules": 950}, "", 10, nil, nil, -1), 120000)
		want := []string{"   61.0  tests", "    4.2  go", "    1.0  rules", "   66.2  in all"}
		if len(rows) < 2 || !reflect.DeepEqual(rows[2:], want) {
			t.Fatalf("the rows read %q, and want %q after the heading", rows, want)
		}
	})
	t.Run("a run past its budget names the part that took the most and its slowest cases", func(t *testing.T) {
		lines := caseLine(map[string]any{"name": "slow", "ms": 9000, "file": "test/contract/a.test.js"}) + "\n" + caseLine(map[string]any{"name": "quick", "ms": 10, "file": "test/level0/b.test.js"})
		report := batteryOf(map[string]float64{"tests": 90000, "rules": 40000}, lines, 10, nil, nil, -1)
		rows := partsSaid(report, 120000)
		warned := -1
		for at, one := range rows {
			if strings.HasPrefix(one, "Warning:") {
				warned = at
			}
		}
		if warned < 0 || !regexp.MustCompile(`took 130\.0s, past its budget of 120\.0s under battery\.budget\. tests took the most`).MatchString(rows[warned]) {
			t.Fatalf("the rows read %q, and want the warning", rows)
		}
		if rows[warned+1] != "    9.0  test/contract/a.test.js slow" {
			t.Fatalf("the slowest case reads %q", rows[warned+1])
		}
		for _, one := range partsSaid(report, 0) {
			if strings.HasPrefix(one, "Warning:") {
				t.Fatal("a budget of 0 warns")
			}
		}
	})
}

func TestStamp(t *testing.T) {
	t.Parallel()
	t.Run("a green run stamps ok with no warning, and a red run stamps the code", func(t *testing.T) {
		green := stampFor(0, "abc", true, batteryAt, nil, nil, nil, 1)
		want := checkStamp{Sha: "abc", Ok: true, Clean: true, At: batteryAt, Warnings: 0, Files: []string{}}
		if !reflect.DeepEqual(green, want) {
			t.Fatalf("the green stamp reads %+v, and wants %+v", green, want)
		}
		said, _ := json.Marshal(green)
		if strings.Contains(string(said), "battery") || strings.Contains(string(said), "runs") {
			t.Fatalf("a stamp with no report carries %s", said)
		}
		if red := stampFor(1, "abc", false, batteryAt, nil, nil, nil, 1); red.Ok || red.Clean {
			t.Fatalf("the red stamp reads %+v", red)
		}
	})
	t.Run("the stamp counts every warning but the prose of a ticket", func(t *testing.T) {
		stood := []finding{{"spec/tickets/a-ticket.md", "rules"}, {"/tree/.se/tickets/a-note.md", "rules"}, {"spec/tickets/a-ticket.md", "tree"}, {"spec/guidance/working.md", "rules"}}
		said := stampFor(0, "abc", true, batteryAt, stood, nil, nil, 1)
		if said.Warnings != 2 || !reflect.DeepEqual(said.Files, []string{"spec/guidance/working.md", "spec/tickets/a-ticket.md"}) {
			t.Fatalf("the stamp reads %d warnings in %v", said.Warnings, said.Files)
		}
	})
	t.Run("the stamp keeps the last runs at its commit, up to the count, and drops another commit's", func(t *testing.T) {
		report := &batteryReport{Parts: map[string]int64{"tests": 30}, Total: 30}
		before := []byte(`{"sha":"abc","runs":[{"tests":20},{"tests":10}]}`)
		kept := stampFor(0, "abc", true, batteryAt, nil, report, before, 3)
		if !reflect.DeepEqual(kept.Runs, []map[string]int64{{"tests": 30}, {"tests": 20}, {"tests": 10}}) || kept.Battery != report {
			t.Fatalf("the runs read %v", kept.Runs)
		}
		if capped := stampFor(0, "abc", true, batteryAt, nil, report, before, 2); len(capped.Runs) != 2 {
			t.Fatalf("the capped runs read %v", capped.Runs)
		}
		if other := stampFor(0, "def", true, batteryAt, nil, report, before, 3); !reflect.DeepEqual(other.Runs, []map[string]int64{{"tests": 30}}) {
			t.Fatalf("another commit's runs read %v", other.Runs)
		}
	})
}
