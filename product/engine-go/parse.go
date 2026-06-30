package main

import (
	"os"
	"path/filepath"
	"strings"
)

// Node is a spec node: a trace work-product or a gate. Mirrors engine.parse's dict.
type Node struct {
	ID         string
	Statement  string
	Class      string
	Verify     string
	Killer     bool
	Type       string
	DependsOn  []string
	Refines    []string
	Implements []string
	Verifies   []string
	Addresses  []string
	Path       string
	RegionBody string
	Line       int
	Milestone  int
}

// Config is the iteration breadcrumb from .quack/config.toml.
type Config struct{ Type, Rigor, Version string }

// design: go-parse  implements: req-zero-dep-parse
// Hand-rolled frontmatter and config.toml parsing over the trivial subset in use
// (key: value lines plus simple [a, b] lists). No third-party TOML or YAML library.
func splitIDs(v string) []string {
	v = strings.Trim(v, "[]")
	out := []string{}
	for _, p := range strings.Split(v, ",") {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}

// ParseNode reads a markdown file's frontmatter into a Node. Splits on '---' and
// reads key: value lines, exactly like engine.parse (split(":", 1), trimmed).
func ParseNode(path string) Node {
	txt, _ := os.ReadFile(path)
	n := Node{ID: strings.TrimSuffix(filepath.Base(path), ".md"), Class: "judgment", Path: path}
	parts := strings.Split(string(txt), "---")
	fm := ""
	if len(parts) >= 3 {
		fm = parts[1]
	}
	for _, line := range strings.Split(fm, "\n") {
		if !strings.Contains(line, ":") {
			continue
		}
		kv := strings.SplitN(line, ":", 2)
		k, v := strings.TrimSpace(kv[0]), strings.TrimSpace(kv[1])
		switch k {
		case "statement":
			n.Statement = v
		case "depends_on":
			n.DependsOn = splitIDs(v)
		case "class":
			n.Class = v
		case "verify":
			n.Verify = v
		case "killer":
			n.Killer = strings.ToLower(v) == "true"
		case "type":
			n.Type = v
		case "refines":
			n.Refines = splitIDs(v)
		case "implements":
			n.Implements = splitIDs(v)
		case "verifies":
			n.Verifies = splitIDs(v)
		case "addresses":
			n.Addresses = splitIDs(v)
		case "id":
			if v != "" {
				n.ID = v
			}
		case "milestone":
			m := 0
			for _, c := range strings.TrimPrefix(v, "M") {
				if c >= '0' && c <= '9' {
					m = m*10 + int(c-'0')
				} else {
					break
				}
			}
			n.Milestone = m
		}
	}
	return n
}

// ReadConfig parses .quack/config.toml's type/rigor/version. Defaults match engine.config.
func ReadConfig(path string) Config {
	c := Config{Type: "default", Rigor: "systematic", Version: "v0"}
	txt, err := os.ReadFile(path)
	if err != nil {
		return c
	}
	for _, line := range strings.Split(string(txt), "\n") {
		for _, k := range []string{"type", "rigor", "version"} {
			if v, ok := tomlString(line, k); ok {
				switch k {
				case "type":
					c.Type = v
				case "rigor":
					c.Rigor = v
				case "version":
					c.Version = v
				}
			}
		}
	}
	return c
}

// tomlString matches a trivial `key = "value"` line (leading space and spaces around = allowed).
func tomlString(line, key string) (string, bool) {
	line = strings.TrimSpace(line)
	if !strings.HasPrefix(line, key) {
		return "", false
	}
	rest := strings.TrimSpace(line[len(key):])
	if !strings.HasPrefix(rest, "=") {
		return "", false
	}
	rest = strings.TrimSpace(rest[1:])
	if len(rest) >= 2 && rest[0] == '"' {
		if end := strings.IndexByte(rest[1:], '"'); end >= 0 {
			return rest[1 : 1+end], true
		}
	}
	return "", false
}

// enddesign
