// An improve line names its home, so the next retro finds it and builds it: a
// path, a link or a ticket, and a line naming none stands refused.
// [[spec/tickets/improve-lines-name-their-home]]
package pull // level0: InPackageTest - the case calls the unexported formFault the chapter's fields pass through

import (
	"os"
	"strings"
	"testing"

	"quackitect/src/yaml"
)

func TestImproveLinesNameTheirHome(t *testing.T) {
	t.Parallel()
	it := &It{Disk: FakeDisk{
		"spec/tickets/slow-lint.md": "---\nstate: open\n---\n",
		"spec/guidance/working.md":  "# Working\n",
		"src/pull/pull_chapter.go":  "package pull\n",
	}}
	field := yaml.AsDoc(yaml.Read("name: improve\nform: list\nhome: true\nsays: how each bad line stops happening, named by its home\n"))
	where := "improve under retro/write"
	t.Run("a line naming no path, link or ticket stands refused", func(t *testing.T) {
		got := it.formFault(field, []string{"- read the tests first"}, where, nil, Hold{})
		if len(got) != 1 || !strings.Contains(got[0], "names no path, link or ticket") {
			t.Fatalf("the line answers %q", got)
		}
	})
	t.Run("a path, a new file in a standing folder, a link and a ticket each name a home", func(t *testing.T) {
		for _, row := range []string{
			"- a case in `src/pull/pull_chapter.go` holds it",
			"- a check in `src/pull/pull_home.go` holds it",
			"- a rule in [[spec/guidance/working#rules]] holds it",
			"- `slow-lint` builds it",
		} {
			if got := it.formFault(field, []string{row}, where, nil, Hold{}); len(got) > 0 {
				t.Errorf("%s answers %q", row, got)
			}
		}
	})
	t.Run("a home standing nowhere names none", func(t *testing.T) {
		for _, row := range []string{"- `ghost-ticket` builds it", "- [[spec/guidance/nowhere]] holds it", "- `nowhere/at/all.go` holds it", "- `./RUNME.sh check` runs it"} {
			if got := it.formFault(field, []string{row}, where, nil, Hold{}); len(got) != 1 {
				t.Errorf("%s answers %q", row, got)
			}
		}
	})
	t.Run("the group route's improve field carries home", func(t *testing.T) {
		text, err := os.ReadFile("../../spec/processes/group.yaml")
		if err != nil {
			t.Fatal(err)
		}
		improve := fieldNamed(yaml.Read(string(text)), "improve")
		if improve == nil || improve.Get("home") != true {
			t.Fatalf("the improve field reads %v", improve)
		}
	})
	t.Run("a list field the step leaves unmarked takes any line", func(t *testing.T) {
		plain := yaml.AsDoc(yaml.Read("name: well\nform: list\nsays: what went well\n"))
		if got := it.formFault(plain, []string{"- read the tests first"}, where, nil, Hold{}); len(got) > 0 {
			t.Fatalf("the unmarked field answers %q", got)
		}
	})
}

func fieldNamed(said any, name string) *yaml.Doc {
	if one := yaml.AsDoc(said); one != nil {
		if one.Get("name") == name && one.Has("form") {
			return one
		}
		for _, key := range one.Keys() {
			if got := fieldNamed(one.Get(key), name); got != nil {
				return got
			}
		}
		return nil
	}
	if list, held := said.([]any); held {
		for _, item := range list {
			if got := fieldNamed(item, name); got != nil {
				return got
			}
		}
	}
	return nil
}
