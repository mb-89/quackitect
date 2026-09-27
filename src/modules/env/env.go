// The env IO module: it writes each SE_ variable once at start, on its
// out-port family, which the wiring binds to env/<name>.
// [[spec/design_output/model#its-file-carries-its-fake]]
package env

import "quackitect/src/q"

// The out-port family, by its local name. [[spec/design_output/model#the-wiring-file]]
const Family = "vars/<name>"

// [[spec/design_output/model#io-modules-and-their-fakes]]
type Env interface {
	Variables() map[string]string
}

type env struct{}

// The real environment, its SE_ variables alone. [[spec/design_output/model#its-file-carries-its-fake]]
func New() Env { return env{} }

func (env) Variables() map[string]string { return nil }

// A map of variables the test hands in. [[spec/design_output/model#io-modules-and-their-fakes]]
type FakeEnv map[string]string

func (one FakeEnv) Variables() map[string]string { return nil }

// [[spec/design_output/model#io-modules-are-modules]]
func Registers(c *q.Catalog) q.Writer {
	return q.GivenIn(c, Family, "", q.Doc("an SE_ variable, as the index starts"))
}

// Commits every variable in one commit, under the family's local name. [[spec/design_output/model#io-modules-are-modules]]
func Start(from Env, commit func(values map[string]any) error) error {
	return nil
}
