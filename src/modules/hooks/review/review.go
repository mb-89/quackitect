// Package review frames a review: the reader's prompt, the reading of its
// answer, and the report, off .claude/skills/level0/lib/review.js. It answers
// nothing until the change lands.
// [[spec/tickets/review-spawns-off-the-door]]
package review

// What the branch verb gathers for a reader, as `branch review --json` prints it. [[spec/design_output/review#the-tool-the-session-calls]]
type Material struct {
	Branch   string `json:"branch"`
	Ask      string `json:"ask"`
	Handback string `json:"handback"`
	Stat     string `json:"stat"`
	Diff     string `json:"diff"`
	Check    Check  `json:"check"`
	Retro    bool   `json:"retro"`
}

// The check on the branch: whether it passes, its exit code where one stands, and what it says. [[spec/design_output/review#what-the-report-looks-like]]
type Check struct {
	OK   bool   `json:"ok"`
	Code *int   `json:"code"`
	Says string `json:"says"`
}

// What the reader answers: the fixes it counts, a line for each question, and its text where it reads as no JSON. [[spec/design_output/review#what-the-reader-answers]]
type Read struct {
	Fix    int    `json:"fix"`
	Ask    string `json:"ask"`
	Beyond string `json:"beyond"`
	Tests  string `json:"tests"`
	Unread string `json:"unread,omitempty"`
}

// The reader's prompt over the material and the rules of the tree. [[spec/design_output/review#the-tool-the-session-calls]]
func ReaderAsks(material Material, rules string) string {
	return ""
}

// The reading of the reader's answer. [[spec/design_output/review#what-the-reader-answers]]
func ReaderSays(text string) Read {
	return Read{}
}

// The reading of an answered event: a refused spawn, a failed reader, or the reader's answer. [[spec/design_output/review#what-the-report-looks-like]]
func ReadOf(deny string, failed bool, text string) Read {
	return Read{}
}

// The report the session reads. [[spec/design_output/review#what-the-report-looks-like]]
func Report(material Material, read Read) string {
	return ""
}
