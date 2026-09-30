// The manifest: many ops, many files, one atomic answer. Every op reads the
// file as the ops before it leave it, and one failure refuses the whole batch,
// off applied in .claude/skills/level0/lib/apply.js.
// [[spec/design_output/apply#check-everything-then-write]]
package edits

import (
	"fmt"
	"regexp"
	"strings"
)

// The ops a manifest names, and the one an op naming none takes. [[spec/design_output/apply#the-verbs]]
const (
	opExact   = "exact"
	opCreate  = "create"
	opWrite   = "write"
	opAppend  = "append"
	opPrepend = "prepend"
	opRegex   = "regex"
	regexOK   = "ims"
)

// [[spec/design_output/apply#the-verbs]]
var opNames = []string{opExact, opCreate, opWrite, opAppend, opPrepend, opRegex}

// One edit of a manifest, under the keys the bridge's tool takes. [[spec/design_output/apply#the-verbs]]
type Op struct {
	File        string   `json:"file"`
	Op          string   `json:"op,omitempty"`
	Old         string   `json:"old,omitempty"`
	New         string   `json:"new,omitempty"`
	ReplaceAll  bool     `json:"replace_all,omitempty"`
	Pattern     string   `json:"pattern,omitempty"`
	Replacement string   `json:"replacement,omitempty"`
	Flags       string   `json:"flags,omitempty"`
	ExpectCount *float64 `json:"expect_count,omitempty"`
}

// A file as the disk holds it before the manifest runs. [[spec/design_output/apply#bytes-in-bytes-out]]
type Held struct {
	Exists bool
	Text   string
}

// A file the manifest leaves: what it held, what it holds after, and whether the manifest made it. [[spec/design_output/apply#the-journal-holds-both-halves]]
type Changed struct {
	File string
	Was  string
	Made string
	Born bool
}

// What a manifest answers: the files it leaves and the places it moves in each, or why it refuses. [[spec/design_output/apply#check-everything-then-write]]
type Took struct {
	Why    string
	Files  []Changed
	Counts map[string]int
}

// The files a manifest names, each once, in the order it names them. [[spec/design_output/apply#bytes-in-bytes-out]]
func FilesIn(ops []Op) []string {
	out := []string{}
	for _, one := range ops {
		path := strings.TrimSpace(one.File)
		if path != "" && !holds(out, path) {
			out = append(out, path)
		}
	}
	return out
}

// [[spec/design_output/apply#check-everything-then-write]]
func Applied(held map[string]Held, ops []Op) Took {
	if len(ops) == 0 {
		return Took{Why: "an apply with no edits: say what to change"}
	}
	now, was, born := map[string]string{}, map[string]string{}, map[string]bool{}
	order, counts := []string{}, map[string]int{}
	for i, one := range ops {
		at := fmt.Sprintf("edit %d", i+1)
		path := strings.TrimSpace(one.File)
		if path == "" {
			return Took{Why: at + " names no file"}
		}
		if _, seen := now[path]; !seen {
			order = append(order, path)
			if said := held[path]; said.Exists {
				now[path], was[path] = said.Text, said.Text
			} else {
				now[path], born[path] = "", true
			}
		}
		text, hits, why := oneOp(one, now[path], born[path], fmt.Sprintf("%s (%s)", at, path))
		if why != "" {
			return Took{Why: why}
		}
		now[path] = text
		counts[path] += hits
	}
	files := make([]Changed, 0, len(order))
	for _, path := range order {
		files = append(files, Changed{File: path, Was: was[path], Made: now[path], Born: born[path]})
	}
	return Took{Files: files, Counts: counts}
}

// [[spec/design_output/apply#the-verbs]]
func oneOp(one Op, text string, absent bool, at string) (string, int, string) {
	kind := strings.TrimSpace(one.Op)
	if kind == "" {
		kind = opExact
	}
	switch kind {
	case opCreate:
		if !absent {
			return "", 0, at + ": create over a file that stands. Use an exact edit, or op write"
		}
		if one.New == "" {
			return "", 0, at + ": create with no content"
		}
		return one.New, 1, ""
	case opWrite:
		if one.New == "" {
			return "", 0, at + ": write with no content. To empty a file, say so with an exact edit"
		}
		return one.New, 1, ""
	}
	if absent {
		return "", 0, at + ": no file stands here. Use op create"
	}
	switch kind {
	case opAppend:
		return text + one.New, 1, ""
	case opPrepend:
		return one.New + text, 1, ""
	case opRegex:
		return byPattern(one, text, at)
	case opExact:
		return byText(one, text, at)
	}
	return "", 0, fmt.Sprintf("%s: no op called %s. The ops are %s", at, kind, strings.Join(opNames, ", "))
}

// An exact edit writes its text as given, so a dollar sign in it stays a dollar sign. [[spec/design_output/apply#bytes-in-bytes-out]]
func byText(one Op, text, at string) (string, int, string) {
	if one.Old == "" {
		return "", 0, at + ": an exact edit takes the text to find"
	}
	found := strings.Count(text, one.Old)
	if found == 0 {
		return "", 0, at + ": the text stands nowhere in the file. Read it and copy the bytes exactly"
	}
	if one.ReplaceAll {
		return strings.ReplaceAll(text, one.Old, one.New), found, ""
	}
	if found > 1 {
		return "", 0, fmt.Sprintf("%s: the text stands %d times. Widen it, or say replace_all", at, found)
	}
	return strings.Replace(text, one.Old, one.New, 1), 1, ""
}

// [[spec/design_output/apply#a-pattern-matching-nothing]]
func byPattern(one Op, text, at string) (string, int, string) {
	if one.Pattern == "" {
		return "", 0, at + ": a regex edit takes a pattern"
	}
	shape, err := Compiled(one.Pattern, one.Flags)
	if err != nil {
		return "", 0, fmt.Sprintf("%s: the pattern compiles to nothing: %v", at, err)
	}
	hits := len(shape.FindAllStringIndex(text, -1))
	if hits == 0 {
		return "", 0, at + ": the pattern matches nothing in the file"
	}
	if one.ExpectCount != nil && int(*one.ExpectCount) != hits {
		return "", 0, fmt.Sprintf("%s: the pattern matches %d times, and expect_count says %v", at, hits, *one.ExpectCount)
	}
	return shape.ReplaceAllString(text, one.Replacement), hits, ""
}

// A pattern under the flags out of i, m and s, as the bridge reads them. [[spec/design_output/apply#a-pattern-matching-nothing]]
func Compiled(pattern, flags string) (*regexp.Regexp, error) {
	kept := ""
	for _, one := range flags {
		if strings.ContainsRune(regexOK, one) && !strings.ContainsRune(kept, one) {
			kept += string(one)
		}
	}
	if kept != "" {
		pattern = "(?" + kept + ")" + pattern
	}
	return regexp.Compile(pattern)
}

// [[spec/design_output/apply#bytes-in-bytes-out]]
func holds(list []string, one string) bool {
	for _, each := range list {
		if each == one {
			return true
		}
	}
	return false
}
