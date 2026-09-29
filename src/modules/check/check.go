// The check module: a check/ name per twin of a JavaScript check and its Go
// port, each a list of findings standing empty until the rules move in, and
// the golden files beside it hold what each side reports alone.
// [[spec/tickets/check-names-meet-their-goldens]]
package check

import "quackitect/src/q"

// The prefix every name of this module carries once the wiring loads it as the check instance, which names each port `<instance>/<port>`. [[spec/tickets/check-module-joins-the-wiring]]
const Prefix = "check/"

// Every twin, by the name its check/ name and its golden file carry. src/scripts/check-twins.js spells the list again, since a script imports no Go. [[spec/tickets/check-names-meet-their-goldens]]
var Twins = []string{"tree", "schema", "size", "magic", "names", "paths", "private", "slug", "vale", "biome"}

// One finding a check reports, in the shape the editor draws. [[spec/tickets/check-names-meet-their-goldens]]
type Finding struct {
	File     string `json:"file"`
	Rule     string `json:"rule"`
	Line     int    `json:"line"`
	Column   int    `json:"column"`
	Message  string `json:"message"`
	Severity string `json:"severity"`
}

// The module type the wiring loads as check: a name per twin, each an empty list until a rule answers it. [[spec/tickets/check-names-meet-their-goldens]]
func Registers(c *q.Catalog) q.Writer {
	writers := make([]q.Writer, 0, len(Twins))
	for _, twin := range Twins {
		writers = append(writers, q.OutIn(c, twin, []Finding{}, q.Doc("the findings of the "+twin+" check, which phase 7 moves in")))
	}
	return q.Join(writers...)
}
