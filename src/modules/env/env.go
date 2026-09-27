// The env IO module: it writes each SE_ variable once at start, on its
// out-port family, which the wiring binds to env/<name>.
// [[spec/design_output/model#its-file-carries-its-fake]]
package env

import (
	"os"
	"strings"

	"quackitect/src/q"
)

// The out-port family, by its local name. [[spec/design_output/model#the-wiring-file]]
const Family = "vars/<name>"

const (
	familyPrefix = "vars/"
	prefix       = "SE_"
)

// [[spec/design_output/model#io-modules-and-their-fakes]]
type Env interface {
	Variables() map[string]string
}

type env struct{}

// The real environment, its SE_ variables alone. [[spec/design_output/model#its-file-carries-its-fake]]
func New() Env { return env{} }

func (env) Variables() map[string]string {
	out := map[string]string{}
	for _, line := range os.Environ() {
		if name, value, ok := strings.Cut(line, "="); ok && strings.HasPrefix(name, prefix) {
			out[name] = value
		}
	}
	return out
}

// A map of variables the test hands in. [[spec/design_output/model#io-modules-and-their-fakes]]
type FakeEnv map[string]string

func (one FakeEnv) Variables() map[string]string {
	out := map[string]string{}
	for name, value := range one {
		if strings.HasPrefix(name, prefix) {
			out[name] = value
		}
	}
	return out
}

// [[spec/design_output/model#io-modules-are-modules]]
func Registers(c *q.Catalog) q.Writer {
	return q.GivenIn(c, Family, "", q.Doc("an SE_ variable, as the index starts"), q.IO())
}

// Commits every variable in one commit, under the family's local name. [[spec/design_output/model#io-modules-are-modules]]
func Start(from Env, commit func(values map[string]any) error) error {
	values := map[string]any{}
	for name, value := range from.Variables() {
		values[familyPrefix+name] = value
	}
	if len(values) == 0 {
		return nil
	}
	return commit(values)
}
