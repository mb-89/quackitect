// The paragraph schema, projected into Vale. The schema hands over the values
// and this file holds the Tengo, so a cap moves in the schema and the rule
// files follow at the next projection. A port of paragraph.js.
// [[spec/design_output/projection#the-second-target]] [[spec/tickets/config-verbs-port-to-go]]
package projection

import (
	"regexp"
	"strings"
)

// The marks a schema names, by name. [[spec/design_output/projection#the-schema-names-a-mark]]
var marks = map[string]string{
	"full stop":        ".",
	"comma":            ",",
	"question mark":    "?",
	"exclamation mark": "!",
	"colon":            ":",
	"semicolon":        ";",
	"parentheses":      "()",
	"apostrophe":       "'",
	"quotation mark":   `"`,
	"hyphen":           "-",
	"slash":            "/",
	"percent":          "%",
	"plus":             "+",
}

// The sides a rule's break stands on, and the one a rule the schema leaves out reads. [[spec/tickets/one-list-holds-the-warnings]]
const (
	errorSide   = "error"
	warningSide = "warning"
	// The register an answer reads, and the words its rules name it by. [[spec/design_output/projection#a-layer-writes-two-files]]
	inAnswer = " in an answer"
)

var levelLine = regexp.MustCompile(`(?m)^level: .*$`)

// The rule files a paragraph schema writes, each under the banner, in the order paragraph.js puts them. [[spec/design_output/projection#the-second-target]]
func rulesFrom(said any, banner string, lists wordLists) []named {
	out := []named{}
	layers := objectAt(said, "layers")
	answer := objectAt(said, "registers", "answer")
	put := func(name, body string) {
		out = append(out, named{name: name, text: bannered(banner, sided(said, name, body))})
	}
	// [[spec/tickets/voice-rules-skip-the-record]]
	prose := dig(said, "frontmatter", "prose")
	if absent(prose) {
		prose = []any{}
	}
	withProse := func(one *Object) *Object {
		out := one.spread()
		out.Set("prose", prose)
		return out
	}
	layer := func(name string) *Object { return withProse(objectAt(layers, name)) }
	held := withProse(layer("shape").spread(objectAt(answer, "shape")))

	put("Characters.yml", characters(layer("characters")))
	put("Markup.yml", markup(layer("markup")))
	put("Shape.yml", run(layer("shape"), "", nil))
	put("ShapeAnswer.yml", run(held, inAnswer, answer.Get("opens")))
	put("Paragraph.yml", paragraph(layer("shape"), ""))
	put("ParagraphAnswer.yml", paragraph(held, inAnswer))
	put("Sentence.yml", sentence(layer("sentence")))
	put("ListItem.yml", listItem(layer("sentence")))
	put("CodeSpans.yml", codeSpans(layer("sentence")))
	put("RestatedTable.yml", restatedTable(layer("restated")))
	for _, one := range grammar(objectAt(layers, "grammar")) {
		put(one.name, one.text)
	}
	// [[spec/design_output/projection#a-layer-writes-two-files]]
	binding := objectAt(layers, "grammar").spread(objectAt(said, "registers", "requirement", "grammar"))
	if modals, held := modal(binding); held {
		put("ModalRequirement.yml", modals)
	}
	if len(wordsOf(lists)) > 0 {
		put("Vocabulary.yml", vocabularyRule(layer("vocabulary"), lists))
	}
	return out
}

// The side a rule file's break stands on, as the schema's rules map names it. [[spec/tickets/one-list-holds-the-warnings]]
func sideOf(said any, name string) string {
	value := dig(said, "rules", strings.TrimSuffix(name, rulesEnding))
	held := ""
	if !absent(value) {
		held = jsString(value)
	}
	if held == errorSide || held == warningSide {
		return held
	}
	return errorSide
}

// A rule body with its first level line set to its side. [[spec/tickets/one-list-holds-the-warnings]]
func sided(said any, name, body string) string {
	found := levelLine.FindStringIndex(body)
	if found == nil {
		return body
	}
	return body[:found[0]] + "level: " + sideOf(said, name) + body[found[1]:]
}

// A rule body under the banner, one comment line a row. [[spec/design_output/projection#each-file-says-so]]
func bannered(banner, body string) string {
	if banner == "" {
		return body
	}
	rows := grouped(jsFields(banner), bannerWidth)
	for i, one := range rows {
		rows[i] = "# " + one
	}
	return strings.Join(rows, "\n") + "\n" + body
}

// The lines that blank a heading, a list mark, a quote, a pipe and an emphasis out of the scan. [[spec/design_output/projection#the-second-target]]
var blankedMarkup = []string{
	"said := plain(scope)",
	"said = blanked(said, `(?m)^#{1,6} +`)",
	"said = blanked(said, `(?m)^[ \\t]*(?:[-*+]|[0-9]+[.)]) +`)",
	"said = blanked(said, `(?m)^[ \\t]*> ?`)",
	"said = blanked(said, `\\|`)",
	"said = blanked(said, `[*_]`)",
}

// The rule refusing a character outside the set a paragraph admits. [[spec/design_output/projection#the-second-target]]
func characters(layer *Object) string {
	var joined strings.Builder
	for _, name := range listOf(layer.Get("punctuation")) {
		joined.WriteString(marks[jsString(name)])
	}
	seen := map[rune]bool{}
	set := []string{}
	for _, one := range joined.String() {
		if !seen[one] {
			seen[one] = true
			set = append(set, string(one))
		}
	}
	tail := "stands outside the set a paragraph admits: letters, digits, space, and " +
		strings.Join(set, " ") + ". Write it in words, or put it in a code span."
	lines := prelude(nil, layer.Get("prose"))
	lines = append(lines, blankedMarkup...)
	lines = append(lines, blankedLeft(layer)...)
	lines = append(lines,
		"",
		"found := text.re_find(`[^\\pL\\pN\\s"+escaped(strings.Join(set, ""))+"]`, said, -1)",
		"if !is_undefined(found) {",
		"  for one in found {",
		"    m := one[0]",
		"    matches = append(matches, {",
		"      begin: m.begin,",
		"      end: m.end,",
		"      message: \"The character \" + m.text + \" \" + "+quoted(tail),
		"    })",
		"  }",
		"}",
	)
	return scripted("A character "+tail, lines)
}

// The rule refusing markup outside what a paragraph admits, and a heading or a lead past its cap. [[spec/design_output/projection#the-second-target]]
func markup(layer *Object) string {
	heading := numberOf(dig(layer, "heading", "words"))
	lead := numberOf(dig(layer, "strongLead", "words"))
	lines := prelude([]string{"rows", "words"}, layer.Get("prose"))
	lines = append(lines,
		"said := plain(scope)",
		"",
		"for row in rows(said) {",
		"  line := text.trim_space(row.said)",
		"",
		"  if text.re_match(`^#{1,6}\\s`, line) {",
		"    title := text.re_replace(`^#+\\s*`, line, \"\")",
		"    title = text.re_replace(`^[0-9]+[.)]\\s*`, title, \"\")",
		"    title = text.re_replace(`[*_]`, title, \"\")",
		"    if words(title) > "+heading+" {",
		"      matches = append(matches, {",
		"        begin: row.begin,",
		"        end: row.end,",
		"        message: \"A heading holds "+heading+" words, and this one holds \" + string(words(title)) + \". Cut it, and let the prose carry the rest.\"",
		"      })",
		"    }",
	)
	if dig(layer, "heading", "oneTitle") == true {
		lines = append(lines,
			"    if text.re_match(`\\s[-]\\s|:\\s`, title) {",
			"      matches = append(matches, {",
			"        begin: row.begin,",
			"        end: row.end,",
			"        message: \"A dash or a colon makes a heading into two. Name one thing.\"",
			"      })",
			"    }",
		)
	}
	lines = append(lines,
		"  }",
		"",
		"  found := text.re_find(`^[ \\t]*(?:[-*+]|[0-9]+[.)])\\s+\\*\\*([^*]+)\\*\\*`, row.said, 1)",
		"  if !is_undefined(found) {",
		"    if words(found[0][1].text) > "+lead+" {",
		"      matches = append(matches, {",
		"        begin: row.begin,",
		"        end: row.end,",
		"        message: \"A strong lead holds "+lead+" words, and this one holds \" + string(words(found[0][1].text)) + \". Cut it.\"",
		"      })",
		"    }",
		"  }",
		"}",
		"",
		"outside := text.re_find(`!\\[[^\\]]*\\]\\(|</?[A-Za-z][A-Za-z0-9]*(?:\\s[^>]*)?>`, said, -1)",
		"if !is_undefined(outside) {",
		"  for one in outside {",
		"    matches = append(matches, {",
		"      begin: one[0].begin,",
		"      end: one[0].end,",
		"      message: \"An image and a tag stand outside the markup a paragraph admits. Write a code span, a link, a fence, a table, a list item, a heading or a strong lead.\"",
		"    })",
		"  }",
		"}",
	)
	return scripted("This markup stands outside what a paragraph admits.", lines)
}

// What an answer opens with where a list or a heading stands first. [[spec/design_output/projection#the-list-opens-an-answer]]
const (
	opensList    = "An answer opens with a list, one sentence an item and one bottom line each. Write that list here."
	opensHeading = "A heading stands under the TL;DR list, and this one opens the answer. Write the list first."
)

// The block names an answer's opening reads. [[spec/design_output/projection#the-list-opens-an-answer]]
const (
	tldrBlock      = "tldr"
	questionsBlock = "questions"
)

// The lines checking an answer opens on its list, where the register names one. [[spec/design_output/projection#the-list-opens-an-answer]]
func opening(opens any) []string {
	names := map[string]bool{}
	for _, one := range listOf(opens) {
		names[jsString(dig(one, "block"))] = true
	}
	if !names[tldrBlock] {
		return nil
	}
	lines := []string{
		"",
		"opened := false",
		"first := {said: \"\", begin: 0, end: 0}",
		"fence := false",
		"",
		"for row in rows(said) {",
		"  if opened { break }",
		"  line := text.trim_space(row.said)",
		"  if text.has_prefix(line, \"```\") {",
		"    fence = !fence",
		"    continue",
		"  }",
		"  if fence { continue }",
		"  if len(line) == 0 { continue }",
	}
	if names[questionsBlock] {
		lines = append(lines, "  if text.has_prefix(line, \"|\") { continue }")
	}
	return append(lines,
		"  first = row",
		"  opened = true",
		"}",
		"",
		"if opened {",
		"  head := text.trim_space(first.said)",
		"  if !text.re_match(`^(?:[-*+]|[0-9]+[.)])\\s+\\S`, head) {",
		"    why := "+quoted(opensList),
		"    if text.has_prefix(head, \"#\") {",
		"      why = "+quoted(opensHeading),
		"    }",
		"    matches = append(matches, {",
		"      begin: first.begin,",
		"      end: first.end,",
		"      message: why",
		"    })",
		"  }",
		"}",
	)
}

// The rule capping the paragraphs a run holds with no structure between them. [[spec/design_output/projection#a-layer-writes-two-files]]
func run(layer *Object, where string, opens any) string {
	most := numberOf(layer.Get("paragraphsPerRun"))
	lines := prelude([]string{"rows", "structure"}, layer.Get("prose"))
	lines = append(lines,
		front,
		"",
		"fenced := false",
		"inPara := false",
		"run := 0",
		"runStart := 0",
		"runEnd := 0",
		"",
		"closeRun := func() {",
		"  if run > "+most+" {",
		"    matches = append(matches, {",
		"      begin: runStart,",
		"      end: runEnd,",
		"      message: \"A run holds "+most+" paragraphs"+where+" with no list, table or diagram between them, and this one holds \" + string(run) + \". Carry the rest as structure.\"",
		"    })",
		"  }",
		"  run = 0",
		"}",
		"",
		"for row in rows(said) {",
		"  trimmed := text.trim_space(row.said)",
		"",
		"  if text.has_prefix(trimmed, \"```\") {",
		"    inPara = false",
		"    closeRun()",
		"    fenced = !fenced",
		"    continue",
		"  }",
		"  if fenced { continue }",
		"",
		"  if len(trimmed) == 0 {",
		"    inPara = false",
		"    continue",
		"  }",
		"",
		"  if structure(row.said) {",
		"    inPara = false",
		"    closeRun()",
		"    continue",
		"  }",
		"",
		"  if !inPara {",
		"    inPara = true",
		"    if run == 0 { runStart = row.begin }",
		"    run++",
		"  }",
		"  runEnd = row.end",
		"}",
		"closeRun()",
	)
	lines = append(lines, opening(opens)...)
	return scripted("A run holds "+most+" paragraphs"+where+".", lines)
}

// The rule capping the sentences a paragraph holds. [[spec/design_output/projection#a-layer-writes-two-files]]
func paragraph(layer *Object, where string) string {
	most := numberOf(layer.Get("sentencesPerParagraph"))
	return counted("A paragraph holds "+most+" sentences"+where+". Break this one.", "paragraph", "[.!?](?:\\s|$)", most)
}

// The rule capping the words a sentence holds. [[spec/design_output/projection#a-layer-writes-two-files]]
func sentence(layer *Object) string {
	most := numberOf(dig(layer, "words", "max"))
	return counted("A sentence holds "+most+" words. Cut this one in two.", "sentence", "\\b\\w+\\b", most)
}

// The rule capping the words a sentence in a list item holds. [[spec/design_output/projection#a-layer-writes-two-files]]
func listItem(layer *Object) string {
	most := numberOf(dig(layer, "words", "listItem"))
	lines := prelude([]string{"rows", "words"}, layer.Get("prose"))
	lines = append(lines,
		front,
		"fenced := false",
		"",
		"for row in rows(said) {",
		"  trimmed := text.trim_space(row.said)",
		"  if text.has_prefix(trimmed, \"```\") {",
		"    fenced = !fenced",
		"    continue",
		"  }",
		"  if fenced { continue }",
		"  if !text.re_match(`^[ \\t]*(?:[-*+]|[0-9]+[.)])\\s`, row.said) { continue }",
		"",
		"  item := text.re_replace(`^[ \\t]*(?:[-*+]|[0-9]+[.)])\\s+`, trimmed, \"\")",
		"  for part in text.re_split(`[.!?]+(?:\\s|$)`, item, -1) {",
		"    n := words(part)",
		"    if n > "+most+" {",
		"      matches = append(matches, {",
		"        begin: row.begin,",
		"        end: row.end,",
		"        message: \"A sentence in a list item holds "+most+" words, and this one holds \" + string(n) + \". Cut it.\"",
		"      })",
		"    }",
		"  }",
		"}",
	)
	return scripted("A sentence in a list item holds "+most+" words.", lines)
}
