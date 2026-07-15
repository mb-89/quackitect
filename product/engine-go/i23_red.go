package main

import (
	"os"
	"path/filepath"
	"strings"
)

// i23_red.go - module workspace checks.

var i23Tests = []namedTest{
	{"module-registry", selftestModuleRegistry},
	{"node-module-default", selftestNodeModuleDefault},
	{"module-subtree-filter", selftestModuleSubtreeFilter},
	{"module-table-filter", selftestModuleTableFilter},
	{"module-command-selector", selftestModuleCommandSelector},
	{"module-import", selftestModuleImport},
	{"module-update", selftestModuleUpdate},
	{"vehicle-module-setup", selftestVehicleModuleSetup},
}

func selftestModuleRegistry() bool {
	dir, err := os.MkdirTemp("", "q22mod")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	p := filepath.Join(dir, "project.toml")
	raw := `[workspace]
id = "fixture"
default_module = "doc"

[iteration]
type = "default"
rigor = "systematic"
version = "i0001_fixture"

[modules.se]
title = "Systematic engineering"
kind = "imported"
path = "modules/se"
from = "../quackitect"

[modules.doc]
title = "Documentation"
kind = "local"
path = "modules/doc"

[modules.doc.review]
title = "Document review"
kind = "local"
path = "modules/doc/review"
parent = "doc"
`
	if err := os.WriteFile(p, []byte(raw), 0o644); err != nil {
		return false
	}
	c := ReadConfig(p)
	return c.WorkspaceID == "fixture" && c.DefaultModule == "doc" && c.Version == "i0001_fixture" &&
		c.Modules["se"].Kind == "imported" && c.Modules["se"].From == "../quackitect" &&
		c.Modules["doc"].Path == "modules/doc" && c.Modules["doc.review"].Parent == "doc"
}

func selftestNodeModuleDefault() bool {
	c := Config{DefaultModule: "doc", Modules: map[string]ModuleConfig{"doc": {ID: "doc"}}}
	n := ParseNodeBytes("req-x.md", []byte("---\nid: req-x\ntype: requirement\nstatement: x\n---\n"))
	if n.Module != "" {
		return false
	}
	n.Module = c.moduleDefault()
	return n.Module == "doc"
}

func selftestModuleSubtreeFilter() bool {
	return moduleMatches("doc", "doc") &&
		moduleMatches("doc.review", "doc") &&
		moduleMatches("doc.review", "doc.review") &&
		!moduleMatches("doc.authoring", "doc.review") &&
		!moduleMatches("se", "doc") &&
		moduleMatches("se", "all")
}

func selftestModuleTableFilter() bool {
	oldRoot, oldSpec := ROOT, SPEC
	defer func() { ROOT, SPEC = oldRoot, oldSpec }()
	dir, err := os.MkdirTemp("", "q22tbl")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	ROOT = dir
	SPEC = filepath.Join(dir, "spec")
	os.MkdirAll(SPEC, 0o755)
	os.WriteFile(filepath.Join(SPEC, "project.toml"), []byte(`[workspace]
default_module = "doc"
[modules.doc]
title = "Documentation"
[modules.doc.review]
title = "Review"
parent = "doc"
`), 0o644)
	nodes := map[string]Node{
		"need-a": {ID: "need-a", Type: "need", Module: "doc", Statement: "need a"},
		"need-b": {ID: "need-b", Type: "need", Module: "doc", Statement: "need b"},
		"uc-a":   {ID: "uc-a", Type: "usecase", Module: "doc.review", Statement: "uc a", Refines: []string{"need-a"}},
	}
	r := BaseResult{Name: "fixture", Columns: []string{"name", "brief"}, Groups: []BaseGroup{{Rows: []BaseRow{{ID: "need-a", Cells: []string{"need a", "need row"}}, {ID: "need-b", Cells: []string{"need b", "need row"}}, {ID: "uc-a", Cells: []string{"uc a", "uc row"}}}}}}
	html := baseResultHTML([]BaseResult{r}, nodes, map[string]string{}, map[string]Event{}, "x")
	mi := strings.Index(html, `data-facet="mod"`)
	ni := strings.Index(html, `data-facet="need"`)
	return mi >= 0 && ni > mi && strings.Contains(html, `data-mod="doc"`) && strings.Contains(html, `data-mod="doc.review"`)
}

func selftestModuleCommandSelector() bool {
	c := Config{Modules: map[string]ModuleConfig{"se": {ID: "se"}, "doc": {ID: "doc"}, "doc.review": {ID: "doc.review", Parent: "doc"}}}
	m, rest := selectModuleArg([]string{"doc", "status", "--all"}, c)
	if m != "doc" || len(rest) != 2 || rest[0] != "status" || rest[1] != "--all" {
		return false
	}
	m, rest = selectModuleArg([]string{"status", "--all"}, c)
	if m != "" || len(rest) != 2 || rest[0] != "status" {
		return false
	}
	selectedModule = "doc"
	defer func() { selectedModule = "" }()
	return moduleSelected(Node{Module: "doc.review"}) && !moduleSelected(Node{Module: "se"})
}

func selftestModuleImport() bool {
	dir, err := os.MkdirTemp("", "q22imp")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	src := filepath.Join(dir, "src", "product")
	dst := filepath.Join(dir, "dst")
	os.MkdirAll(src, 0o755)
	os.MkdirAll(filepath.Join(moduleImportDir(dst, "se"), "old"), 0o755)
	os.WriteFile(filepath.Join(src, "a.txt"), []byte("a"), 0o644)
	os.WriteFile(filepath.Join(src, "b.txt"), []byte("b"), 0o644)
	os.MkdirAll(moduleImportDir(dst, "se"), 0o755)
	os.WriteFile(filepath.Join(moduleImportDir(dst, "se"), "b.txt"), []byte("old"), 0o644)
	os.WriteFile(filepath.Join(moduleImportDir(dst, "se"), "old", "gone.txt"), []byte("gone"), 0o644)
	ops, err := modulePlan(filepath.Join(dir, "src"), dst, "se")
	if err != nil {
		return false
	}
	seen := map[string]bool{}
	for _, op := range ops {
		seen[op.Op] = true
	}
	return seen["create"] && seen["write"] && seen["delete"] && seen["provenance"] && !fileExists(filepath.Join(moduleImportDir(dst, "se"), "a.txt"))
}

func selftestModuleUpdate() bool {
	dir, err := os.MkdirTemp("", "q22upd")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	src := filepath.Join(dir, "src", "product")
	dst := filepath.Join(dir, "dst")
	os.MkdirAll(src, 0o755)
	os.WriteFile(filepath.Join(src, "a.txt"), []byte("new"), 0o644)
	os.MkdirAll(moduleImportDir(dst, "doc.review"), 0o755)
	os.MkdirAll(moduleOverlayDir(dst, "doc.review"), 0o755)
	os.WriteFile(moduleTomlPath(dst, "doc.review"), []byte("id = \"doc.review\"\nsource = \""+filepath.ToSlash(filepath.Join(dir, "src"))+"\"\n"), 0o644)
	os.WriteFile(filepath.Join(moduleOverlayDir(dst, "doc.review"), "local.txt"), []byte("keep"), 0o644)
	ops, err := modulePlan(readModuleSourceFrom(dst, "doc.review"), dst, "doc.review")
	if err != nil {
		return false
	}
	for _, op := range ops {
		if strings.Contains(filepath.ToSlash(op.File), "/overlay/") {
			return false
		}
	}
	return len(ops) > 0 && fileExists(filepath.Join(moduleOverlayDir(dst, "doc.review"), "local.txt"))
}

func fileExists(path string) bool { _, err := os.Stat(path); return err == nil }

func readModuleSourceFrom(root, id string) string {
	oldRoot := ROOT
	defer func() { ROOT = oldRoot }()
	ROOT = root
	return readModuleSource(id)
}

func selftestVehicleModuleSetup() bool {
	dir, err := os.MkdirTemp("", "q22veh")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	vehicle := filepath.Join(dir, "vehicle")
	if err := initVehicleFiles(vehicle); err != nil {
		return false
	}
	pt := filepath.Join(vehicle, "spec", "project.toml")
	f, err := os.OpenFile(pt, os.O_APPEND|os.O_WRONLY, 0o644)
	if err != nil {
		return false
	}
	f.WriteString(`

[workspace]
id = "vehicle"
default_module = "doc"

[modules.se]
title = "Systematic engineering"
kind = "imported"
path = "modules/se"
from = "` + filepath.ToSlash(ROOT) + `"

[modules.doc]
title = "Documentation"
kind = "local"
path = "modules/doc"

[modules.doc.review]
title = "Document review"
kind = "local"
path = "modules/doc/review"
parent = "doc"
`)
	f.Close()
	c := ReadConfig(pt)
	if c.DefaultModule != "doc" || c.Modules["se"].Kind != "imported" || c.Modules["doc.review"].Parent != "doc" {
		return false
	}
	ops, err := modulePlan(ROOT, vehicle, "se")
	if err != nil || len(ops) == 0 {
		return false
	}
	for _, op := range ops {
		if strings.Contains(filepath.ToSlash(op.File), "doc.review") {
			return false
		}
	}
	return true
}
