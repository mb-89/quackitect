package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"quackitect/engine/internal/frontmatter"
	"quackitect/engine/internal/voice"
	"quackitect/engine/internal/yaml"
)

// Reads a note kind's shape from src/schemas and validates a note against it.
// The schema is picked by the note's kind, never by its path.
// A schema that will not load stops the operation rather than passing a note.

type Schema struct {
	// Guidance is the rules for filling this kind. The template writes it onto
	// every note, so a reader is one click from them.
	Guidance    string
	Kind        string
	Frontmatter FrontSpec
	Body        BodySpec
}

// FrontSpec is the JSON Schema 2020-12 half, over the note's yaml block.
type FrontSpec struct {
	Required             []string
	Properties           map[string]PropSpec
	AdditionalProperties bool
}

type PropSpec struct {
	Const string
	Type  string
	Link  bool
	// Enum is the values allowed. It may be written here, or drawn from the
	// token's own process, which is what FromProcess names.
	Enum []string
	// EnumFrom names where the values come from, as a path. process.states and
	// process.dispositions read this token's own process. processes.names reads
	// every process the copy has.
	EnumFrom    string
	MaxWords    int
	WholeWords  bool
	Description string
}

// BodySpec is this project's half, over the markdown under the frontmatter.
type BodySpec struct {
	HeadingLevel  int
	Sections      []SectionSpec
	StrictOrder   bool
	ExtraSections bool
}

type SectionSpec struct {
	Header string
	// HeaderPrefix matches every chapter whose heading starts with it, for the
	// sections that carry a name in the heading: "evidence: write" is one of
	// many, and a schema naming them all would name them twice.
	HeaderPrefix string
	Required     bool
	List         bool
	// Ordered means the items carry their own numbers, 1 upward, so a rule can
	// be cited by number from somewhere else.
	Ordered bool
	// DetailMarker ends an item that has a chapter of its own elsewhere. It is
	// the star a standard puts on a term it explains in an appendix.
	DetailMarker string
	// Explains names the list chapter whose numbers this chapter's headings
	// carry, so a reader walks from a rule to its argument and back.
	Explains            string
	Tense               string
	MaxItems            int
	MaxWordsPerItem     int
	MaxSentences        int
	MaxWordsPerSentence int
	MaxWords            int
	Description         string
}

// listValue reads a frontmatter value as a list, in either yaml spelling.
//
// The note reader takes a list written one item per line. A short list reads
// better written between brackets on one line, so that spelling is read here,
// where the schema has said the field is a list. Reading it in the note reader
// would turn a token whose title happens to sit in brackets into a list.
func listValue(v any) ([]string, bool) {
	switch t := v.(type) {
	case []string:
		return t, true
	case string:
		s := strings.TrimSpace(t)
		inner, opened := strings.CutPrefix(s, "[")
		if !opened {
			return nil, false
		}
		inner, closed := strings.CutSuffix(inner, "]")
		if !closed {
			return nil, false
		}
		var out []string
		for _, part := range splitOutsideQuotes(inner) {
			if part = strings.TrimSpace(part); part != "" {
				out = append(out, frontmatter.Unquote(part))
			}
		}
		return out, true
	}
	return nil, false
}

// splitOutsideQuotes cuts on commas that are not inside a quoted entry, so an
// entry may hold a comma of its own.
func splitOutsideQuotes(s string) []string {
	var out []string
	var cur strings.Builder
	quote := byte(0)
	for i := 0; i < len(s); i++ {
		c := s[i]
		switch {
		case quote != 0 && c == quote:
			quote = 0
		case quote == 0 && (c == '"' || c == '\''):
			quote = c
		case quote == 0 && c == ',':
			out = append(out, cur.String())
			cur.Reset()
			continue
		}
		cur.WriteByte(c)
	}
	if strings.TrimSpace(cur.String()) != "" {
		out = append(out, cur.String())
	}
	return out
}

// unlink answers a value with its wiki brackets taken off. A link is how a
// value is shown and walked. The name inside it is the value.
func unlink(v string) string {
	v = strings.TrimSpace(v)
	if inner, found := strings.CutPrefix(v, "[["); found {
		if name, closed := strings.CutSuffix(inner, "]]"); closed {
			return strings.TrimSpace(name)
		}
	}
	return v
}

// Departure is one way a note leaves its schema, and where.
// Line is 1-based in the file. Zero means the note as a whole.
type Departure struct {
	Line int
	Says string
}

// Parked answers whether the engine leaves a file alone.
//
// A name starting with an underscore is parked: read by nobody, checked by
// nothing, and still on disk. It is how a file waits to be picked up again
// without being deleted and without being wrong in the meantime.
func Parked(name string) bool {
	return strings.HasPrefix(filepath.Base(name), "_")
}

// SchemasDir is where a copy keeps the shape of every kind it knows.
func SchemasDir(methodRoot string) string {
	return filepath.Join(methodRoot, "src", "schemas")
}

// LoadSchema reads the schema for one kind, or says why it cannot.
func LoadSchema(methodRoot, kind string) (Schema, error) {
	path := filepath.Join(SchemasDir(methodRoot), kind+".schema.yaml")
	b, err := os.ReadFile(path)
	if err != nil {
		return Schema{}, fmt.Errorf("no schema for kind %q: %w", kind, err)
	}
	tree, err := yaml.Parse(string(b))
	if err != nil {
		return Schema{}, fmt.Errorf("%s does not parse: %w", path, err)
	}
	top := yaml.Map(tree)
	s := Schema{Kind: yaml.Str(top["kind"]), Guidance: yaml.Str(top["guidance"])}
	if s.Kind != kind {
		return Schema{}, fmt.Errorf("%s declares kind %q and is named for %q", path, s.Kind, kind)
	}

	front := yaml.Map(top["frontmatter"])
	s.Frontmatter.AdditionalProperties = yaml.Str(front["additionalProperties"]) == "true"
	s.Frontmatter.Required = yaml.Strs(front["required"])
	s.Frontmatter.Properties = map[string]PropSpec{}
	for name, raw := range yaml.Map(front["properties"]) {
		p := yaml.Map(raw)
		s.Frontmatter.Properties[name] = PropSpec{
			Const:       yaml.Str(p["const"]),
			Type:        yaml.Str(p["type"]),
			Link:        yaml.Str(p["x-link"]) == "true",
			Enum:        yaml.Strs(p["enum"]),
			EnumFrom:    yaml.Str(p["x-enum-from"]),
			MaxWords:    schemaInt(p["x-max-words"]),
			WholeWords:  yaml.Str(p["x-whole-words"]) == "true",
			Description: yaml.Str(p["description"]),
		}
	}

	body := yaml.Map(top["body"])
	s.Body.HeadingLevel = schemaInt(body["headingLevel"])
	if s.Body.HeadingLevel == 0 {
		s.Body.HeadingLevel = 1
	}
	s.Body.StrictOrder = yaml.Str(body["order"]) == "strict"
	s.Body.ExtraSections = yaml.Str(body["extraSections"]) == "true"
	for _, raw := range yaml.List(body["sections"]) {
		m := yaml.Map(raw)
		s.Body.Sections = append(s.Body.Sections, SectionSpec{
			Header:              yaml.Str(m["header"]),
			HeaderPrefix:        yaml.Str(m["headerPrefix"]),
			Required:            yaml.Str(m["required"]) == "true",
			List:                yaml.Str(m["list"]) == "true",
			Ordered:             yaml.Str(m["ordered"]) == "true",
			DetailMarker:        yaml.Str(m["detailMarker"]),
			Explains:            yaml.Str(m["explains"]),
			Tense:               yaml.Str(m["tense"]),
			MaxItems:            schemaInt(m["maxItems"]),
			MaxWordsPerItem:     schemaInt(m["maxWordsPerItem"]),
			MaxSentences:        schemaInt(m["maxSentences"]),
			MaxWordsPerSentence: schemaInt(m["maxWordsPerSentence"]),
			MaxWords:            schemaInt(m["maxWords"]),
			Description:         yaml.Str(m["description"]),
		})
	}
	if len(s.Body.Sections) == 0 {
		return Schema{}, fmt.Errorf("%s declares no sections, so it constrains nothing", path)
	}
	return s, nil
}

// Every scalar arrives as a string, so a number is read where it is used.
func schemaInt(v any) int {
	n, err := strconv.Atoi(strings.TrimSpace(yaml.Str(v)))
	if err != nil {
		return 0
	}
	return n
}

// splitNoteLines is frontmatter.Split with the body's first line number, which an
// editor needs to put a mark on the right row.
func splitNoteLines(text string) (front, body string, bodyLine int) {
	lines := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
	if len(lines) == 0 || lines[0] != frontmatter.Fence {
		return "", text, 1
	}
	for i := 1; i < len(lines); i++ {
		if lines[i] != frontmatter.Fence {
			continue
		}
		j := i + 1
		for j < len(lines) && strings.TrimSpace(lines[j]) == "" {
			j++
		}
		return strings.Join(lines[1:i], "\n"), strings.Join(lines[j:], "\n"), j + 1
	}
	return "", text, 1
}

// ValidateNote answers every way a note departs from its schema, not the
// first, because the editor underlines all of them at once.
//
// When the note names a process, the schema is narrowed to what that process
// switched on before anything is checked. The catalogue says what may exist.
// The process says what does.
func ValidateNote(s Schema, text, methodRoot string) []Departure {
	var out []Departure
	front, body, bodyLine := splitNoteLines(text)

	if name := unlink(frontValue(front, "process")); name != "" {
		p, err := LoadProcess(methodRoot, name)
		if err != nil {
			return []Departure{{Line: frontLine(front, "process"), Says: err.Error()}}
		}
		s = p.Narrow(s)
	}
	// processes.names is answered by the copy rather than by one process.
	for name, spec := range s.Frontmatter.Properties {
		if spec.EnumFrom == "processes.names" {
			spec.Enum = AvailableProcesses(methodRoot)
			s.Frontmatter.Properties[name] = spec
		}
	}

	if strings.TrimSpace(front) == "" {
		out = append(out, Departure{Line: 1,
			Says: "it has no frontmatter, so nothing says which schema reads it"})
	} else {
		f, err := frontmatter.Parse(front)
		if err != nil {
			out = append(out, Departure{Line: 1, Says: "the frontmatter does not parse: " + err.Error()})
		} else {
			out = append(out, checkFront(s.Frontmatter, f, front)...)
		}
	}

	return append(out, checkBody(s.Body, body, bodyLine)...)
}

// frontValue reads one key out of raw frontmatter, before it is parsed, so a
// note can say which process narrows the schema that then reads it.
func frontValue(front, key string) string {
	for _, line := range strings.Split(front, "\n") {
		if rest, found := strings.CutPrefix(strings.TrimSpace(line), key+":"); found {
			return frontmatter.Unquote(strings.TrimSpace(rest))
		}
	}
	return ""
}

// frontLine answers the 1-based file line a frontmatter key sits on. The
// fence is line 1, so the block's first key is line 2.
func frontLine(front, key string) int {
	for i, line := range strings.Split(front, "\n") {
		if strings.HasPrefix(strings.TrimSpace(line), key+":") {
			return i + 2
		}
	}
	return 1
}

func checkFront(spec FrontSpec, f frontmatter.Front, front string) []Departure {
	var out []Departure
	for _, key := range spec.Required {
		// A required field is asked for by presence, never by its string, so
		// a required list is satisfied by the list it carries. Why is
		// [[a-required-field-is-checked-by-presence]].
		if !frontmatter.Given(f, key) {
			out = append(out, Departure{Line: 1,
				Says: fmt.Sprintf("the frontmatter has no %s", key)})
		}
	}
	for name, p := range spec.Properties {
		raw, held := f[name]
		if !held {
			continue
		}
		if p.Type == "array" {
			if _, isList := listValue(raw); !isList {
				out = append(out, Departure{Line: frontLine(front, name),
					Says: fmt.Sprintf("%s is a list in the schema, and it is written %q", name, frontmatter.Str(f, name))})
			}
			continue
		}
		got := unlink(frontmatter.Str(f, name))
		if p.Const != "" && got != "" && got != p.Const {
			out = append(out, Departure{Line: frontLine(front, name),
				Says: fmt.Sprintf("%s reads %q and the schema allows only %q", name, got, p.Const)})
		}
		if len(p.Enum) > 0 && got != "" && !holdsName(p.Enum, got) {
			out = append(out, Departure{Line: frontLine(front, name),
				Says: fmt.Sprintf("%s reads %q and the values are %s",
					name, got, strings.Join(p.Enum, ", "))})
		}
		out = append(out, checkWords(p, name, got, frontLine(front, name))...)
	}
	if !spec.AdditionalProperties {
		for name := range f {
			if _, declared := spec.Properties[name]; !declared {
				out = append(out, Departure{Line: frontLine(front, name),
					Says: fmt.Sprintf("the frontmatter carries %s, which the schema does not declare", name)})
			}
		}
	}
	return out
}

// checkWords holds a scalar field to its word count.
//
// The count alone is gamed by joining words, so a long token carrying an
// underscore or a slash is refused beside it. That pair was in the engine
// before the schema was, and the schema owns it now.
func checkWords(p PropSpec, name, got string, line int) []Departure {
	if p.MaxWords <= 0 || got == "" {
		return nil
	}
	var out []Departure
	words := strings.Fields(got)
	if len(words) > p.MaxWords {
		out = append(out, Departure{Line: line,
			Says: fmt.Sprintf("%s is %d words at most, and this is %d: %q",
				name, p.MaxWords, len(words), got)})
	}
	if !p.WholeWords {
		return out
	}
	for _, w := range words {
		if strings.ContainsAny(w, `_/\`) && len(w) > 12 {
			out = append(out, Departure{Line: line,
				Says: fmt.Sprintf("%q joins words to get under the %s limit", w, name)})
		}
	}
	return out
}

// overWords answers a section's length when it runs past the bound the schema
// puts on it. The length is words, with the template's own comments dropped
// first, and one bound is written once. What that settled, and why the unit is
// words, is [[a-section-is-measured-in-words]].
func overWords(max int, text string) (int, bool) {
	if max <= 0 {
		return 0, false
	}
	n := len(strings.Fields(stripComments(text)))
	return n, n > max
}

func checkBody(spec BodySpec, body string, bodyLine int) []Departure {
	var out []Departure
	found := chaptersOf(body, spec.HeadingLevel)

	at := map[string]bodyChapter{}
	var order []string
	for _, c := range found {
		// A heading opened twice is a departure, reported at the second, and
		// the second is left out of what the rest of this check reads. Why it
		// is not a replacement is [[a-chapter-opened-twice-is-a-departure]].
		if _, again := at[c.Header]; again {
			out = append(out, Departure{Line: bodyLine + c.Line,
				Says: fmt.Sprintf("it opens the %s chapter twice, and a reader cannot tell which one the work was written against", c.Header)})
			continue
		}
		at[c.Header] = c
		order = append(order, c.Header)
	}

	var wanted []string
	for _, sec := range spec.Sections {
		// A section naming a prefix matches every chapter whose heading starts
		// with it, and each one is held to that section's bounds. Why the
		// schema names a prefix is [[a-section-may-name-a-prefix]].
		if sec.HeaderPrefix != "" {
			for _, c := range found {
				if strings.HasPrefix(c.Header, sec.HeaderPrefix) {
					wanted = append(wanted, c.Header)
					out = append(out, checkSection(sec, c, bodyLine)...)
				}
			}
			continue
		}
		c, here := at[sec.Header]
		if !here {
			if sec.Required {
				out = append(out, Departure{Line: bodyLine,
					Says: fmt.Sprintf("it has no %s chapter", sec.Header)})
			}
			continue
		}
		wanted = append(wanted, sec.Header)
		out = append(out, checkSection(sec, c, bodyLine)...)
	}

	if !spec.ExtraSections {
		for _, c := range found {
			if !declaredSection(spec, c.Header) {
				out = append(out, Departure{Line: bodyLine + c.Line,
					Says: fmt.Sprintf("it carries a %s chapter, which the schema does not declare", c.Header)})
			}
		}
	}

	out = append(out, checkExplains(spec, at, bodyLine)...)

	if spec.StrictOrder {
		var got []string
		for _, name := range order {
			if declaredSection(spec, name) {
				got = append(got, name)
			}
		}
		if strings.Join(got, ",") != strings.Join(wanted, ",") {
			out = append(out, Departure{Line: bodyLine,
				Says: fmt.Sprintf("the chapters run %s and the schema says %s",
					strings.Join(got, ", "), strings.Join(wanted, ", "))})
		}
	}
	return out
}

// checkExplains holds a starred rule and its chapter against each other.
//
// A standard puts a star on a term it explains elsewhere, and the reader
// follows the star. Here the star is on the rule and the number is on the
// chapter, so the walk goes both ways and neither half can be left behind.
func checkExplains(spec BodySpec, at map[string]bodyChapter, bodyLine int) []Departure {
	var out []Departure
	for _, sec := range spec.Sections {
		if sec.Explains == "" {
			continue
		}
		chapter, here := at[sec.Header]
		listSpec := sectionNamed(spec, sec.Explains)
		listChapter, listHere := at[sec.Explains]
		if !here || !listHere || listSpec == nil {
			continue
		}
		want := starred(listItems(listChapter.Body), listSpec.DetailMarker)
		got := map[int]bool{}
		for _, sub := range chaptersOf(chapter.Body, spec.HeadingLevel+1) {
			line := bodyLine + chapter.Line + 1 + sub.Line
			n := leadingNumber(sub.Header)
			if n == 0 {
				out = append(out, Departure{Line: line,
					Says: fmt.Sprintf("%q explains no rule. Start its title with the number of the "+
						"rule it explains and put a %s on that rule, or take the chapter out",
						sub.Header, listSpec.DetailMarker)})
				continue
			}
			if !holdsNumber(want, n) {
				out = append(out, Departure{Line: line,
					Says: fmt.Sprintf("%q explains rule %d, and that rule carries no %q",
						sub.Header, n, listSpec.DetailMarker)})
			}
			// One rule, one chapter: a second chapter carrying a number already
			// taken is a departure. See [[a-chapter-opened-twice-is-a-departure]].
			if got[n] {
				out = append(out, Departure{Line: line,
					Says: fmt.Sprintf("%q explains rule %d, and another chapter already does",
						sub.Header, n)})
			}
			got[n] = true
		}
		for _, n := range want {
			if !got[n] {
				out = append(out, Departure{Line: bodyLine + chapter.Line,
					Says: fmt.Sprintf("rule %d is starred and %s has no chapter starting with %d",
						n, sec.Header, n)})
			}
		}
	}
	return out
}

func sectionNamed(spec BodySpec, header string) *SectionSpec {
	for i := range spec.Sections {
		if spec.Sections[i].Header == header {
			return &spec.Sections[i]
		}
	}
	return nil
}

func holdsNumber(all []int, one int) bool {
	for _, n := range all {
		if n == one {
			return true
		}
	}
	return false
}

func declaredSection(spec BodySpec, header string) bool {
	for _, sec := range spec.Sections {
		if sec.Header == header {
			return true
		}
		if sec.HeaderPrefix != "" && strings.HasPrefix(header, sec.HeaderPrefix) {
			return true
		}
	}
	return false
}

func checkSection(sec SectionSpec, c bodyChapter, bodyLine int) []Departure {
	var out []Departure
	head := bodyLine + c.Line
	body := stripComments(c.Body)
	if n, over := overWords(sec.MaxWords, c.Body); over {
		out = append(out, Departure{Line: head,
			Says: fmt.Sprintf("%s runs to %d words and the schema allows %d", sec.Header, n, sec.MaxWords)})
	}
	if sec.MaxSentences > 0 {
		if n := sentenceCount(body); n > sec.MaxSentences {
			out = append(out, Departure{Line: head,
				Says: fmt.Sprintf("%s runs to %d sentences and the schema allows %d", sec.Header, n, sec.MaxSentences)})
		}
	}
	if sec.MaxWordsPerSentence > 0 {
		for _, one := range sentencesOf(body) {
			if n := len(strings.Fields(one)); n > sec.MaxWordsPerSentence {
				out = append(out, Departure{Line: head,
					Says: fmt.Sprintf("a sentence in %s runs to %d words and the schema allows %d: %s",
						sec.Header, n, sec.MaxWordsPerSentence, firstWords(one, 6))})
			}
		}
	}
	if !sec.List {
		return out
	}
	items := listItems(body)
	if len(items) == 0 {
		out = append(out, Departure{Line: head, Says: sec.Header + " is not a list, and the schema says it is one"})
	}
	if sec.MaxItems > 0 && len(items) > sec.MaxItems {
		over := items[sec.MaxItems]
		out = append(out, Departure{Line: bodyLine + c.Line + over.Line,
			Says: fmt.Sprintf("%s holds %d items and the schema allows %d", sec.Header, len(items), sec.MaxItems)})
	}
	if sec.MaxWordsPerItem > 0 {
		for _, item := range items {
			if n := len(strings.Fields(item.Text)); n > sec.MaxWordsPerItem {
				out = append(out, Departure{Line: bodyLine + c.Line + item.Line,
					Says: fmt.Sprintf("an item in %s runs to %d words and the schema allows %d: %s",
						sec.Header, n, sec.MaxWordsPerItem, firstWords(item.Text, 6))})
			}
		}
	}
	if sec.Ordered {
		for i, item := range items {
			if item.Number != i+1 {
				out = append(out, Departure{Line: bodyLine + c.Line + item.Line,
					Says: fmt.Sprintf("%s is numbered, and item %d is written %d: %s",
						sec.Header, i+1, item.Number, firstWords(item.Text, 6))})
			}
		}
	}
	return out
}

// starred answers the numbers of the items marked as having a chapter.
// The marker is taken at either end, because a standard puts it after the
// term and a reader scanning a list finds it faster in front.
func starred(items []item, marker string) []int {
	if marker == "" {
		return nil
	}
	var out []int
	for _, one := range items {
		text := strings.TrimSpace(one.Text)
		if strings.HasSuffix(text, marker) || strings.HasPrefix(text, marker) {
			out = append(out, one.Number)
		}
	}
	return out
}

// leadingNumber reads the number a discussion heading starts with.
func leadingNumber(header string) int {
	digits := 0
	for digits < len(header) && header[digits] >= '0' && header[digits] <= '9' {
		digits++
	}
	if digits == 0 {
		return 0
	}
	n, err := strconv.Atoi(header[:digits])
	if err != nil {
		return 0
	}
	return n
}

// bodyChapter is one level-two chapter. Line is 0-based within the body.
type bodyChapter struct {
	Header string
	Body   string
	Line   int
}

// chaptersOf cuts the body at every heading of the schema's level. A deeper
// heading is content of the chapter it sits in, which is what lets Discussion
// hold sub-headings without becoming several chapters.
func chaptersOf(body string, level int) []bodyChapter {
	if level < 1 {
		level = 1
	}
	mark := strings.Repeat("#", level) + " "
	var out []bodyChapter
	var cur *bodyChapter
	for n, line := range strings.Split(strings.ReplaceAll(body, "\r\n", "\n"), "\n") {
		if strings.HasPrefix(line, mark) {
			out = append(out, bodyChapter{Header: strings.TrimSpace(line[len(mark):]), Line: n})
			cur = &out[len(out)-1]
			continue
		}
		if cur != nil {
			cur.Body += line + "\n"
		}
	}
	return out
}

// sentencesOf answers a chapter's sentences, unwrapped. A heading is not one.
func sentencesOf(text string) []string {
	var out []string
	for _, para := range strings.Split(text, "\n\n") {
		if strings.HasPrefix(strings.TrimSpace(para), "#") {
			continue
		}
		out = append(out, voice.SentencesIn(strings.Join(strings.Fields(para), " "))...)
	}
	return out
}

// item is one top-level list entry. Line is 0-based within its chapter body.
// Number is what the item numbered itself, or zero when it carries no number.
type item struct {
	Text   string
	Line   int
	Number int
}

// listItems joins a wrapped line onto the item above it.
// A bullet, "1." and "1)" are all list items. The number is kept, because an
// ordered list is how one rule is cited from somewhere else.
func listItems(text string) []item {
	var out []item
	for n, line := range strings.Split(text, "\n") {
		if rest, num, is := listLead(line); is {
			out = append(out, item{Text: rest, Line: n + 1, Number: num})
			continue
		}
		if len(out) > 0 && strings.TrimSpace(line) != "" &&
			(strings.HasPrefix(line, " ") || strings.HasPrefix(line, "\t")) {
			out[len(out)-1].Text += " " + strings.TrimSpace(line)
		}
	}
	return out
}

// listLead reads what starts a list item, or says the line does not.
func listLead(line string) (rest string, number int, is bool) {
	if after, found := strings.CutPrefix(line, "- "); found {
		return strings.TrimSpace(after), 0, true
	}
	digits := 0
	for digits < len(line) && line[digits] >= '0' && line[digits] <= '9' {
		digits++
	}
	if digits == 0 || digits+1 >= len(line) {
		return "", 0, false
	}
	if line[digits] != '.' && line[digits] != ')' {
		return "", 0, false
	}
	if line[digits+1] != ' ' {
		return "", 0, false
	}
	n, err := strconv.Atoi(line[:digits])
	if err != nil {
		return "", 0, false
	}
	return strings.TrimSpace(line[digits+2:]), n, true
}

// sentenceCount uses the voice checker's splitter, so a sentence means one
// thing here. The paragraph is unwrapped first: the splitter reads a line, and
// this prose is hard-wrapped.
func sentenceCount(text string) int { return len(sentencesOf(text)) }

func firstWords(s string, n int) string {
	f := strings.Fields(s)
	if len(f) <= n {
		return strings.Join(f, " ")
	}
	return strings.Join(f[:n], " ") + " ..."
}

// LintNotes reads every note under a folder against the schema its kind names,
// walking all the way down. A note naming no kind is a finding rather than a
// skip, and a folder parked with a leading underscore drops out with everything
// beneath it. What the walk cost and what it caught is
// [[a-lint-reads-the-whole-tree]].
func LintNotes(r Roots, dir string) []Finding {
	var out []Finding
	err := filepath.WalkDir(dir, func(path string, e os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if e.IsDir() {
			// The folder this walk started at is never parked by its own name.
			if path != dir && Parked(e.Name()) {
				return filepath.SkipDir
			}
			return nil
		}
		if !strings.HasSuffix(e.Name(), ".md") || Parked(e.Name()) {
			return nil
		}
		// The finding is named by the file's path from the folder walked, so
		// two files with one name stay apart. See [[a-finding-is-named-by-its-path]].
		id := e.Name()
		if rel, err := filepath.Rel(dir, path); err == nil {
			id = filepath.ToSlash(rel)
		}
		b, err := os.ReadFile(path)
		if err != nil {
			out = append(out, Finding{ID: id, File: path, Says: "it cannot be read: " + err.Error()})
			return nil
		}
		// kindOf is the one reader of a note's kind, so a linked value means
		// the same thing to the lint as it does to the editor.
		kind := kindOf(string(b))
		if kind == "" {
			out = append(out, Finding{ID: id, File: path, Line: 1,
				Says: "it names no kind, so no schema can read it"})
			return nil
		}
		s, err := LoadSchema(r.Method, kind)
		if err != nil {
			out = append(out, Finding{ID: id, File: path, Line: 1, Says: err.Error()})
			return nil
		}
		for _, d := range ValidateNote(s, string(b), r.Method) {
			out = append(out, Finding{ID: id, Title: kind, File: path, Line: d.Line, Says: d.Says})
		}
		return nil
	})
	if err != nil {
		return append(out, Finding{ID: dir,
			Says: "it cannot be read, so this guards nothing: " + err.Error()})
	}
	return out
}

// LintGuidance reads the guidance corpus against the schemas it names.
func LintGuidance(r Roots) []Finding {
	return LintNotes(r, GuidanceDir(r.Method))
}

// LintRationales reads the arguments against the schema they name. Where the
// folder is absent there is nothing to read and nothing to report, and where it
// is present and unreadable there is. Both halves are
// [[a-lint-reads-the-whole-tree]].
func LintRationales(r Roots) []Finding {
	dir := RationaleDir(r.Method)
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		return nil
	}
	return LintNotes(r, dir)
}
