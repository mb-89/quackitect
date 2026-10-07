// The config a Go program reads. One reader answers a key over every
// layer, and answers the map a named file holds at a key.
// [[spec/design_output/config#the-go-reader]]
package config

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"strconv"
	"strings"

	"quackitect/src/q"
)

// The two files the layers stand in, the schema whose default answers a key no file sets, and that layer's name. q owns them. [[spec/design_output/config#the-layers]]
const (
	Tracked = q.TrackedConfig
	Local   = q.LocalConfig
	Schema  = q.SchemaConfig
	BuiltIn = q.BuiltInLayer
)

// The modes the local layer's folder and file take, and the indent its JSON writes. [[spec/tickets/cage-hold-drops-port]]
const (
	folderMode = 0o755
	fileMode   = 0o644
	indent     = "  "
)

// Writes one key into the local layer under the work root and keeps every other key it holds, as writes in src/bridge/config.js does. It makes the layer's whole folder where none stands. [[spec/tickets/cage-hold-drops-port]]
func Drop(root, key, value string) error {
	at := filepath.Join(root, filepath.FromSlash(Local))
	held := read(root, Local)
	if held == nil {
		held = map[string]any{}
	}
	parts := strings.Split(key, ".")
	here := held
	for _, part := range parts[:len(parts)-1] {
		next, ok := here[part].(map[string]any)
		if !ok {
			next = map[string]any{}
			here[part] = next
		}
		here = next
	}
	here[parts[len(parts)-1]] = value
	body, err := json.MarshalIndent(held, "", indent)
	if err != nil {
		return err
	}
	if err := makeDir(filepath.Dir(at), folderMode); err != nil {
		return err
	}
	return writeFile(at, append(body, '\n'), fileMode)
}

// [[spec/design_output/config#the-go-reader]]
func EnvOf(key string) string { return q.EnvOf(key) }

// The value a key resolves to at rest, in the order q.AtRest holds. [[spec/design_output/model#a-keys-layers]]
func Value(root, key string) (any, bool) {
	out, _, held := Where(root, key)
	return out, held
}

// The value and the layer answering it: a file's path, or the variable's name. [[spec/tickets/cfg-topic-holds-one-resolver]]
func Where(root, key string) (any, string, bool) {
	env := map[string]string{EnvOf(key): envOf(EnvOf(key))}
	literal, layer, held := q.Settled(key, ordered(root, Schema), ordered(root, Tracked), ordered(root, Local), env)
	if !held {
		return nil, "", false
	}
	var out any
	if err := json.Unmarshal([]byte(literal), &out); err != nil {
		return nil, "", false
	}
	return out, layer, true
}

// A key's built-in, the schema's default, read off no other layer, for a reader whose config door answers nothing. [[spec/tickets/stale-span-reads-schema-unset]]
func Default(root, key string) (any, bool) {
	return defaultIn(read(root, Schema), key)
}

// The map a named file holds at a key, read off that file and no layer. [[spec/design_output/config#the-go-reader]]
func Map(root, path, key string) map[string]string {
	said, found := valueIn(read(root, path), key)
	if !found {
		return map[string]string{}
	}
	held, ok := said.(map[string]any)
	if !ok {
		return map[string]string{}
	}
	out := make(map[string]string, len(held))
	for name, one := range held {
		out[name] = stringOf(one)
	}
	return out
}

// The list a named file holds at a key, in the order the file writes it. [[spec/design_output/config#the-go-reader]]
func List(root, path, key string) []string {
	said, found := valueIn(read(root, path), key)
	if !found {
		return []string{}
	}
	held, ok := said.([]any)
	if !ok {
		return []string{}
	}
	out := make([]string, 0, len(held))
	for _, one := range held {
		out = append(out, stringOf(one))
	}
	return out
}

func stringOf(one any) string {
	if text, ok := one.(string); ok {
		return text
	}
	return fmt.Sprint(one)
}

// A count the reader answers, or zero where the key stands nowhere. [[spec/design_output/config#the-go-reader]]
func Count(root, key string) int {
	said, held := Value(root, key)
	if !held {
		return 0
	}
	switch one := said.(type) {
	case float64:
		return int(one)
	case string:
		if whole, err := strconv.Atoi(strings.TrimSpace(one)); err == nil {
			return whole
		}
	}
	return 0
}

func read(root, path string) map[string]any {
	held, err := readFile(filepath.Join(root, filepath.FromSlash(path)))
	if err != nil {
		return nil
	}
	var said map[string]any
	if err := json.Unmarshal(held, &said); err != nil {
		return nil
	}
	return said
}

// A layer file as q reads it, or the empty value where it stands nowhere or holds no JSON. [[spec/design_output/config#the-go-reader]]
func ordered(root, path string) q.Ordered {
	body, err := readFile(filepath.Join(root, filepath.FromSlash(path)))
	if err != nil {
		return q.Ordered{}
	}
	out, err := q.JSON.Parse(body)
	if err != nil {
		return q.Ordered{}
	}
	return out
}

// The default a schema names for a dotted key, under each segment's properties. [[spec/tickets/the-config-schema-gets-generated]]
func defaultIn(schema map[string]any, key string) (any, bool) {
	var here any = schema
	for _, part := range strings.Split(key, ".") {
		step, _ := here.(map[string]any)
		properties, _ := step["properties"].(map[string]any)
		if here = properties[part]; here == nil {
			return nil, false
		}
	}
	entry, _ := here.(map[string]any)
	said, ok := entry["default"]
	return said, ok
}

func valueIn(said map[string]any, key string) (any, bool) {
	if said == nil {
		return nil, false
	}
	parts := strings.Split(key, ".")
	var here any = said
	for _, part := range parts {
		step, ok := here.(map[string]any)
		if !ok {
			return nil, false
		}
		here, ok = step[part]
		if !ok {
			return nil, false
		}
	}
	return here, true
}
