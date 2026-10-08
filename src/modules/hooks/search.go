// Grep and Glob answer off the index through the door, in the shapes the
// bridge's answersFromIndex hands the harness. Every other case passes to the
// disk.
// [[spec/design_output/index#the-door-answers-the-tools]]
package hooks

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

// The tools the index answers, its methods, the modes of a Grep, its limit where the call names none, and the line a cut answer ends on. [[spec/design_output/index#the-door-answers-the-tools]]
const (
	grepTool    = "Grep"
	globTool    = "Glob"
	grepMethod  = "grep"
	globMethod  = "glob"
	contentMode = "content"
	countMode   = "count"
	filesMode   = "files_with_matches"
	headLimit   = 250
	cutLine     = "(the answer stops at the limit)"
)

// [[spec/design_output/index#a-type-is-a-glob]]
var kinds = map[string]string{
	"js": "*.{js,jsx,mjs,cjs}", "ts": "*.{ts,tsx,mts,cts}", "py": "*.{py,pyi}", "go": "*.go",
	"rust": "*.rs", "java": "*.java", "c": "*.{c,h}", "cpp": "*.{cpp,cc,cxx,hpp,hh,hxx}",
	"cs": "*.cs", "rb": "*.rb", "php": "*.php", "sh": "*.{sh,bash,zsh}", "md": "*.{md,markdown}",
	"json": "*.json", "yaml": "*.{yaml,yml}", "toml": "*.toml", "html": "*.{html,htm}",
	"css": "*.{css,scss,sass}", "sql": "*.sql", "xml": "*.xml",
}

// A path opening on a slash or a drive stands outside the tree the index holds. [[spec/design_output/index#where-the-disk-still-answers]]
var absolute = regexp.MustCompile(`^([A-Za-z]:)?[\\/]`)

// The answer se-index prints for a grep and a glob, as the door reads it. [[spec/design_output/index#the-door-answers-the-tools]]
type grepSaid struct {
	Files []struct {
		Path  string `json:"path"`
		Count int    `json:"count"`
		Lines []struct {
			Line  int    `json:"line"`
			Text  string `json:"text"`
			Match bool   `json:"match"`
		} `json:"lines"`
	} `json:"files"`
	Cut bool `json:"cut"`
}

type globSaid struct {
	Paths []string `json:"paths"`
	Cut   bool     `json:"cut"`
}

// Answers a Grep or a Glob with the index's shape, and passes where the bridge passes: no index, no ask, an absolute path, or a question the index refuses. [[spec/design_output/index#the-door-answers-the-tools]]
func (d *Door) searches(post Post) (Effect, bool) {
	if post.Event != toolEvent || d.from.Index == nil {
		return Effect{}, false
	}
	e := post.E
	method, params, ok := askedOf(e)
	if !ok || absolute.MatchString(callField(e, "path")) {
		return Effect{}, false
	}
	answer, err := d.from.Index(method, params)
	if err != nil || answer == nil {
		return Effect{}, false
	}
	var shape map[string]any
	if method == globMethod {
		shape, err = globShape(answer)
	} else {
		shape, err = grepShape(e, answer)
	}
	if err != nil {
		return Effect{}, false
	}
	return Effect{Kind: resultKind, Result: shape}, true
}

// [[spec/design_output/index#where-the-disk-still-answers]]
func askedOf(e map[string]any) (string, map[string]any, bool) {
	pattern := callField(e, "pattern")
	if pattern == "" {
		return "", nil, false
	}
	switch textOf(e, "tool") {
	case globTool:
		return globMethod, map[string]any{"pattern": pattern, "path": callField(e, "path")}, true
	case grepTool:
		glob, ok := globOf(e)
		if !ok {
			return "", nil, false
		}
		around := callNumber(e, "-C", "context")
		limit := headLimit
		if said, named := fieldOf(e, "head_limit"); named && said != nil {
			limit = callNumber(e, "head_limit")
		}
		return grepMethod, map[string]any{
			"pattern": pattern, "glob": glob, "path": callField(e, "path"),
			"insensitive": truthOf(e, "-i"), "multiline": truthOf(e, "multiline"), "only": truthOf(e, "-o"),
			"before": numberOr(e, "-B", around), "after": numberOr(e, "-A", around),
			"limit": limit, "offset": callNumber(e, "offset"),
		}, true
	}
	return "", nil, false
}

// A type reads as its glob, and a type beside a glob, or one the index knows no glob for, passes. [[spec/design_output/index#a-type-is-a-glob]]
func globOf(e map[string]any) (string, bool) {
	said := callField(e, "glob")
	kind := strings.ToLower(strings.TrimSpace(callField(e, "type")))
	if kind == "" {
		return said, true
	}
	if said != "" {
		return "", false
	}
	glob, ok := kinds[kind]
	return glob, ok
}

// A call's field, flat on the event or nested under its input. [[spec/tickets/grep-glob-answer-off-index]]
func fieldOf(e map[string]any, key string) (any, bool) {
	if said, ok := e[key]; ok {
		return said, true
	}
	input, _ := e["input"].(map[string]any)
	said, ok := input[key]
	return said, ok
}

// The first of the keys a call names, flat or under its input, read as a whole number, and 0 where none reads as one. [[spec/tickets/grep-glob-answer-off-index]]
func callNumber(e map[string]any, keys ...string) int {
	for _, key := range keys {
		if said, ok := fieldOf(e, key); ok && said != nil {
			return wholeOf(said)
		}
	}
	return 0
}

func numberOr(e map[string]any, key string, or int) int {
	if said, ok := fieldOf(e, key); ok && said != nil {
		return wholeOf(said)
	}
	return or
}

func wholeOf(said any) int {
	switch one := said.(type) {
	case float64:
		return int(one)
	case int:
		return one
	case string:
		var n float64
		if _, err := fmt.Sscan(one, &n); err == nil {
			return int(n)
		}
	}
	return 0
}

func truthOf(e map[string]any, key string) bool {
	said, _ := fieldOf(e, key)
	switch one := said.(type) {
	case bool:
		return one
	case string:
		return one != ""
	case float64:
		return one != 0
	}
	return false
}

func decoded(answer map[string]any, into any) error {
	text, err := json.Marshal(answer)
	if err != nil {
		return err
	}
	return json.Unmarshal(text, into)
}

// [[spec/design_output/index#the-door-answers-the-tools]]
func globShape(answer map[string]any) (map[string]any, error) {
	var said globSaid
	if err := decoded(answer, &said); err != nil {
		return nil, err
	}
	filenames := append([]string{}, said.Paths...)
	return map[string]any{"durationMs": 0, "numFiles": len(filenames), "filenames": filenames, "truncated": said.Cut}, nil
}

// [[spec/design_output/index#the-door-answers-the-tools]]
func grepShape(e map[string]any, answer map[string]any) (map[string]any, error) {
	var said grepSaid
	if err := decoded(answer, &said); err != nil {
		return nil, err
	}
	mode := callField(e, "output_mode")
	if mode == "" {
		mode = filesMode
	}
	filenames := make([]string, 0, len(said.Files))
	for _, one := range said.Files {
		filenames = append(filenames, one.Path)
	}
	shape := map[string]any{"mode": mode, "numFiles": len(filenames), "filenames": filenames}
	switch mode {
	case contentMode:
		lines := 0
		for _, one := range said.Files {
			lines += len(one.Lines)
		}
		shape["content"], shape["numLines"] = grepText(e, said, mode), lines
	case countMode:
		matches := 0
		for _, one := range said.Files {
			matches += one.Count
		}
		shape["content"], shape["numMatches"] = grepText(e, said, mode), matches
	}
	return shape, nil
}

// The text a Grep prints, line for line as the bridge's grepSaid writes it. [[spec/design_output/index#the-door-answers-the-tools]]
func grepText(e map[string]any, said grepSaid, mode string) string {
	if len(said.Files) == 0 {
		return "No matches found"
	}
	var rows []string
	switch mode {
	case countMode:
		for _, one := range said.Files {
			rows = append(rows, fmt.Sprintf("%s:%d", one.Path, one.Count))
		}
	case contentMode:
		numbered := true
		if flag, ok := fieldOf(e, "-n"); ok && flag == false {
			numbered = false
		}
		for _, one := range said.Files {
			for _, line := range one.Lines {
				mark := "-"
				if line.Match {
					mark = ":"
				}
				if numbered {
					rows = append(rows, fmt.Sprintf("%s%s%d%s%s", one.Path, mark, line.Line, mark, line.Text))
				} else {
					rows = append(rows, one.Path+mark+line.Text)
				}
			}
		}
	}
	if said.Cut {
		rows = append(rows, cutLine)
	}
	return strings.Join(rows, "\n")
}
