// The body a voice refusal frames: each finding's place, rule, the text it
// wrote, its line and message, then the Hold line. The write door and the
// draft checks each open it their own way. A stub until tests-green.
// [[spec/tickets/prose-tools-answer-in-go]]
package prose

// One finding a voice refusal names: where it stands, its rule and message, the text it wrote, cut by the caller, and the line it stands in, where the caller hands one. Vale's own row stands as Finding in prose.go. [[spec/tickets/prose-tools-answer-in-go]]
type Refused struct {
	Line    int
	Column  int
	Rule    string
	Message string
	Said    string
	Context string
}

// [[spec/tickets/prose-tools-answer-in-go]]
func Body(where string, found []Refused) string {
	return ""
}
