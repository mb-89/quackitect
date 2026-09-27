// A projection of files/: a module declares a glob, a codec and a kind, and
// the store parses, saves, restores and dumps through it.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package q

// The kind of a projection, which carries its direction. [[spec/design_output/model#everything-on-disk-mirrors]]
type Mirror string

const (
	Loaded Mirror = "loaded"
	Saved  Mirror = "saved"
	Dump   Mirror = "dump"
)

// The one code knowing a file format. [[spec/design_output/model#everything-on-disk-mirrors]]
type Codec[T any] interface {
	Parse(body []byte) (T, error)
	Serialize(value T) ([]byte, error)
}

// Registers the family `<name>/<path...>`, whose key names a file under glob. [[spec/design_output/model#everything-on-disk-mirrors]]
func ProjectIn[T any](c *Catalog, name, glob string, codec Codec[T], kind Mirror, def T, opts ...Option) Writer {
	return c.add(givenOf(name+"/<path...>", def), callerAt(2), opts)
}

// The bytes of a saved file: every name under prefix, with its type and value. [[spec/design_output/model#everything-on-disk-mirrors]]
func (s *Store) Save(prefix string) ([]byte, error) { return nil, nil }

// Restores a saved file name by name, and answers a line for each name it refuses. [[spec/design_output/model#everything-on-disk-mirrors]]
func (s *Store) Restore(saved []byte) ([]string, error) { return nil, nil }

// The bytes of a dump of every name under prefix. [[spec/design_output/model#everything-on-disk-mirrors]]
func (s *Store) Dump(prefix string) ([]byte, error) { return nil, nil }
