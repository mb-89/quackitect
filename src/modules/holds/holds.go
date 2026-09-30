// The holds module: each box's hold file, a loaded projection of files/
// under hold/, and whether an agent at this desk blesses a gate.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package holds

import (
	"encoding/json"

	"quackitect/src/q"
)

// The hold files, which .claude/skills/level0/lib/folders.js owns and a module spells again. [[spec/design_output/model#everything-on-disk-mirrors]]
const Glob = ".se/.runtime/hold/*.json"

// The bless file, which BLESS_FILE in src/scripts/pull-bless.js owns and a module spells again, and the name its word answers at. [[spec/design_output/pull#the-bless]]
const (
	// .claude/skills/level0/lib/folders.js owns this name. [[spec/design_output/pull#the-bless]]
	Bless     = ".se/.runtime/bless.json"
	BlessName = "bless/agent"
)

type blessIn struct {
	// .claude/skills/level0/lib/folders.js owns this name. [[spec/design_output/pull#the-bless]]
	File q.Content `q:"files/.se/.runtime/bless.json"`
}

// [[spec/design_output/model#everything-on-disk-mirrors]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join(
		q.ProjectIn(c, "hold", Glob, q.JSON, q.Loaded, q.Ordered{}, q.Doc("a box's hold, keyed by its file")),
		q.DerivedIn(c, BlessName, false, blesses, q.Doc("whether an agent at this desk blesses a gate, off the bless file the sidebar writes")),
	)
}

// The bless file's agent word, and false where the file stands absent or unread. [[spec/design_output/pull#the-bless]]
func blesses(in blessIn) bool {
	var said struct {
		Agent bool `json:"agent"`
	}
	return json.Unmarshal([]byte(in.File.Text), &said) == nil && said.Agent
}
