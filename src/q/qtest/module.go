// A fake module registers the ports and actions its script names, and the
// index's own cases drive every transaction a module makes over it.
// [[spec/design_output/model#the-index-meets-fake-modules]]
package qtest

import "quackitect/src/q"

// An action of the script: its name, whether it writes, and the requests it answers. [[spec/design_output/model#the-index-meets-fake-modules]]
type Act struct {
	Name     string
	Writes   bool
	Requests []q.Request
}

// The script of one module type: an out-port `out`, an in-port `in` its derived `seen` echoes, and its actions. [[spec/design_output/model#the-index-meets-fake-modules]]
type Module struct {
	Type  string
	Out   bool
	Reads bool
	Acts  []Act
}

// The in-port `in` the derived `seen` reads. [[spec/design_output/model#the-index-meets-fake-modules]]
type seenOf struct {
	In int `q:"in"`
}

// Registers what the script names, each with its q.Doc, and answers the writer of its out-port and its `seen`. [[spec/design_output/model#the-index-meets-fake-modules]]
func (one Module) Register(c *q.Catalog) q.Writer {
	var hands []q.Writer
	if one.Out {
		hands = append(hands, q.OutIn(c, "out", 0, q.Doc("the value the script's writer commits")))
	}
	if one.Reads {
		hands = append(hands, q.DerivedIn(c, "seen", 0, func(in seenOf) int { return in.In }, q.Doc("the in-port, echoed")))
	}
	for _, act := range one.Acts {
		opts := []q.Option{q.Doc("an action the script names")}
		if act.Writes {
			opts = append(opts, q.Writes())
		}
		q.ActionIn(c, act.Name, func(string) []q.Request { return append([]q.Request(nil), act.Requests...) }, opts...)
	}
	return q.Join(hands...)
}

// The types a wiring loads, and the writer each type's out-port hands back. [[spec/design_output/model#the-index-meets-fake-modules]]
type Fakes struct {
	Hands map[string]q.Writer
	types map[string]func(*q.Catalog)
}

// [[spec/design_output/model#the-index-meets-fake-modules]]
func Modules(scripts ...Module) *Fakes {
	fakes := &Fakes{Hands: map[string]q.Writer{}, types: map[string]func(*q.Catalog){}}
	for _, one := range scripts {
		fakes.types[one.Type] = func(c *q.Catalog) { fakes.Hands[one.Type] = one.Register(c) }
	}
	return fakes
}

// The map q.Start takes, so the wiring loads fake modules the way it loads real ones. [[spec/design_output/model#the-index-meets-fake-modules]]
func (f *Fakes) Types() map[string]func(*q.Catalog) { return f.types }
