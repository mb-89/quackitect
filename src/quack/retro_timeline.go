// The retro's timeline: every timed line of its input, placed by its time,
// and the hours they fall in.
// [[spec/guidance/retro/chapter]]
package main

import (
	"fmt"
	"io"
	"math"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// A line a transcript writes as a failing tool result, and a log line at a failing level. [[spec/guidance/retro/signals]]
var retroFault = regexp.MustCompile(`"is_error":[` + retroJSSpaces + `]*true|"level":"(?:warn|error|fatal)"`)

// An hour, in the milliseconds a time counts, and the length of an ISO time cut to its hour. [[spec/guidance/retro/chapter]]
const (
	retroHourMillis = 3_600_000
	retroHourKey    = 13
)

// The printed columns, each as wide as its head. [[spec/guidance/retro/chapter]]
var retroTimelineColumns = []string{"transcript", "log", "sessions", "faults"}

// A timed file of the input: its path under the input, its source, and each line's time and fault. [[spec/guidance/retro/chapter]]
type retroTimedFile struct {
	path   string
	source string
	times  []float64
	faults []bool
}

// One hour holding a line: where it starts, its counts per source, its sessions and its faults. [[spec/guidance/retro/chapter]]
type retroHourRow struct {
	at          float64
	hour        string
	transcripts int
	log         int
	faults      int
	sessions    map[string]bool
}

// A class pattern to count: its id, the source it reads, and the pattern. [[spec/guidance/retro/classify]]
type retroMeasure struct {
	id      string
	source  any
	pattern *regexp.Regexp
}

func init() { register("retro timeline", retroTimelineVerb(retroRoot)) }

// The time a line carries in its source's field, in milliseconds, and NaN where it carries none. [[spec/guidance/retro/chapter]]
func retroTimeOf(source retroSource, line string) float64 {
	found := source.field.FindStringSubmatch(line)
	if found == nil {
		return math.NaN()
	}
	return retroJSMillis(found[1])
}

// Every .jsonl file under a source of the input, as a path under the input, sorted. [[spec/guidance/retro/chapter]]
func retroTimelineWalk(input, top string) []string {
	out := []string{}
	var into func(rel string)
	into = func(rel string) {
		entries, err := os.ReadDir(filepath.Join(input, filepath.FromSlash(rel)))
		if err != nil {
			return
		}
		for _, one := range entries {
			path := rel + "/" + one.Name()
			if one.IsDir() {
				into(path)
			} else if strings.HasSuffix(one.Name(), ".jsonl") {
				out = append(out, path)
			}
		}
	}
	into(top)
	sort.SliceStable(out, func(i, j int) bool { return retroJSLess(out[i], out[j]) })
	return out
}

// The lines of a file under the input. [[spec/guidance/retro/chapter]]
func retroTimelineLines(input, path string) []string {
	return strings.Split(retroFileText(filepath.Join(input, filepath.FromSlash(path))), "\n")
}

// Every timed file of the input: its path under the input, and the time of each line. A line with no time takes the time before it. [[spec/guidance/retro/chapter]]
func retroTimedFiles(root, name string) []retroTimedFile {
	input := filepath.Join(retroHome(root, name), retroInput)
	out := []retroTimedFile{}
	for _, source := range retroTimed {
		for _, path := range retroTimelineWalk(input, source.top) {
			file := retroTimedFile{path: path, source: source.top}
			last := math.NaN()
			for _, line := range retroTimelineLines(input, path) {
				if when := retroTimeOf(source, line); !math.IsNaN(when) {
					last = when
				}
				file.times = append(file.times, last)
				file.faults = append(file.faults, retroFault.MatchString(line))
			}
			out = append(out, file)
		}
	}
	return out
}

// The hours holding a line, each with its counts per source, its sessions and its faults. [[spec/guidance/retro/chapter]]
func retroHoursOf(files []retroTimedFile) []*retroHourRow {
	held := map[string]*retroHourRow{}
	for _, file := range files {
		for at, when := range file.times {
			if math.IsNaN(when) {
				continue
			}
			start := math.Floor(when/retroHourMillis) * retroHourMillis
			key := retroJSISO(start)[:retroHourKey]
			hour, ok := held[key]
			if !ok {
				hour = &retroHourRow{at: start, hour: key, sessions: map[string]bool{}}
				held[key] = hour
			}
			switch file.source {
			case "transcripts":
				hour.transcripts++
			case "log":
				hour.log++
			}
			if file.faults[at] {
				hour.faults++
			}
			if file.source == "transcripts" {
				hour.sessions[file.path] = true
			}
		}
	}
	out := []*retroHourRow{}
	for _, one := range held {
		out = append(out, one)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].hour < out[j].hour })
	return out
}

// The verb: prints the hours holding work, with the idle stretches between them, and writes them beside the input. [[spec/guidance/retro/chapter]]
func retroTimelineVerb(root func() string) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		base, name := root(), retroWordAt(argv, 2)
		if name == "" || !retroIsThere(filepath.Join(retroHome(base, name), retroInput)) {
			fmt.Fprintln(errs, "retro timeline names a retro whose collect stands: ./RUNME.sh retro timeline <retro>")
			return 2
		}
		hours := retroHoursOf(retroTimedFiles(base, name))
		rows := []any{}
		for _, one := range hours {
			rows = append(rows, retroJSObject("hour", one.hour, "transcripts", one.transcripts, "log", one.log, "faults", one.faults, "sessions", len(one.sessions)))
		}
		if err := retroJSWrite(filepath.Join(retroHome(base, name), "timeline.json"), rows); err != nil {
			fmt.Fprintln(errs, err)
			return 1
		}
		fmt.Fprintf(out, "hour (UTC)      %s\n", strings.Join(retroTimelineColumns, "  "))
		var before float64
		for _, one := range hours {
			idle := 0
			if before != 0 {
				idle = int(math.Round((one.at-before)/retroHourMillis)) - 1
			}
			if idle > 0 {
				fmt.Fprintf(out, "  ... %d idle hour(s)\n", idle)
			}
			cells := []string{}
			for at, count := range []int{one.transcripts, one.log, len(one.sessions), one.faults} {
				cells = append(cells, fmt.Sprintf("%*d", len(retroTimelineColumns[at]), count))
			}
			fmt.Fprintf(out, "%s   %s\n", one.hour, strings.Join(cells, "  "))
			before = one.at
		}
		return 0
	}
}

// Each measure's matches over the input, and the active hours they fall in, read in one pass. A measure names its source, log or transcripts, or all. [[spec/guidance/retro/classify]]
func retroCountsOver(root, name string, measures []retroMeasure) (map[string]int, int) {
	input := filepath.Join(retroHome(root, name), retroInput)
	counts := map[string]int{}
	for _, one := range measures {
		counts[one.id] = 0
	}
	hours := map[float64]bool{}
	for _, source := range retroTimed {
		reading := []retroMeasure{}
		for _, one := range measures {
			if retroJSSame(one.source, "all") || retroJSSame(one.source, source.top) {
				reading = append(reading, one)
			}
		}
		for _, path := range retroTimelineWalk(input, source.top) {
			for _, line := range retroTimelineLines(input, path) {
				if when := retroTimeOf(source, line); !math.IsNaN(when) {
					hours[math.Floor(when/retroHourMillis)] = true
				}
				for _, one := range reading {
					if one.pattern != nil && one.pattern.MatchString(line) {
						counts[one.id]++
					}
				}
			}
		}
	}
	return counts, len(hours)
}
