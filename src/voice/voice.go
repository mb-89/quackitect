// The voice verbs in Go. `measure` scores a folder of prose through Vale, and
// `refused` ranks what the doors turn away. The pure half takes rows and
// answers rows, and Run reaches the disk, Vale and the clock through Doors,
// so a test drives it over a fixture. It prints what
// .claude/skills/level0/lib/voice.js prints, line for line.
// [[spec/design_output/projection#the-second-target]]
package voice

import (
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"regexp"
	"slices"
	"sort"
	"strconv"
	"strings"
	"time"
)

// The folders and names the verbs read and write, as lib/voice.js, lib/vale.js and lib/log.js name them. [[spec/design_output/projection#the-second-target]]
const (
	Measured = ".se/.runtime/measure" // the runtime folder .claude/skills/level0/lib/folders.js owns
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
	scoreColumn = 3
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
	numeric   = []int{1, 2, scoreColumn}
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
	// The rules over one file's text, by its path under the root. [[spec/tickets/vale-leaves-the-tree]]
	Lint func(path, text string) []Finding
	Now  func() time.Time
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
	return 0
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
