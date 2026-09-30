// The write door's pure reads: the refusal a harness write naming no ticket
// meets, and the file an edit leaves, off onToolWrite in src/bridge/write.js.
// [[spec/tickets/cage-write-door-port]]
package write

// The handover, the one path inside the tree a harness write reaches past the no-ticket refusal. .claude/skills/level0/lib/folders.js owns it. [[spec/design_output/level0#a-write-names-its-ticket]]
const Handover = ".se/HANDOVER.md"

// One finding the voice keeps over a written file, as Vale answers it. [[spec/tickets/cage-write-door-port]]
type Finding struct {
	Rule     string `json:"rule"`
	Line     int    `json:"line"`
	Column   int    `json:"column"`
	Said     string `json:"said"`
	Message  string `json:"message"`
	Severity string `json:"severity"`
}

// The refusal a harness write tool meets, since it carries no ticket field. [[spec/design_output/level0#a-write-names-its-ticket]]
func ToolRefusal(tool string) string {
	return ""
}

// The file as it stands after the write: a Write's content, or each edit applied over the text on disk. [[spec/design_output/level0#the-write-door]]
func WholeAfter(e map[string]any, was string, stands bool) string {
	return ""
}
