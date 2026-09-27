// The config module: the tracked config and its local layer, each a loaded
// projection of files/ under config/.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package config

import "quackitect/src/q"

// The two files the layers stand in. src/config owns the names, and a module spells them again because it imports q alone. [[spec/design_output/config#the-layers]]
const (
	Tracked = "spec/config/level0.json"
	// .claude/skills/level0/lib/folders.js owns this name. [[spec/design_output/config#the-layers]]
	Local = ".se/.runtime/config.json"
)

// [[spec/design_output/model#everything-on-disk-mirrors]]
func Registers(c *q.Catalog) q.Writer {
	return q.ProjectIn(c, "config", Tracked, q.JSON, q.Loaded, q.Ordered{}, q.Also(Local), q.Doc("a config layer, keyed by its file"))
}
