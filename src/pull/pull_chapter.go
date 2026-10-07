// The text a hand writes and the engine reads: the answer a hand-out prints,
// the chapter a leaf owns, and the evidence weighed against the leaf's
// fields.
// [[spec/design_output/pull#the-work-answer]]
package pull

import (
	"encoding/json"
	"fmt"
	"path"
	"regexp"
	"strconv"
	"strings"

	"quackitect/src/front"
	"quackitect/src/modules/check"
	"quackitect/src/note"
	"quackitect/src/yaml"
)

// A shell answers this where it finds no command, and the question a gate's reviewer asks before it clears. [[spec/design_output/pull#the-gate]]
const (
	noCommand   = 127
	beforeClear = "does anything here contradict what you see in the phase?"
	found       = "findings"
)

// A gate's words read as the review's: accept as pass, reject as fail. [[spec/design_output/pull#the-gate]]
var openers = map[string]string{"pass": "pass", "fail": "fail", "accept": "pass", "reject": "fail"}

var (
	findingsOpen = regexp.MustCompile(`(?i)^(pass\s+with\s+findings|accept\s+with\s+points)\b`)
	ticketName   = regexp.MustCompile(`^[a-z0-9][a-z0-9-]*$`)
	bullet       = regexp.MustCompile(`^[-*]\s+`)
	openerGap    = regexp.MustCompile(`[\s:.,]+`)
	leadGap      = regexp.MustCompile(`^[\s:.,]+`)
	findingRow   = regexp.MustCompile(`^([^\s:]+):\s*(.*)$`)
	headingRow   = regexp.MustCompile(`^#{1,6}\s`)
	trailBlank   = regexp.MustCompile(`[ \t]+$`)
	starBullet   = regexp.MustCompile(`^(\s*)\* `)
	manyBlanks   = regexp.MustCompile(`\n{3,}`)
	backticked   = regexp.MustCompile("`([^`]+)`")
	leadBlanks   = regexp.MustCompile(`^\n+`)
)

// The forms the voice reads, past checked. [[spec/design_output/pull#the-voice-reads-the-evidence]]
var formsRead = map[string]bool{"text": true, "list": true, "checklist": true, "verdict": true}

// What one command of a leaf answered, which the record keeps. [[spec/design_output/pull#the-commands-answer]]
type Answered struct {
	Name string
	Exit int
	Said string
}

// The rows of a split text, its line ends read as one. [[spec/design_output/pull#the-fields-ride-the-payload]]
func rowsOf(text string) []string { return strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n") }

// The answer a hand-out prints. [[spec/design_output/pull#the-work-answer]]
func (it *It) workAnswer(one *Held, leaf *Leaf) string {
	phase := ""
	if leaf.Parent != "" {
		phase = " under " + leaf.Parent
	}
	rows := []string{fmt.Sprintf("%s  %s at %s, leaf %d of %d%s", Work, one.Name, leaf.Path, leaf.At+1, leaf.Of, phase)}
	if leaf.Does != "" {
		rows = append(rows, "      "+leaf.Does)
	}
	if leaf.Gate != "" {
		rows = append(rows, "      answers: "+leaf.Gate, "      before the clear: "+beforeClear)
	}
	if leaf.Final {
		rows = append(rows, it.acceptRows(one, leaf)...)
	}
	ask := AskOf(one.Text)
	if ask == "" {
		ask = "(the ask stands empty)"
	}
	rows = append(rows, "", "# Ask", "", ask, "", "Answer with --fields, a JSON object holding one key a field:")
	for _, field := range leaf.Evidence {
		more, options := "", ""
		if field.Has("expects") {
			more = ", expects " + yaml.AsString(field.Get("expects"))
		}
		if field.Get("options") != nil {
			options = ", one of " + strings.Join(yaml.StringsOf(field.Get("options")), ", ")
		}
		form := "undefined"
		if field.Has("form") {
			form = fieldWord(field, "form")
		}
		rows = append(rows, fmt.Sprintf("  %s  %s%s%s: %s", fieldWord(field, "name"), form, more, options, fieldWord(field, "says")))
	}
	if len(leaf.Checklist) > 0 {
		rows = append(rows, "  "+checked+"  one line per item below, on how you take it into account", "", "Checklist:")
		for _, item := range leaf.Checklist {
			rows = append(rows, "  - "+item)
		}
	}
	if leaf.Asks != "" {
		rows = append(rows, "", "Asks: "+leaf.Asks)
	}
	rows = append(rows, it.notesSaid(it.notesOf(one.Text, leaf))...)
	rows = append(rows, "")
	if leaf.holdsForm("verdict") != nil {
		rows = append(rows, fmt.Sprintf("Hand it back with %s, and the verdict field decides.", CallOf("ticket", "pull", one.Name, "--fields", "<json>")))
	} else {
		rows = append(rows, fmt.Sprintf("Hand it back: %s, or --fail \"why\", --became <ticket> or --answered <ticket> in place of --pass.", CallOf("ticket", "pull", one.Name, "--pass", "--fields", "<json>")))
	}
	return strings.Join(rows, "\n")
}

// The rows of a ticket's Ask, its comments aside. [[spec/design_output/pull#the-work-answer]]
func AskOf(text string) string {
	for _, one := range note.Read(text).Sections {
		if strings.ToLower(one.Header) != "ask" {
			continue
		}
		kept := []string{}
		for _, row := range one.Own {
			if !commentRow.MatchString(row) {
				kept = append(kept, row)
			}
		}
		return strings.TrimSpace(strings.Join(kept, "\n"))
	}
	return ""
}

// The payload's fields written under the leaf's chapter, or why one lands nowhere. [[spec/design_output/pull#a-leaf-comes-back]]
func withPayload(text, path, payload string) (string, string) {
	var fields front.Ordered
	if json.Unmarshal([]byte(payload), &fields) != nil {
		return "", "--fields takes a JSON object, one key per field of the leaf in hand."
	}
	now := text
	for _, pair := range fields {
		put, why := withFieldText(now, path, pair.Key, formatted(pair.Value))
		if why != "" {
			return "", why
		}
		now = put
	}
	return now, ""
}

// A bullet writes as a dash, a line drops its trailing blanks, and a run of blank lines folds to one. A list answer writes one item a line. [[spec/design_output/pull#the-fields-ride-the-payload]]
func formatted(said any) string {
	text := ""
	switch one := said.(type) {
	case []any:
		parts := make([]string, 0, len(one))
		for _, each := range one {
			parts = append(parts, "- "+jsText(each))
		}
		text = strings.Join(parts, "\n")
	default:
		text = jsText(said)
	}
	rows := rowsOf(text)
	for i, row := range rows {
		rows[i] = starBullet.ReplaceAllString(trailBlank.ReplaceAllString(row, ""), "$1- ")
	}
	text = leadBlanks.ReplaceAllString(manyBlanks.ReplaceAllString(strings.Join(rows, "\n"), "\n\n"), "")
	return strings.TrimRight(text, " \t\n\r")
}

// A value off JSON as String writes it: a list joins by commas, and an object reads as its tag. [[spec/design_output/pull#the-fields-ride-the-payload]]
func jsText(said any) string {
	switch one := said.(type) {
	case nil:
		return "null"
	case string:
		return one
	case bool:
		return strconv.FormatBool(one)
	case json.Number:
		return one.String()
	case []any:
		parts := make([]string, 0, len(one))
		for _, each := range one {
			if each == nil {
				parts = append(parts, "")
				continue
			}
			parts = append(parts, jsText(each))
		}
		return strings.Join(parts, ",")
	case front.Ordered:
		return "[object Object]"
	}
	return fmt.Sprint(said)
}

// One field's answer written under the leaf's chapter, its comments kept, and a checked chapter the leaf lacks written at its end. [[spec/design_output/pull#the-fields-ride-the-payload]]
func withFieldText(text, path, name, said string) (string, string) {
	sections := note.Read(text).Sections
	leaf := note.SectionAt(sections, path)
	if leaf < 0 {
		return "", fmt.Sprintf("%s holds no chapter to write %s into.", path, name)
	}
	level := len(strings.Split(path, "/")) + 1
	field := -1
	for i := leaf + 1; i < len(sections); i++ {
		if sections[i].Level < level {
			break
		}
		if sections[i].Level == level && sections[i].Header == name {
			field = i
			break
		}
	}
	rows := rowsOf(text)
	if field < 0 {
		if name != checked {
			return "", fmt.Sprintf("%s holds no field %s.", path, name)
		}
		end := chapterEnd(sections, leaf, level-1, len(rows))
		put := append([]string{strings.Repeat("#", level) + " " + checked, ""}, rowsOf(said)...)
		return strings.Join(spliced(rows, end, end, append(put, "")...), "\n"), ""
	}
	start := sections[field].Line
	end := chapterEnd(sections, field, level, len(rows))
	kept := []string{}
	for _, row := range rows[start:end] {
		if commentRow.MatchString(row) {
			kept = append(kept, row)
		}
	}
	put := append([]string{""}, kept...)
	if len(kept) > 0 {
		put = append(put, "")
	}
	put = append(append(put, rowsOf(said)...), "")
	return strings.Join(spliced(rows, start, end, put...), "\n"), ""
}

// The rows with the span from to replaced by the rows put. [[spec/design_output/pull#the-fields-ride-the-payload]]
func spliced(rows []string, from, to int, put ...string) []string {
	out := append([]string{}, rows[:from]...)
	out = append(out, put...)
	return append(out, rows[to:]...)
}

// The row a chapter ends before: the next heading at its level or above, or the last row. [[spec/design_output/pull#the-fields-ride-the-payload]]
func chapterEnd(sections []note.Section, at, level, last int) int {
	for i := at + 1; i < len(sections); i++ {
		if sections[i].Level <= level {
			return sections[i].Line - 1
		}
	}
	return last
}

// A leaf's chapter: whether it stands, its own rows, and each field under it by header. [[spec/design_output/pull#the-fields-hold-their-forms]]
type Chapter struct {
	Stands bool
	Own    []string
	Fields map[string][]string
}

// [[spec/design_output/pull#the-fields-hold-their-forms]]
func ChapterOf(text, path string) Chapter {
	sections := note.Read(text).Sections
	at := note.SectionAt(sections, path)
	if at < 0 {
		return Chapter{Fields: map[string][]string{}}
	}
	level := len(strings.Split(path, "/"))
	out := Chapter{Stands: true, Own: chapterLines(sections[at].Own), Fields: map[string][]string{}}
	for i := at + 1; i < len(sections); i++ {
		if sections[i].Level <= level {
			break
		}
		if sections[i].Level == level+1 {
			out.Fields[sections[i].Header] = chapterLines(sections[i].Own)
		}
	}
	return out
}

// The rows a field counts: neither blank, nor a comment, nor an answered row, nor a fence. [[spec/design_output/pull#the-fields-hold-their-forms]]
func chapterLines(own []string) []string {
	out := []string{}
	for _, row := range own {
		if strings.TrimSpace(row) == "" || commentRow.MatchString(row) || answeredRow.MatchString(row) || fenceRow.MatchString(row) {
			continue
		}
		out = append(out, strings.TrimSpace(row))
	}
	return out
}

// [[spec/design_output/pull#the-fields-hold-their-forms]]
func (it *It) formFaults(one *Held, leaf *Leaf, chapter Chapter, held Hold) []string {
	if !chapter.Stands {
		return []string{fmt.Sprintf("%s holds no chapter for %s.", one.Path, leaf.Path)}
	}
	out := []string{}
	for _, field := range leaf.Evidence {
		name := fieldWord(field, "name")
		rows, ok := chapter.Fields[name]
		where := name + " under " + leaf.Path
		if !ok {
			out = append(out, fmt.Sprintf("%s stands as no heading, and its form is %s.", where, fieldWord(field, "form")))
			continue
		}
		out = append(out, it.formFault(field, rows, where, one, held)...)
	}
	if len(leaf.Checklist) > 0 {
		if rows := chapter.Fields[checked]; len(rows) < len(leaf.Checklist) {
			out = append(out, fmt.Sprintf("%s under %s holds %d line(s), and the checklist holds %d item(s).", checked, leaf.Path, len(rows), len(leaf.Checklist)))
		}
	}
	return out
}

// [[spec/design_output/pull#the-fields-hold-their-forms]]
func (it *It) formFault(field *yaml.Doc, rows []string, where string, one *Held, held Hold) []string {
	form := fieldWord(field, "form")
	if !field.Has("form") || field.Get("form") == nil {
		form = "text"
	}
	switch form {
	case "text", "list":
		if len(rows) > 0 && form == "list" && field.Get("home") == true {
			return it.homeFaults(rows, where)
		}
		if len(rows) > 0 {
			return nil
		}
		if form == "list" {
			return []string{where + " holds no item."}
		}
		return []string{where + " holds no text."}
	case "command":
		if len(rows) == 1 {
			return nil
		}
		return []string{fmt.Sprintf("%s holds %d line(s), and a command is one line.", where, len(rows))}
	case "link":
		if len(rows) != 1 {
			return []string{fmt.Sprintf("%s holds %d line(s), and a link is one.", where, len(rows))}
		}
		said := Bare(rows[0])
		if it.inherited(said) || it.inherited(said+".md") {
			return nil
		}
		return []string{fmt.Sprintf("%s names %s, which resolves nowhere.", where, said)}
	case "choice":
		options := yaml.StringsOf(field.Get("options"))
		if len(rows) != 1 {
			return []string{fmt.Sprintf("%s holds %d line(s), and a choice is one word.", where, len(rows))}
		}
		for _, one := range options {
			if one == rows[0] {
				return nil
			}
		}
		return []string{fmt.Sprintf("%s reads %s, and the options are %s.", where, rows[0], strings.Join(options, ", "))}
	case "files":
		named := map[string]bool{}
		for _, row := range rows {
			named[strings.TrimSpace(bullet.ReplaceAllString(row, ""))] = true
		}
		missing := []string{}
		for _, path := range it.changedSince(one, held) {
			if !named[path] {
				missing = append(missing, path)
			}
		}
		if len(rows) == 0 {
			return []string{where + " names no file."}
		}
		if len(missing) > 0 {
			return []string{fmt.Sprintf("%s leaves out %s, which the branch changes.", where, strings.Join(missing, ", "))}
		}
		return nil
	case "checklist":
		if len(rows) > 0 {
			return nil
		}
		return []string{where + " holds no line."}
	case "verdict":
		said := VerdictIn(rows)
		if said.Said == "" {
			first := "nothing"
			if len(rows) > 0 {
				first = rows[0]
			}
			return []string{fmt.Sprintf("%s opens with pass or fail, or at a gate with accept or reject, and it reads %s.", where, first)}
		}
		if said.Said == "fail" && said.Reason == "" {
			return []string{where + " fails with no finding under it."}
		}
		if said.Said == found {
			return it.findingFaults(said, where)
		}
	}
	return nil
}

// A list field marked home refuses each line naming no path, link or ticket that stands. [[spec/design_output/pull#the-fields-hold-their-forms]]
func (it *It) homeFaults(rows []string, where string) []string {
	out := []string{}
	for _, row := range rows {
		if !it.namesHome(row) {
			out = append(out, fmt.Sprintf("%s holds %s, which names no path, link or ticket.", where, row))
		}
	}
	return out
}

// A home: a link resolving in the tree, a ticket in backticks, or a backticked path whose file or folder stands. [[spec/design_output/pull#the-fields-hold-their-forms]]
func (it *It) namesHome(row string) bool {
	for _, link := range linkIn.FindAllStringSubmatch(row, -1) {
		if said := strings.TrimSpace(link[1]); it.inherited(said) || it.inherited(said+".md") {
			return true
		}
	}
	for _, span := range backticked.FindAllStringSubmatch(row, -1) {
		said := span[1]
		if strings.ContainsAny(said, " \t") {
			continue
		}
		if !strings.Contains(said, "/") {
			if it.inherited("spec/tickets/" + said + ".md") {
				return true
			}
			continue
		}
		if folder := path.Dir(said); it.inherited(said) || (folder != "." && folder != "/" && it.inherited(folder)) {
			return true
		}
	}
	return false
}

// Whether a path stands under the work root, or under the method root it inherits. [[spec/design_output/vehicle#the-work-root-inherits]]
func (it *It) inherited(path string) bool {
	if it.Disk.Exists(path) {
		return true
	}
	return it.Method != "" && it.Method != it.Root && (OSDisk{Root: it.Method}).Exists(path)
}

// One child a finding names. [[spec/design_output/pull#a-finding-rides-out]]
type Finding struct{ Name, Line string }

// What a verdict field says: pass, fail or findings, the reason, and the children a finding names. [[spec/design_output/pull#the-fields-hold-their-forms]]
type Verdict struct {
	Said, Reason string
	Findings     []Finding
}

// The word a verdict row opens with. [[spec/design_output/pull#the-fields-hold-their-forms]]
func openerOf(row string) string {
	said := strings.TrimSpace(bullet.ReplaceAllString(row, ""))
	return strings.ToLower(openerGap.Split(said, -1)[0])
}

// A verdict field keeps every round, so the last row opening with pass or fail decides. [[spec/design_output/pull#the-fields-hold-their-forms]]
func VerdictIn(rows []string) Verdict {
	at := -1
	for i := len(rows) - 1; i >= 0; i-- {
		if _, ok := openers[openerOf(rows[i])]; ok {
			at = i
			break
		}
	}
	if at < 0 {
		return Verdict{}
	}
	first := strings.TrimSpace(bullet.ReplaceAllString(rows[at], ""))
	word := openerOf(first)
	findings := findingsOpen.FindString(first)
	if findings != "" {
		word = findings
	}
	rest := []string{}
	for _, row := range append([]string{leadGap.ReplaceAllString(first[len(word):], "")}, rows[at+1:]...) {
		if said := strings.TrimSpace(bullet.ReplaceAllString(row, "")); said != "" {
			rest = append(rest, said)
		}
	}
	reason := strings.Join(tabled(rest), "; ")
	if findings == "" {
		return Verdict{Said: openers[word], Reason: reason}
	}
	out := Verdict{Said: found, Reason: reason, Findings: []Finding{}}
	for _, row := range rest {
		if strings.HasPrefix(row, "|") {
			continue
		}
		if said := findingRow.FindStringSubmatch(row); said != nil {
			out.Findings = append(out.Findings, Finding{Name: said[1], Line: strings.TrimSpace(said[2])})
		} else {
			out.Findings = append(out.Findings, Finding{Line: row})
		}
	}
	return out
}

// A table's rows ride one piece, joined by the escape the unblock reads back as lines. [[spec/tickets/the-small-faults-land]]
func tabled(rows []string) []string {
	out := []string{}
	for _, row := range rows {
		if strings.HasPrefix(row, "|") && len(out) > 0 && strings.HasPrefix(out[len(out)-1], "|") {
			out[len(out)-1] += `\n` + row
			continue
		}
		out = append(out, row)
	}
	return out
}

// A pass with findings mints a child a row, so a row names a child the tree holds nowhere yet. [[spec/design_output/pull#a-finding-rides-out]]
func (it *It) findingFaults(said Verdict, where string) []string {
	if len(said.Findings) == 0 {
		return []string{where + " passes with findings, and names none."}
	}
	taken := map[string]bool{}
	for _, one := range TicketsHere(it.Disk) {
		taken[one.Name] = true
	}
	out := []string{}
	seen := map[string]bool{}
	for _, one := range said.Findings {
		switch {
		case one.Name == "":
			out = append(out, fmt.Sprintf("%s names no child in %s; write it as - <child-name>: <finding>.", where, one.Line))
		case !ticketName.MatchString(one.Name):
			out = append(out, fmt.Sprintf("%s names %s, and a ticket name holds lowercase words joined by hyphens.", where, one.Name))
		case check.OverLong(one.Name, it.Words) != "":
			out = append(out, fmt.Sprintf("%s names %s, and a ticket name holds at most %d words.", where, one.Name, it.Words))
		case taken[one.Name]:
			out = append(out, fmt.Sprintf("%s names %s, which a ticket holds already.", where, one.Name))
		case seen[one.Name]:
			out = append(out, fmt.Sprintf("%s names %s twice.", where, one.Name))
		}
		seen[one.Name] = true
	}
	return out
}
