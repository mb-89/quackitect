// The battery's report and the stamp the check leaves: the parts as timed,
// the slowest cases, a time a test file, the red cases, the spawns, and the
// record a door reads before a push. Every function takes text or rows.
// [[spec/guidance/retro/effect]] [[spec/design_output/work#the-battery-answers-first]]
package main

import (
	"bufio"
	"cmp"
	"encoding/json"
	"fmt"
	"math"
	"regexp"
	"slices"
	"strconv"
	"strings"
)

// The cases a report names, the words a red case keeps, the cases a budget warning names, the width a part's seconds pad to, and the milliseconds in a tenth of a second and the tenths in one, which a part's time rounds by. [[spec/guidance/retro/effect]] [[spec/tickets/the-check-runs-fast-again]]
const (
	slowestKept    = 10
	redWords       = 200
	budgetNamed    = 5
	secondsWide    = 7
	msInTenth      = 100
	tenthsInSecond = 10
)

// The source whose warnings a ticket's prose holds, which fromRules in src/modules/lsp/tools.go names, and the folders a ticket stands in, which folders.js owns. [[spec/design_output/work#the-battery-answers-first]]
const proseSource = "rules"

var ticketFolders = []string{"spec/tickets", ".se/tickets"}

// The module every Go package's path opens on, the header over the red cases, and the rows go test prints: a failing case, its message under it, and the package line closing them. [[spec/rationales/go-stands-as-one-module]] [[spec/tickets/ci-reds-name-their-cases]]
const (
	goModule  = "quackitect/"
	redHeader = "The red cases:"
)

var (
	goFailCase    = regexp.MustCompile(`^\s*--- FAIL: (\S+)`)
	goSaidLine    = regexp.MustCompile(`^\s+([\w.-]+\.go):(\d+): (.*)$`)
	goFailPackage = regexp.MustCompile(`^FAIL\s+(\S+)\s`)
)

// One case the runner's reporter wrote. [[spec/guidance/retro/effect]]
type caseRow struct {
	File    string  `json:"file"`
	Name    string  `json:"name"`
	Nesting int     `json:"nesting"`
	Ms      float64 `json:"ms"`
	Ok      *bool   `json:"ok"`
	Todo    bool    `json:"todo"`
	Said    string  `json:"said"`
	Line    int     `json:"line,omitempty"`
}

type slowCase struct {
	Name string  `json:"name"`
	Ms   float64 `json:"ms"`
	File string  `json:"file"`
}

type fileTime struct {
	Name string `json:"name"`
	Ms   int64  `json:"ms"`
}

type redCase struct {
	File string `json:"file"`
	Name string `json:"name"`
	Said string `json:"said"`
	Line int    `json:"line,omitempty"`
}

type spawnTally struct {
	All int `json:"all"`
}

// One report of the battery. [[spec/guidance/retro/effect]]
type batteryReport struct {
	Parts   map[string]int64 `json:"parts"`
	Total   int64            `json:"total"`
	Slowest []slowCase       `json:"slowest"`
	Files   []fileTime       `json:"files"`
	Unrun   []string         `json:"unrun"`
	Red     []redCase        `json:"red"`
	Spawns  *spawnTally      `json:"spawns"`
}

// One finding the lint left standing. [[spec/design_output/work#the-battery-answers-first]]
type finding struct {
	File   string `json:"file"`
	Source string `json:"source"`
}

// The stamp's shape. [[spec/design_output/work#the-battery-answers-first]]
type checkStamp struct {
	Sha      string             `json:"sha"`
	Ok       bool               `json:"ok"`
	Clean    bool               `json:"clean"`
	At       string             `json:"at"`
	Warnings int                `json:"warnings"`
	Files    []string           `json:"files"`
	Battery  *batteryReport     `json:"battery,omitempty"`
	Runs     []map[string]int64 `json:"runs,omitempty"`
}

// The rows the runner's reporter wrote, one a case, and none for a line that reads as no row. [[spec/guidance/retro/effect]]
func rowsIn(lines string) []caseRow {
	out := []caseRow{}
	read := bufio.NewScanner(strings.NewReader(lines))
	read.Buffer(nil, math.MaxInt32)
	for read.Scan() {
		line := strings.TrimSpace(read.Text())
		var row caseRow
		if strings.HasPrefix(line, "{") && json.Unmarshal([]byte(line), &row) == nil {
			out = append(out, row)
		}
	}
	return out
}

// The cases, each with its time and its file, the slowest first. [[spec/guidance/retro/effect]]
func slowestIn(lines string, most int) []slowCase {
	out := []slowCase{}
	for _, row := range rowsIn(lines) {
		out = append(out, slowCase{row.Name, row.Ms, row.File})
	}
	slices.SortStableFunc(out, func(a, b slowCase) int { return cmp.Compare(b.Ms, a.Ms) })
	return out[:min(len(out), most)]
}

// A time a test file: the sum of its cases at the top, the slowest first. [[spec/guidance/retro/effect]]
func filesIn(lines string) []fileTime {
	held := map[string]float64{}
	order := []string{}
	for _, row := range rowsIn(lines) {
		if row.Nesting != 0 || row.File == "" {
			continue
		}
		if _, seen := held[row.File]; !seen {
			order = append(order, row.File)
		}
		held[row.File] += row.Ms
	}
	out := []fileTime{}
	for _, name := range order {
		out = append(out, fileTime{name, int64(math.Round(held[name]))})
	}
	slices.SortStableFunc(out, func(a, b fileTime) int { return cmp.Compare(b.Ms, a.Ms) })
	return out
}

// The red cases in their own words: the file, the name, and the error's first line. A TODO case fails by design. [[spec/guidance/retro/effect]]
func redIn(lines string) []redCase {
	out := []redCase{}
	for _, row := range rowsIn(lines) {
		if row.Ok != nil && !*row.Ok && !row.Todo {
			out = append(out, redCase{File: row.File, Name: row.Name, Said: redWordsOf(row.Said), Line: row.Line})
		}
	}
	return out
}

func redWordsOf(said string) string {
	runes := []rune(said)
	return string(runes[:min(len(runes), redWords)])
}

// The red Go tests off go test's output: each failing case with its first message, its file under its package's folder, and a parent case with no message of its own left out. [[spec/tickets/ci-reds-name-their-cases]]
func goRedIn(said string) []redCase {
	out := []redCase{}
	var held []redCase
	for _, line := range strings.Split(said, "\n") {
		if found := goFailCase.FindStringSubmatch(line); found != nil {
			held = append(held, redCase{Name: found[1]})
			continue
		}
		if found := goSaidLine.FindStringSubmatch(line); found != nil && len(held) > 0 && held[len(held)-1].File == "" {
			at, _ := strconv.Atoi(found[2])
			last := &held[len(held)-1]
			last.File, last.Line, last.Said = found[1], at, redWordsOf(found[3])
			continue
		}
		if found := goFailPackage.FindStringSubmatch(line); found != nil {
			folder := strings.TrimPrefix(found[1], goModule)
			for _, one := range held {
				if one.File != "" {
					one.File = folder + "/" + one.File
					out = append(out, one)
				}
			}
			held = nil
		}
	}
	return out
}

// One red case as a row: its file and line, its name, and what it said. [[spec/tickets/ci-reds-name-their-cases]]
func redLine(one redCase) string {
	where := one.File
	if where != "" && one.Line > 0 {
		where += ":" + strconv.Itoa(one.Line)
	}
	kept := []string{}
	for _, word := range []string{where, one.Name, one.Said} {
		if word != "" {
			kept = append(kept, word)
		}
	}
	return strings.Join(kept, ": ")
}

// The rows a red run's log ends on, a red case each, and none on a green run. [[spec/tickets/ci-reds-name-their-cases]]
func redSaid(red []redCase) []string {
	if len(red) == 0 {
		return nil
	}
	rows := []string{"", redHeader}
	for _, one := range red {
		rows = append(rows, "  "+redLine(one))
	}
	return rows
}

// The tally the process door writes, one line a spawn: how many in all. [[spec/guidance/retro/effect]]
func spawnsIn(tally string) spawnTally {
	out := spawnTally{}
	for _, line := range strings.Split(tally, "\n") {
		if line = strings.TrimSpace(line); line == "" {
			continue
		}
		out.All++
	}
	return out
}

// One report: the parts rounded, the battery's span, the slowest cases, a time a file, the parts a red run left unrun, the red cases, and the spawns. The span is the sum of the parts where the run names none, as a negative span does. [[spec/guidance/retro/effect]]
func batteryOf(parts map[string]float64, lines string, most int, unrun []string, spawns *spawnTally, span float64) batteryReport {
	timed := map[string]int64{}
	var total int64
	for name, ms := range parts {
		timed[name] = int64(math.Round(ms))
		total += timed[name]
	}
	if span >= 0 {
		total = int64(math.Round(span))
	}
	return batteryReport{
		Parts:   timed,
		Total:   total,
		Slowest: slowestIn(lines, most),
		Files:   filesIn(lines),
		Unrun:   append([]string{}, unrun...),
		Red:     redIn(lines),
		Spawns:  spawns,
	}
}

// The rows the check prints last: each part's seconds, the slowest first, their sum, and a warning past the budget naming the slowest part and cases. A budget of 0 names none. [[spec/tickets/the-check-runs-fast-again]]
func partsSaid(report batteryReport, budget int64) []string {
	row := func(ms float64, what string) string { return fmt.Sprintf("%*s  %s", secondsWide, seconds(ms), what) }
	names := []string{}
	for name := range report.Parts {
		names = append(names, name)
	}
	slices.SortFunc(names, func(a, b string) int {
		return cmp.Or(cmp.Compare(report.Parts[b], report.Parts[a]), strings.Compare(a, b))
	})
	rows := []string{"", "The check's parts, in seconds:"}
	for _, name := range names {
		rows = append(rows, row(float64(report.Parts[name]), name))
	}
	rows = append(rows, row(float64(report.Total), "in all"))
	if budget <= 0 || report.Total <= budget || len(names) == 0 {
		return rows
	}
	rows = append(rows, "", fmt.Sprintf("Warning: the check took %ss, past its budget of %ss under battery.budget. %s took the most. The slowest cases:",
		seconds(float64(report.Total)), seconds(float64(budget)), names[0]))
	for _, one := range report.Slowest[:min(len(report.Slowest), budgetNamed)] {
		rows = append(rows, row(one.Ms, strings.TrimSpace(one.File+" "+one.Name)))
	}
	return rows
}

func seconds(ms float64) string {
	return fmt.Sprintf("%.1f", math.Round(ms/msInTenth)/tenthsInSecond)
}

// The stamp's shape, off what the check found. The battery's report rides it where one stands, and the last runs at this commit ride beside it, up to the count. [[spec/guidance/retro/effect]]
func stampFor(code int, sha string, clean bool, at string, stood []finding, report *batteryReport, before []byte, keep int) checkStamp {
	files := []string{}
	warnings := 0
	for _, one := range stood {
		if !holdsPush(one) {
			continue
		}
		warnings++
		if one.File != "" {
			files = append(files, one.File)
		}
	}
	slices.Sort(files)
	out := checkStamp{Sha: sha, Ok: code == 0, Clean: clean, At: at, Warnings: warnings, Files: slices.Compact(files)}
	if report == nil {
		return out
	}
	out.Battery = report
	var last struct {
		Sha  string             `json:"sha"`
		Runs []map[string]int64 `json:"runs"`
	}
	out.Runs = []map[string]int64{report.Parts}
	if json.Unmarshal(before, &last) == nil && last.Sha == sha {
		out.Runs = append(out.Runs, last.Runs...)
	}
	out.Runs = out.Runs[:min(len(out.Runs), max(1, keep))]
	return out
}

// A ticket's prose stands at warning by rule, so it holds no push, and every other warning does. [[spec/design_output/work#the-battery-answers-first]]
func holdsPush(one finding) bool {
	if one.Source != proseSource {
		return true
	}
	file := strings.ReplaceAll(one.File, `\`, "/")
	for _, folder := range ticketFolders {
		if strings.HasPrefix(file, folder+"/") || strings.Contains(file, "/"+folder+"/") {
			return false
		}
	}
	return true
}
