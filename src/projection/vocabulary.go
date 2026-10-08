// The word lists, read into the set a paragraph writes and the swaps a refusal
// teaches. A list holding a word writes the vocabulary rule's head.
// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]] [[spec/tickets/config-verbs-port-to-go]]
package projection

import (
	"regexp"
	"sort"
	"strings"
)

// The lists a schema names where its vocabulary layer names none. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
const (
	coreList  = "spec/vocabulary/core.yml"
	termsList = "spec/vocabulary/terms.yml"
	swapsList = "spec/vocabulary/swaps.yml"
	stemsList = "spec/config/stems.yaml"
)

var (
	wordShape = regexp.MustCompile(`^[a-z][a-z-]*( [a-z][a-z-]*)*$`)
	wordParts = regexp.MustCompile(`[ -]`)
)

// The paths of the four lists a schema reads. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
type listPaths struct{ core, terms, swaps, endings string }

// The four paths in the order Object.values reads them. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func (one listPaths) all() []string { return []string{one.core, one.terms, one.swaps, one.endings} }

// The lists a schema's vocabulary layer names, each falling back to its standing path. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func pathsOf(said any) listPaths {
	layer := objectAt(said, "layers", "vocabulary")
	one := func(key, fallback string) string {
		if held, text := layer.Get(key).(string); text && jsTrim(held) != "" {
			return jsTrim(held)
		}
		return fallback
	}
	return listPaths{
		core:    one("core", coreList),
		terms:   one("terms", termsList),
		swaps:   one("swaps", swapsList),
		endings: one("endings", stemsList),
	}
}

// The four lists, each read as YAML. [[spec/design_output/projection#the-second-target]]
type wordLists struct{ core, terms, swaps, stems any }

// The lists a schema names, read off the texts. [[spec/design_output/projection#the-second-target]]
func listsOf(said any, texts map[string]string) wordLists {
	paths := pathsOf(said)
	return wordLists{
		core:  readYaml(texts[paths.core]),
		terms: readYaml(texts[paths.terms]),
		swaps: readYaml(texts[paths.swaps]),
		stems: readYaml(texts[paths.endings]),
	}
}

// The rows of a list that stand as objects. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func rowsOf(said any) []*Object {
	out := []*Object{}
	for _, one := range listOf(said) {
		if row := asObject(one); row != nil {
			out = append(out, row)
		}
	}
	return out
}

// A value as a trimmed lower case text, or nothing where it stands absent. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func lower(said any) string { return strings.ToLower(jsTrim(joinString(said))) }

// The words a list's rows name that hold the word shape. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func wordsIn(said any, key string) []string {
	out := []string{}
	for _, one := range rowsOf(dig(said, key)) {
		if word := lower(one.Get("word")); wordShape.MatchString(word) {
			out = append(out, word)
		}
	}
	return out
}

// Every part of every core word and term, a swapped one left out, sorted. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func wordsOf(lists wordLists) []string {
	swaps := swapsOf(lists)
	seen := map[string]bool{}
	out := []string{}
	for _, word := range append(wordsIn(lists.core, "words"), wordsIn(lists.terms, "terms")...) {
		for _, part := range wordParts.Split(word, -1) {
			if _, swapped := swaps.at[part]; part != "" && !swapped && !seen[part] {
				seen[part] = true
				out = append(out, part)
			}
		}
	}
	return sorted(out)
}

// The swaps, each word and the core word to write, sorted by word. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func swapsOf(lists wordLists) *Object {
	out := &Object{at: map[string]any{}}
	for _, one := range rowsOf(dig(lists.swaps, "swaps")) {
		word, write := lower(one.Get("word")), lower(one.Get("write"))
		if !wordShape.MatchString(word) || write == "" || out.Has(word) {
			continue
		}
		out.Set(word, write)
	}
	sort.Strings(out.order)
	return out
}

// The rule refusing a word the lists leave out. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func vocabularyRule(layer *Object) string {
	where := jsTrim(joinString(layer.Get("terms")))
	if where == "" {
		where = termsList
	}
	return scripted("A word stands outside the words this tree writes. Write a core word, or add it to " +
		where + " with one line that says what it means.")
}
