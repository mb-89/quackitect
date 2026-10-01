// A projection of files/: a module declares a glob, a codec and a kind, and
// the store parses, saves, restores and dumps through it.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package q

import (
	"encoding/json"
	"fmt"
	"path"
	"reflect"
	"sort"
	"strings"
)

// The kind of a projection, which carries its direction. [[spec/design_output/model#everything-on-disk-mirrors]]
type Mirror string

const (
	Loaded Mirror = "loaded"
	Saved  Mirror = "saved"
	Dump   Mirror = "dump"
)

// The family every file stands under, which a loaded projection reads. The files module owns the name, and q spells it again because q imports no module. [[spec/design_output/model#everything-on-disk-mirrors]]
const filesPrefix = "files/"

// The one code knowing a file format. [[spec/design_output/model#everything-on-disk-mirrors]]
type Codec[T any] interface {
	Parse(body []byte) (T, error)
	Serialize(value T) ([]byte, error)
}

// A projection a catalog holds: its family, its kind, a glob, and the round trip of its codec. [[spec/design_output/model#everything-on-disk-mirrors]]
type Projection struct {
	Name      string
	Kind      Mirror
	Glob      string
	RoundTrip func(body []byte) ([]byte, error)
	// A read-only projection draws a file and writes none, so its codec refuses a write and no round trip holds it. [[spec/tickets/the-lens-reads-v1]]
	ReadOnly bool
}

// Marks a projection whose codec reads a file and writes none. [[spec/tickets/the-lens-reads-v1]]
func ReadOnly() Option {
	return func(one *registration) { one.readOnly = true }
}

// A second glob the same family projects, such as the local layer of a config file. [[spec/design_output/model#everything-on-disk-mirrors]]
func Also(glob string) Option {
	return func(one *registration) { one.globs = append(one.globs, glob) }
}

// Registers the family `<name>/<path...>`, whose key names a file under glob. A loaded one parses files/<key> when a run names the key. [[spec/design_output/model#everything-on-disk-mirrors]]
func ProjectIn[T any](c *Catalog, name, glob string, codec Codec[T], kind Mirror, def T, opts ...Option) Writer {
	one := &registration{name: name + "/<path...>", kind: out, typ: typeOf[T](), def: def, missing: missing(def), mirror: kind, globs: []string{glob}}
	one.trip = func(body []byte) ([]byte, error) {
		value, err := codec.Parse(body)
		if err != nil {
			return nil, err
		}
		return codec.Serialize(value)
	}
	if kind == Loaded {
		one.kind = derived
		one.inputs = []input{{name: filesPrefix + "<path...>", typ: typeOf[Content]()}}
		// The wiring renames the family after this runs, so the key trims off the name the registration carries at call time. [[spec/tickets/the-lens-reads-v1]]
		one.keyed = func(snap Snapshot, full string) (any, error) {
			key := strings.TrimPrefix(full, strings.TrimSuffix(one.name, "<path...>"))
			if !one.covers(key) {
				return nil, fmt.Errorf("%s stands outside the globs of %s", key, one.name)
			}
			file, _ := snap.Read(filesPrefix + key).(Content)
			if file.Hash == "" {
				return def, nil
			}
			return codec.Parse([]byte(file.Text))
		}
	}
	return c.add(one, callerAt(2), opts)
}

func (one *registration) covers(key string) bool {
	for _, glob := range one.globs {
		if matched, _ := path.Match(glob, key); matched {
			return true
		}
	}
	return false
}

// Every projection the catalog holds, one a glob. [[spec/design_output/model#everything-on-disk-mirrors]]
func (c *Catalog) Projections() []Projection {
	var out []Projection
	for _, one := range c.all() {
		for _, glob := range one.globs {
			out = append(out, Projection{Name: one.name, Kind: one.mirror, Glob: glob, RoundTrip: one.trip, ReadOnly: one.readOnly})
		}
	}
	return out
}

// A name in a saved file: its type, and its value. [[spec/design_output/model#everything-on-disk-mirrors]]
type savedName struct {
	Type  string          `json:"type"`
	Value json.RawMessage `json:"value"`
}

// Every name under prefix and its value: each concrete name the catalog registers, and each the store holds. [[spec/design_output/model#everything-on-disk-mirrors]]
func (s *Store) under(prefix string) map[string]any {
	snap := s.Snapshot()
	out := map[string]any{}
	for _, group := range s.groups {
		if strings.HasPrefix(group.name, prefix) && !keyed(group.name) {
			out[group.name] = snap.Read(group.name)
		}
	}
	for name, held := range snap.values {
		if strings.HasPrefix(name, prefix) {
			out[name] = held.value
		}
	}
	return out
}

// The bytes of a saved file: every name under prefix, with its type and value. [[spec/design_output/model#everything-on-disk-mirrors]]
func (s *Store) Save(prefix string) ([]byte, error) {
	saved := map[string]savedName{}
	for name, value := range s.under(prefix) {
		body, err := json.Marshal(value)
		if err != nil {
			return nil, fmt.Errorf("%s saves as no JSON: %w", name, err)
		}
		saved[name] = savedName{Type: s.owner(name).typ.String(), Value: body}
	}
	return indented(saved)
}

// Restores a saved file name by name, and answers a line for each name it refuses. A name nobody registers stays out, and a missing one keeps its built-in value. [[spec/design_output/model#everything-on-disk-mirrors]]
func (s *Store) Restore(saved []byte) ([]string, error) {
	var held map[string]savedName
	if err := json.Unmarshal(saved, &held); err != nil {
		return nil, err
	}
	names := make([]string, 0, len(held))
	for name := range held {
		names = append(names, name)
	}
	sort.Strings(names)
	var refused []string
	var hand Writer
	values := map[string]any{}
	for _, name := range names {
		one := s.owner(name)
		if one == nil {
			continue
		}
		if held[name].Type != one.typ.String() {
			refused = append(refused, fmt.Sprintf("%s saves a %s, and the catalog holds a %s", name, held[name].Type, one.typ))
			continue
		}
		value := reflect.New(one.typ)
		if err := json.Unmarshal(held[name].Value, value.Interface()); err != nil {
			refused = append(refused, fmt.Sprintf("%s restores no %s: %v", name, one.typ, err))
			continue
		}
		values[name] = value.Elem().Interface()
		hand.ones = append(hand.ones, one)
	}
	if len(values) == 0 {
		return refused, nil
	}
	_, err := s.Commit(s.Snapshot().Revision, hand, values)
	return refused, err
}

// The bytes of a saved file holding the names it is handed, which Restore reads back. [[spec/design_output/processes#the-placements]]
func (s *Store) SaveNames(names []string) ([]byte, error) { return indented(map[string]savedName{}) }

// The bytes of a dump of every name under prefix. [[spec/design_output/model#everything-on-disk-mirrors]]
func (s *Store) Dump(prefix string) ([]byte, error) {
	return indented(s.under(prefix))
}

// Writes the layout JSON.stringify(value, null, 2) writes, with its closing newline. [[spec/design_output/model#everything-on-disk-mirrors]]
func indented(value any) ([]byte, error) {
	body, err := json.MarshalIndent(value, "", jsonIndent)
	if err != nil {
		return nil, err
	}
	return append(body, '\n'), nil
}
