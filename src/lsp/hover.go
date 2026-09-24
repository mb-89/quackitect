// The hover over a term: the line the dictionary holds for it, and the source it cites.
// The dictionary and the table of endings are read on each ask, so a save reaches the next hover.
// [[spec/design_output/lsp#the-hover-shows-a-term]]
package main

import (
	"encoding/json"
	"regexp"
	"strings"

	"quackitect/yaml"
)

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

var (
	entryAt     = regexp.MustCompile(`^\s*-\s*\{(.*)\}\s*$`)
	letterRunAt = regexp.MustCompile(`[A-Za-z][A-Za-z-]*`)
)

type hover struct {
	Contents markup `json:"contents"`
}

type markup struct {
	Kind  string `json:"kind"`
	Value string `json:"value"`
}

type term struct {
	word, means, source string
}

type suffixRow struct {
	end  string
	to   []string
	long bool
}

type stems struct {
	endings  []suffixRow
	prefixes []string
}

type stemCase struct {
	word    string
	reaches string
}

// [[spec/design_output/lsp#the-hover-shows-a-term]]
func (one *server) hovers(params json.RawMessage) *hover {
	var said struct {
		TextDocument struct {
			URI string `json:"uri"`
		} `json:"textDocument"`
		Position position `json:"position"`
	}
	if json.Unmarshal(params, &said) != nil {
		return nil
	}
	where := pathOf(said.TextDocument.URI)
	if where == "" {
		return nil
	}
	tree := one.checker.Tree()
	return hoverAt(tree, relativeTo(tree.Root, where), said.Position)
}

// The term under the cursor, widened to the longest term covering it. [[spec/design_output/lsp#the-hover-shows-a-term]]
func hoverAt(tree *Tree, path string, at position) *hover {
	rows := yaml.SplitLines(tree.Read(path))
	if at.Line < 0 || at.Line >= len(rows) {
		return nil
	}
	row := rows[at.Line]
	cut := byteAt(row, at.Character)
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
	table := stemsIn(tree.Read(endingsPath))
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
	return &hover{Contents: markup{Kind: "markdown", Value: value}}
}

// Whether the words of a term stand in the row with the cursor word among them. The last word takes an ending too. [[spec/design_output/lsp#the-hover-shows-a-term]]
func covers(one term, row string, words [][]int, here int, table stems) bool {
	parts := strings.Fields(one.word)
	for first := here - len(parts) + 1; first <= here; first++ {
		if first < 0 || first+len(parts) > len(words) {
			continue
		}
		held := true
		for k, part := range parts {
			said := strings.ToLower(row[words[first+k][0]:words[first+k][1]])
			if k == len(parts)-1 {
				held = held && table.reaches(said, map[string]bool{part: true})
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
func stemsIn(text string) stems {
	said := yaml.AsDoc(yaml.Read(text))
	out := stems{prefixes: yaml.StringsOf(said.Get("prefixes"))}
	for _, row := range yaml.AsList(said.Get("endings")) {
		doc := yaml.AsDoc(row)
		one := suffixRow{end: yaml.AsString(doc.Get("end")), to: yaml.StringsOf(doc.Get("to")), long: yaml.AsBool(doc.Get("long"))}
		if one.end != "" && len(one.to) > 0 {
			out.endings = append(out.endings, one)
		}
	}
	return out
}

// [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func casesIn(text string) []stemCase {
	out := []stemCase{}
	for _, row := range yaml.AsList(yaml.AsDoc(yaml.Read(text)).Get("cases")) {
		doc := yaml.AsDoc(row)
		out = append(out, stemCase{word: yaml.AsString(doc.Get("word")), reaches: yaml.AsString(doc.Get("reaches"))})
	}
	return out
}

// Whether a word stands as a held word, an ending on one, or a prefix on either, as the rule reads the table. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func (one stems) reaches(word string, held map[string]bool) bool {
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

func (one stems) listed(word string, held map[string]bool) bool {
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
