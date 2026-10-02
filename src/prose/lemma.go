// The lemma of one word: the exception list first, then golem's English
// dictionary, then the endings a word the dictionary misses carries.
// [[spec/tickets/prose-checks-run-in-go]]
package prose

import (
	_ "embed"
	"regexp"
	"strings"
	"sync"

	"github.com/aaaton/golem/v4"
	"github.com/aaaton/golem/v4/dicts/en"

	"quackitect/src/yaml"
)

//go:embed lemmas.yml
var lemmasFile string

// The shortest stem an ending leaves, so a short word keeps its letters. [[spec/tickets/prose-checks-run-in-go]]
const shortestStem = 3

// The endings a word the dictionary misses sheds, each with the tails tried in order; the first stem the dictionary holds wins, else the first tail. [[spec/tickets/prose-checks-run-in-go]]
var endings = []struct {
	end string
	to  []string
}{
	{"ies", []string{"y"}},
	{"ied", []string{"y"}},
	{"ing", []string{"", "e", undouble}},
	{"ed", []string{"", "e", undouble}},
	{"es", []string{"", "e"}},
	{"s", []string{""}},
}

// The tail that drops the last letter of a doubled stem, as capped reads cap. [[spec/tickets/prose-checks-run-in-go]]
const undouble = "-"

var (
	loaded   sync.Once
	lemmer   *golem.Lemmatizer
	listed   map[string]string
	letters  = regexp.MustCompile(`^[a-z]+$`)
	keepsEnd = regexp.MustCompile(`(ss|us|is)$`)
)

// The dictionary decodes once, on the first word read. [[spec/tickets/prose-checks-run-in-go]]
func load() {
	loaded.Do(func() {
		listed = map[string]string{}
		forms := yaml.AsDoc(yaml.AsDoc(yaml.Read(lemmasFile)).Get("forms"))
		for _, form := range forms.Keys() {
			listed[strings.ToLower(form)] = strings.ToLower(yaml.AsString(forms.Get(form)))
		}
		lemmer, _ = golem.New(en.New())
	})
}

// The forms where the lemma the exception list names stands over golem's. [[spec/tickets/prose-checks-run-in-go]]
func Exceptions() map[string]string {
	load()
	out := make(map[string]string, len(listed))
	for form, lemma := range listed {
		out[form] = lemma
	}
	return out
}

// The lemma of one word, lower case. [[spec/tickets/prose-checks-run-in-go]]
func Lemma(word string) string {
	load()
	w := strings.ToLower(strings.TrimSpace(word))
	if lemma, held := listed[w]; held {
		return lemma
	}
	if known(w) {
		return strings.ToLower(lemmer.LemmaLower(w))
	}
	return byEndings(w)
}

func known(w string) bool {
	return lemmer != nil && lemmer.InDict(w)
}

// A word the dictionary misses sheds its ending by rule, so an unknown -ed form still reads past. [[spec/tickets/prose-checks-run-in-go]]
func byEndings(w string) string {
	if !letters.MatchString(w) || keepsEnd.MatchString(w) {
		return w
	}
	for _, one := range endings {
		stem, cut := strings.CutSuffix(w, one.end)
		if !cut || len(stem) < shortestStem {
			continue
		}
		first := ""
		for _, tail := range one.to {
			candidate := stem + tail
			if tail == undouble {
				if len(stem) < 2 || stem[len(stem)-1] != stem[len(stem)-2] {
					continue
				}
				candidate = stem[:len(stem)-1]
			}
			if first == "" {
				first = candidate
			}
			if known(candidate) {
				return candidate
			}
		}
		return first
	}
	return w
}
