// The wiring: the instances to load, each of a module type, and the wire
// binding each port to a name. A module names its ports locally alone.
// [[spec/design_output/model#the-wiring-file]]
package q

// The mark a wire carries where an in-port reads its built-in value. [[spec/design_output/model#the-wiring-file]]
const BuiltIn = "built-in"

const Unwired Kind = "an in-port with no wire"

type Instance struct {
	Name   string
	Module string
}

// Wires map `<instance>.<port>` to a standard name, to `<instance>.<port>` of a writer, or to BuiltIn. [[spec/design_output/model#the-wiring-file]]
type Wiring struct {
	Instances []Instance
	Wires     map[string]string
}

// [[spec/design_output/model#the-wiring-file]]
func ReadWiring(text string) (Wiring, error) {
	return Wiring{}, nil
}

// [[spec/design_output/model#the-wiring-file]]
func Load(w Wiring, types map[string]func(*Catalog)) (*Catalog, []Fault) {
	return New(), nil
}

// A config key by its local name, which the wiring files under `<instance>/config/<key>`. [[spec/design_output/model#config-comes-off-the-registrations]]
func CfgIn[T any](c *Catalog, key string, def T, opts ...Option) Writer {
	return c.add(givenOf("config/"+key, def), callerAt(2), opts)
}
