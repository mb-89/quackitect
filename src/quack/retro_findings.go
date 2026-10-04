// The retro's findings: the rows every column answers, and the columns the
// readers write, one file a chapter and one for the field feedback.
// [[spec/guidance/retro/read]]
package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"sort"
	"strings"
)

// The five starfish questions, one row each. [[spec/guidance/retro/read]]
var retroQuestions = []string{"start", "stop", "keep", "more", "less"}

// The improvements, which are also the categories a class fix falls in. [[spec/guidance/retro/classify]]
var retroCategories = []string{"mechanize", "guidance", "process", "code", "tools"}

// The rows of the matrix: the questions, then the improvements. [[spec/guidance/retro/read]]
var retroRows = append(append([]string{}, retroQuestions...), retroCategories...)

// The folder the findings stand in, the field feedback's column, and an auditor's file prefix. [[spec/guidance/retro/audit]]
const (
	retroFindingsFolder = "findings"
	retroFeedback       = "feedback"
	retroAuditPrefix    = "audit-"
)

// The characters JavaScript's \s and trim take as white space. [[spec/guidance/retro/read]]
const retroJSSpaces = `\t\n\v\f\r \x{a0}\x{1680}\x{2000}-\x{200a}\x{2028}\x{2029}\x{202f}\x{205f}\x{3000}\x{feff}`

// A section's head, and an item under it. [[spec/guidance/retro/read]]
var (
	retroFindingsHead = regexp.MustCompile(`^##[` + retroJSSpaces + `]+(\w+)`)
	retroFindingsItem = regexp.MustCompile(`^- ([^\n\r\x{2028}\x{2029}]+)$`)
)

// One column of the matrix: a chapter, the field feedback or an auditor, with its findings by row. [[spec/guidance/retro/read]]
type retroColumn struct {
	id       string
	title    string
	findings map[string][]string
}

// One finding, note or memory: its id, and its text. [[spec/guidance/retro/classify]]
type retroItem struct {
	id   string
	text string
}

// One chapter's findings: a section per row, and the items under it in order. A row with no section answers nil. [[spec/guidance/retro/read]]
func retroFindingsOf(text string) map[string][]string {
	out := map[string][]string{}
	for _, row := range retroRows {
		out[row] = nil
	}
	row := ""
	for _, line := range strings.Split(text, "\n") {
		line = strings.TrimSuffix(line, "\r")
		if head := retroFindingsHead.FindStringSubmatch(line); head != nil {
			row = strings.ToLower(head[1])
			if !slices.Contains(retroRows, row) {
				row = ""
			}
			if row != "" {
				out[row] = []string{}
			}
			continue
		}
		if item := retroFindingsItem.FindStringSubmatch(line); row != "" && item != nil {
			out[row] = append(out[row], retroJSTrim(item[1]))
		}
	}
	return out
}

// A finding's id: its column, its row, and its place in the row, counted from one. [[spec/guidance/retro/read]]
func retroIdOf(column, row string, at int) string {
	return fmt.Sprintf("%s.%s.%d", column, row, at+1)
}

// Every finding of every column, by id. [[spec/guidance/retro/classify]]
func retroItemsOf(columns []retroColumn) []retroItem {
	out := []retroItem{}
	for _, column := range columns {
		for _, row := range retroRows {
			for at, text := range column.findings[row] {
				out = append(out, retroItem{id: retroIdOf(column.id, row, at), text: text})
			}
		}
	}
	return out
}

// The columns a retro's findings fill, and the faults of a column standing incomplete. [[spec/guidance/retro/read]]
func retroColumnsOf(home string) ([]retroColumn, []string) {
	cuts, _ := retroCutsOf(retroFileText(filepath.Join(home, retroCutsFile)))
	wanted := []retroColumn{}
	for _, one := range cuts {
		wanted = append(wanted, retroColumn{id: one.id, title: one.title})
	}
	if retroIsThere(filepath.Join(home, retroFindingsFolder, retroFeedback+".md")) {
		wanted = append(wanted, retroColumn{id: retroFeedback, title: "field feedback"})
	}
	audits := []string{}
	entries, _ := os.ReadDir(filepath.Join(home, retroFindingsFolder))
	for _, one := range entries {
		if strings.HasPrefix(one.Name(), retroAuditPrefix) && strings.HasSuffix(one.Name(), ".md") {
			audits = append(audits, one.Name())
		}
	}
	sort.SliceStable(audits, func(i, j int) bool { return retroJSLess(audits[i], audits[j]) })
	for _, one := range audits {
		id := strings.TrimSuffix(one, ".md")
		wanted = append(wanted, retroColumn{id: id, title: "the checklist, " + id[len(retroAuditPrefix):]})
	}
	faults := []string{}
	columns := []retroColumn{}
	for _, one := range wanted {
		at := filepath.Join(home, retroFindingsFolder, one.id+".md")
		if !retroIsThere(at) {
			faults = append(faults, fmt.Sprintf("%s/%s.md stands nowhere", retroFindingsFolder, one.id))
			columns = append(columns, retroColumn{id: one.id, title: one.title, findings: map[string][]string{}})
			continue
		}
		findings := retroFindingsOf(retroFileText(at))
		for _, row := range retroRows {
			if findings[row] == nil {
				faults = append(faults, fmt.Sprintf("%s/%s.md carries no %s section", retroFindingsFolder, one.id, row))
			}
		}
		columns = append(columns, retroColumn{id: one.id, title: one.title, findings: findings})
	}
	return columns, faults
}

// The word of the verb's line at a place, or none. [[spec/tickets/retro-verbs-port-to-go]]
func retroWordAt(argv []string, at int) string {
	if at < len(argv) {
		return argv[at]
	}
	return ""
}

// Whether a path stands on the disk. [[spec/tickets/retro-verbs-port-to-go]]
func retroIsThere(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// A file's text, or none where it reads as nothing. [[spec/tickets/retro-verbs-port-to-go]]
func retroFileText(path string) string {
	body, _ := os.ReadFile(path)
	return string(body)
}
