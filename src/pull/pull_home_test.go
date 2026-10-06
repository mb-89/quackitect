// An improve line names its home, so the next retro finds it and builds it: a
// path, a link or a ticket, and a line naming none stands refused.
// [[spec/tickets/improve-lines-name-their-home]]
package pull

import (
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
	t.Run("a list field the step leaves unmarked takes any line", func(t *testing.T) {
		plain := yaml.AsDoc(yaml.Read("name: well\nform: list\nsays: what went well\n"))
		if got := it.formFault(plain, []string{"- read the tests first"}, where, nil, Hold{}); len(got) > 0 {
			t.Fatalf("the unmarked field answers %q", got)
		}
	})
}
