// The private delta, off lib/private.js and refusedDelta in lib/refuse.js:
// the lines a staged delta adds, read for a private shape, a name the box
// answers, and a run or a token out of a raw note under .se/notes.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"regexp"
	"strconv"
	"strings"
)

// The rules the private delta names. [[spec/design_output/private#the-three-checks]]
const (
	ShapeHome = "ShapeStaysHome"
	BoxHome   = "BoxNameStaysHome"
	NoteHome  = "NoteTextStaysHome"
)

// The words a copied run takes, the letters a token takes, the digits a phone number takes, the line a delta opens a file with, and the column every finding names. [[spec/design_output/private#the-run-and-the-token]]
const (
	copyRun     = 6
	shortest    = 8
	phoneDigits = 8
	addedHead   = "+++ "
	firstColumn = 1
)

// The users naming nobody. [[spec/design_output/private#the-box-names-the-owner]]
var nobody = []string{"user", "root", "one", "somebody", "nobody", "agent", "claude", "runner", "ubuntu", "vscode"}

// The shapes a line carries a person in, and the paths the delta leaves home. [[spec/design_output/private#the-delta-a-commit-carries]]
var (
	privateFree  = []*regexp.Regexp{regexp.MustCompile(`^\.se(/|$)`), regexp.MustCompile(`^\.git(/|$)`)}
	nowhere      = regexp.MustCompile(`(?i)(?:^|\.)(?:example\.(?:com|org|net)|example|invalid|localhost|test)$`)
	email        = regexp.MustCompile(`[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`)
	called       = regexp.MustCompile(`\+\d[\d\s().-]{7,}\d|\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b`)
	digit        = regexp.MustCompile(`\d`)
	homes        = regexp.MustCompile(`(?:/home/|/Users/|[A-Za-z]:\\Users\\)([A-Za-z0-9._-]+)`)
	hunkHead     = regexp.MustCompile(`^@@+ .*\+(\d+)(?:,\d+)? @@`)
	hasSeparator = regexp.MustCompile(`[@/\\]|[a-z0-9]\.[a-z0-9]`)
	opaque       = regexp.MustCompile(`^[a-z0-9._+]{12,}$`)
	notLetters   = regexp.MustCompile(`[^a-z0-9]+`)
	lineEnd      = regexp.MustCompile(`\r?\n`)
	folderBreak  = regexp.MustCompile(`[/\\]+`)
)

// The months a date in prose names. [[spec/design_output/private#the-delta-a-commit-carries]]
const month = "January|February|March|April|May|June|July|August|September|October|November|December"

// The dates in prose. [[spec/design_output/private#the-delta-a-commit-carries]]
var dates = []*regexp.Regexp{
	regexp.MustCompile(`\b\d{4}-\d{2}-\d{2}\b`),
	regexp.MustCompile(`\b(?:` + month + `)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b`),
	regexp.MustCompile(`\b\d{1,2}(?:st|nd|rd|th)?\s+(?:` + month + `)\s+\d{4}\b`),
	regexp.MustCompile(`\b(?:` + month + `)\s+\d{4}\b`),
}

// One line a delta adds: its file, its line, and its text. [[spec/tickets/cage-commit-guards-port]]
type Added struct {
	File string
	Line int
	Text string
}

// One private finding over a delta, where it stands, and what it adds. [[spec/tickets/cage-commit-guards-port]]
type Leak struct {
	File    string
	Line    int
	Column  int
	Rule    string
	Said    string
	Message string
}

// What the box answers: its user, its home folder, and the git name and address. [[spec/design_output/private#the-box-names-the-owner]]
type Box struct {
	User  string
	Home  string
	Name  string
	Email string
}

// One raw note under .se/notes, by its path. [[spec/design_output/private#the-door-reads-the-notes]]
type Note struct {
	Name string
	Text string
}

// One word of a text: its flattened form, as written, and the line it stands on. [[spec/design_output/private#the-flatten]]
type word struct {
	flat string
	raw  string
	file string
	line int
}

// Every line the delta adds, by file and line, a binary file and a removed file aside. [[spec/tickets/cage-commit-guards-port]]
func AddedIn(diff string) []Added {
	var out []Added
	file, at, binary := "", 0, false
	for _, line := range lineEnd.Split(diff, -1) {
		if strings.HasPrefix(line, "diff --git ") {
			file, binary = "", false
			continue
		}
		if strings.HasPrefix(line, "Binary files") || strings.HasPrefix(line, "GIT binary patch") {
			binary = true
			continue
		}
		if strings.HasPrefix(line, addedHead) {
			file = pathIn(line[len(addedHead):])
			continue
		}
		if hunk := hunkHead.FindStringSubmatch(line); hunk != nil {
			at, _ = strconv.Atoi(hunk[1])
			continue
		}
		if !strings.HasPrefix(line, "+") || strings.HasPrefix(line, "+++") {
			continue
		}
		if file != "" && !binary {
			out = append(out, Added{File: file, Line: at, Text: line[1:]})
		}
		at++
	}
	return out
}

// The three checks over the lines a delta adds past .se and .git. [[spec/tickets/cage-commit-guards-port]]
func PrivateIn(added []Added, box Box, held []Note) []Leak {
	var mine []Added
	for _, one := range added {
		if one.File != "" && !matchesAny(privateFree, one.File) {
			mine = append(mine, one)
		}
	}
	if len(mine) == 0 {
		return nil
	}
	out := shapesIn(mine)
	out = append(out, boxNamesIn(mine, box)...)
	return append(out, noteTextIn(mine, held)...)
}

// The refusal naming every private finding a delta carries. [[spec/tickets/cage-commit-guards-port]]
func RefusedDelta(found []Leak) string {
	lines := []string{"This commit carries something private, so the door holds it here.", ""}
	for _, one := range found {
		lines = append(lines,
			"  "+one.File+":"+strconv.Itoa(one.Line)+":"+strconv.Itoa(one.Column)+"  "+one.Rule,
			"    adds: "+Cut(one.Said, LineCut),
			"    "+one.Message,
			"")
	}
	lines = append(lines, "Take the line out of the delta, stage the file again, and commit. A line "+
		"the delta removes passes always, so a leak leaves this tree the same way.")
	return strings.Join(lines, "\n")
}

// An address, a phone number, a date in prose, and a home path naming a person. [[spec/tickets/cage-commit-guards-port]]
func shapesIn(added []Added) []Leak {
	var out []Leak
	for _, one := range added {
		for _, said := range email.FindAllString(one.Text, -1) {
			if nowhere.MatchString(said[strings.Index(said, "@")+1:]) {
				continue
			}
			out = append(out, leak(ShapeHome, one.File, one.Line, said,
				"An email address names a person, and git carries it to everybody.",
				"Say the role this line means, and hold the address under .se."))
		}
		for _, said := range called.FindAllString(one.Text, -1) {
			if len(digit.FindAllString(said, -1)) < phoneDigits {
				continue
			}
			out = append(out, leak(ShapeHome, one.File, one.Line, said,
				"A phone number reaches one person, and a tracked file reaches the world.",
				"Cut it, and hold it under .se where the box keeps its own."))
		}
		if prose.MatchString(one.File) {
			for _, said := range dated(one.Text) {
				out = append(out, leak(ShapeHome, one.File, one.Line, said,
					"A date in prose says when somebody looks, and a reader acts on none of it.",
					"Drop it, and name the client version where a build matters."))
			}
		}
		for _, said := range homed(one.Text) {
			out = append(out, leak(ShapeHome, one.File, one.Line, said,
				"A home path names the person owning the box, and "+strings.Join(nobody, ", "),
				"are the users naming nobody. Write the path under one of those, or say $HOME."))
		}
	}
	return out
}

// A name the box answers, standing whole in a line. [[spec/tickets/cage-commit-guards-port]]
func boxNamesIn(added []Added, box Box) []Leak {
	var out []Leak
	wanted := namesOf(box)
	for _, one := range added {
		for _, name := range wanted {
			if !carriesTheName(one.Text, name[1]) {
				continue
			}
			out = append(out, leak(BoxHome, one.File, one.Line, name[1],
				"This box answers "+name[1]+" as "+name[0]+", so the line carries the",
				"person behind the box. Say the role, and let git carry the work alone."))
		}
	}
	return out
}

// A run of words or a token out of a note, read file by file. [[spec/tickets/cage-commit-guards-port]]
func noteTextIn(added []Added, notes []Note) []Leak {
	var held []Note
	for _, one := range notes {
		if strings.TrimSpace(one.Text) != "" {
			held = append(held, one)
		}
	}
	if len(held) == 0 {
		return nil
	}
	var out []Leak
	var files []string
	for _, one := range added {
		if !holds(files, one.File) {
			files = append(files, one.File)
		}
	}
	for _, file := range files {
		words := wordsWithLines(added, file)
		if len(words) == 0 {
			continue
		}
		for _, note := range held {
			theirs := privateTokens(note.Text)
			length, end := longestRun(flatOf(words), flatOf(theirs))
			if length >= copyRun {
				var said []string
				for _, one := range words[end-length : end] {
					said = append(said, one.raw)
				}
				from := words[end-length]
				out = append(out, leak(NoteHome, from.file, from.line, strings.Join(said, " "),
					strconv.Itoa(length)+" words come straight out of "+note.Name+", and a note holds",
					"what a person dumps there. Say what the thing is, for a reader who",
					"reads no note."))
			}
			for _, one := range sharedTokens(words, theirs) {
				out = append(out, leak(NoteHome, one.file, one.line, one.raw,
					note.Name+" carries this token, and one token leaks a path, an address",
					"or a secret. Name what the line means, and leave the token home."))
			}
		}
	}
	return out
}

// The names the box answers that name a person, each with what it is. [[spec/design_output/private#the-box-names-the-owner]]
func namesOf(box Box) [][2]string {
	var out [][2]string
	user, home := strings.TrimSpace(box.User), strings.TrimSpace(box.Home)
	name, address := strings.TrimSpace(box.Name), strings.TrimSpace(box.Email)
	if namesAPerson(user) {
		out = append(out, [2]string{"the user of this box", user})
	}
	if home != "" {
		last := ""
		for _, part := range folderBreak.Split(home, -1) {
			if part != "" {
				last = part
			}
		}
		if namesAPerson(last) {
			out = append(out, [2]string{"the home folder here", home})
		}
	}
	if namesAPerson(name) {
		out = append(out, [2]string{"the git name here", name})
	}
	if namesAPerson(address) {
		out = append(out, [2]string{"the git address here", address})
	}
	return out
}

// [[spec/design_output/private#the-box-names-the-owner]]
func namesAPerson(said string) bool {
	name := strings.TrimSpace(said)
	return name != "" && !holds(nobody, strings.ToLower(name))
}

// [[spec/design_output/private#the-box-names-the-owner]]
func carriesTheName(line, name string) bool {
	if name == "" {
		return false
	}
	return regexp.MustCompile(`(^|[^A-Za-z0-9])` + regexp.QuoteMeta(name) + `([^A-Za-z0-9]|$)`).MatchString(line)
}

// The words of a text, lowered and trimmed; a word with a separator stays whole, and every other splits at each letter past a-z and 0-9. [[spec/design_output/private#the-flatten]]
func privateTokens(text string) []word {
	var out []word
	for _, raw := range strings.Fields(text) {
		one := strings.TrimFunc(strings.ToLower(raw), func(r rune) bool {
			return !(r >= 'a' && r <= 'z' || r >= '0' && r <= '9' || r == '@' || r == '/' || r == '\\')
		})
		if one == "" {
			continue
		}
		if hasSeparator.MatchString(one) {
			out = append(out, word{flat: one, raw: raw})
			continue
		}
		for _, part := range notLetters.Split(one, -1) {
			if part != "" {
				out = append(out, word{flat: part, raw: raw})
			}
		}
	}
	return out
}

// The longest run two word lists share, and where it ends in the first. [[spec/design_output/private#the-run-and-the-token]]
func longestRun(a, b []string) (int, int) {
	prev := make([]int, len(b)+1)
	length, end := 0, 0
	for i := 1; i <= len(a); i++ {
		row := make([]int, len(b)+1)
		for j := 1; j <= len(b); j++ {
			if a[i-1] != b[j-1] {
				continue
			}
			row[j] = prev[j-1] + 1
			if row[j] > length {
				length, end = row[j], i
			}
		}
		prev = row
	}
	return length, end
}

// The tokens of mine a note carries as an identifier, once each. [[spec/design_output/private#what-a-secret-looks-like]]
func sharedTokens(mine, theirs []word) []word {
	inNote := map[string]bool{}
	for _, one := range theirs {
		if isIdentifier(one.flat) && len(one.flat) >= shortest {
			inNote[one.flat] = true
		}
	}
	var out []word
	seen := map[string]bool{}
	for _, one := range mine {
		if !inNote[one.flat] || seen[one.flat] {
			continue
		}
		seen[one.flat] = true
		out = append(out, one)
	}
	return out
}

// [[spec/design_output/private#what-a-secret-looks-like]]
func isIdentifier(token string) bool {
	return hasSeparator.MatchString(token) || opaque.MatchString(token)
}

// The words of one file's added lines, each with its line. [[spec/design_output/private#the-three-checks]]
func wordsWithLines(added []Added, file string) []word {
	var out []word
	for _, one := range added {
		if one.File != file {
			continue
		}
		for _, each := range privateTokens(one.Text) {
			each.file, each.line = one.File, one.Line
			out = append(out, each)
		}
	}
	return out
}

// [[spec/design_output/private#the-run-and-the-token]]
func flatOf(words []word) []string {
	out := make([]string, 0, len(words))
	for _, one := range words {
		out = append(out, one.flat)
	}
	return out
}

// Every date a line names, once each. [[spec/design_output/private#the-delta-a-commit-carries]]
func dated(text string) []string {
	var out []string
	for _, shape := range dates {
		for _, said := range shape.FindAllString(text, -1) {
			if !holds(out, said) {
				out = append(out, said)
			}
		}
	}
	return out
}

// Every home path a line names under a person, its trailing dots off. [[spec/design_output/private#the-delta-a-commit-carries]]
func homed(text string) []string {
	var out []string
	for _, one := range homes.FindAllStringSubmatch(text, -1) {
		who := strings.TrimRight(one[1], ".")
		if who == "" || holds(nobody, strings.ToLower(who)) {
			continue
		}
		out = append(out, strings.TrimRight(one[0], "."))
	}
	return out
}

// The path a +++ line names, or nothing for /dev/null. [[spec/design_output/private#the-delta-a-commit-carries]]
func pathIn(said string) string {
	one := strings.TrimSpace(said)
	one = strings.TrimSuffix(strings.TrimPrefix(one, `"`), `"`)
	if one == "/dev/null" {
		return ""
	}
	if strings.HasPrefix(one, "a/") || strings.HasPrefix(one, "b/") {
		return one[2:]
	}
	return one
}

// [[spec/tickets/cage-commit-guards-port]]
func matchesAny(shapes []*regexp.Regexp, said string) bool {
	for _, one := range shapes {
		if one.MatchString(said) {
			return true
		}
	}
	return false
}

// One finding at the first column, its message lines joined flat. [[spec/tickets/cage-commit-guards-port]]
func leak(rule, file string, line int, said string, message ...string) Leak {
	return Leak{File: file, Line: line, Column: firstColumn, Rule: rule, Said: said, Message: flat(strings.Join(message, " "))}
}
