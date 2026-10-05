// The tree a projection reads, as layer.js hands it: one root, or the work
// root laid over the method root. The package reads no disk itself, so a
// caller hands in the tree and a test hands in a map.
// [[spec/design_output/vehicle#the-work-root-inherits]]
package projection

import (
	"sort"
	"strings"
)

// One name a folder lists, a file or a folder. [[spec/design_output/vehicle#the-work-root-inherits]]
type Listed struct {
	Name string
	Dir  bool
}

// A tree answering relative paths, as the rooted reader in layer.js does. [[spec/design_output/vehicle#the-work-root-inherits]]
type Tree interface {
	Exists(path string) bool
	Read(path string) string
	List(folder string) []Listed
}

// The work tree laid over the method tree: the work file wins, a folder lists as the union, and a JSON file both hold joins key by key. [[spec/design_output/vehicle#the-work-root-inherits]]
func Inherits(method, work Tree) Tree { return inherited{under: method, over: work} }

type inherited struct{ under, over Tree }

// Whether either root holds the path. [[spec/design_output/vehicle#the-work-root-inherits]]
func (one inherited) Exists(path string) bool {
	return one.over.Exists(path) || one.under.Exists(path)
}

// The work root's text, or the method root's, or the two joined where both hold a JSON file. [[spec/design_output/vehicle#the-work-root-inherits]]
func (one inherited) Read(path string) string {
	if !one.over.Exists(path) {
		return one.under.Read(path)
	}
	if !one.under.Exists(path) || !strings.HasSuffix(path, ".json") {
		return one.over.Read(path)
	}
	return stringify(deeply(layerParsed(one.under.Read(path)), layerParsed(one.over.Read(path))))
}

// The union of both roots' listings, the work root's entry winning a name. [[spec/design_output/vehicle#the-work-root-inherits]]
func (one inherited) List(folder string) []Listed {
	var order []string
	at := map[string]Listed{}
	for _, each := range append(one.under.List(folder), one.over.List(folder)...) {
		if _, held := at[each.Name]; !held {
			order = append(order, each.Name)
		}
		at[each.Name] = each
	}
	out := make([]Listed, 0, len(order))
	for _, name := range order {
		out = append(out, at[name])
	}
	return out
}

// A JSON text as layer.js parsed reads it: an empty object where it fails. [[spec/design_output/vehicle#the-work-root-inherits]]
func layerParsed(text string) any {
	said, err := parseJSON(text)
	if err != nil {
		return newObject()
	}
	return said
}

// One object laid over another, key by key, where both hold an object. [[spec/design_output/vehicle#the-work-root-inherits]]
func deeply(under, over any) *Object {
	out := newObject()
	if below := asObject(under); below != nil {
		out = below.spread()
	}
	above := asObject(over)
	for _, name := range above.Keys() {
		value := above.Get(name)
		if held := asObject(out.Get(name)); held != nil && asObject(value) != nil {
			out.Set(name, deeply(held, value))
			continue
		}
		out.Set(name, value)
	}
	return out
}

// A tree held as texts by path, for a test and a caller holding the sources already. [[spec/tickets/config-verbs-port-to-go]]
type Texts map[string]string

// Whether the map holds the path as a file or as a folder over one. [[spec/tickets/config-verbs-port-to-go]]
func (one Texts) Exists(path string) bool {
	if _, held := one[path]; held {
		return true
	}
	for name := range one {
		if strings.HasPrefix(name, path+"/") {
			return true
		}
	}
	return false
}

// The text the map holds at the path. [[spec/tickets/config-verbs-port-to-go]]
func (one Texts) Read(path string) string { return one[path] }

// The names one level under a folder, sorted. [[spec/tickets/config-verbs-port-to-go]]
func (one Texts) List(folder string) []Listed {
	at := map[string]bool{}
	for name := range one {
		rest, held := strings.CutPrefix(name, folder+"/")
		if !held {
			continue
		}
		head, _, deeper := strings.Cut(rest, "/")
		at[head] = at[head] || deeper
	}
	names := make([]string, 0, len(at))
	for name := range at {
		names = append(names, name)
	}
	sort.Strings(names)
	out := make([]Listed, 0, len(names))
	for _, name := range names {
		out = append(out, Listed{Name: name, Dir: at[name]})
	}
	return out
}
