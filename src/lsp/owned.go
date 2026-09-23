// A field the verbs write, weighed in an open buffer against the file the
// index holds. A person's edit there stands, and the next pull writes over it,
// so the panel warns and refuses nothing.
// [[spec/design_output/lsp#an-engine-field-warns]]
package main

import (
	"path/filepath"
	"strings"

	"quackitect/yaml"
)

// [[spec/design_output/lsp#an-engine-field-warns]]
const EngineOwnsField = "EngineOwnsField"

// A warning on each engine key the buffer writes other than the file does. A file no editor holds draws nothing. [[spec/design_output/lsp#an-engine-field-warns]]
func engineFaults(tree *Tree, path string) []Finding {
	if !tree.Held(path) {
		return nil
	}
	was, stands := tree.OnDisk(path)
	if !stands {
		return nil
	}
	now := tree.Read(path)
	schemas := schemasIn(tree)
	schema := schemas.Get(kindOf(now))
	if schema == nil {
		schema = governorOf(schemas, path)
	}
	nowRows, wasRows := yaml.SplitLines(now), yaml.SplitLines(was)
	nowFront, wasFront := frontOf(nowRows), frontOf(wasRows)
	if schema == nil || !nowFront.Stands || !wasFront.Stands {
		return nil
	}

	out := []Finding{}
	props := yaml.AsDoc(yaml.AsDoc(schema.Get("frontmatter")).Get("properties"))
	for _, key := range props.Keys() {
		if !yaml.AsBool(yaml.AsDoc(props.Get(key)).Get("x-engine")) {
			continue
		}
		if blockOf(nowRows, nowFront, key) == blockOf(wasRows, wasFront, key) {
			continue
		}
		line := nowFront.Lines[key]
		if line == 0 {
			line = 1
		}
		out = append(out, warn(EngineOwnsField, path, line,
			"The verbs write "+key+", as ./RUNME.sh ticket pull does, and the next pull writes over this edit."))
	}
	return out
}

// The lines a top-level key holds in the frontmatter, its nested ones too, and nothing where the key stands nowhere. [[spec/design_output/lsp#an-engine-field-warns]]
func blockOf(rows []string, front Front, key string) string {
	start := front.Lines[key]
	if start == 0 {
		return ""
	}
	end := len(rows) + 1
	for i := start; i < len(rows); i++ {
		if strings.TrimSpace(rows[i]) == "---" {
			end = i + 1
			break
		}
	}
	for _, line := range front.Lines {
		if line > start && line < end {
			end = line
		}
	}
	held := []string{}
	for _, row := range rows[start-1 : end-1] {
		held = append(held, strings.TrimRight(row, " \t"))
	}
	return strings.TrimRight(strings.Join(held, "\n"), "\n")
}

// The file under the buffer, as the disk the tree reads holds it, and whether one stands. [[spec/design_output/lsp#an-engine-field-warns]]
func (one *Tree) OnDisk(path string) (string, bool) {
	read, err := one.disk.ReadFile(filepath.Join(one.Root, filepath.FromSlash(slashed(path))))
	if err != nil {
		return "", false
	}
	return string(read), true
}
