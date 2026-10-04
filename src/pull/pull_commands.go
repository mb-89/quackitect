// The voice the pull reads over the evidence, and the commands a leaf names
// as run, off src/scripts/pull-chapter.js.
// [[spec/design_output/pull#the-voice-reads-the-evidence]]
package pull

import (
	"fmt"
	"strconv"
	"strings"

	"quackitect/src/front"
	"quackitect/src/note"
	"quackitect/src/yaml"
)

// The pull reads the ticket the way the lint reads it: it answers the lines that refuse, and puts each break of form on warned. [[spec/design_output/pull#the-voice-reads-the-evidence]]
func (it *It) voiceFaults(one *Held, leaf *Leaf, warned *[]string) []string {
	if it.Voice == nil {
		return nil
	}
	text, first, last, ok := voiceText(one.Text, leaf)
	if !ok {
		return nil
	}
	out := []string{}
	for _, fault := range it.Voice(one.Path, text, first, last) {
		row := fmt.Sprintf("%s breaks %s at line %d of %s: %s", leaf.Path, fault.Rule, fault.Line, one.Path, fault.Message)
		if fault.Refuses {
			out = append(out, row)
		} else {
			*warned = append(*warned, row)
		}
	}
	return out
}

// A hand-back landing over a break of form names each line. [[spec/design_output/pull#the-voice-reads-the-evidence]]
func (it *It) warnsOf(warned []string) {
	if len(warned) == 0 {
		return
	}
	rows := []string{"These lines break a rule of form, and the hand-back lands. Leave them as they stand:"}
	for _, one := range warned {
		rows = append(rows, "  "+one)
	}
	it.Println(strings.Join(rows, "\n"))
}

// The ticket with the rows the voice passes blanked in place, so every row keeps its file line: a field in no prose form, and an answered row. [[spec/design_output/pull#the-voice-reads-the-evidence]]
func voiceText(text string, leaf *Leaf) (string, int, int, bool) {
	sections := note.Read(text).Sections
	at := note.SectionAt(sections, leaf.Path)
	if at < 0 {
		return "", 0, 0, false
	}
	rows := rowsOf(text)
	level := len(strings.Split(leaf.Path, "/"))
	first := sections[at].Line
	last := chapterEnd(sections, at, level, len(rows))
	read := map[string]bool{checked: true}
	for _, field := range leaf.Evidence {
		if formsRead[fieldWord(field, "form")] {
			read[fieldWord(field, "name")] = true
		}
	}
	for i := at + 1; i < len(sections) && sections[i].Level > level; i++ {
		if sections[i].Level != level+1 || read[sections[i].Header] {
			continue
		}
		end := chapterEnd(sections, i, level+1, len(rows))
		for row := sections[i].Line; row < end; row++ {
			if !commentRow.MatchString(rows[row]) {
				rows[row] = ""
			}
		}
	}
	holds := false
	for row := first - 1; row < last; row++ {
		if answeredRow.MatchString(rows[row]) {
			rows[row] = ""
		}
		bare := strings.TrimSpace(rows[row])
		if bare != "" && !commentRow.MatchString(bare) && !headingRow.MatchString(bare) {
			holds = true
		}
	}
	return strings.Join(rows, "\n"), first, last, holds
}

// Each command field the leaf holds a line under, run, and what each answers. A field whose answer misses what it expects puts a finding on found. [[spec/design_output/pull#the-commands-answer]]
func (it *It) commandsRun(path string, evidence []*yaml.Doc, chapter Chapter, faults *[]string) []Answered {
	out := []Answered{}
	for _, field := range evidence {
		if fieldWord(field, "form") != "command" {
			continue
		}
		name := fieldWord(field, "name")
		line := ""
		if rows := chapter.Fields[name]; len(rows) > 0 {
			line = rows[0]
		}
		stdout, exit, err := it.Shell(line)
		if err != nil {
			*faults = append(*faults, fmt.Sprintf("%s under %s runs %s, and the box answers %s.", name, path, line, err.Error()))
			continue
		}
		last := ""
		for _, row := range strings.Split(strings.TrimSpace(stdout), "\n") {
			if row != "" {
				last = row
			}
		}
		out = append(out, Answered{Name: name, Exit: exit, Said: jsCut(last, cutSaid)})
		if exit == noCommand {
			*faults = append(*faults, fmt.Sprintf("%s under %s runs %s, and the box finds no such command. A command field holds one bare line, indented four spaces.", name, path, line))
			continue
		}
		if !field.Has("expects") || field.Get("expects") == nil || yaml.AsString(field.Get("expects")) == "" {
			continue
		}
		want := yaml.AsString(field.Get("expects"))
		if number, err := strconv.Atoi(strings.TrimSpace(want)); err == nil && strings.TrimSpace(want) != "" {
			if exit != number {
				*faults = append(*faults, fmt.Sprintf("%s under %s expects exit %d, and %s answers %d: %s", name, path, number, line, exit, last))
			}
			continue
		}
		if word := strings.ToLower(openerGap.Split(last, -1)[0]); word != strings.ToLower(want) {
			said := last
			if said == "" {
				said = "nothing"
			}
			*faults = append(*faults, fmt.Sprintf("%s under %s expects %s, and %s answers %s", name, path, want, line, said))
		}
	}
	return out
}

// The first units of a text as slice counts them in JavaScript. [[spec/design_output/pull#the-commands-answer]]
func jsCut(said string, most int) string {
	units := 0
	for at, r := range said {
		size := 1
		if r > 0xFFFF {
			size = 2
		}
		if units+size > most {
			return said[:at]
		}
		units += size
	}
	return said
}

// The commands the record keeps, as the entry writes them. [[spec/design_output/pull#the-commands-answer]]
func answeredRows(said []Answered) []any {
	out := make([]any, 0, len(said))
	for _, one := range said {
		out = append(out, front.Ordered{{Key: "name", Value: one.Name}, {Key: "exit", Value: one.Exit}, {Key: "said", Value: one.Said}})
	}
	return out
}
