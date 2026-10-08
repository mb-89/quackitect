// The word lists, read into the set a paragraph writes and the swaps a refusal
// teaches, and inlined into one Vale rule.
// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]] [[spec/tickets/config-verbs-port-to-go]]
package projection

import (
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// The lists a schema names where its vocabulary layer names none. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
const (
	coreList  = "spec/vocabulary/core.yml"
	termsList = "spec/vocabulary/terms.yml"
	swapsList = "spec/vocabulary/swaps.yml"
	stemsList = "spec/config/stems.yaml"
	// A part shorter than this stands, in the check and in the rule alike. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
	shortest = 3
	// What an ending row writes in its place: none cuts it, drop cuts one letter more. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
	noneEnding = "none"
	dropEnding = "drop"
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

// One ending row: the ending, what takes its place, and whether the stem stays long. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
type ending struct {
	end  string
	to   []string
	long bool
}

// The table of endings and the prefixes a listed word takes. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func stemsOf(said any) ([]ending, []string) {
	endings := []ending{}
	for _, one := range rowsOf(dig(said, "endings")) {
		row := ending{end: lower(one.Get("end")), long: one.Get("long") == true}
		for _, to := range listOf(one.Get("to")) {
			if said := lower(to); said != "" {
				row.to = append(row.to, said)
			}
		}
		if row.end != "" && len(row.to) > 0 {
			endings = append(endings, row)
		}
	}
	prefixes := []string{}
	for _, one := range listOf(dig(said, "prefixes")) {
		if said := lower(one); said != "" {
			prefixes = append(prefixes, said)
		}
	}
	return endings, prefixes
}

// The table read as the Tengo the rule runs. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func endingLines(endings []ending) []string {
	out := []string{}
	for _, row := range endings {
		over := jsLength(row.end)
		if row.long {
			over++
		}
		out = append(out, "  if n > "+strconv.Itoa(over)+" && text.has_suffix(w, "+quoted(row.end)+") {")
		for _, to := range row.to {
			cut := jsLength(row.end)
			if to == dropEnding {
				cut++
			}
			stem := "w[:n-" + strconv.Itoa(cut) + "]"
			if to != dropEnding && to != noneEnding {
				stem += " + " + quoted(to)
			}
			out = append(out, "    if inside["+stem+"] != undefined { return true }")
		}
		out = append(out, "  }")
	}
	return out
}

// The rule refusing a word the lists leave out. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func vocabularyRule(layer *Object, lists wordLists) string {
	swaps := swapsOf(lists)
	endings, prefixes := stemsOf(lists.stems)
	where := jsTrim(joinString(layer.Get("terms")))
	if where == "" {
		where = termsList
	}
	roads := []string{}
	for _, from := range swaps.order {
		roads = append(roads, from+"="+jsString(swaps.Get(from)))
	}
	shownPrefixes := make([]string, len(prefixes))
	for i, one := range prefixes {
		shownPrefixes[i] = quoted(one)
	}
	tail := "stands outside the words this tree writes. Write a core word, or add it to " +
		where + " with one line that says what it means."

	lines := prelude(nil, layer.Get("prose"))
	lines = append(lines, "list := `")
	lines = append(lines, grouped(wordsOf(lists), rowWidth)...)
	lines = append(lines,
		"`",
		"",
		"inside := {}",
		"for w in text.re_split(`\\s+`, list, -1) {",
		"  if len(w) > 0 { inside[w] = 1 }",
		"}",
		"",
		"roads := `",
	)
	lines = append(lines, grouped(roads, rowWidth)...)
	lines = append(lines,
		"`",
		"",
		"swaps := {}",
		"for one in text.re_split(`\\s+`, roads, -1) {",
		"  pair := text.split(one, \"=\")",
		"  if len(pair) == 2 { swaps[pair[0]] = pair[1] }",
		"}",
		"",
		"listed := func(w) {",
		"  if inside[w] != undefined { return true }",
		"  n := len(w)",
	)
	lines = append(lines, endingLines(endings)...)
	lines = append(lines,
		"  return false",
		"}",
		"",
		"known := func(w) {",
		"  if listed(w) { return true }",
		"  for pre in ["+strings.Join(shownPrefixes, ", ")+"] {",
		"    if len(w) > len(pre) + 2 && text.has_prefix(w, pre) && listed(w[len(pre):]) { return true }",
		"  }",
		"  return false",
		"}",
		"",
	)
	lines = append(lines, blankedMarkup...)
	lines = append(lines, blankedLeft(layer)...)
	lines = append(lines,
		"",
		"opens := func(at) {",
		"  i := at - 1",
		"  for i >= 0 {",
		"    c := said[i:i+1]",
		"    if c == \" \" || c == \"\\t\" || c == \"\\n\" { i-- ; continue }",
		"    if c == \".\" || c == \"!\" || c == \"?\" || c == \":\" || c == \";\" { return true }",
		"    return false",
		"  }",
		"  return true",
		"}",
		"",
		"found := text.re_find(`[A-Za-z][A-Za-z0-9'’-]*`, said, -1)",
		"if is_undefined(found) { found = [] }",
		"",
		"for one in found {",
		"  m := one[0]",
		"  w := m.text",
		"  if text.re_match(`[0-9_]`, w) { continue }",
		"  head := w[0:1]",
		"  if head != text.to_lower(head) && !opens(m.begin) { continue }",
		"  if len(w) == 1 { continue }",
		"",
		"  low := text.to_lower(w)",
		"  low = text.trim_suffix(low, \"'s\")",
		"  low = text.trim_suffix(low, \"’s\")",
		"  if text.contains(low, \"'\") || text.contains(low, \"’\") { continue }",
		"",
		"  bad := \"\"",
		"  for part in text.split(low, \"-\") {",
		"    p := text.trim_space(part)",
		"    if len(p) < "+strconv.Itoa(shortest)+" { continue }",
		"    if known(p) { continue }",
		"    bad = p",
		"    break",
		"  }",
		"  if bad == \"\" { continue }",
		"",
		"  road := swaps[bad]",
		"  say := bad + \" stands outside the words this tree writes. \"",
		"  if road != undefined {",
		"    say += \"Write \" + road + \" instead.\"",
		"  } else {",
		"    say += "+quoted("Write a core word, or add ")+" + bad +",
		"      "+quoted(" to "+where+" with one line that says what it means."),
		"  }",
		"  matches = append(matches, {begin: m.begin, end: m.end, message: say})",
		"}",
	)
	return scripted("A word "+tail, lines)
}
