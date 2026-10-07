// The VoiceParagraph vocabulary script: the word lists and the stems table it
// reads, and a word outside them, naming the swap where one stands.
// [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
package rules

import (
	"regexp"
	"sort"
	"strings"

	"quackitect/src/prose"
	"quackitect/src/yaml"
)

// The lists the rule reads, the endings a stem cuts, and the edges the rule keeps. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
const (
	paraCorePath   = "spec/vocabulary/core.yml"
	paraTermsPath  = "spec/vocabulary/terms.yml"
	paraSwapsPath  = "spec/vocabulary/swaps.yml"
	paraStemsPath  = "spec/config/stems.yaml"
	paraNone       = "none"
	paraDrop       = "drop"
	paraShortest   = 3
	paraPrefixRest = 2
)

// The patterns of the word scan and the list rows. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
var (
	paraWord     = regexp.MustCompile(`[A-Za-z][A-Za-z0-9'’-]*`)
	paraDigit    = regexp.MustCompile(`[0-9_]`)
	paraSpaces   = regexp.MustCompile(`\s+`)
	paraListWord = regexp.MustCompile(`^[a-z][a-z-]*( [a-z][a-z-]*)*$`)
	paraFlowRow  = regexp.MustCompile(`^\s*-\s*\{(.*)\}\s*$`)
)

// The path a vocabulary key names, else its fallback, as pathsOf in vocabulary.js reads it. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func paraPathAt(layer *yaml.Doc, key, fallback string) string {
	if held, isText := layer.Get(key).(string); isText && strings.TrimSpace(held) != "" {
		return strings.TrimSpace(held)
	}
	return fallback
}

// The swaps the rule reads, as the Tengo splits its road list: each pair joined by a space, split on white space, and a piece holding one equals sign kept. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func paraSwaps(text string) map[string]string {
	first := map[string]string{}
	for _, line := range strings.Split(text, "\n") {
		found := paraFlowRow.FindStringSubmatch(line)
		if found == nil {
			continue
		}
		row := map[string]string{}
		for _, field := range strings.Split(found[1], ",") {
			if key, value, held := strings.Cut(field, ":"); held {
				row[strings.TrimSpace(key)] = strings.ToLower(strings.Trim(strings.TrimSpace(value), `"'`))
			}
		}
		word, write := strings.TrimSpace(row["word"]), strings.TrimSpace(row["write"])
		if _, taken := first[word]; !paraListWord.MatchString(word) || write == "" || taken {
			continue
		}
		first[word] = write
	}
	roads := []string{}
	for word, write := range first {
		roads = append(roads, word+"="+write)
	}
	sort.Strings(roads)
	out := map[string]string{}
	for _, one := range paraSpaces.Split(strings.Join(roads, " "), -1) {
		if pair := strings.Split(one, "="); len(pair) == 2 {
			out[pair[0]] = pair[1]
		}
	}
	return out
}

// One row of the stems table: an ending, what takes its place, and whether the stem stays long. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
type paraEnding struct {
	end  string
	to   []string
	long bool
}

// The endings and the prefixes of the stems table, as stemsOf in vocabulary.js reads them. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func paraStems(text string) ([]paraEnding, []string) {
	said := yaml.AsDoc(yaml.Read(text))
	lower := func(one any) string { return strings.ToLower(strings.TrimSpace(yaml.AsString(one))) }
	endings := []paraEnding{}
	for _, one := range yaml.AsList(said.Get("endings")) {
		row := yaml.AsDoc(one)
		if row == nil {
			continue
		}
		ending := paraEnding{end: lower(row.Get("end")), long: row.Get("long") == true}
		if list, isList := row.Get("to").([]any); isList {
			for _, to := range list {
				if to := lower(to); to != "" {
					ending.to = append(ending.to, to)
				}
			}
		}
		if ending.end != "" && len(ending.to) > 0 {
			endings = append(endings, ending)
		}
	}
	prefixes := []string{}
	if list, isList := said.Get("prefixes").([]any); isList {
		for _, one := range list {
			if pre := lower(one); pre != "" {
				prefixes = append(prefixes, pre)
			}
		}
	}
	return endings, prefixes
}

// A word the lists hold, itself or through a row of the endings. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func paraListed(inside map[string]bool, endings []paraEnding, w string) bool {
	if inside[w] {
		return true
	}
	n := len(w)
	for _, row := range endings {
		over := len(row.end)
		if row.long {
			over++
		}
		if n <= over || !strings.HasSuffix(w, row.end) {
			continue
		}
		for _, to := range row.to {
			cut, add := len(row.end), to
			if to == paraDrop {
				cut++
			}
			if to == paraDrop || to == paraNone {
				add = ""
			}
			if inside[w[:n-cut]+add] {
				return true
			}
		}
	}
	return false
}

// Whether the word at an offset opens a sentence: nothing but space stands between it and a closing mark or the start. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func paraOpensAt(said string, at int) bool {
	for i := at - 1; i >= 0; i-- {
		switch said[i] {
		case ' ', '\t', '\n':
			continue
		case '.', '!', '?', ':', ';':
			return true
		}
		return false
	}
	return true
}

// A word outside the core, the terms and their stems, naming the swap where one stands. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func paraVocabulary(read Read) (script, error) {
	schema := paraSchemaOf(read)
	layer := schema.layer("vocabulary")
	inside := prose.Words(read(paraPathAt(layer, "core", paraCorePath)), read(paraPathAt(layer, "terms", paraTermsPath)), read(paraPathAt(layer, "swaps", paraSwapsPath)))
	swaps := paraSwaps(read(paraPathAt(layer, "swaps", paraSwapsPath)))
	endings, prefixes := paraStems(read(paraPathAt(layer, "endings", paraStemsPath)))
	where := strings.TrimSpace(yaml.AsString(layer.Get("terms")))
	if where == "" {
		where = paraTermsPath
	}
	known := func(w string) bool {
		if paraListed(inside, endings, w) {
			return true
		}
		for _, pre := range prefixes {
			if len(w) > len(pre)+paraPrefixRest && strings.HasPrefix(w, pre) && paraListed(inside, endings, w[len(pre):]) {
				return true
			}
		}
		return false
	}
	left := paraLeft(layer)
	return func(in scriptIn) []scriptMatch {
		said := paraBare(schema.prose, left, in.Text)
		out := []scriptMatch{}
		for _, match := range paraWord.FindAllStringIndex(said, -1) {
			w := said[match[0]:match[1]]
			if paraDigit.MatchString(w) || len(w) == 1 {
				continue
			}
			if head := w[:1]; head != strings.ToLower(head) && !paraOpensAt(said, match[0]) {
				continue
			}
			low := strings.TrimSuffix(strings.TrimSuffix(strings.ToLower(w), "'s"), "’s")
			if strings.ContainsAny(low, "'’") {
				continue
			}
			bad := ""
			for _, part := range strings.Split(low, "-") {
				if p := strings.TrimSpace(part); len(p) >= paraShortest && !known(p) {
					bad = p
					break
				}
			}
			if bad == "" {
				continue
			}
			say := bad + " stands outside the words this tree writes. "
			if road, held := swaps[bad]; held {
				say += "Write " + road + " instead."
			} else {
				say += "Write a core word, or add " + bad + " to " + where + " with one line that says what it means."
			}
			out = append(out, scriptMatch{Begin: match[0], End: match[1], Message: say})
		}
		return out
	}, nil
}
