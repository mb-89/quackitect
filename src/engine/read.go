package main

import (
	"flag"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

// READING IS A VERB, BECAUSE READING IS WHAT AN AGENT MOSTLY DOES.
//
// The verb table held no reader, so every read of a line range went out
// through a shell, and so did every outline of a note by its headings. One
// session was measured: 791 of its 1038 shell calls were reading rather than
// writing.
//
// THE SHAPING IS THE POINT RATHER THAN THE PAGING. A range of lines is the
// least of it. What the engine knows and the agent re-encodes by hand is which
// files are tests, which are generated and which are parked.
//
// FINDING IS NOT REBUILT. se find answers where a word is, and this answers
// what is there.
func runRead(c *call) int {
	fs := flag.NewFlagSet("read", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se read - read a file, or the files a glob names. Prints what it read as JSON.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se read --file doc/glossary.md                 the whole file")
		fmt.Fprintln(c.err, "  se read --file doc/glossary.md --lines 20-60   those lines")
		fmt.Fprintln(c.err, "  se read --file doc/glossary.md --outline       its headings")
		fmt.Fprintln(c.err, "  se read --path 'src/engine/*.go' --outline --without tests")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  A path is relative to the folder being worked on. What is left out is")
		fmt.Fprintln(c.err, "  named in the answer, with why, so nothing goes missing in silence.")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	file := fs.String("file", "", "the file to read")
	path := fs.String("path", "", "a glob naming the files to read")
	lines := fs.String("lines", "", "a line range, 20-60, or one line")
	outline := fs.Bool("outline", false, "the headings rather than the lines")
	without := fs.String("without", "", "kinds to leave out: tests, generated, parked")
	if code, stop := c.parse(fs, "read"); stop {
		return code
	}
	got, err := TheReading(c.roots, Reading{File: *file, Path: *path, Lines: *lines,
		Outline: *outline, Without: *without})
	if err != nil {
		return c.fail(err)
	}
	c.answerJSON(got)
	return 0
}

// Reading is what was asked for.
type Reading struct {
	File    string
	Path    string
	Lines   string
	Outline bool
	Without string
}

// Readings is what was read, and what was left out with why.
type Readings struct {
	Files   []ReadFile `json:"files"`
	LeftOut []LeftOut  `json:"left_out,omitempty"`
}

// ReadFile is one file: how many lines it holds, which of them are here, and
// either those lines or the headings over them.
type ReadFile struct {
	Path    string    `json:"path"`
	Of      int       `json:"of"`
	From    int       `json:"from,omitempty"`
	To      int       `json:"to,omitempty"`
	Text    string    `json:"text,omitempty"`
	Outline []Heading `json:"outline,omitempty"`
}

// Heading is one heading of a markdown file, by the line it is on.
type Heading struct {
	Line  int    `json:"line"`
	Depth int    `json:"depth"`
	Text  string `json:"text"`
}

// LeftOut is a file the shaping dropped, and why it dropped it.
type LeftOut struct {
	Path string `json:"path"`
	Why  string `json:"why"`
}

// TheReading answers what was asked for.
//
// ONE FILE OR A GLOB, NEVER BOTH, because an answer that quietly read one of
// the two is an answer nobody can tell apart from the other.
func TheReading(r Roots, asked Reading) (Readings, error) {
	if (asked.File == "") == (asked.Path == "") {
		return Readings{}, fmt.Errorf("name one file with --file, or a glob with --path, and not both")
	}
	from, to, err := theRangeAsked(asked.Lines)
	if err != nil {
		return Readings{}, err
	}
	without, err := theKindsToLeaveOut(asked.Without)
	if err != nil {
		return Readings{}, err
	}
	paths, err := thePathsToRead(r, asked)
	if err != nil {
		return Readings{}, err
	}
	var out Readings
	for _, rel := range paths {
		if why := whyItIsLeftOut(r, rel, without, asked.Outline); why != "" {
			out.LeftOut = append(out.LeftOut, LeftOut{Path: rel, Why: why})
			continue
		}
		one, err := oneFileRead(r, rel, from, to, asked.Outline)
		if err != nil {
			return Readings{}, err
		}
		out.Files = append(out.Files, one)
	}
	return out, nil
}

// theRangeAsked reads the range a caller named: nothing is the whole file, one
// number is that line, and two are the ends, both of them in it.
func theRangeAsked(lines string) (int, int, error) {
	if strings.TrimSpace(lines) == "" {
		return 0, 0, nil
	}
	one := func(s string) (int, error) {
		n, err := strconv.Atoi(strings.TrimSpace(s))
		if err != nil || n < 1 {
			return 0, fmt.Errorf("a line range is 20-60, or one line number, and %q is neither", lines)
		}
		return n, nil
	}
	if at := strings.Index(lines, "-"); at >= 0 {
		from, err := one(lines[:at])
		if err != nil {
			return 0, 0, err
		}
		to, err := one(lines[at+1:])
		if err != nil {
			return 0, 0, err
		}
		if to < from {
			return 0, 0, fmt.Errorf("the range %q ends before it begins", lines)
		}
		return from, to, nil
	}
	n, err := one(lines)
	return n, n, err
}

// theKindsToLeaveOut reads what the caller asked to be left out, and refuses a
// kind this door does not know rather than passing over it.
func theKindsToLeaveOut(without string) (map[string]bool, error) {
	out := map[string]bool{}
	for _, kind := range strings.Split(without, ",") {
		kind = strings.TrimSpace(kind)
		if kind == "" {
			continue
		}
		switch kind {
		case "tests", "generated", "parked":
			out[kind] = true
		default:
			return nil, fmt.Errorf("%q is no kind this door knows: tests, generated and parked are", kind)
		}
	}
	return out, nil
}

// thePathsToRead answers the files to read, in order.
func thePathsToRead(r Roots, asked Reading) ([]string, error) {
	if asked.File != "" {
		return []string{filepath.ToSlash(asked.File)}, nil
	}
	re, err := globRegexp(asked.Path)
	if err != nil {
		return nil, err
	}
	var out []string
	err = filepath.WalkDir(r.Work, func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		if d.IsDir() {
			// THE FOLDERS NOTHING READS. .git is not this tree's text, and .se
			// is what does not travel.
			if d.Name() == ".git" || d.Name() == ".se" {
				return filepath.SkipDir
			}
			return nil
		}
		rel, err := filepath.Rel(r.Work, p)
		if err != nil {
			return nil
		}
		if slash := filepath.ToSlash(rel); re.MatchString(slash) {
			out = append(out, slash)
		}
		return nil
	})
	sort.Strings(out)
	return out, err
}

// whyItIsLeftOut answers why this file is not read, and nothing where it is.
//
// WHAT IS DROPPED IS NAMED, because a set that is quietly short reads exactly
// like a set with nothing in it to drop.
func whyItIsLeftOut(r Roots, rel string, without map[string]bool, outline bool) string {
	if without["parked"] && parkedPath(rel) {
		return "parked: a name on its path begins with an underscore"
	}
	if without["tests"] && aTestFile(rel) {
		return "a test"
	}
	if without["generated"] && itSaysItIsGenerated(r, rel) {
		return "generated: it says so in its own first lines"
	}
	if outline && !strings.HasSuffix(rel, ".md") {
		return "not markdown, so it carries no headings to outline"
	}
	return ""
}

// aTestFile says whether this file is a test, by the name every suite here
// gives one.
func aTestFile(rel string) bool {
	name := filepath.Base(rel)
	return strings.HasSuffix(name, "_test.go") || strings.Contains(name, "_test.") ||
		strings.Contains(name, ".test.")
}

// itSaysItIsGenerated reads the head of a file for the line a generator leaves.
// The rule is the file's own word, so nothing here keeps a list of generators.
func itSaysItIsGenerated(r Roots, rel string) bool {
	path, err := inTheTree(r, rel)
	if err != nil {
		return false
	}
	b, err := os.ReadFile(path)
	if err != nil {
		return false
	}
	for i, line := range strings.Split(string(b), "\n") {
		if i >= 5 {
			return false
		}
		if strings.Contains(line, "DO NOT EDIT") {
			return true
		}
	}
	return false
}

// oneFileRead reads one file: its lines, or the headings over them.
func oneFileRead(r Roots, rel string, from, to int, outline bool) (ReadFile, error) {
	path, err := inTheTree(r, rel)
	if err != nil {
		return ReadFile{}, fmt.Errorf("%s: %w", rel, err)
	}
	b, err := os.ReadFile(path)
	if err != nil {
		return ReadFile{}, err
	}
	lines := strings.Split(strings.TrimSuffix(string(b), "\n"), "\n")
	if len(lines) == 1 && lines[0] == "" {
		lines = nil
	}
	one := ReadFile{Path: filepath.ToSlash(rel), Of: len(lines)}
	if outline {
		one.Outline = theHeadingsIn(lines)
		return one, nil
	}
	first, last := 1, len(lines)
	if from > 0 {
		first = from
	}
	if to > 0 && to < last {
		last = to
	}
	if first > last {
		return one, nil // the range is past the end, and the file's length says so
	}
	one.From, one.To = first, last
	one.Text = strings.Join(lines[first-1:last], "\n") + "\n"
	return one, nil
}

// theHeadingsIn answers the markdown headings of these lines, by the line each
// is on. A fenced block is passed over, because a heading inside one is text.
func theHeadingsIn(lines []string) []Heading {
	var out []Heading
	fenced := false
	for i, line := range lines {
		if strings.HasPrefix(strings.TrimSpace(line), "```") {
			fenced = !fenced
			continue
		}
		if fenced || !strings.HasPrefix(line, "#") {
			continue
		}
		depth := len(line) - len(strings.TrimLeft(line, "#"))
		text := strings.TrimSpace(line[depth:])
		if text == "" {
			continue
		}
		out = append(out, Heading{Line: i + 1, Depth: depth, Text: text})
	}
	return out
}
