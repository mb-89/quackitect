// The views module: every base file under spec/views, parsed, in name order.
// [[spec/design_output/extension#the-views-section]]
package views

import (
	"path"
	"sort"
	"strings"

	"quackitect/src/q"
	"quackitect/src/yaml"
)

// The folder of the base files, and the name their list answers at. [[spec/design_output/extension#the-views-section]]
const (
	Folder    = "spec/views"
	Ext       = ".base"
	BasesName = "views/bases"
)

// One base: its file's name, and what the file says. [[spec/design_output/extension#the-views-section]]
type Base struct {
	Name string `json:"name"`
	Said any    `json:"said"`
}

type filesIn struct {
	Files map[string]q.Content `q:"files/<path...>"`
}

// [[spec/design_output/extension#the-views-section]]
func Registers(c *q.Catalog) q.Writer {
	return q.DerivedIn(c, BasesName, []Base{}, basesOf, q.Doc("every base file under spec/views, parsed, in name order"))
}

func basesOf(in filesIn) []Base {
	out := []Base{}
	for at, file := range in.Files {
		if file.Hash == "" || path.Dir(at) != Folder || !strings.HasSuffix(at, Ext) {
			continue
		}
		out = append(out, Base{Name: strings.TrimSuffix(path.Base(at), Ext), Said: plainOf(yaml.Read(file.Text))})
	}
	sort.Slice(out, func(a, b int) bool { return out[a].Name < out[b].Name })
	return out
}

// A YAML value as maps and lists, since a yaml.Doc keeps its fields unexported and reaches /v1 empty. [[spec/design_output/extension#the-views-section]]
func plainOf(said any) any {
	switch one := said.(type) {
	case *yaml.Doc:
		out := map[string]any{}
		for _, key := range one.Keys() {
			out[key] = plainOf(one.Get(key))
		}
		return out
	case []any:
		out := make([]any, len(one))
		for at, each := range one {
			out[at] = plainOf(each)
		}
		return out
	}
	return said
}
