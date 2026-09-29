// The holds module: each box's hold file, a loaded projection of files/
// under hold/.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package holds

import "quackitect/src/q"

// The hold files, which .claude/skills/level0/lib/folders.js owns and a module spells again. [[spec/design_output/model#everything-on-disk-mirrors]]
const Glob = ".se/.runtime/hold/*.json"

// [[spec/design_output/model#everything-on-disk-mirrors]]
func Registers(c *q.Catalog) q.Writer {
	return q.ProjectIn(c, "hold", Glob, q.JSON, q.Loaded, q.Ordered{}, q.Doc("a box's hold, keyed by its file"))
}
