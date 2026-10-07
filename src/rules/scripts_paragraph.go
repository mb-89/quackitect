// The script rules of the VoiceParagraph style, and the schema reader and the
// Tengo helpers they share, read the way rulesFrom in
// .claude/skills/level0/lib/paragraph.js reads them into Tengo.
// [[spec/design_output/rules#a-script-answers-offsets]]
package rules

import (
	"fmt"
	"regexp"
	"slices"
	"strings"

	"quackitect/src/yaml"
)

// The schema every paragraph script reads. [[spec/design_output/projection#the-second-target]]
const paraSchemaPath = "spec/schemas/paragraph.schema.yaml"

// The VoiceParagraph scripts by check id. [[spec/design_output/rules#a-script-answers-offsets]]
var paragraphScripts = map[string]scriptMaker{
	"VoiceParagraph.Characters":    paraCharacters,
	"VoiceParagraph.CodeSpans":     paraCodeSpans,
	"VoiceParagraph.ListItem":      paraListItem,
	"VoiceParagraph.Markup":        paraMarkup,
	"VoiceParagraph.RestatedTable": paraRestatedTable,
	"VoiceParagraph.Shape":         paraShape(false),
	"VoiceParagraph.ShapeAnswer":   paraShape(true),
	"VoiceParagraph.Vocabulary":    paraVocabulary,
}

// The patterns the Tengo helpers share: frontless, plain, structure and the blanks before a word scan. [[spec/design_output/projection#what-stands-outside-a-layer]]
var (
	paraKey   = regexp.MustCompile(`^[ \t]*-?[ \t]*([A-Za-z_][A-Za-z0-9_]*):`)
	paraPlain = []*regexp.Regexp{
		regexp.MustCompile("(?s)```.*?```"),
		regexp.MustCompile(`(?s)~~~.*?~~~`),
		regexp.MustCompile(`(?s)<!--.*?-->`),
		regexp.MustCompile(`(?m)^(?:\t| {4,}).*$`),
		regexp.MustCompile("`[^`\n]*`"),
		regexp.MustCompile("`[^`\n]*\n[^`\n]*`"),
		regexp.MustCompile(`https?://[^\s)]+`),
		regexp.MustCompile(`\[\[[^\]]*\]\]`),
		regexp.MustCompile(`\[[^\]]*\]\([^)]*\)`),
		regexp.MustCompile(`[A-Za-z0-9_.-]+/[A-Za-z0-9_./-]+`),
	}
	paraLineMarks = []*regexp.Regexp{
		regexp.MustCompile(`(?m)^#{1,6} +`),
		regexp.MustCompile(`(?m)^[ \t]*(?:[-*+]|[0-9]+[.)]) +`),
		regexp.MustCompile(`(?m)^[ \t]*> ?`),
		regexp.MustCompile(`\|`),
		regexp.MustCompile(`[*_]`),
	}
	paraNumbered = regexp.MustCompile(`^[0-9]+[.)] `)
	paraIndented = regexp.MustCompile(`^ {4,}[^ ]`)
	paraCodeSpan = regexp.MustCompile("`[^`]*`")
)

// The schema read once: its layers, its answer register, and the frontmatter fields a rule reads as prose. [[spec/tickets/voice-rules-skip-the-record]]
type paraSchema struct {
	layers *yaml.Doc
	answer *yaml.Doc
	prose  []string
}

// Reads the paragraph schema off the reader. [[spec/design_output/projection#the-second-target]]
func paraSchemaOf(read Read) paraSchema {
	said := yaml.AsDoc(yaml.Read(read(paraSchemaPath)))
	return paraSchema{
		layers: yaml.AsDoc(said.Get("layers")),
		answer: yaml.AsDoc(yaml.AsDoc(said.Get("registers")).Get("answer")),
		prose:  yaml.StringsOf(yaml.AsDoc(said.Get("frontmatter")).Get("prose")),
	}
}

// One layer of the schema by name. [[spec/design_output/projection#the-second-target]]
func (one paraSchema) layer(name string) *yaml.Doc { return yaml.AsDoc(one.layers.Get(name)) }

// The whole number at a key path under a doc, and a fault where the schema holds none. [[spec/design_output/projection#the-second-target]]
func paraNumber(doc *yaml.Doc, path ...string) (int, error) {
	for _, key := range path[:len(path)-1] {
		doc = yaml.AsDoc(doc.Get(key))
	}
	number, held := doc.Get(path[len(path)-1]).(int)
	if !held {
		return 0, fmt.Errorf("%s holds no whole number at %s", paraSchemaPath, strings.Join(path, "."))
	}
	return number, nil
}

// The words a layer's exceptions name, as left in paragraph.js reads them. [[spec/design_output/projection#the-grammar-rules]]
func paraLeft(layer *yaml.Doc) []string {
	out := []string{}
	for _, one := range yaml.AsList(layer.Get("exceptions")) {
		if doc := yaml.AsDoc(one); doc != nil && doc.Has("word") {
			one = doc.Get("word")
		}
		if word := yaml.AsString(one); word != "" {
			out = append(out, word)
		}
	}
	return out
}

// The frontmatter blanked past the fields the schema calls prose. [[spec/tickets/voice-rules-skip-the-record]]
func paraFrontless(keys []string, said string) string {
	lines := strings.Split(said, "\n")
	if len(lines) < 2 || strings.TrimSpace(lines[0]) != "---" {
		return said
	}
	out := make([]string, 0, len(lines))
	inside, keep := true, false
	for at, line := range lines {
		switch {
		case at == 0:
			out = append(out, line)
		case inside && strings.TrimSpace(line) == "---":
			inside = false
			out = append(out, line)
		case !inside:
			out = append(out, line)
		default:
			if found := paraKey.FindStringSubmatch(line); found != nil {
				keep = slices.Contains(keys, found[1])
			}
			if keep {
				out = append(out, line)
			} else {
				out = append(out, strings.Repeat(" ", len(line)))
			}
		}
	}
	return strings.Join(out, "\n")
}

// Every match of a pattern turned to spaces, so the offsets stand. [[spec/design_output/projection#what-stands-outside-a-layer]]
func paraBlanked(said string, pattern *regexp.Regexp) string {
	found := pattern.FindAllStringIndex(said, -1)
	if len(found) == 0 {
		return said
	}
	var out strings.Builder
	at := 0
	for _, match := range found {
		out.WriteString(said[at:match[0]])
		out.WriteString(strings.Repeat(" ", match[1]-match[0]))
		at = match[1]
	}
	out.WriteString(said[at:])
	return out.String()
}

// The text with the frontmatter, the code, the links and the paths blanked. [[spec/design_output/projection#what-stands-outside-a-layer]]
func paraPlainOf(keys []string, said string) string {
	out := paraFrontless(keys, said)
	for _, pattern := range paraPlain {
		out = paraBlanked(out, pattern)
	}
	return out
}

// The plain text with the line marks, the pipes, the emphasis and the layer's exceptions blanked, before a scan of words or characters. [[spec/design_output/projection#what-stands-outside-a-layer]]
func paraBare(keys, left []string, said string) string {
	out := paraPlainOf(keys, said)
	for _, pattern := range paraLineMarks {
		out = paraBlanked(out, pattern)
	}
	for _, word := range left {
		out = paraBlanked(out, regexp.MustCompile(regexp.QuoteMeta(word)))
	}
	return out
}

// One line of the frontless text and its byte offsets. [[spec/design_output/projection#what-stands-outside-a-layer]]
type paraRow struct {
	said       string
	begin, end int
}

// The lines of the frontless text with their offsets. [[spec/design_output/projection#what-stands-outside-a-layer]]
func paraRows(keys []string, said string) []paraRow {
	out := []paraRow{}
	at := 0
	for _, line := range strings.Split(paraFrontless(keys, said), "\n") {
		out = append(out, paraRow{said: line, begin: at, end: at + len(line)})
		at += len(line) + 1
	}
	return out
}

// The words a line holds, split on each space. [[spec/design_output/projection#what-stands-outside-a-layer]]
func paraWords(said string) int {
	n := 0
	for _, one := range strings.Split(said, " ") {
		if strings.TrimSpace(one) != "" {
			n++
		}
	}
	return n
}

// A line a list, a table, a heading, a quote, a rule or an indent opens. [[spec/design_output/projection#a-layer-writes-two-files]]
func paraStructure(line string) bool {
	t := strings.TrimSpace(line)
	for _, head := range []string{"#", "|", ">", "- ", "* ", "+ ", "---"} {
		if strings.HasPrefix(t, head) {
			return true
		}
	}
	return paraNumbered.MatchString(t) || paraIndented.MatchString(line)
}

// A match over a whole row. [[spec/design_output/rules#a-script-answers-offsets]]
func paraOver(row paraRow, message string) scriptMatch {
	return scriptMatch{Begin: row.begin, End: row.end, Message: message}
}
