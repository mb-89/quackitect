// The VoiceParagraph scripts over a line: a character outside the set, the
// markup past its caps, a list item sentence and the code spans a sentence holds.
// [[spec/design_output/rules#a-script-answers-offsets]]
package rules

import (
	"fmt"
	"regexp"
	"slices"
	"strings"

	"quackitect/src/yaml"
)

// The mark each punctuation name in the characters layer admits. [[spec/design_output/projection#the-schema-names-a-mark]]
var paraMarks = map[string]string{
	"full stop": ".", "comma": ",", "question mark": "?", "exclamation mark": "!",
	"colon": ":", "semicolon": ";", "parentheses": "()", "apostrophe": "'",
	"quotation mark": `"`, "hyphen": "-", "slash": "/", "percent": "%", "plus": "+",
}

// The patterns of the Markup, ListItem and CodeSpans scripts. [[spec/design_output/projection#the-second-target]]
var (
	paraHeading     = regexp.MustCompile(`^#{1,6}\s`)
	paraHashes      = regexp.MustCompile(`^#+\s*`)
	paraTitleNumber = regexp.MustCompile(`^[0-9]+[.)]\s*`)
	paraEmphasis    = regexp.MustCompile(`[*_]`)
	paraTwoTitles   = regexp.MustCompile(`\s[-]\s|:\s`)
	paraStrongLead  = regexp.MustCompile(`^[ \t]*(?:[-*+]|[0-9]+[.)])\s+\*\*([^*]+)\*\*`)
	paraOutside     = regexp.MustCompile(`!\[[^\]]*\]\(|</?[A-Za-z][A-Za-z0-9]*(?:\s[^>]*)?>`)
	paraItem        = regexp.MustCompile(`^[ \t]*(?:[-*+]|[0-9]+[.)])\s`)
	paraItemHead    = regexp.MustCompile(`^[ \t]*(?:[-*+]|[0-9]+[.)])\s+`)
	paraSentenceEnd = regexp.MustCompile(`[.!?]+(?:\s|$)`)
)

// A character outside the set the characters layer admits. [[spec/design_output/projection#the-second-target]]
func paraCharacters(read Read) (script, error) {
	schema := paraSchemaOf(read)
	layer := schema.layer("characters")
	set := []string{}
	for _, name := range yaml.StringsOf(layer.Get("punctuation")) {
		for _, mark := range strings.Split(paraMarks[name], "") {
			if !slices.Contains(set, mark) {
				set = append(set, mark)
			}
		}
	}
	tail := "stands outside the set a paragraph admits: letters, digits, space, and " + strings.Join(set, " ") + ". Write it in words, or put it in a code span."
	outside := regexp.MustCompile(`[^\pL\pN\s` + `\` + strings.Join(set, `\`) + `]`)
	if len(set) == 0 {
		outside = regexp.MustCompile(`[^\pL\pN\s]`)
	}
	left := paraLeft(layer)
	return func(in scriptIn) []scriptMatch {
		said := paraBare(schema.prose, left, in.Text)
		out := []scriptMatch{}
		for _, match := range outside.FindAllStringIndex(said, -1) {
			out = append(out, scriptMatch{Begin: match[0], End: match[1], Message: "The character " + said[match[0]:match[1]] + " " + tail})
		}
		return out
	}, nil
}

// A heading past its cap or naming two things, a strong lead past its cap, and an image or a tag. [[spec/design_output/projection#the-second-target]]
func paraMarkup(read Read) (script, error) {
	schema := paraSchemaOf(read)
	layer := schema.layer("markup")
	limit, err := paraNumber(layer, "heading", "words")
	if err != nil {
		return nil, err
	}
	lead, err := paraNumber(layer, "strongLead", "words")
	if err != nil {
		return nil, err
	}
	oneTitle := yaml.AsBool(yaml.AsDoc(layer.Get("heading")).Get("oneTitle"))
	return func(in scriptIn) []scriptMatch {
		said := paraPlainOf(schema.prose, in.Text)
		out := []scriptMatch{}
		for _, row := range paraRows(schema.prose, said) {
			line := strings.TrimSpace(row.said)
			if paraHeading.MatchString(line) {
				title := paraHashes.ReplaceAllString(line, "")
				title = paraTitleNumber.ReplaceAllString(title, "")
				title = paraEmphasis.ReplaceAllString(title, "")
				if n := paraWords(title); n > limit {
					out = append(out, paraOver(row, fmt.Sprintf("A heading holds %d words, and this one holds %d. Cut it, and let the prose carry the rest.", limit, n)))
				}
				if oneTitle && paraTwoTitles.MatchString(title) {
					out = append(out, paraOver(row, "A dash or a colon makes a heading into two. Name one thing."))
				}
			}
			if found := paraStrongLead.FindStringSubmatch(row.said); found != nil {
				if n := paraWords(found[1]); n > lead {
					out = append(out, paraOver(row, fmt.Sprintf("A strong lead holds %d words, and this one holds %d. Cut it.", lead, n)))
				}
			}
		}
		for _, match := range paraOutside.FindAllStringIndex(said, -1) {
			out = append(out, scriptMatch{Begin: match[0], End: match[1], Message: "An image and a tag stand outside the markup a paragraph admits. Write a code span, a link, a fence, a table, a list item, a heading or a strong lead."})
		}
		return out
	}, nil
}

// A sentence in a list item past the cap. [[spec/design_output/projection#a-layer-writes-two-files]]
func paraListItem(read Read) (script, error) {
	schema := paraSchemaOf(read)
	most, err := paraNumber(schema.layer("sentence"), "words", "listItem")
	if err != nil {
		return nil, err
	}
	return func(in scriptIn) []scriptMatch {
		out := []scriptMatch{}
		fenced := false
		for _, row := range paraRows(schema.prose, paraFrontless(schema.prose, in.Text)) {
			trimmed := strings.TrimSpace(row.said)
			if strings.HasPrefix(trimmed, "```") {
				fenced = !fenced
				continue
			}
			if fenced || !paraItem.MatchString(row.said) {
				continue
			}
			for _, part := range paraSentenceEnd.Split(paraItemHead.ReplaceAllString(trimmed, ""), -1) {
				if n := paraWords(part); n > most {
					out = append(out, paraOver(row, fmt.Sprintf("A sentence in a list item holds %d words, and this one holds %d. Cut it.", most, n)))
				}
			}
		}
		return out
	}, nil
}

// A sentence holding more code spans than the cap. [[spec/design_output/projection#a-layer-writes-two-files]]
func paraCodeSpans(read Read) (script, error) {
	schema := paraSchemaOf(read)
	most, err := paraNumber(schema.layer("sentence"), "codeSpans")
	if err != nil {
		return nil, err
	}
	return func(in scriptIn) []scriptMatch {
		out := []scriptMatch{}
		fenced := false
		for _, row := range paraRows(schema.prose, paraFrontless(schema.prose, in.Text)) {
			trimmed := strings.TrimSpace(row.said)
			if strings.HasPrefix(trimmed, "```") {
				fenced = !fenced
				continue
			}
			if fenced || strings.HasPrefix(trimmed, "|") || strings.HasPrefix(trimmed, "#") || strings.HasPrefix(trimmed, ">") {
				continue
			}
			for _, part := range paraSentenceEnd.Split(row.said, -1) {
				if seen := len(paraCodeSpan.FindAllStringIndex(part, -1)); seen > most {
					out = append(out, paraOver(row, fmt.Sprintf("A sentence holds %d code spans, and this one holds %d. Carry the rest as a list or a table.", most, seen)))
				}
			}
		}
		return out
	}, nil
}
