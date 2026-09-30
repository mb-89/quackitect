// The reads the editor's features answer: the hover over a term, the
// completion at the cursor, the links a file's pointers draw, and the fold
// over the frontmatter. Each reads the tree and nothing past it.
// [[spec/tickets/lsp-module-serves-the-features]]
package check

import (
	"fmt"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"unicode/utf16"
	"unicode/utf8"

	"quackitect/src/yaml"
)

// A place in a file as the protocol counts it: rows from zero, and a column in UTF-16 units. [[spec/tickets/lsp-module-serves-the-features]]
type Position struct {
	Line      int `json:"line"`
	Character int `json:"character"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type Span struct {
	Start Position `json:"start"`
	End   Position `json:"end"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type Hover struct {
	Contents Markup `json:"contents"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type Markup struct {
	Kind  string `json:"kind"`
	Value string `json:"value"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type Completion struct {
	Label      string    `json:"label"`
	Kind       int       `json:"kind"`
	Detail     string    `json:"detail,omitempty"`
	InsertText string    `json:"insertText,omitempty"`
	TextEdit   *TextEdit `json:"textEdit,omitempty"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type TextEdit struct {
	Range   Span   `json:"range"`
	NewText string `json:"newText"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type DocumentLink struct {
	Range   Span   `json:"range"`
	Target  string `json:"target"`
	Tooltip string `json:"tooltip,omitempty"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type FoldingRange struct {
	StartLine int    `json:"startLine"`
	EndLine   int    `json:"endLine"`
	Kind      string `json:"kind,omitempty"`
}

// The paths the vocabulary layer names, and the defaults where it names none. [[spec/design_output/lsp#the-hover-shows-a-term]]
const (
	paragraphSchema = "spec/schemas/paragraph.schema.yaml"
	termsDefault    = "spec/vocabulary/terms.yml"
	endingsDefault  = "spec/config/stems.yaml"
)

// A row names an ending and what takes its place: none cuts it, drop cuts one letter more. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
const (
	cutNone = "none"
	cutDrop = "drop"
	// A prefix leaves a word longer than itself by this much, as the rule reads it. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
	prefixRoom = 2
)

// The kind the protocol names for a fold that is neither a comment nor an import. [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
const regionFold = "region"

// The marks a URI path carries bare beside the letters and digits. [[spec/design_output/lsp#a-pointer-opens-its-target]]
const bareInPath = "-_.~$&+,/:;=@"

var (
	entryAt     = regexp.MustCompile(`^\s*-\s*\{(.*)\}\s*$`)
	letterRunAt = regexp.MustCompile(`[A-Za-z][A-Za-z-]*`)
)

type term struct {
	word, means, source string
}

type suffixRow struct {
	end  string
	to   []string
	long bool
}

// The table of endings and prefixes a word reaches its stem through. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
type Stems struct {
	endings  []suffixRow
	prefixes []string
}

// The term under the cursor, widened to the longest term covering it. The dictionary and the table of endings are read on each ask, so a save reaches the next hover. [[spec/design_output/lsp#the-hover-shows-a-term]]
func HoverAt(tree *Tree, path string, line, character int) *Hover {
	rows := yaml.SplitLines(tree.Read(path))
	if line < 0 || line >= len(rows) {
		return nil
	}
	row := rows[line]
	cut := byteAt(row, character)
	words := letterRunAt.FindAllStringIndex(row, -1)
	here := -1
	for i, span := range words {
		if span[0] <= cut && cut < span[1] {
			here = i
		}
	}
	if here < 0 {
		return nil
	}
	termsPath, endingsPath := vocabularyPaths(tree)
	terms := termsIn(tree.Read(termsPath))
	table := StemsIn(tree.Read(endingsPath))
	var best *term
	width := 0
	for i := range terms {
		size := len(strings.Fields(terms[i].word))
		if size > width && covers(terms[i], row, words, here, table) {
			best, width = &terms[i], size
		}
	}
	if best == nil {
		return nil
	}
	value := "**" + best.word + "**: " + best.means
	if best.source != "" {
		value += "\n\n" + best.source
	}
	return &Hover{Contents: Markup{Kind: "markdown", Value: value}}
}

// Whether the words of a term stand in the row with the cursor word among them. The last word takes an ending too. [[spec/design_output/lsp#the-hover-shows-a-term]]
func covers(one term, row string, words [][]int, here int, table Stems) bool {
	parts := strings.Fields(one.word)
	for first := here - len(parts) + 1; first <= here; first++ {
		if first < 0 || first+len(parts) > len(words) {
			continue
		}
		held := true
		for k, part := range parts {
			said := strings.ToLower(row[words[first+k][0]:words[first+k][1]])
			if k == len(parts)-1 {
				held = held && table.Reaches(said, map[string]bool{part: true})
			} else {
				held = held && said == part
			}
		}
		if held {
			return true
		}
	}
	return false
}

// [[spec/design_output/lsp#the-hover-shows-a-term]]
func vocabularyPaths(tree *Tree) (string, string) {
	layer := yaml.AsDoc(yaml.AsDoc(yaml.AsDoc(yaml.Read(tree.Read(paragraphSchema))).Get("layers")).Get("vocabulary"))
	named := func(key, fallback string) string {
		if said := strings.TrimSpace(yaml.AsString(layer.Get(key))); said != "" {
			return said
		}
		return fallback
	}
	return named("terms", termsDefault), named("endings", endingsDefault)
}

// The terms, one entry a line. The reader of YAML reads no braces, and the shape rule keeps a comma out of every value, so a split on the comma holds. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func termsIn(text string) []term {
	out := []term{}
	for _, row := range yaml.SplitLines(text) {
		found := entryAt.FindStringSubmatch(row)
		if found == nil {
			continue
		}
		held := map[string]string{}
		for _, part := range strings.Split(found[1], ",") {
			key, value, ok := strings.Cut(part, ":")
			if ok {
				held[strings.TrimSpace(key)] = strings.Trim(strings.TrimSpace(value), `"`)
			}
		}
		if held["word"] != "" && held["means"] != "" {
			out = append(out, term{word: strings.ToLower(held["word"]), means: held["means"], source: held["source"]})
		}
	}
	return out
}

// [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func StemsIn(text string) Stems {
	said := yaml.AsDoc(yaml.Read(text))
	out := Stems{prefixes: yaml.StringsOf(said.Get("prefixes"))}
	for _, row := range yaml.AsList(said.Get("endings")) {
		doc := yaml.AsDoc(row)
		one := suffixRow{end: yaml.AsString(doc.Get("end")), to: yaml.StringsOf(doc.Get("to")), long: yaml.AsBool(doc.Get("long"))}
		if one.end != "" && len(one.to) > 0 {
			out.endings = append(out.endings, one)
		}
	}
	return out
}

// Whether a word stands as a held word, an ending on one, or a prefix on either, as the rule reads the table. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func (one Stems) Reaches(word string, held map[string]bool) bool {
	if one.listed(word, held) {
		return true
	}
	for _, pre := range one.prefixes {
		if len(word) > len(pre)+prefixRoom && strings.HasPrefix(word, pre) && one.listed(word[len(pre):], held) {
			return true
		}
	}
	return false
}

func (one Stems) listed(word string, held map[string]bool) bool {
	if held[word] {
		return true
	}
	for _, row := range one.endings {
		over := len(row.end)
		if row.long {
			over++
		}
		if len(word) <= over || !strings.HasSuffix(word, row.end) {
			continue
		}
		for _, to := range row.to {
			cut, add := len(row.end), to
			switch to {
			case cutNone:
				add = ""
			case cutDrop:
				cut, add = cut+1, ""
			}
			if held[word[:len(word)-cut]+add] {
				return true
			}
		}
	}
	return false
}

// Every pointer of the file that lands on a file, with its target. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func LinksIn(tree *Tree, path string) []DocumentLink {
	out := []DocumentLink{}
	text := tree.Read(path)
	if !Textual(text) {
		return out
	}
	rows := yaml.SplitLines(text)
	held := PlacesIn(tree)
	for _, one := range PointersIn(path, rows) {
		target, ok := landing(tree, held, one.Target())
		if !ok {
			continue
		}
		row := rows[one.Line()-1]
		out = append(out, DocumentLink{
			Range: Span{
				Start: Position{Line: one.Line() - 1, Character: units(row[:one.Start()])},
				End:   Position{Line: one.Line() - 1, Character: units(row[:one.End()])},
			},
			Target:  target,
			Tooltip: "open " + one.Target(),
		})
	}
	return out
}

// The URI a pointer opens, and the heading's line where it names a chapter. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func landing(tree *Tree, held Places, target string) (string, bool) {
	name, anchor, chaptered := strings.Cut(target, "#")
	at := held.FileOf(name)
	if at == "" || !held.Holds(at) {
		return "", false
	}
	uri := uriOf(filepath.Join(tree.Root, filepath.FromSlash(at)))
	if !chaptered {
		return uri, true
	}
	found, ok := ChapterOf(tree, at, strings.TrimSpace(anchor))
	if !ok {
		return "", false
	}
	return uri + "#L" + strconv.Itoa(found.Line), true
}

// [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
func FoldsOf(text string) []FoldingRange {
	front := FrontOf(strings.Split(text, "\n"))
	if !front.Stands {
		return []FoldingRange{}
	}
	return []FoldingRange{{StartLine: 0, EndLine: front.Close, Kind: regionFold}}
}

// The file URI of a path, each byte a path leaves bare kept and every other written as %XX, as net/url escapes a path. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func uriOf(path string) string {
	said := Slashed(path)
	if !strings.HasPrefix(said, "/") {
		said = "/" + said
	}
	var out strings.Builder
	out.WriteString("file://")
	for i := 0; i < len(said); i++ {
		c := said[i]
		if 'a' <= c && c <= 'z' || 'A' <= c && c <= 'Z' || '0' <= c && c <= '9' || strings.IndexByte(bareInPath, c) >= 0 {
			out.WriteByte(c)
		} else {
			fmt.Fprintf(&out, "%%%02X", c)
		}
	}
	return out.String()
}

// A column in UTF-16 units, the unit the protocol counts by default. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func units(said string) int {
	return len(utf16.Encode([]rune(said)))
}

// The UTF-16 units before a byte of the row. A byte inside a character counts from that character's start. [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
func unitsTo(row string, at int) int {
	at = min(at, len(row))
	for at > 0 && at < len(row) && !utf8.RuneStart(row[at]) {
		at--
	}
	return units(row[:at])
}

// The byte of the row an editor's column names, and the row's end where the column runs past it. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func byteAt(row string, character int) int {
	counted := 0
	for at, said := range row {
		if counted >= character {
			return at
		}
		counted += utf16.RuneLen(said)
	}
	return len(row)
}
