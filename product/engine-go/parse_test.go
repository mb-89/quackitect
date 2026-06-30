package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestParseNode(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "req-x.md")
	os.WriteFile(p, []byte("---\nid: req-x\ntype: requirement\nrefines: [uc-a, uc-b]\nstatement: Hello world.\nkiller: true\nclass: review\n---\n\nbody\n"), 0644)
	n := ParseNode(p)
	if n.ID != "req-x" || n.Type != "requirement" || n.Statement != "Hello world." || !n.Killer || n.Class != "review" {
		t.Fatalf("bad node: %+v", n)
	}
	if len(n.Refines) != 2 || n.Refines[0] != "uc-a" || n.Refines[1] != "uc-b" {
		t.Fatalf("bad refines: %v", n.Refines)
	}
}

func TestParseNodeDefaults(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "plain.md")
	os.WriteFile(p, []byte("no frontmatter here\n"), 0644)
	n := ParseNode(p)
	if n.ID != "plain" || n.Class != "judgment" || n.Killer || n.Statement != "" {
		t.Fatalf("bad defaults: %+v", n)
	}
}

func TestReadConfig(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "config.toml")
	os.WriteFile(p, []byte("[iteration]\ntype    = \"default\"\nrigor   = \"systematic\"\nversion = \"i0003_engine_vehicle_go\"\n"), 0644)
	c := ReadConfig(p)
	if c.Type != "default" || c.Rigor != "systematic" || c.Version != "i0003_engine_vehicle_go" {
		t.Fatalf("bad config: %+v", c)
	}
}
