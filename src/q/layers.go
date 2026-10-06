// The layers a config key reads at rest, with no context or override open: the
// variable, the local file, the tracked file, and the schema's built-in. Every
// Go reader of a key resolves it here.
// [[spec/design_output/model#a-keys-layers]]
package q

import (
	"encoding/json"
	"strings"
)

// The files the layers stand in, and the layer a key no file sets reads. .claude/skills/level0/lib/folders.js owns the local name. [[spec/design_output/config#the-layers]]
const (
	TrackedConfig = "spec/config/level0.json"
	LocalConfig   = ".se/.runtime/config.json"
	SchemaConfig  = "spec/config/level0.schema.json"
	BuiltInLayer  = "built-in"
)

// The variable the environment layer reads for a dotted key. [[spec/design_output/config#the-go-reader]]
func EnvOf(dotted string) string {
	return "SE_" + strings.ToUpper(strings.NewReplacer(".", "_", "-", "_").Replace(dotted))
}

// A dotted key as the catalog names it: its first segment the instance, the rest its local name. [[spec/design_output/model#config-comes-off-the-registrations]]
func KeyOfDotted(dotted string) Key {
	instance, rest, _ := strings.Cut(dotted, ".")
	segments := strings.Split(rest, ".")
	for i, one := range segments {
		segments[i] = Kebab(one)
	}
	local := strings.Join(segments, "/")
	return Key{Name: instance + "/config/" + local, Instance: instance, Local: local}
}

// The literal and the layer answering a key at rest: the variable, then the local file, then the tracked file. A shared key reads the tracked file alone, and a blank variable stands unset. [[spec/design_output/model#a-keys-layers]]
func AtRest(key Key, tracked, local Ordered, env map[string]string) (string, string, bool) {
	if !key.Shared {
		name := EnvOf(key.Dotted())
		if text := strings.TrimSpace(env[name]); text != "" {
			return LiteralOfText(text), name, true
		}
		if literal, ok := Filed(local, key); ok {
			return literal, LocalConfig, true
		}
	}
	if literal, ok := Filed(tracked, key); ok {
		return literal, TrackedConfig, true
	}
	return "", "", false
}

// AtRest over a dotted key, where the schema says whether the key is shared and answers its built-in where no layer sets it. [[spec/design_output/config#the-go-reader]]
func Settled(dotted string, schema, tracked, local Ordered, env map[string]string) (string, string, bool) {
	key := KeyOfDotted(dotted)
	entry, declared := schemaEntry(schema, key)
	if shared, ok := member(entry, "shared"); declared && ok {
		key.Shared = shared.Literal == "true"
	}
	if literal, layer, ok := AtRest(key, tracked, local, env); ok {
		return literal, layer, true
	}
	if def, ok := member(entry, "default"); declared && ok {
		if literal, ok := literalOf(def); ok {
			return literal, BuiltInLayer, true
		}
	}
	return "", "", false
}

// The entry a schema holds for a key, under the properties of each segment of its path. [[spec/tickets/the-config-schema-gets-generated]]
func schemaEntry(schema Ordered, key Key) (Ordered, bool) {
	here := schema
	for _, name := range key.Path() {
		properties, ok := member(here, "properties")
		if !ok {
			return Ordered{}, false
		}
		if here, ok = member(properties, name); !ok {
			return Ordered{}, false
		}
	}
	return here, true
}

// A variable's text stands as its JSON literal where it reads as JSON, and as a JSON string otherwise. [[spec/design_output/model#a-keys-layers]]
func LiteralOfText(text string) string {
	if json.Valid([]byte(text)) {
		return text
	}
	quoted, _ := json.Marshal(text)
	return string(quoted)
}

// The literal a layer file sets for the key, under its instance and then each segment of its key. [[spec/design_output/model#config-comes-off-the-registrations]]
func Filed(file Ordered, key Key) (string, bool) {
	value, ok := file, true
	for _, name := range key.Path() {
		if value, ok = member(value, name); !ok {
			return "", false
		}
	}
	return literalOf(value)
}

// A value as one JSON literal: a scalar as it reads, an object or a list serialized. [[spec/design_output/model#everything-on-disk-mirrors]]
func literalOf(value Ordered) (string, bool) {
	if !value.Object && !value.Array {
		return value.Literal, value.Literal != ""
	}
	body, err := JSON.Serialize(value)
	return string(body), err == nil
}

// The member of an object under its name. [[spec/design_output/model#config-comes-off-the-registrations]]
func member(value Ordered, name string) (Ordered, bool) {
	if !value.Object {
		return Ordered{}, false
	}
	for i, key := range value.Keys {
		if key == name {
			return value.Fields[i], true
		}
	}
	return Ordered{}, false
}
