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
)

// The two files the layers stand in, the local one owned by .claude/skills/level0/lib/folders.js and spelled again here because a Go module imports no JavaScript. [[spec/design_output/config#the-layers]]
const (
	Tracked = "spec/config/level0.json"
	Local   = ".se/.runtime/config.json" // .claude/skills/level0/lib/folders.js owns this name
)

// [[spec/design_output/config#the-go-reader]]
func EnvOf(key string) string {
	said := strings.ToUpper(strings.NewReplacer(".", "_", "-", "_").Replace(key))
	return "SE_" + said
}

// The local file beats the environment, and the environment beats the tracked one. [[spec/design_output/config#the-resolver-holds-the-layers]]
func Value(root, key string) (any, bool) {
	out, _, held := Where(root, key)
	return out, held
}

// The value and the layer answering it: a file's path, or the variable's name. [[spec/tickets/cfg-topic-holds-one-resolver]]
func Where(root, key string) (any, string, bool) {
	var out any
	layer := ""
	if said, found := valueIn(read(root, Tracked), key); found {
		out, layer = said, Tracked
	}
	if said := strings.TrimSpace(envOf(EnvOf(key))); said != "" {
		out, layer = said, EnvOf(key)
	}
	if said, found := valueIn(read(root, Local), key); found {
		out, layer = said, Local
	}
	return out, layer, layer != ""
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
