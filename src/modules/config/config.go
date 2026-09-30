// The config module: the tracked config and its local layer, each a loaded
// projection of files/ under config/, the contexts and overrides it holds, and
// the value each key resolves off its layers.
// [[spec/design_output/model#the-config-module]]
package config

import (
	"encoding/json"
	"fmt"
	"maps"
	"slices"
	"strings"

	"quackitect/src/q"
)

// The two files the layers stand in. src/config owns the names, and a module spells them again because it imports q alone. [[spec/design_output/config#the-layers]]
const (
	Tracked = "spec/config/level0.json"
	// .claude/skills/level0/lib/folders.js owns this name. [[spec/design_output/config#the-layers]]
	Local = ".se/.runtime/config.json"
)

// The variable the environment layer reads for a key. src/config.EnvOf owns the spelling, and a module spells it again because it imports q alone. [[spec/design_output/config#the-go-reader]]
func EnvOf(key string) string {
	return "SE_" + strings.ToUpper(strings.NewReplacer(".", "_", "-", "_").Replace(key))
}

// The names the module writes past its projections: the contexts and overrides it holds, and the values it resolves. [[spec/design_output/model#the-config-module]]
const (
	HeldName   = "config/held"
	ValuesName = q.ResolvedName
)

// The kinds of a change to config/held. A drop keeps the overrides its holder set, and drops every other. [[spec/design_output/model#a-context-holds-a-lease]]
const (
	Opens     = "open"
	Closes    = "close"
	Overrides = "override"
	Drops     = "drop"
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

// A context config/held keeps: its handle, its holder, the context it nests in, and its values by full key name. [[spec/design_output/model#a-context-holds-a-lease]]
type Context struct {
	Handle string            `json:"handle"`
	Holder string            `json:"holder"`
	Parent string            `json:"parent"`
	Values map[string]string `json:"values"`
}

// The value of config/held: the contexts open, in the order they opened, and the overrides by full key name. Nothing of it reaches the disk. [[spec/design_output/model#a-context-holds-a-lease]]
type Held struct {
	Contexts  []Context         `json:"contexts"`
	Overrides map[string]string `json:"overrides"`
	// The holder of each override, a window, by full key name. [[spec/tickets/config-answers-keys-and-overrides]]
	By map[string]string `json:"by"`
}

// The layers config/values reads: both files, the SE_ variables, the live leases and the held contexts and overrides. [[spec/design_output/model#a-keys-layers]]
type layersIn struct {
	Tracked q.Ordered `q:"config/spec/config/level0.json"`
	// .claude/skills/level0/lib/folders.js owns this name. [[spec/design_output/config#the-layers]]
	Local  q.Ordered         `q:"config/.se/.runtime/config.json"`
	Env    map[string]string `q:"env/<name>,optional"`
	Leases []string          `q:"index/leases,optional"`
	Held   Held              `q:"config/held"`
}

// The two projections, the contexts and overrides it holds, and the values it resolves for every key of the catalog it registers into. [[spec/design_output/model#the-config-module]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join(
		q.ProjectIn(c, "config", Tracked, q.JSON, q.Loaded, q.Ordered{}, q.Also(Local), q.Optional(), q.Doc("a config layer, keyed by its file")),
		q.GuardIn(c, HeldName, Held{}, holds, q.Doc("the contexts open and the overrides set, which a restart drops")),
		q.DerivedIn(c, ValuesName, q.Resolved{}, func(in layersIn) q.Resolved { return resolves(c.Keys(), in) }, q.Doc("the JSON literal each key resolves off its layers, by its full name")),
		q.DerivedIn(c, KeysName, []Row{}, func(in layersIn) []Row { return rowsOf(dottedIn(c.Keys()), in) }, q.Doc("every key, dotted, with the JSON literal it resolves to and the layer answering it")),
		actions(c),
	)
}

// Folds a change into the held contexts and overrides, and refuses an open over a key a live unrelated context holds, naming its holder. [[spec/design_output/model#a-context-holds-a-lease]]
func holds(held Held, change Change) (Held, error) {
	next := held
	switch change.Kind {
	case Opens:
		if holder, key, taken := takenBy(held, change); taken {
			return held, fmt.Errorf("%s holds %s under a live context, so the context %s of %s opens nowhere", holder, key, change.Handle, change.Holder)
		}
		next.Contexts = append(slices.Clone(held.Contexts), Context{Handle: change.Handle, Holder: change.Holder, Parent: change.Parent, Values: change.Values})
	case Closes:
		next.Contexts = slices.DeleteFunc(slices.Clone(held.Contexts), func(one Context) bool { return one.Handle == change.Handle })
	case Overrides:
		next.Overrides, next.By = map[string]string{}, map[string]string{}
		maps.Copy(next.Overrides, held.Overrides)
		maps.Copy(next.Overrides, change.Values)
		maps.Copy(next.By, held.By)
		for name := range change.Values {
			next.By[name] = change.Holder
		}
	case Drops:
		next.Overrides, next.By = map[string]string{}, map[string]string{}
		for name, literal := range held.Overrides {
			if held.By[name] == change.Holder {
				next.Overrides[name], next.By[name] = literal, change.Holder
			}
		}
	default:
		return held, fmt.Errorf("%s takes no change of the kind %q", HeldName, change.Kind)
	}
	return next, nil
}

// The holder and the key of the first live context outside the opener's nesting that sets a key the open sets. [[spec/design_output/model#a-context-holds-a-lease]]
func takenBy(held Held, change Change) (string, string, bool) {
	keys := slices.Sorted(maps.Keys(change.Values))
	for _, one := range held.Contexts {
		if !liveIn(one.Holder, change.Leases) || nests(held, change.Parent, one.Handle) {
			continue
		}
		for _, key := range keys {
			if _, set := one.Values[key]; set {
				return one.Holder, key, true
			}
		}
	}
	return "", "", false
}

// Whether the context outer stands on the parent chain that starts at parent. [[spec/design_output/model#a-context-holds-a-lease]]
func nests(held Held, parent, outer string) bool {
	seen := map[string]bool{}
	for parent != "" && !seen[parent] {
		if parent == outer {
			return true
		}
		seen[parent] = true
		next := ""
		for _, one := range held.Contexts {
			if one.Handle == parent {
				next = one.Parent
			}
		}
		parent = next
	}
	return false
}

// A holder stands live where its part holds a lease, and every holder stands live where the list stands empty, since no manager commits it. [[spec/design_output/model#a-context-holds-a-lease]]
func liveIn(holder string, leases []string) bool {
	return len(leases) == 0 || slices.Contains(leases, holder)
}

// Each key the layers set, by its full name, and no entry where every layer stands empty, so the key reads its built-in value. [[spec/design_output/model#a-keys-layers]]
func resolves(keys []q.Key, in layersIn) q.Resolved {
	out := q.Resolved{}
	for _, key := range keys {
		if literal, _, ok := winning(key, in); ok {
			out[key.Name] = literal
		}
	}
	return out
}

// The layers config/values names beside the two files and the variables. [[spec/design_output/model#a-keys-layers]]
const (
	OverrideLayer = "override"
	ContextLayer  = "context"
)

// The literal and the layer answering a key off both files and the variables, with no context or override open, as the config readers see a tree at rest. [[spec/tickets/cfg-topic-holds-one-resolver]]
func Layered(key q.Key, tracked, local q.Ordered, env map[string]string) (string, string, bool) {
	return winning(key, layersIn{Tracked: tracked, Local: local, Env: env})
}

// The highest layer setting the key, and its name: override, the innermost live context, environment, local file, default file. A shared key reads the default file alone. [[spec/design_output/model#a-keys-layers]]
func winning(key q.Key, in layersIn) (string, string, bool) {
	if key.Shared {
		return fileLayer(Tracked)(filed(in.Tracked, key))
	}
	if literal, ok := in.Held.Overrides[key.Name]; ok {
		return literal, OverrideLayer, true
	}
	if literal, ok := contextual(in.Held.Contexts, in.Leases, key.Name); ok {
		return literal, ContextLayer, true
	}
	if text, ok := in.Env[EnvOf(key.Dotted())]; ok {
		return literalOfText(text), EnvOf(key.Dotted()), true
	}
	if literal, ok := filed(in.Local, key); ok {
		return literal, Local, true
	}
	return fileLayer(Tracked)(filed(in.Tracked, key))
}

// A file's answer, named by its layer where it holds the key. [[spec/design_output/model#a-keys-layers]]
func fileLayer(layer string) func(string, bool) (string, string, bool) {
	return func(literal string, ok bool) (string, string, bool) {
		if !ok {
			return "", "", false
		}
		return literal, layer, true
	}
}

// The value the last opened live context sets for the key, since an inner context opens after the one it nests in. [[spec/design_output/model#a-context-holds-a-lease]]
func contextual(contexts []Context, leases []string, name string) (string, bool) {
	for i := len(contexts) - 1; i >= 0; i-- {
		one := contexts[i]
		if literal, set := one.Values[name]; set && liveIn(one.Holder, leases) {
			return literal, true
		}
	}
	return "", false
}

// A variable's text stands as its JSON literal where it reads as JSON, and as a JSON string otherwise. [[spec/design_output/model#a-keys-layers]]
func literalOfText(text string) string {
	if json.Valid([]byte(text)) {
		return text
	}
	quoted, _ := json.Marshal(text)
	return string(quoted)
}

// The literal a layer file sets for the key, under its instance and then each segment of its key, as src/config reads a dotted key. [[spec/design_output/model#config-comes-off-the-registrations]]
func filed(file q.Ordered, key q.Key) (string, bool) {
	value, ok := file, true
	for _, name := range key.Path() {
		if value, ok = member(value, name); !ok {
			return "", false
		}
	}
	if !value.Object && !value.Array {
		return value.Literal, value.Literal != ""
	}
	body, err := q.JSON.Serialize(value)
	return string(body), err == nil
}

// The member of an object under its name. [[spec/design_output/model#config-comes-off-the-registrations]]
func member(value q.Ordered, name string) (q.Ordered, bool) {
	if !value.Object {
		return q.Ordered{}, false
	}
	for i, key := range value.Keys {
		if key == name {
			return value.Fields[i], true
		}
	}
	return q.Ordered{}, false
}
