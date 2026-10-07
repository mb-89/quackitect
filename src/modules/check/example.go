// The check's hook into the one example parser: a body naming x-steps reads its
// steps there, and a field naming x-under stands under that glob alone.
// [[spec/design_output/examples#the-format]]
package check

import (
	"fmt"
	"strings"

	"quackitect/src/example"
	"quackitect/src/yaml"
)

// [[spec/design_output/examples#the-format]]
func stepFaults(text string, body *yaml.Doc, where string) []Finding {
	if yaml.AsString(body.Get("x-steps")) != "example" {
		return nil
	}
	_, faults := example.Read(slashed(where), text)
	out := []Finding{}
	for _, one := range faults {
		out = append(out, fault("Example."+one.Rule, where, one.Line, one.Message))
	}
	return out
}

// [[spec/design_output/examples#the-places]]
func edgeFaults(note Note, props *yaml.Doc, kind, where string) []Finding {
	out := []Finding{}
	for _, key := range props.Keys() {
		glob := yaml.AsString(yaml.AsDoc(props.Get(key)).Get("x-under"))
		if glob == "" {
			continue
		}
		named, under := !yaml.Empty(note.Front.Said.Get(key)), underGlob(glob, where)
		switch {
		case under && !named:
			out = append(out, schemaFault(key, where, 1, fmt.Sprintf("A %s under %s names %s in its frontmatter.", kind, glob, key)))
		case !under && named:
			line := note.Front.Lines[key]
			out = append(out, schemaFault(key, where, max(line, 1), fmt.Sprintf("A %s names %s under %s alone.", kind, key, glob)))
		}
	}
	return out
}

// The glob matches the path, or a tail of it past a slash, so a path the write door holds whole matches too. [[spec/design_output/examples#the-places]]
func underGlob(glob, where string) bool {
	path := slashed(where)
	for {
		if matches(glob, path) {
			return true
		}
		_, rest, cut := strings.Cut(path, "/")
		if !cut {
			return false
		}
		path = rest
	}
}
