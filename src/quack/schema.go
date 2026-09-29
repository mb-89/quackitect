// quack schema: spec/config/level0.schema.json off the keys the modules
// declare, with the drawing spec/config/draws.json lays over them. --write
// writes the file, and the bare verb prints it.
// [[spec/tickets/the-config-schema-gets-generated]]
package main

import (
	"os"
	"path/filepath"
	"strings"

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
	all, err := q.ReadWiring(string(text))
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
func dottedOf(key q.Key) string {
	local := strings.ReplaceAll(key.Local, "/", ".")
	if key.Instance == "" {
		return local
	}
	return key.Instance + "." + local
}

// The schema's text, as the verb writes it. [[spec/tickets/the-config-schema-gets-generated]]
func schemaText(root string) ([]byte, error) {
	return nil, nil
}
