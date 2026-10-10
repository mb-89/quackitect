// A red leaf whose tests land, and a later leaf passes since, stands kept on a
// replay while its tests stand, so the walk goes on. [[spec/design_output/pull#kept-red-leaves]]
package pull // level0: InPackageTest - reaches the unexported keptRed and the helpers cloudPull and must

import (
	"strings"
	"testing"
)

// A ticket past implement/change, whose red leaf's pass lands after the commit it names. [[spec/design_output/pull#kept-red-leaves]]
func keptTicket(before string) string {
	return `---
kind: [[ticket]]
state: open
steps:
  - name: design
    steps:
      - name: tests-red
        evidence:
          - name: tests
            form: command
            expects: assertion
          - name: red
            form: list
  - name: gate
  - name: implement
    steps:
      - name: change
step: design/tests-red
record:
  - step: design/tests-red
    def: aaaa
    hash_after: ` + before + `
  - step: implement/change
    def: bbbb
---

# design

## tests-red

### red

- src/pull/kept_test.go
`
}

func TestALandedRedLeafStandsKeptWhileItsTestsStand(t *testing.T) {
	t.Parallel()
	it, _, _ := cloudPull(t)
	before := it.tipOf()
	must(t, it.Disk.Write("src/pull/kept_test.go", "package pull\n"))
	must(t, it.Git.AddAll())
	_, err := it.Git.Commit("t: passes design/tests-red", nil)
	must(t, err)
	text := keptTicket(before)
	leaf := LeafOf(FrontOf(text), "design/tests-red")
	kept := it.keptRed(text, leaf, "t")
	if len(kept) == 0 || !strings.Contains(kept[len(kept)-1].Value.(string), "a later leaf passed since") {
		t.Fatalf("the red leaf stands kept as %v", kept)
	}
	must(t, it.Disk.Remove("src/pull/kept_test.go"))
	must(t, it.Git.AddAll())
	_, err = it.Git.Commit("the red case leaves", nil)
	must(t, err)
	if kept := it.keptRed(text, leaf, "t"); kept != nil {
		t.Fatalf("a red leaf whose test is gone stands kept as %v", kept)
	}
}
