package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// design: go-module-import-plan  implements: req-module-import, req-module-update
// Module import/update is planned as deterministic file operations. The planner mirrors a
// source tree into modules/<id>/import, records provenance in module.toml, reports deletes for
// files no longer present upstream, and never touches modules/<id>/overlay.
type modulePlanOp struct {
	Op   string
	File string
}

func moduleImportDir(root, id string) string {
	return filepath.Join(root, "modules", filepath.FromSlash(strings.ReplaceAll(id, ".", "/")), "import")
}
func moduleOverlayDir(root, id string) string {
	return filepath.Join(root, "modules", filepath.FromSlash(strings.ReplaceAll(id, ".", "/")), "overlay")
}
func moduleTomlPath(root, id string) string {
	return filepath.Join(root, "modules", filepath.FromSlash(strings.ReplaceAll(id, ".", "/")), "module.toml")
}

func moduleSourceRoot(from string) string {
	if st, err := os.Stat(filepath.Join(from, "product")); err == nil && st.IsDir() {
		return filepath.Join(from, "product")
	}
	return from
}

func modulePlan(from, root, id string) ([]modulePlanOp, error) {
	if strings.TrimSpace(id) == "" {
		return nil, fmt.Errorf("module: id required")
	}
	src := moduleSourceRoot(from)
	if st, err := os.Stat(src); err != nil || !st.IsDir() {
		return nil, fmt.Errorf("module: source not found: %s", src)
	}
	dst := moduleImportDir(root, id)
	overlay := moduleOverlayDir(root, id)
	srcFiles := map[string][]byte{}
	if err := filepath.Walk(src, func(p string, fi os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		base := filepath.Base(p)
		if fi.IsDir() {
			if base == ".git" || base == ".gotmp" || base == "__pycache__" {
				return filepath.SkipDir
			}
			return nil
		}
		if strings.HasSuffix(base, ".exe") || strings.HasSuffix(base, ".pyc") {
			return nil
		}
		rel, _ := filepath.Rel(src, p)
		raw, e := os.ReadFile(p)
		if e != nil {
			return e
		}
		srcFiles[filepath.ToSlash(rel)] = raw
		return nil
	}); err != nil {
		return nil, err
	}
	var ops []modulePlanOp
	for rel, raw := range srcFiles {
		target := filepath.Join(dst, filepath.FromSlash(rel))
		if old, err := os.ReadFile(target); err != nil {
			ops = append(ops, modulePlanOp{"create", target})
		} else if string(old) != string(raw) {
			ops = append(ops, modulePlanOp{"write", target})
		}
	}
	if st, err := os.Stat(dst); err == nil && st.IsDir() {
		filepath.Walk(dst, func(p string, fi os.FileInfo, err error) error {
			if err != nil || fi.IsDir() {
				return nil
			}
			rel, _ := filepath.Rel(dst, p)
			if _, ok := srcFiles[filepath.ToSlash(rel)]; !ok {
				ops = append(ops, modulePlanOp{"delete", p})
			}
			return nil
		})
	}
	prov := moduleTomlPath(root, id)
	provBody := "id = \"" + id + "\"\nsource = \"" + filepath.ToSlash(from) + "\"\nimport = \"" + filepath.ToSlash(dst) + "\"\n"
	if old, err := os.ReadFile(prov); err != nil || string(old) != provBody {
		ops = append(ops, modulePlanOp{"provenance", prov})
	}
	var filtered []modulePlanOp
	for _, op := range ops {
		clean := filepath.Clean(op.File)
		if overlay != "" {
			if rel, err := filepath.Rel(overlay, clean); err == nil && rel != "." && !strings.HasPrefix(rel, "..") && !filepath.IsAbs(rel) {
				continue
			}
		}
		filtered = append(filtered, op)
	}
	sort.Slice(filtered, func(i, j int) bool {
		if filtered[i].Op != filtered[j].Op {
			return filtered[i].Op < filtered[j].Op
		}
		return filtered[i].File < filtered[j].File
	})
	return filtered, nil
}

func cmdModule(args []string) {
	if len(args) < 2 || (args[0] != "import" && args[0] != "update") {
		fmt.Println("usage: " + brand() + " module import <id> --from <path> [--dry] | module update <id> [--dry]")
		return
	}
	id := args[1]
	from := flagVal(args, "--from")
	if args[0] == "update" && from == "" {
		from = readModuleSource(id)
	}
	ops, err := modulePlan(from, ROOT, id)
	if err != nil {
		fmt.Println(err)
		quackExit(1)
	}
	for _, op := range ops {
		fmt.Println(op.Op + " " + filepath.ToSlash(op.File))
	}
	if hasFlag(args, "--dry") {
		fmt.Println("dry run: " + itoa(len(ops)) + " operation(s), nothing written")
	}
}

func readModuleSource(id string) string {
	raw, err := os.ReadFile(moduleTomlPath(ROOT, id))
	if err != nil {
		return ""
	}
	for _, line := range strings.Split(string(raw), "\n") {
		if v, ok := tomlString(line, "source"); ok {
			return v
		}
	}
	return ""
}

// enddesign
