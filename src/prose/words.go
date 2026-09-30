// The domain words: the core and the terms, less every swapped word, read the
// way wordsOf in .claude/skills/level0/lib/vocabulary.js reads them.
// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
package prose

import (
	"regexp"
	"strings"
)

var (
	flowRow  = regexp.MustCompile(`^\s*-\s*\{(.*)\}\s*$`)
	wordForm = regexp.MustCompile(`^[a-z][a-z-]*( [a-z][a-z-]*)*$`)
	wordPart = regexp.MustCompile(`[ -]`)
)

// The domain words off the texts of the core, the terms and the swaps. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func Words(core, terms, swaps string) map[string]bool {
	swapped := map[string]bool{}
	for _, row := range rowsOf(swaps) {
		if word := strings.ToLower(row["word"]); wordForm.MatchString(word) && row["write"] != "" {
			swapped[word] = true
		}
	}
	out := map[string]bool{}
	for _, text := range []string{core, terms} {
		for _, row := range rowsOf(text) {
			word := strings.ToLower(row["word"])
			if !wordForm.MatchString(word) {
				continue
			}
			for _, part := range wordPart.Split(word, -1) {
				if part != "" && !swapped[part] {
					out[part] = true
				}
			}
		}
	}
	return out
}

// Every flow row of a list file, as its fields. The lists write one row a line. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func rowsOf(text string) []map[string]string {
	out := []map[string]string{}
	for _, line := range strings.Split(text, "\n") {
		found := flowRow.FindStringSubmatch(line)
		if found == nil {
			continue
		}
		row := map[string]string{}
		for _, field := range fieldsOf(found[1]) {
			key, value, held := strings.Cut(field, ":")
			if held {
				row[strings.TrimSpace(key)] = unquoted(value)
			}
		}
		out = append(out, row)
	}
	return out
}

// The fields of a flow row, split on each comma outside a quote. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func fieldsOf(said string) []string {
	var out []string
	quote, from := rune(0), 0
	for at, one := range said {
		switch {
		case quote != 0 && one == quote:
			quote = 0
		case quote == 0 && (one == '"' || one == '\''):
			quote = one
		case quote == 0 && one == ',':
			out = append(out, said[from:at])
			from = at + 1
		}
	}
	return append(out, said[from:])
}

func unquoted(said string) string {
	bare := strings.TrimSpace(said)
	if len(bare) > 1 && (bare[0] == '"' || bare[0] == '\'') && bare[len(bare)-1] == bare[0] {
		return bare[1 : len(bare)-1]
	}
	return bare
}
