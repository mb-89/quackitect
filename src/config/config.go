// The config a Go program reads. One reader answers a key over the three
// layers, and answers the map a named file holds at a key.
// [[spec/design_output/config#a-go-program-reads-the-config]]
package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// The two files the layers stand in, the local one owned by .claude/skills/level0/lib/folders.js and spelled again here because a Go module imports no JavaScript. [[spec/design_output/config#the-three-layers]]
const (
	Tracked = "spec/config/level0.json"
	Local   = ".se/.runtime/config.json"
)

// [[spec/design_output/config#a-go-program-reads-the-config]]
func EnvOf(key string) string {
	said := strings.ToUpper(strings.NewReplacer(".", "_", "-", "_").Replace(key))
	return "SE_" + said
}

// The local file beats the environment, and the environment beats the tracked one. [[spec/design_output/config#the-resolver-holds-the-layers]]
func Value(root, key string) (any, bool) {
	var out any
	held := false
	if said, found := valueIn(read(root, Tracked), key); found {
		out, held = said, true
	}
	if said := strings.TrimSpace(os.Getenv(EnvOf(key))); said != "" {
		out, held = said, true
	}
	if said, found := valueIn(read(root, Local), key); found {
		out, held = said, true
	}
	return out, held
}

// The map a named file holds at a key, read off that file and no layer. [[spec/design_output/config#a-go-program-reads-the-config]]
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

func stringOf(one any) string {
	if text, ok := one.(string); ok {
		return text
	}
	return fmt.Sprint(one)
}

func read(root, path string) map[string]any {
	held, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(path)))
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
