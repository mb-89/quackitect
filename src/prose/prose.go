// The prose checks in Go: the past, length and outside vetoes over Vale's
// findings, which src/bridge/prose.js runs on wink while the prose slice
// stands in shadow.
// [[spec/tickets/prose-checks-run-in-go]]
package prose

// The modes a request reads: every veto, or the past veto alone, which the check and the push door take. [[spec/tickets/prose-checks-run-in-go]]
const (
	All  = "all"
	Past = "past"
)

// One Vale finding, in the shape the bridge hands it. [[spec/tickets/prose-checks-run-in-go]]
type Finding struct {
	Rule   string `json:"rule"`
	Line   int    `json:"line"`
	Column int    `json:"column"`
	Said   string `json:"said"`
}

// The word caps the paragraph schema sets on a sentence and a list item. [[spec/tickets/prose-checks-run-in-go]]
type Caps struct {
	Sentence int `json:"sentence"`
	ListItem int `json:"listItem"`
}

// The forms where the lemma the exception list names stands over golem's. [[spec/tickets/prose-checks-run-in-go]]
func Exceptions() map[string]string {
	return nil
}

// The lemma of one word, lower case. [[spec/tickets/prose-checks-run-in-go]]
func Lemma(word string) string {
	return ""
}

// Whether the word reads past in the line: a form that is its own lemma, or its -s or -ing form, reads present. [[spec/design_output/level0#the-tense-reader]]
func ReadsAsPast(line, word string) bool {
	return true
}

// The word count of the longest sentence in the text, a code span and a link counted as one word each. [[spec/design_output/level0#the-tense-reader]]
func Longest(text string) int {
	return 0
}

// The findings the vetoes leave standing, in the order they arrive. [[spec/tickets/prose-checks-run-in-go]]
func Kept(text string, found []Finding, caps Caps, words map[string]bool, mode string) []Finding {
	return found
}
