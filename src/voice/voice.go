// The voice verbs in Go. `measure` scores a folder of prose through Vale, and
// `refused` ranks what the doors turn away. The pure half takes rows and
// answers rows, and Run reaches the disk, Vale and the clock through Doors,
// so a test drives it over a fixture. It prints what
// .claude/skills/level0/lib/voice.js prints, line for line.
// [[spec/design_output/projection#the-second-target]]
package voice

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"math/big"
	"path/filepath"
	"regexp"
	"slices"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode"
	"unicode/utf16"
)

// The folders and names the verbs read and write, as lib/voice.js and lib/vale.js name them, and the log folder Log in src/modules/check/folders.go. [[spec/design_output/projection#the-second-target]]
const (
	Measured = ".se/.runtime/measure" // the runtime folder src/modules/check/folders.go owns
	Shortest = 25
	Days     = 7
	Answer   = "answer.md"
	Config   = ".vale.ini"
	Folder   = ".se/.log"
)

const (
	top         = 3
	per         = 1000
	tenths      = 10
	ordinal     = 3
	transcripts = "--transcripts"
	dayMs       = 86400000
	lastMs      = 8.64e15
)

var (
	word      = regexp.MustCompile(`[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*`)
	lines     = regexp.MustCompile(`\r?\n`)
	prose     = regexp.MustCompile(`(?i)\.(md|markdown|txt)$`)
	rowsFile  = regexp.MustCompile(`(?i)\.jsonl$`)
	drive     = regexp.MustCompile(`^[A-Za-z]:[\\/]`)
	proseRule = regexp.MustCompile(`^Voice(Vale|Paragraph)\.`)
	decimal   = regexp.MustCompile(`^[+-]?(?:Infinity|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)$`)
	radix     = regexp.MustCompile(`^0([xXoObB])([0-9A-Fa-f]+)$`)
	heads     = []string{"file", "words", "findings", fmt.Sprintf("per %d words", per), "top rules"}
	numeric   = []int{1, 2, 3}
	noise     = []string{".git", "node_modules"}
)

// The error toISOString throws past the range a date holds. [[spec/design_output/projection#the-second-target]]
var errInvalidTime = errors.New("RangeError: Invalid time value")

// One parsed transcript or log row. [[spec/design_output/projection#the-second-target]]
type Row = map[string]any

// One answer file the transcripts yield: its path under the root, and its text. [[spec/design_output/projection#the-second-target]]
type File struct{ Path, Text string }

// One Vale finding as fromJson in lib/vale.js reads it. [[spec/design_output/projection#the-second-target]]
type Finding struct {
	File, Rule, Said, Message, Severity string
	Line, Column                        int
	Fixable                             bool
}

// A rule and how often it fires. [[spec/design_output/projection#the-second-target]]
type Count struct {
	Rule string
	N    int
}

// A file the measure reads: its shown path, its words and its findings. [[spec/design_output/projection#the-second-target]]
type Scored struct {
	File  string
	Words int
	Found []Finding
}

// One row of the measure table. [[spec/design_output/projection#the-second-target]]
type ScoreRow struct {
	File     string
	Words    int
	Findings int
	Score    float64
	Top      []Count
}

// One row of the refused table: a rule, the phrase it meets, and its fires. [[spec/design_output/projection#the-second-target]]
type Refusal struct {
	Rule, Phrase string
	Fires        int
}

// One name a folder lists, and whether it is a folder itself. [[spec/design_output/projection#the-second-target]]
type Entry struct {
	Name string
	Dir  bool
}

// The outside the verbs reach: the root, Vale's path, the disk, a Vale run answering its stdout, and the clock. [[spec/design_output/doors#one-door-per-outside-thing]]
type Doors struct {
	Root    string
	Bin     string
	Exists  func(path string) bool
	List    func(path string) ([]Entry, error)
	Read    func(path string) (string, error)
	Write   func(path, text string) error
	MakeDir func(path string) error
	Vale    func(argv []string, cwd string) (string, error)
	Now     func() time.Time
	Ceiling int
}

// Runs the voice verb over the words past it, and answers its exit code; a dry run writes no answer file. [[spec/design_output/projection#the-second-target]]
func Run(d Doors, words []string, dry bool, out, errs io.Writer) int {
	what := ""
	if len(words) > 0 {
		what = words[0]
	}
	switch what {
	case "measure":
		return measure(d, words[1:], dry, out, errs)
	case "refused":
		return refused(d, words[1:], out, errs)
	}
	fmt.Fprint(out, "Usage: ./RUNME.sh voice <verb>\n\n",
		"  measure <folder>           score every markdown file under a folder\n",
		"  measure "+transcripts+" <f>  pull the answers out of the transcripts first\n",
		"  refused [days]             rank what the doors turn away, seven by default\n")
	if what != "" {
		return 2
	}
	return 0
}

// Scores every prose file under a folder through Vale, after pulling the answers out of the transcripts where asked. [[spec/design_output/projection#the-second-target]]
func measure(d Doors, words []string, dry bool, out, errs io.Writer) int {
	if d.Bin == "" || !d.Exists(d.Bin) {
		fmt.Fprintln(errs, "Vale is missing. Run ./RUNME.sh once and it installs.")
		return 2
	}

	pulling := slices.Contains(words, transcripts)
	folder := "."
	for _, one := range words {
		if one != transcripts {
			folder = one
			break
		}
	}

	if pulling {
		made, err := pullAnswers(d, folder, dry)
		if err != nil {
			return fails(errs, err)
		}
		if made == 0 {
			fmt.Fprintf(errs, "No answer of %d words or more stands under %s.\n", Shortest, folder)
			return 1
		}
		fmt.Fprintf(out, "%d answer(s) under %s.\n\n", made, Measured)
		folder = Measured
	}

	skip := noise
	if strings.Split(folder, "/")[0] != ".se" {
		skip = append(slices.Clone(noise), ".se")
	}
	paths := filesUnder(d, under(d.Root, folder), prose, skip)
	if len(paths) == 0 {
		fmt.Fprintf(errs, "No markdown file stands under %s.\n", folder)
		return 1
	}

	said, err := d.Vale([]string{d.Bin, "--config=" + Config, "--output=JSON", "--no-exit", folder}, d.Root)
	if err != nil {
		return fails(errs, err)
	}
	found := map[string][]Finding{}
	for _, one := range FromJSON(said) {
		key := shown(d.Root, one.File)
		found[key] = append(found[key], one)
	}

	var mine []Scored
	var all []Finding
	for _, path := range paths {
		text, err := d.Read(path)
		if err != nil {
			return fails(errs, err)
		}
		file := shown(d.Root, path)
		mine = append(mine, Scored{File: file, Words: WordsIn(text), Found: found[file]})
		all = append(all, found[file]...)
	}
	rows := MeasuredRows(mine)
	fmt.Fprintln(out, MeasureTable(append(rows, TotalOf(rows))))

	if counts := RuleCounts(all); len(counts) > 0 {
		shownCounts := make([][]string, 0, len(counts))
		for _, one := range counts {
			shownCounts = append(shownCounts, []string{one.Rule, strconv.Itoa(one.N)})
		}
		fmt.Fprintln(out)
		fmt.Fprintln(out, Tabled([]string{"rule", "fires"}, shownCounts, []int{1}))
	}
	if pulling {
		return pastCeiling(rows, d.Ceiling, errs)
	}
	return 0
}

// Names each answer whose score passes the ceiling, and exits 1 where one does; a ceiling of 0 holds the check off. [[spec/tickets/the-coordinator-runs-under-level0]]
func pastCeiling(rows []ScoreRow, ceiling int, errs io.Writer) int {
	if ceiling <= 0 {
		return 0
	}
	code := 0
	for _, one := range rows {
		if one.Score > float64(ceiling) {
			fmt.Fprintf(errs, "%s scores %.1f, past the ceiling of %d.\n", one.File, one.Score, ceiling)
			code = 1
		}
	}
	return code
}

// Ranks the warn rows of the log inside the days asked, seven by default. [[spec/design_output/projection#the-second-target]]
func refused(d Doors, words []string, out, errs io.Writer) int {
	said := ""
	if len(words) > 0 {
		said = words[0]
	}
	days := DaysOf(said)
	var texts []string
	for _, path := range filesUnder(d, under(d.Root, Folder), rowsFile, nil) {
		text, err := d.Read(path)
		if err != nil {
			return fails(errs, err)
		}
		texts = append(texts, text)
	}

	since, err := SinceOf(d.Now(), days)
	if err != nil {
		fmt.Fprintln(errs, err)
		return 1
	}
	ranked := RankedRefusals(RefusalsIn(RowsIn(texts...), since))
	if len(ranked) == 0 {
		fmt.Fprintf(out, "No door refuses anything in %s day(s).\n", numberText(days))
		return 0
	}
	fmt.Fprintln(out, RefusedTable(ranked))
	return 0
}

// The line and the exit an uncaught fault answers under node. [[spec/design_output/projection#the-second-target]]
func fails(errs io.Writer, err error) int {
	fmt.Fprintln(errs, "Error: "+err.Error())
	return 1
}

// Writes every answer of every transcript under a folder as a file under the measured folder, and answers how many; a dry run counts and writes nothing. [[spec/design_output/projection#the-second-target]]
func pullAnswers(d Doors, folder string, dry bool) (int, error) {
	made := 0
	for _, path := range filesUnder(d, under(d.Root, folder), rowsFile, nil) {
		parts := strings.FieldsFunc(path, func(r rune) bool { return r == '/' || r == '\\' })
		session := ""
		if len(parts) > 0 {
			session = rowsFile.ReplaceAllString(parts[len(parts)-1], "")
		}
		text, err := d.Read(path)
		if err != nil {
			return made, err
		}
		for _, one := range AnswerFiles(session, AnswersIn(text)) {
			to := under(d.Root, one.Path)
			if !dry {
				if err := d.MakeDir(filepath.Dir(to)); err != nil {
					return made, err
				}
				if err := d.Write(to, one.Text); err != nil {
					return made, err
				}
			}
			made++
		}
	}
	return made, nil
}

// Every file under a path whose name the pattern wants, past the skipped names and every name opening on an underscore, sorted; a path that lists nothing stands for itself. [[spec/design_output/projection#the-second-target]]
func filesUnder(d Doors, at string, wanted *regexp.Regexp, skip []string) []string {
	var out []string
	var into func(path string)
	into = func(path string) {
		rows, err := d.List(path)
		if err != nil || len(rows) == 0 {
			if wanted.MatchString(path) && d.Exists(path) {
				out = append(out, path)
			}
			return
		}
		for _, one := range rows {
			if slices.Contains(skip, one.Name) || strings.HasPrefix(one.Name, "_") {
				continue
			}
			held := filepath.Join(path, one.Name)
			if one.Dir {
				into(held)
			} else if wanted.MatchString(one.Name) {
				out = append(out, held)
			}
		}
	}
	into(at)
	sort.SliceStable(out, func(a, b int) bool { return unitsCompare(out[a], out[b]) < 0 })
	return out
}

// A slash path under the root, or the path itself where it is absolute. [[spec/design_output/projection#the-second-target]]
func under(root, path string) string {
	if strings.HasPrefix(path, "/") || drive.MatchString(path) {
		return path
	}
	return filepath.Join(append([]string{root}, strings.Split(path, "/")...)...)
}

// A path as the tables show it: forward slashes, relative to the root where it stands under it. [[spec/design_output/projection#the-second-target]]
func shown(root, path string) string {
	flat := strings.ReplaceAll(path, "\\", "/")
	base := strings.ReplaceAll(root, "\\", "/")
	if strings.HasPrefix(flat, base+"/") {
		return flat[len(base)+1:]
	}
	return flat
}

// How many words a text holds: runs of letters and digits, joined by an apostrophe or a hyphen. [[spec/design_output/projection#the-second-target]]
func WordsIn(said string) int {
	return len(word.FindAllStringIndex(said, -1))
}

// Every JSON object line of the texts, past the blank lines and the lines nobody reads. [[spec/design_output/projection#the-second-target]]
func RowsIn(texts ...string) []Row {
	out := []Row{}
	for _, text := range texts {
		for _, line := range lines.Split(text, -1) {
			if jsTrim(line) == "" {
				continue
			}
			var row any
			if json.Unmarshal([]byte(line), &row) != nil {
				continue
			}
			if one, ok := row.(map[string]any); ok {
				out = append(out, one)
			}
		}
	}
	return out
}

// The answers of a transcript: the last text of each turn, where it runs to the shortest or more. An owner row opens the next turn. [[spec/tickets/answers-read-the-last-text]]
func AnswersIn(text string) []string {
	out := []string{}
	last := ""
	closes := func() {
		if last != "" && WordsIn(last) >= Shortest {
			out = append(out, last)
		}
		last = ""
	}
	for _, row := range RowsIn(text) {
		if opensTurn(row) {
			closes()
		}
		if said := answerOf(row); said != "" {
			last = said
		}
	}
	closes()
	return out
}

// An owner row in the transcript: a user row carrying no tool result, and neither a meta row nor a compaction summary. [[spec/tickets/answers-read-the-last-text]]
func opensTurn(row Row) bool {
	if row["type"] != "user" || truthy(row["isMeta"]) || truthy(row["isCompactSummary"]) {
		return false
	}
	if truthy(row["isSidechain"]) || truthy(row["agentId"]) {
		return false
	}
	message, _ := row["message"].(map[string]any)
	content, ok := message["content"].([]any)
	if !ok {
		return true
	}
	for _, one := range content {
		if block, _ := one.(map[string]any); block["type"] == "tool_result" {
			return false
		}
	}
	return true
}

// The text blocks of a main-line assistant row, joined by a blank line and trimmed. [[spec/design_output/projection#the-second-target]]
func answerOf(row Row) string {
	if row["type"] != "assistant" || truthy(row["isSidechain"]) || truthy(row["agentId"]) {
		return ""
	}
	message, _ := row["message"].(map[string]any)
	blocks, ok := message["content"].([]any)
	if !ok {
		return ""
	}
	var texts []string
	for _, one := range blocks {
		block, _ := one.(map[string]any)
		if text, ok := block["text"].(string); ok && block["type"] == "text" {
			texts = append(texts, text)
		}
	}
	return jsTrim(strings.Join(texts, "\n\n"))
}

// The answers as numbered files under the measured folder, each ending on one newline. [[spec/design_output/projection#the-second-target]]
func AnswerFiles(session string, answers []string) []File {
	out := make([]File, 0, len(answers))
	for i, said := range answers {
		out = append(out, File{
			Path: fmt.Sprintf("%s/%s/%0*d-%s", Measured, session, ordinal, i+1, Answer),
			Text: strings.TrimRightFunc(said, jsSpace) + "\n",
		})
	}
	return out
}

// The findings a thousand words, to one place, rounding half up as Math.round does. [[spec/design_output/projection#the-second-target]]
func ScoreOf(words, findings int) float64 {
	if words == 0 {
		return 0
	}
	return jsRound(float64(findings)/float64(words)*per*tenths) / tenths
}

// Math.round: the nearest integer, a half rounding up. [[spec/design_output/projection#the-second-target]]
func jsRound(x float64) float64 {
	down := math.Floor(x)
	if x-down >= 0.5 {
		return down + 1
	}
	return down
}

// A rule's leaf: the name past its last dot, so a style prefix drops off. [[spec/design_output/projection#the-second-target]]
func LeafOf(said string) string {
	flat := jsTrim(said)
	if at := strings.LastIndex(flat, "."); at >= 0 {
		return flat[at+1:]
	}
	return flat
}

// The rules ranked by how often each fires, a tie in localeCompare order. [[spec/design_output/projection#the-second-target]]
func RuleCounts(found []Finding) []Count {
	out := []Count{}
	at := map[string]int{}
	for _, one := range found {
		rule := LeafOf(one.Rule)
		if rule == "" {
			continue
		}
		if i, ok := at[rule]; ok {
			out[i].N++
			continue
		}
		at[rule] = len(out)
		out = append(out, Count{rule, 1})
	}
	sort.SliceStable(out, func(a, b int) bool {
		if out[a].N != out[b].N {
			return out[a].N > out[b].N
		}
		return localeCompare(out[a].Rule, out[b].Rule) < 0
	})
	return out
}

// The measure rows: each file's words, findings, score and top rules. [[spec/design_output/projection#the-second-target]]
func MeasuredRows(files []Scored) []ScoreRow {
	out := make([]ScoreRow, 0, len(files))
	for _, one := range files {
		counts := RuleCounts(one.Found)
		out = append(out, ScoreRow{
			File:     one.File,
			Words:    one.Words,
			Findings: len(one.Found),
			Score:    ScoreOf(one.Words, len(one.Found)),
			Top:      counts[:min(top, len(counts))],
		})
	}
	return out
}

// The TOTAL row: the words and findings summed, and their score. [[spec/design_output/projection#the-second-target]]
func TotalOf(rows []ScoreRow) ScoreRow {
	words, findings := 0, 0
	for _, one := range rows {
		words += one.Words
		findings += one.Findings
	}
	return ScoreRow{File: "TOTAL", Words: words, Findings: findings, Score: ScoreOf(words, findings), Top: []Count{}}
}

// The moment the days walk back from now, as toISOString writes it: the day of the month less the days, truncated, as setUTCDate takes it. Past the range a date holds it fails as toISOString does. [[spec/design_output/projection#the-second-target]]
func SinceOf(now time.Time, days float64) (string, error) {
	day := now.UTC().Day()
	shift := math.Trunc(float64(day)-days) - float64(day)
	ms := float64(now.UnixMilli()) + shift*dayMs
	if math.IsNaN(ms) || math.Abs(ms) > lastMs {
		return "", errInvalidTime
	}
	at := time.UnixMilli(int64(ms)).UTC()
	year := fmt.Sprintf("%04d", at.Year())
	if at.Year() < 0 || at.Year() > 9999 {
		year = fmt.Sprintf("%+07d", at.Year())
	}
	return year + at.Format("-01-02T15:04:05.000Z"), nil
}

// The day count a word asks for, read as Number reads it, where it reads finite and past zero; otherwise the default. [[spec/design_output/projection#the-second-target]]
func DaysOf(said string) float64 {
	if n := jsNumber(said); !math.IsInf(n, 0) && !math.IsNaN(n) && n > 0 {
		return n
	}
	return Days
}

// A word as Number reads it: blank as zero, a radix literal, a decimal, or NaN. [[spec/design_output/projection#the-second-target]]
func jsNumber(said string) float64 {
	flat := jsTrim(said)
	if flat == "" {
		return 0
	}
	if found := radix.FindStringSubmatch(flat); found != nil {
		base := map[string]int{"x": 16, "o": 8, "b": 2}[strings.ToLower(found[1])]
		n, ok := new(big.Int).SetString(found[2], base)
		if !ok {
			return math.NaN()
		}
		f, _ := new(big.Float).SetInt(n).Float64()
		return f
	}
	if !decimal.MatchString(flat) {
		return math.NaN()
	}
	f, err := strconv.ParseFloat(flat, 64)
	if err != nil && !errors.Is(err, strconv.ErrRange) {
		return math.NaN()
	}
	return f
}

// A finite number as String writes it: plain below 1e21 and from 1e-7, an exponent otherwise. [[spec/design_output/projection#the-second-target]]
func numberText(n float64) string {
	if n == 0 || (math.Abs(n) >= 1e-7 && math.Abs(n) < 1e21) {
		return strconv.FormatFloat(n, 'f', -1, 64)
	}
	mant, exp, _ := strings.Cut(strconv.FormatFloat(n, 'e', -1, 64), "e")
	sign, digits := exp[:1], strings.TrimLeft(exp[1:], "0")
	return mant + "e" + sign + digits
}

// The warn rows carrying a rule, at or after since where since names a moment. [[spec/design_output/projection#the-second-target]]
func RefusalsIn(rows []Row, since string) []Row {
	out := []Row{}
	for _, one := range rows {
		if one["level"] != "warn" || !truthy(one["rule"]) {
			continue
		}
		if since == "" || unitsCompare(jsString(one["at"]), since) >= 0 {
			out = append(out, one)
		}
	}
	return out
}

// The refusals ranked by fires, keyed by rule leaf and phrase, the phrase falling back to the tool. [[spec/design_output/projection#the-second-target]]
func RankedRefusals(rows []Row) []Refusal {
	out := []Refusal{}
	at := map[[2]string]int{}
	for _, one := range rows {
		rule := LeafOf(jsString(one["rule"]))
		phrase := jsTrim(jsString(one["phrase"]))
		if phrase == "" {
			phrase = jsTrim(jsString(one["tool"]))
		}
		key := [2]string{rule, phrase}
		if i, ok := at[key]; ok {
			out[i].Fires++
			continue
		}
		at[key] = len(out)
		out = append(out, Refusal{rule, phrase, 1})
	}
	sort.SliceStable(out, func(a, b int) bool {
		if out[a].Fires != out[b].Fires {
			return out[a].Fires > out[b].Fires
		}
		if by := localeCompare(out[a].Rule, out[b].Rule); by != 0 {
			return by < 0
		}
		return localeCompare(out[a].Phrase, out[b].Phrase) < 0
	})
	return out
}

// A table: each column padded to its widest cell in UTF-16 units, the right columns padded on the left, each line trimmed at its end. [[spec/design_output/projection#the-second-target]]
func Tabled(head []string, rows [][]string, right []int) string {
	all := append([][]string{head}, rows...)
	wide := make([]int, len(head))
	for i := range head {
		for _, row := range all {
			if i < len(row) {
				wide[i] = max(wide[i], units(row[i]))
			}
		}
	}
	drawn := make([]string, 0, len(all))
	for _, row := range all {
		cells := make([]string, 0, len(row))
		for i, one := range row {
			pad := ""
			if i < len(wide) {
				pad = strings.Repeat(" ", max(0, wide[i]-units(one)))
			}
			if slices.Contains(right, i) {
				cells = append(cells, pad+one)
			} else {
				cells = append(cells, one+pad)
			}
		}
		drawn = append(drawn, strings.TrimRightFunc(strings.Join(cells, "  "), jsSpace))
	}
	return strings.Join(drawn, "\n")
}

// The measure table: file, words, findings, score to one place, and the top rules. [[spec/design_output/projection#the-second-target]]
func MeasureTable(rows []ScoreRow) string {
	shownRows := make([][]string, 0, len(rows))
	for _, one := range rows {
		tops := make([]string, 0, len(one.Top))
		for _, count := range one.Top {
			tops = append(tops, fmt.Sprintf("%s %d", count.Rule, count.N))
		}
		shownRows = append(shownRows, []string{
			one.File, strconv.Itoa(one.Words), strconv.Itoa(one.Findings),
			strconv.FormatFloat(one.Score, 'f', 1, 64), strings.Join(tops, ", "),
		})
	}
	return Tabled(heads, shownRows, numeric)
}

// The refused table: rule, fires and phrase. [[spec/design_output/projection#the-second-target]]
func RefusedTable(ranked []Refusal) string {
	shownRows := make([][]string, 0, len(ranked))
	for _, one := range ranked {
		shownRows = append(shownRows, []string{one.Rule, strconv.Itoa(one.Fires), one.Phrase})
	}
	return Tabled([]string{"rule", "fires", "phrase"}, shownRows, []int{1})
}

// Vale's JSON as findings, in the file order Vale writes, sorted by line and column; the prose styles drop off each rule. [[spec/design_output/projection#the-second-target]]
func FromJSON(stdout string) []Finding {
	out := []Finding{}
	if stdout == "" {
		return out
	}
	var whole json.RawMessage
	if json.Unmarshal([]byte(stdout), &whole) != nil {
		return out
	}
	read := json.NewDecoder(bytes.NewReader(whole))
	if open, err := read.Token(); err != nil || open != json.Delim('{') {
		return out
	}
	for read.More() {
		key, err := read.Token()
		if err != nil {
			return out
		}
		var rows any
		if read.Decode(&rows) != nil {
			return out
		}
		list, ok := rows.([]any)
		if !ok {
			continue
		}
		for _, one := range list {
			row, _ := one.(map[string]any)
			out = append(out, findingOf(fmt.Sprint(key), row))
		}
	}
	sort.SliceStable(out, func(a, b int) bool {
		if out[a].Line != out[b].Line {
			return out[a].Line < out[b].Line
		}
		return out[a].Column < out[b].Column
	})
	return out
}

// One Vale row as a finding, each field falling back as fromJson's does. [[spec/design_output/projection#the-second-target]]
func findingOf(file string, row map[string]any) Finding {
	one := Finding{File: file, Rule: proseRule.ReplaceAllString(jsString(row["Check"]), ""), Line: 1, Column: 1, Severity: "error"}
	if line, ok := row["Line"].(float64); ok {
		one.Line = int(line)
	}
	if span, ok := row["Span"].([]any); ok && len(span) > 0 {
		if column, ok := span[0].(float64); ok {
			one.Column = int(column)
		}
	}
	if row["Match"] != nil {
		one.Said = jsString(row["Match"])
	}
	if row["Message"] != nil {
		one.Message = jsString(row["Message"])
	}
	if row["Severity"] != nil {
		one.Severity = jsString(row["Severity"])
	}
	action, _ := row["Action"].(map[string]any)
	one.Fixable = truthy(action["Name"])
	return one
}

// Whether a JSON value reads as true in JavaScript. [[spec/design_output/projection#the-second-target]]
func truthy(v any) bool {
	switch one := v.(type) {
	case nil:
		return false
	case bool:
		return one
	case string:
		return one != ""
	case float64:
		return one != 0 && !math.IsNaN(one)
	}
	return true
}

// A JSON value as String writes it, a missing one as nothing. [[spec/design_output/projection#the-second-target]]
func jsString(v any) string {
	switch one := v.(type) {
	case nil:
		return ""
	case string:
		return one
	case bool:
		return strconv.FormatBool(one)
	case float64:
		return numberText(one)
	case []any:
		parts := make([]string, 0, len(one))
		for _, each := range one {
			parts = append(parts, jsString(each))
		}
		return strings.Join(parts, ",")
	}
	return "[object Object]"
}

// Whether a rune is whitespace to String.prototype.trim. [[spec/design_output/projection#the-second-target]]
func jsSpace(r rune) bool {
	return r != '\u0085' && (unicode.IsSpace(r) || r == 0xFEFF)
}

// A text trimmed at both ends as trim does. [[spec/design_output/projection#the-second-target]]
func jsTrim(said string) string { return strings.TrimFunc(said, jsSpace) }

// A text's length in UTF-16 units, as length counts it. [[spec/design_output/projection#the-second-target]]
func units(said string) int { return len(utf16.Encode([]rune(said))) }

// Two texts compared by UTF-16 units, as the JavaScript operators and the default sort compare. [[spec/design_output/projection#the-second-target]]
func unitsCompare(a, b string) int {
	return slices.Compare(utf16.Encode([]rune(a)), utf16.Encode([]rune(b)))
}

// The printable ASCII in the CLDR root order localeCompare sorts by, a letter's two cases side by side. [[spec/design_output/projection#the-second-target]]
const rootOrder = "\t\n\v\f\r _-,;:!?.'\"()[]{}@*/\\&#%`^+<=>|~$0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ"

// Each ASCII rune's primary weight in the root order, both cases of a letter sharing one. [[spec/design_output/projection#the-second-target]]
var primary = func() map[rune]int {
	out := map[rune]int{}
	for i, r := range rootOrder {
		out[r] = i
		if unicode.IsUpper(r) {
			out[r] = out[unicode.ToLower(r)]
		}
	}
	return out
}()

// The weights localeCompare reads a text by: the primary weight of each rune, and its case, past the control runes it ignores. A rune past ASCII weighs past every ASCII one, by its lower case. [[spec/design_output/projection#the-second-target]]
func weightsOf(said string) (first, cases []int) {
	for _, r := range said {
		weight, ok := primary[r]
		if !ok {
			if r < 0x80 || unicode.IsControl(r) {
				continue
			}
			weight = len(rootOrder) + int(unicode.ToLower(r))
		}
		first = append(first, weight)
		upper := 0
		if unicode.IsUpper(r) {
			upper = 1
		}
		cases = append(cases, upper)
	}
	return first, cases
}

// Two texts compared as localeCompare does under the root locale: the letters first, the case after, lower before upper. [[spec/design_output/projection#the-second-target]]
func localeCompare(a, b string) int {
	firstA, casesA := weightsOf(a)
	firstB, casesB := weightsOf(b)
	if by := slices.Compare(firstA, firstB); by != 0 {
		return by
	}
	return slices.Compare(casesA, casesB)
}
