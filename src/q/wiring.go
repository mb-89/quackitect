// The wiring: the instances to load, each of a module type, and the wire
// binding each port to a name. A module names its ports locally alone.
// [[spec/design_output/model#the-wiring-file]]
package q

import (
	"fmt"
	"strings"

	"quackitect/src/yaml"
)

// The mark a wire carries where an in-port reads its built-in value. [[spec/design_output/model#the-wiring-file]]
const BuiltIn = "built-in"

// The file the index reads the wiring from, which a fault of the wiring names. [[spec/tickets/the-wiring-file-binds-ports]]
const WiringFile = "spec/wiring.yaml"

const (
	Unwired Kind = "an in-port with no wire"
	NoType  Kind = "an instance of a module type nobody registers"
)

type Instance struct {
	Name   string
	Module string
}

// Wires map `<instance>.<port>` to a standard name, to `<instance>.<port>` of a writer, or to BuiltIn. [[spec/design_output/model#the-wiring-file]]
type Wiring struct {
	Instances []Instance
	Wires     map[string]string
}

// Instances stand as a block map of `<instance>:` over `module: <type>`, since src/yaml reads no flow map. [[spec/tickets/the-wiring-file-binds-ports]]
func ReadWiring(text string) (Wiring, error) {
	doc := yaml.AsDoc(yaml.Read(text))
	if doc == nil {
		return Wiring{}, fmt.Errorf("%s reads no map", WiringFile)
	}
	w := Wiring{Wires: map[string]string{}}
	instances := yaml.AsDoc(doc.Get("instances"))
	for _, name := range instances.Keys() {
		module := yaml.AsString(yaml.AsDoc(instances.Get(name)).Get("module"))
		if module == "" {
			return Wiring{}, fmt.Errorf("%s: the instance %s names no module", WiringFile, name)
		}
		w.Instances = append(w.Instances, Instance{Name: name, Module: module})
	}
	wires := yaml.AsDoc(doc.Get("wires"))
	for _, port := range wires.Keys() {
		to := yaml.AsString(wires.Get(port))
		if to == "" {
			return Wiring{}, fmt.Errorf("%s: the wire of %s names nothing", WiringFile, port)
		}
		w.Wires[port] = to
	}
	return w, nil
}

// Each instance registers on a catalog of its own, and Load renames its registrations in place, so every Writer a module holds stays valid. It answers every fault at once. [[spec/tickets/the-wiring-file-binds-ports]]
func Load(w Wiring, types map[string]func(*Catalog)) (*Catalog, []Fault) {
	type loaded struct {
		instance string
		regs     []*registration
	}
	var faults []Fault
	var all []loaded
	writers := map[string]string{}
	for _, one := range w.Instances {
		register, ok := types[one.Module]
		if !ok {
			faults = append(faults, Fault{Kind: NoType, Name: one.Name, Where: []string{WiringFile}, Says: fmt.Sprintf("the module type %s registers nowhere", one.Module)})
			continue
		}
		local := New()
		register(local)
		regs := local.all()
		for _, reg := range regs {
			port := one.Name + "." + reg.name
			reg.instance, reg.port = one.Name, reg.name
			reg.name = outName(w, one.Name, reg.name)
			writers[port] = reg.name
		}
		all = append(all, loaded{one.Name, regs})
	}
	c := New()
	for _, each := range all {
		for _, reg := range each.regs {
			faults = append(faults, bind(w, each.instance, reg, writers)...)
		}
		c.regs = append(c.regs, each.regs...)
	}
	return c, faults
}

// An out-port takes the standard name its wire names, and otherwise `<instance>/<port>`, a family port keeping its key segments. A config key stands under `<instance>/config/<key>`. [[spec/tickets/the-wiring-file-binds-ports]]
func outName(w Wiring, instance, port string) string {
	if to, ok := w.Wires[instance+"."+port]; ok && !strings.HasPrefix(port, "config/") && to != BuiltIn && !toPort(to) {
		return to
	}
	return instance + "/" + port
}

// A wire names a port as `<instance>.<port>`, its dot before any slash, so a family name such as `files/<path...>` reads as a name. [[spec/design_output/model#the-wiring-file]]
func toPort(to string) bool {
	dot, slash := strings.Index(to, "."), strings.Index(to, "/")
	return dot >= 0 && (slash < 0 || dot < slash)
}

// The name a module's local name commits under: its own wire, the wire of the family port it falls under with its keys carried over, or `<instance>/<local>`. [[spec/design_output/model#the-wiring-file]]
func (w Wiring) Bound(instance, local string) string {
	if to, ok := w.Wires[instance+"."+local]; ok && to != BuiltIn && !toPort(to) {
		return to
	}
	for port, to := range w.Wires {
		family, ok := strings.CutPrefix(port, instance+".")
		if !ok || to == BuiltIn || toPort(to) || !matches(family, local) {
			continue
		}
		if carried, ok := carry(family, local, to); ok {
			return carried
		}
	}
	return instance + "/" + local
}

// Fills the keys of to with the segments local takes under family. [[spec/design_output/model#the-wiring-file]]
func carry(family, local, to string) (string, bool) {
	keys := map[string]string{}
	got := strings.Split(local, "/")
	for i, one := range strings.Split(family, "/") {
		if isRest(one) {
			keys[one] = strings.Join(got[i:], "/")
			break
		}
		if isKey(one) {
			keys[one] = got[i]
		}
	}
	out := strings.Split(to, "/")
	for i, one := range out {
		if isKey(one) {
			value, ok := keys[one]
			if !ok {
				return "", false
			}
			out[i] = value
		}
	}
	return strings.Join(out, "/"), true
}

// An in-port takes its wire: a standard name, the name of the writer a port-to-port wire names, or no read under BuiltIn, where the field keeps its zero value. [[spec/tickets/the-wiring-file-binds-ports]]
func bind(w Wiring, instance string, reg *registration, writers map[string]string) []Fault {
	var faults []Fault
	kept := reg.inputs[:0]
	for _, in := range reg.inputs {
		port := instance + "." + in.name
		in.port = port
		to, wired := w.Wires[port]
		switch {
		case strings.HasPrefix(in.name, "config/"):
			in.name = instance + "/" + in.name
		case !wired:
			faults = append(faults, Fault{Kind: Unwired, Name: reg.name, Where: []string{reg.where}, Says: fmt.Sprintf("field %s reads %s, which %s wires nowhere", in.field, port, WiringFile)})
			continue
		case to == BuiltIn:
			continue
		case toPort(to):
			name, ok := writers[to]
			if !ok {
				faults = append(faults, Fault{Kind: Unwired, Name: reg.name, Where: []string{reg.where}, Says: fmt.Sprintf("field %s reads %s, whose wire names %s, a port no instance writes", in.field, port, to)})
				continue
			}
			in.name = name
		default:
			in.name = to
		}
		kept = append(kept, in)
	}
	reg.inputs = kept
	return faults
}

// Loads the wiring and checks the catalog, and answers no store where either names a fault. [[spec/design_output/model#the-index-resolves-in-passes]]
func Start(w Wiring, types map[string]func(*Catalog)) (*Store, error) {
	c, faults := Load(w, types)
	faults = append(faults, c.Check()...)
	faults = append(faults, c.Undescribed()...)
	if len(faults) > 0 {
		return nil, Refused(faults)
	}
	return NewStore(c), nil
}

// [[spec/design_output/model#the-index-resolves-in-passes]]
type Refused []Fault

func (faults Refused) Error() string {
	lines := make([]string, 0, len(faults)+1)
	lines = append(lines, "the index refuses to start:")
	for _, one := range faults {
		lines = append(lines, one.String())
	}
	return strings.Join(lines, "\n")
}

// The value of config/values: each key's resolved JSON literal, by its full name `<instance>/config/<key>`. [[spec/tickets/the-config-module-resolves-layers]]
type Resolved map[string]string

// A config key by its local name, which the wiring files under `<instance>/config/<key>`. [[spec/design_output/model#config-comes-off-the-registrations]]
func CfgIn[T any](c *Catalog, key string, def T, opts ...Option) Writer {
	return c.add(givenOf("config/"+key, def), callerAt(2), opts)
}
