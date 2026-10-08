// The contract a script rule keeps: a maker reads what it needs once at Load,
// and the script it answers takes the raw text and answers byte offsets.
// [[spec/design_output/rules#a-script-answers-offsets]]
package rules

// One match a script answers: byte offsets into the raw text, the end past the last byte, and a message in place of the rule's where it names one. [[spec/design_output/rules#a-script-answers-offsets]]
type scriptMatch struct {
	Begin, End int
	Message    string
}

// What a script reads: the path the text reads as, and the raw text. [[spec/design_output/rules#a-script-answers-offsets]]
type scriptIn struct {
	Path string
	Text string
}

// One script rule over one file. [[spec/design_output/rules#a-script-answers-offsets]]
type script func(in scriptIn) []scriptMatch

// Builds a script rule off the texts it reads past the file, once at Load. [[spec/design_output/rules#a-script-answers-offsets]]
type scriptMaker func(read Read) (script, error)

// The makers of every script rule, keyed by check id, off both halves. [[spec/design_output/rules#a-script-answers-offsets]]
func scriptMakers() map[string]scriptMaker {
	out := map[string]scriptMaker{}
	for _, half := range []map[string]scriptMaker{paragraphScripts, voiceScripts} {
		for check, maker := range half {
			out[check] = maker
		}
	}
	return out
}
