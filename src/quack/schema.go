// quack schema: spec/config/level0.schema.json off the keys the modules
// declare, with the drawing spec/config/draws.json lays over them. --write
// writes the file, and the bare verb prints it.
// [[spec/tickets/the-config-schema-gets-generated]]
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"

	manager "quackitect/src/modules/index"
	"quackitect/src/q"
)

// The files the verb reads and writes, by their path under the root. [[spec/tickets/the-config-schema-gets-generated]]
const (
	schemaAt = "spec/config/level0.schema.json"
	drawsAt  = "spec/config/draws.json"
	wiringAt = "spec/wiring.yaml"
)

// The catalog of every key the tree declares: the modules the wiring loads, and the manager the root always loads. [[spec/tickets/the-config-schema-gets-generated]]
func catalogOf(root string) (*q.Catalog, error) {
	text, err := os.ReadFile(filepath.Join(root, wiringAt))
	if err != nil {
		return nil, err
	}
	return wiredCatalog(string(text))
}

// The catalog the wiring's text loads, with the manager beside it. [[spec/tickets/the-config-schema-gets-generated]]
func wiredCatalog(text string) (*q.Catalog, error) {
	all, err := q.ReadWiring(text)
	if err != nil {
		return nil, err
	}
	c := q.New()
	manager.Registers(c)
	if _, err := load(all, c); err != nil {
		return nil, err
	}
	return c, nil
}

// The dotted name a file holds a key under: its instance, then its local name. A key no instance loads reads its first segment as its section. [[spec/tickets/the-config-schema-gets-generated]]
func dottedOf(key q.Key) string { return key.Dotted() }

// The draft of the schema the generator writes, which the sidebar and the resolvers read. [[spec/tickets/the-config-schema-gets-generated]]
const schemaDraft = "https://json-schema.org/draft/2020-12/schema"

// One entry of the schema: a key's members, or the entries under it by name. [[spec/tickets/the-config-schema-gets-generated]]
type schemaNode struct {
	entry    q.Ordered
	children map[string]*schemaNode
	drawn    int
}

func (n *schemaNode) under(name string) *schemaNode {
	if n.children == nil {
		n.children = map[string]*schemaNode{}
	}
	if n.children[name] == nil {
		n.children[name] = &schemaNode{entry: q.Ordered{Object: true}}
	}
	return n.children[name]
}

// The schema's text, as the verb writes it: one object a section and one member a key, sections and members in name order, the drawing laid over each entry. [[spec/tickets/the-config-schema-gets-generated]]
func schemaText(root string) ([]byte, error) {
	c, err := catalogOf(root)
	if err != nil {
		return nil, err
	}
	tree := &schemaNode{}
	for _, key := range c.Keys() {
		at := tree
		for _, name := range key.Path() {
			at = at.under(name)
		}
		at.entry = keyEntry(key)
	}
	if err := drawsOver(root, tree); err != nil {
		return nil, err
	}
	schema := q.Ordered{Object: true}
	set(&schema, "$schema", literal(schemaDraft))
	set(&schema, "title", literal("level zero"))
	set(&schema, "type", literal("object"))
	set(&schema, "properties", propertiesOf(tree))
	return q.JSON.Serialize(schema)
}

// A key's members: its JSON type, its built-in value, its help, its unit, its options, and whether the project shares it. [[spec/tickets/the-config-schema-gets-generated]]
func keyEntry(key q.Key) q.Ordered {
	entry := q.Ordered{Object: true}
	set(&entry, "type", literal(key.Type))
	set(&entry, "default", q.Ordered{Literal: key.Default})
	set(&entry, "help", literal(key.Doc))
	if key.Unit != "" {
		set(&entry, "unit", literal(key.Unit))
	}
	if len(key.Enum) > 0 {
		options := q.Ordered{Array: true}
		for _, one := range key.Enum {
			options.Items = append(options.Items, literal(one))
		}
		set(&entry, "enum", options)
	}
	if key.Shared {
		set(&entry, "shared", q.Ordered{Literal: "true"})
	}
	return entry
}

// Lays each member of the drawing over the entry it names, and stands an entry naming no key as the drawing holds it. [[spec/tickets/the-config-schema-gets-generated]]
func drawsOver(root string, tree *schemaNode) error {
	text, err := os.ReadFile(filepath.Join(root, drawsAt))
	if err != nil {
		return err
	}
	draws, err := q.JSON.Parse(text)
	if err != nil {
		return fmt.Errorf("%s: %w", drawsAt, err)
	}
	for i, section := range draws.Keys {
		members := draws.Fields[i]
		tree.under(section).drawn = i + 1
		for j, name := range members.Keys {
			tree.under(section).under(name).drawn = j + 1
			entry := &tree.under(section).under(name).entry
			drawn := members.Fields[j]
			for k, member := range drawn.Keys {
				set(entry, member, drawn.Fields[k])
			}
		}
	}
	return nil
}

// A section stands as an object of its entries: those the drawing names first in its order, since the sidebar draws its groups in the order it meets them, and the rest in name order. [[spec/tickets/the-config-schema-gets-generated]]
func propertiesOf(n *schemaNode) q.Ordered {
	names := make([]string, 0, len(n.children))
	for name := range n.children {
		names = append(names, name)
	}
	sort.Slice(names, func(i, j int) bool {
		a, b := n.children[names[i]].drawn, n.children[names[j]].drawn
		if (a == 0) != (b == 0) {
			return a != 0
		}
		if a != b {
			return a < b
		}
		return names[i] < names[j]
	})
	out := q.Ordered{Object: true}
	for _, name := range names {
		child := n.children[name]
		if child.children == nil {
			set(&out, name, child.entry)
			continue
		}
		section := q.Ordered{Object: true}
		set(&section, "type", literal("object"))
		set(&section, "properties", propertiesOf(child))
		set(&out, name, section)
	}
	return out
}

func set(object *q.Ordered, key string, value q.Ordered) {
	for i, one := range object.Keys {
		if one == key {
			object.Fields[i] = value
			return
		}
	}
	object.Keys = append(object.Keys, key)
	object.Fields = append(object.Fields, value)
}

// A string as its JSON literal, with <, > and & kept as they read. [[spec/tickets/the-config-schema-gets-generated]]
func literal(text string) q.Ordered {
	var out bytes.Buffer
	encoder := json.NewEncoder(&out)
	encoder.SetEscapeHTML(false)
	_ = encoder.Encode(text)
	return q.Ordered{Literal: string(bytes.TrimSpace(out.Bytes()))}
}

// quack schema prints the schema, and quack schema --write writes it. [[spec/tickets/the-config-schema-gets-generated]]
func schemas(root string, write bool) error {
	text, err := schemaText(root)
	if err != nil {
		return err
	}
	if !write {
		_, err := os.Stdout.Write(text)
		return err
	}
	return os.WriteFile(filepath.Join(root, schemaAt), text, 0o644)
}
