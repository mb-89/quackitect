// The script rules of the VoiceVale style: the comments of code, the counts
// and digits of prose, the doors, and the private shapes, each a port of its
// Tengo script. [[spec/design_output/rules#a-script-answers-offsets]]
package rules

import (
	"regexp"
	"strings"
)

var valeDirective = regexp.MustCompile(`^//\s*(go|ts|eslint|biome|nolint|lint):`)

// A comment line that stands anywhere: a pointer, a level0 marker, or a lint directive. [[spec/design_output/rules#a-script-answers-offsets]]
func valeAllowed(t string) bool {
	return (strings.Contains(t, "[[") && strings.Contains(t, "]]")) || strings.Contains(t, "level0:") || valeDirective.MatchString(t)
}

// Reads trimmed lines in order and says which are comments, holding a block comment open across lines. [[spec/design_output/rules#a-script-answers-offsets]]
type valeComments struct{ inBlock bool }

// Whether a trimmed line reads as a comment. [[spec/design_output/rules#a-script-answers-offsets]]
func (r *valeComments) comment(t string) bool {
	switch {
	case r.inBlock:
		if strings.Contains(t, "*/") {
			r.inBlock = false
		}
		return true
	case strings.HasPrefix(t, "//"):
		return true
	case strings.HasPrefix(t, "/*"):
		if !strings.Contains(t, "*/") {
			r.inBlock = true
		}
		return true
	}
	return false
}

// Hands each line past blanks and an opening shebang to see, with whether it reads as a comment; see stops the walk by answering false. [[spec/design_output/rules#a-script-answers-offsets]]
func valeCodeLines(text string, see func(line voiceLine, trimmed string, comment bool) bool) {
	reader := valeComments{}
	for index, line := range voiceLines(text) {
		trimmed := strings.TrimSpace(line.text)
		if trimmed == "" || (index == 0 && strings.HasPrefix(trimmed, "#!")) {
			continue
		}
		if !see(line, trimmed, reader.comment(trimmed)) {
			return
		}
	}
}

// VoiceVale.CodeComment: a comment past the header carrying no pointer, marker or directive. [[spec/design_output/rules#a-script-answers-offsets]]
func codeComment(in scriptIn) []scriptMatch {
	out := []scriptMatch{}
	seenCode := false
	valeCodeLines(in.Text, func(line voiceLine, trimmed string, comment bool) bool {
		if !comment {
			seenCode = true
		} else if seenCode && !valeAllowed(trimmed) {
			out = append(out, voiceWhole(line))
		}
		return true
	})
	return out
}

const valeNumberWords = `[Tt]wo|[Tt]hree|[Ff]our|[Ff]ive|[Ss]ix|[Ss]even|[Ee]ight|[Nn]ine|[Tt]en|[Ee]leven|[Tt]welve`

var valeHeaderCount = regexp.MustCompile(`(?:^|[^\w-])(\d+ [a-z]+s|` + valeNumberWords + `)(?:[^\w-]|$)`)

// VoiceVale.CodeHeader: a count in the header, or a header line past the cap. [[spec/design_output/rules#a-script-answers-offsets]]
func codeHeader(in scriptIn) []scriptMatch {
	out := []scriptMatch{}
	used := 0
	valeCodeLines(in.Text, func(line voiceLine, trimmed string, comment bool) bool {
		if !comment {
			return false
		}
		if valeAllowed(trimmed) {
			return true
		}
		used++
		if found := voiceGroups(valeHeaderCount, line.text, line.at); len(found) > 0 {
			out = append(out, found...)
		} else if used > voiceHeaderLines {
			out = append(out, voiceWhole(line))
		}
		return true
	})
	return out
}

var valeListCount = regexp.MustCompile(`(?:^|[^\w-])((?:\d+|` + valeNumberWords + `) [a-z]+s)\b`)
var valeListNumber = regexp.MustCompile(`^\d+[.)]\s`)
var valeIndented = regexp.MustCompile(`^(?: {4,}|\t)`)

// Whether a trimmed line opens a list item or a table row. [[spec/design_output/rules#a-script-answers-offsets]]
func valeStructure(t string) bool {
	return strings.HasPrefix(t, "- ") || strings.HasPrefix(t, "* ") || strings.HasPrefix(t, "|") || valeListNumber.MatchString(t)
}

// VoiceVale.CountedList: a count on the line right above a list or a table. [[spec/design_output/rules#a-script-answers-offsets]]
func countedList(in scriptIn) []scriptMatch {
	out := []scriptMatch{}
	lines := voiceLines(in.Text)
	fenced, front := false, 0
	for index, line := range lines {
		t := strings.TrimSpace(line.text)
		if t == "---" && front < 2 {
			front++
			continue
		}
		if front == 1 {
			continue
		}
		if strings.HasPrefix(t, voiceFence) {
			fenced = !fenced
			continue
		}
		if fenced || t == "" || valeStructure(t) || strings.HasPrefix(t, "<!--") || valeIndented.MatchString(line.text) {
			continue
		}
		next := ""
		for _, later := range lines[index+1:] {
			if next = strings.TrimSpace(later.text); next != "" {
				break
			}
		}
		if valeStructure(next) {
			out = append(out, voiceGroups(valeListCount, line.text, line.at)...)
		}
	}
	return out
}

var valeExamples = []*regexp.Regexp{regexp.MustCompile(`\[\[[^\]]*\]\]`), regexp.MustCompile(`\[[^\]]*\]\([^)]*\)`), regexp.MustCompile("`[^`]*`")}
var valeListLead = regexp.MustCompile(`^(\s*)\d+[.)]\s`)
var valeDigits = regexp.MustCompile(`\d+(?:\.\d+)*`)
var valeWordBefore = regexp.MustCompile(`[A-Za-z0-9_-]$`)
var valeWordAfter = regexp.MustCompile(`^[A-Za-z0-9_-]`)
var valeUnits = regexp.MustCompile(`^ ?(?:ms|s|MiB|KiB|MB|KB|GB|%)\b`)
var valeNamed = regexp.MustCompile(`(?:client|node|version)\s*$`)
var valeSpelled = regexp.MustCompile(`\b((?:` + valeNumberWords + `)) [a-z]+s\b`)

// A line with its links and code spans blanked to spaces, so offsets beside them stand. [[spec/design_output/rules#a-script-answers-offsets]]
func valeBlanked(line string) string {
	for _, shape := range valeExamples {
		for _, hit := range shape.FindAllStringIndex(line, -1) {
			line = line[:hit[0]] + strings.Repeat(" ", hit[1]-hit[0]) + line[hit[1]:]
		}
	}
	return line
}

// The bare digits and spelled counts of one prose line, placed in the whole text. [[spec/design_output/rules#a-script-answers-offsets]]
func valeDigitsOf(line voiceLine) []scriptMatch {
	out := []scriptMatch{}
	read := valeListLead.ReplaceAllString(valeBlanked(line.text), "$1   ")
	for _, hit := range valeDigits.FindAllStringIndex(read, -1) {
		before, after := read[:hit[0]], read[hit[1]:]
		if valeWordBefore.MatchString(before) || valeWordAfter.MatchString(after) || strings.Contains(read[hit[0]:hit[1]], ".") || valeUnits.MatchString(after) || valeNamed.MatchString(before) {
			continue
		}
		out = append(out, scriptMatch{Begin: line.at + hit[0], End: line.at + hit[1]})
	}
	return append(out, voiceGroups(valeSpelled, read, line.at)...)
}

// VoiceVale.DigitInProse: a digit or a spelled count in prose, past front matter, fences, headings and tables. [[spec/design_output/rules#a-script-answers-offsets]]
func digitInProse(in scriptIn) []scriptMatch {
	out := []scriptMatch{}
	fenced, front := false, 0
	for _, line := range voiceLines(in.Text) {
		trimmed := strings.TrimSpace(line.text)
		if trimmed == "---" && front < 2 {
			front++
			continue
		}
		if front == 1 {
			continue
		}
		if strings.HasPrefix(trimmed, voiceFence) || strings.HasPrefix(trimmed, "~~~") {
			fenced = !fenced
			continue
		}
		if fenced || valeIndented.MatchString(line.text) || strings.HasPrefix(trimmed, "#") || strings.HasPrefix(trimmed, "|") {
			continue
		}
		out = append(out, valeDigitsOf(line)...)
	}
	return out
}

// Every line past a line comment that refuses answers its whole line. [[spec/design_output/rules#a-script-answers-offsets]]
func valeCodeRefuses(text string, refuses func(t string) bool) []scriptMatch {
	out := []scriptMatch{}
	for _, line := range voiceLines(text) {
		t := strings.TrimSpace(line.text)
		if !strings.HasPrefix(t, "//") && refuses(t) {
			out = append(out, voiceWhole(line))
		}
	}
	return out
}

var valeRealDoor = regexp.MustCompile(`doors/(disk|proc|git|clock|log)\.js`)

// VoiceVale.FakeDoorsInTest: a test importing a real door in place of its fake. [[spec/design_output/rules#a-script-answers-offsets]]
func fakeDoorsInTest(in scriptIn) []scriptMatch {
	return valeCodeRefuses(in.Text, func(t string) bool {
		return !strings.Contains(t, "doors/fake/") && valeRealDoor.MatchString(t)
	})
}

var valeProcessReads = []string{"env", "argv", "platform", "pid", "version", "execPath"}
var valeOSImport = regexp.MustCompile(`^(?:import )?"os(?:/[a-z]+)?"$`)

// VoiceVale.OutsideInDoors: a read of the process or an os import outside a door. [[spec/design_output/rules#a-script-answers-offsets]]
func outsideInDoors(in scriptIn) []scriptMatch {
	return valeCodeRefuses(in.Text, func(t string) bool {
		for _, field := range valeProcessReads {
			if strings.Contains(t, "process."+field) {
				return true
			}
		}
		return valeOSImport.MatchString(t)
	})
}

var valePrivateShapes = []*regexp.Regexp{
	regexp.MustCompile(`[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z0-9.-]*[A-Za-z]{2,}`),
	regexp.MustCompile(`\+[0-9]{1,3}[ -]?\(?[0-9]{2,4}\)?[ -]?[0-9]{3,4}[ -]?[0-9]{3,4}`),
	regexp.MustCompile(`\(?\b[0-9]{3}\)?[ -][0-9]{3}[ -][0-9]{4}\b`),
	regexp.MustCompile(`\b[0-9]{4}-[0-9]{2}-[0-9]{2}\b`),
	regexp.MustCompile(`\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+[0-9]{1,2}\b`),
	regexp.MustCompile(`\b[0-9]{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\b`),
	regexp.MustCompile(`(?:/home/|/Users/|[A-Za-z]:[\\/][Uu]sers[\\/])[A-Za-z0-9_-]+(?:[.][A-Za-z0-9_-]+)*`),
}
var valePrivateIndent = regexp.MustCompile(`^    \S`)
var valeHome = regexp.MustCompile(`^(?:/home/|/Users/|[A-Za-z]:[\\/][Uu]sers[\\/])`)
var valeNobody = map[string]bool{"user": true, "root": true, "one": true, "somebody": true, "nobody": true, "agent": true, "claude": true, "runner": true, "ubuntu": true, "vscode": true}

// A line with each inline code span blanked to spaces, the backticks too. [[spec/design_output/rules#a-script-answers-offsets]]
func valeSpansBlanked(line string) string {
	parts := strings.Split(line, "`")
	for index := 1; index < len(parts); index += 2 {
		parts[index] = strings.Repeat(" ", len(parts[index]))
	}
	return strings.Join(parts, " ")
}

// VoiceVale.Private: an address, a phone number, a date or a home path in prose, shape by shape. [[spec/design_output/rules#a-script-answers-offsets]]
func private(in scriptIn) []scriptMatch {
	out := []scriptMatch{}
	fenced := false
	for _, line := range voiceLines(in.Text) {
		trimmed := strings.TrimSpace(line.text)
		if strings.HasPrefix(trimmed, voiceFence) || strings.HasPrefix(trimmed, "~~~") {
			fenced = !fenced
			continue
		}
		if fenced || valePrivateIndent.MatchString(line.text) {
			continue
		}
		read := valeSpansBlanked(line.text)
		for _, shape := range valePrivateShapes {
			for _, hit := range shape.FindAllStringIndex(read, -1) {
				if !valeNobody[valeHome.ReplaceAllString(read[hit[0]:hit[1]], "")] {
					out = append(out, scriptMatch{Begin: line.at + hit[0], End: line.at + hit[1]})
				}
			}
		}
	}
	return out
}
