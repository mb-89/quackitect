// The grammar rules a paragraph schema's grammar layer writes: the tenses,
// the modals, the hedges, the contractions and the Latin short forms.
// A port of the grammar half of paragraph.js.
// [[spec/design_output/projection#the-grammar-rules]] [[spec/tickets/config-verbs-port-to-go]]
package projection

import "strings"

// The value a layer names a form it refuses by. [[spec/design_output/projection#the-grammar-rules]]
const refusedForm = "refused"

// The heads an auxiliary chain opens with. [[spec/design_output/projection#the-grammar-rules]]
var (
	perfect = []string{"have", "has", "had"}
	being   = []string{"am", "are", "is", "was", "were", "be", "been", "being"}
	modals  = []string{"can", "could", "may", "might", "must", "ought", "shall", "should", "will", "would"}
)

// The contractions and the words they stand for. [[spec/design_output/projection#the-grammar-rules]]
var contractions = [][2]string{
	{"(c)an't", "$1annot"},
	{"(w)on't", "$1ill not"},
	{"(d)on't", "$1o not"},
	{"(d)oesn't", "$1oes not"},
	{"(d)idn't", "$1id not"},
	{"(i)sn't", "$1s not"},
	{"(a)ren't", "$1re not"},
	{"(w)asn't", "$1as not"},
	{"(h)asn't", "$1as not"},
	{"(h)aven't", "$1ave not"},
	{"(i)t's", "$1t is"},
	{"(t)hat's", "$1hat is"},
	{"(t)here's", "$1here is"},
	{"(y)ou're", "$1ou are"},
	{"(t)hey're", "$1hey are"},
	{"(w)e've", "$1e have"},
	{"(i)'ve", "$1 have"},
	{"(w)e'll", "$1e will"},
	{"(i)t'll", "$1t will"},
}

// The Latin short forms and what to write. [[spec/design_output/projection#the-grammar-rules]]
var latin = [][2]string{
	{"\\be\\.g\\.", "for example"},
	{"\\bE\\.g\\.", "For example"},
	{"\\bi\\.e\\.", "that is"},
	{"\\bI\\.e\\.", "That is"},
	{"\\bviz\\.", "namely"},
	{"\\bViz\\.", "Namely"},
	{"\\bcf\\.", "compare"},
	{"\\bCf\\.", "Compare"},
}

// The et cetera forms and what to write. [[spec/design_output/projection#the-grammar-rules]]
var etCetera = [][2]string{
	{"\\betc\\.", "and so on"},
	{"\\bEtc\\.", "And so on"},
}

// The rule files a grammar layer writes. [[spec/design_output/projection#the-grammar-rules]]
func grammar(layer *Object) []named {
	out := []named{}
	left := []string{}
	for _, one := range listOf(layer.Get("exceptions")) {
		word := dig(one, "word")
		if absent(word) {
			word = one
		}
		left = append(left, jsString(word))
	}
	left = sorted(left)

	if layer.Get("auxiliaryChains") == refusedForm {
		out = append(out,
			named{"Auxiliary.yml", sequenced("Write the simple tense and name the time: '%s %s'.", perfect, "VBN", left)},
			named{"Progressive.yml", sequenced("Write the simple tense: '%s %s'.", being, "VBG", left)},
		)
	}
	if said, held := modal(layer); held {
		out = append(out, named{"Modal.yml", said})
	}
	if said, held := hedge(layer); held {
		out = append(out, named{"Hedge.yml", said})
	}
	if layer.Get("contractions") == refusedForm {
		out = append(out, named{"Contraction.yml", swapped("Write both words: '%s' instead of '%s'.", contractions, swapHow{ignorecase: true, replace: true})})
	}
	if layer.Get("latinShortForms") == refusedForm {
		out = append(out,
			named{"Latin.yml", swapped("Write it out: '%s' instead of '%s'.", latin, swapHow{nonword: true, replace: true})},
			named{"EtCetera.yml", swapped("Write it out: '%s' instead of '%s', and keep the full stop the sentence needs.", etCetera, swapHow{nonword: true})},
		)
	}
	for _, one := range listOf(layer.Get("tenses")) {
		if strings.Contains(jsString(one), "past") {
			out = append(out, named{"PastTense.yml", pastTense(left)})
			break
		}
	}
	return out
}

// The rule refusing the simple past. [[spec/design_output/projection#the-grammar-rules]]
func pastTense(left []string) string {
	lines := []string{
		"extends: sequence",
		"message: " + quoted("Write the present tense: '%s'. The past belongs in spec/rationales."),
		"link: " + ruleLink,
		"level: error",
		"ignorecase: true",
	}
	lines = append(lines, exceptionLines(left)...)
	return strings.Join(append(lines, "tokens:", "  - tag: VBD", ""), "\n")
}

// The rule refusing every modal a register leaves out, or none where it holds them all. [[spec/design_output/projection#the-grammar-rules]]
func modal(layer *Object) (string, bool) {
	held := map[string]bool{}
	names := []string{}
	for _, one := range listOf(layer.Get("modals")) {
		if said := jsString(one); !held[said] {
			held[said] = true
			names = append(names, said)
		}
	}
	refused := []string{}
	for _, one := range modals {
		if !held[one] {
			refused = append(refused, one)
		}
	}
	if len(refused) == 0 {
		return "", false
	}
	lines := []string{
		"extends: existence",
		"message: " + quoted("This register holds the modals "+strings.Join(names, ", ")+". Say what is, or name the one that binds."),
		"link: " + ruleLink,
		"level: error",
		"ignorecase: true",
		"tokens:",
	}
	for _, one := range refused {
		lines = append(lines, "  - '\\b"+one+"\\b'")
	}
	return strings.Join(append(lines, ""), "\n"), true
}

// The rule cutting a hedge, or none where the layer names no hedge. [[spec/design_output/projection#the-grammar-rules]]
func hedge(layer *Object) (string, bool) {
	hedges := []string{}
	for _, one := range listOf(layer.Get("hedges")) {
		if said := jsTrim(jsString(one)); said != "" {
			hedges = append(hedges, said)
		}
	}
	if len(hedges) == 0 {
		return "", false
	}
	lines := []string{
		"extends: existence",
		"message: " + quoted("Cut the hedge '%s'. Say the thing, or name the measure."),
		"link: " + ruleLink,
		"level: error",
		"ignorecase: true",
		"tokens:",
	}
	for _, one := range hedges {
		lines = append(lines, "  - '\\b"+strings.Join(strings.Split(one, " "), "\\s+")+"\\b'")
	}
	return strings.Join(append(lines, ""), "\n"), true
}
