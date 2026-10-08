// The paragraph schema, projected into rule files. The schema hands over the
// values, so a cap moves in the schema and the rule files follow at the next
// projection. A script rule carries its head alone. A port of paragraph.js.
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
	put("Markup.yml", markup())
	put("Shape.yml", run(layer("shape"), ""))
	put("ShapeAnswer.yml", run(held, inAnswer))
	put("Paragraph.yml", paragraph(layer("shape"), ""))
	put("ParagraphAnswer.yml", paragraph(held, inAnswer))
	put("Sentence.yml", sentence(layer("sentence")))
	put("ListItem.yml", listItem(layer("sentence")))
	put("CodeSpans.yml", codeSpans(layer("sentence")))
	put("RestatedTable.yml", restatedTable())
	for _, one := range grammar(objectAt(layers, "grammar")) {
		put(one.name, one.text)
	}
	// [[spec/design_output/projection#a-layer-writes-two-files]]
	binding := objectAt(layers, "grammar").spread(objectAt(said, "registers", "requirement", "grammar"))
	if modals, held := modal(binding); held {
		put("ModalRequirement.yml", modals)
	}
	if len(wordsOf(lists)) > 0 {
		put("Vocabulary.yml", vocabularyRule(layer("vocabulary")))
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
	return scripted("A character " + tail)
}

// The rule refusing markup outside what a paragraph admits, and a heading or a lead past its cap. [[spec/design_output/projection#the-second-target]]
func markup() string {
	return scripted("This markup stands outside what a paragraph admits.")
}

// The rule capping the paragraphs a run holds with no structure between them. [[spec/design_output/projection#a-layer-writes-two-files]]
func run(layer *Object, where string) string {
	most := numberOf(layer.Get("paragraphsPerRun"))
	return scripted("A run holds " + most + " paragraphs" + where + ".")
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
	return scripted("A sentence in a list item holds " + most + " words.")
}
