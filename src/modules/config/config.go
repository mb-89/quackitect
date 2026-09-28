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

// The names the module writes past its projections: the contexts and overrides it holds, and the values it resolves. [[spec/design_output/model#the-config-module]]
const (
	HeldName   = "config/held"
	ValuesName = "config/values"
)

// The kinds of a change to config/held. [[spec/design_output/model#a-context-holds-a-lease]]
const (
	Opens     = "open"
	Closes    = "close"
	Overrides = "override"
)

// A change config/held folds: a context opening under its holder's lease, a context closing, or an override. Values map a full key name to its JSON literal, and Leases carry the parts the opener read live. [[spec/design_output/model#a-context-holds-a-lease]]
type Change struct {
	Kind   string            `json:"kind"`
	Handle string            `json:"handle"`
	Holder string            `json:"holder"`
	Parent string            `json:"parent"`
	Values map[string]string `json:"values"`
	Leases []string          `json:"leases"`
}

// [[spec/design_output/model#everything-on-disk-mirrors]]
func Registers(c *q.Catalog) q.Writer {
	return q.ProjectIn(c, "config", Tracked, q.JSON, q.Loaded, q.Ordered{}, q.Also(Local), q.Doc("a config layer, keyed by its file"))
}
