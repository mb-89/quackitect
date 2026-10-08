// The fixture home of the guidance cases: the fake index a case seeds with
// its files and reads the steps off.
// [[spec/guidance/code/testing]]
package guidance // level0: InPackageTest - the case files beside it stand in the package and share its helper

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// What the module answers over the files a case seeds. [[spec/design_output/model#the-fake-index]]
func stepsOver(t *testing.T, files map[string]string) map[string][]Read {
	t.Helper()
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	seeds := map[string]any{}
	for at, text := range files {
		seeds["files/"+at] = q.Content{Hash: "h", Text: text}
	}
	index.Seed(seeds)
	said, _ := index.Run(StepsPort).(map[string][]Read)
	return said
}
