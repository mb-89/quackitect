// ticket set writes one field of a ticket's front as the schema takes it, and
// refuses a field the engine owns.
// [[spec/tickets/view-actions-run-through-verbs]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"strings"
	"testing"
)

// The schema the edit cases weigh against, as ticket-edit.test.js seeds it. [[spec/tickets/view-actions-run-through-verbs]]
const editCaseSchema = `kind: ticket

frontmatter:
  type: object
  properties:
    state:
      enum: [open, closed]
      x-engine: true
    step:
      type: string
      x-engine: true
    steps:
      type: array
      x-engine: true
    urgent:
      type: boolean
    group:
      type: string
    todo:
      type: [boolean, string]
`

// A ticket as ticket-edit.test.js seeds it, with the extra rows over its route. [[spec/tickets/view-actions-run-through-verbs]]
func editCaseTicket(extra string) string {
	return "---\nkind: [[ticket]]\nstate: open\n" + extra + "steps:\n  - name: do\n    does: makes the change\nstep: do\n---\n\n# Ask\n\nA thing.\n"
}

// A tree holding the schema and the tickets the case names, each under spec/tickets. [[spec/tickets/view-actions-run-through-verbs]]
func editCaseTree(t *testing.T, names ...string) string {
	t.Helper()
	root := t.TempDir()
	t.Setenv(workRootVar, "")
	seedsFile(t, root, "spec/schemas/ticket.schema.yaml", editCaseSchema)
	for _, name := range names {
		seedsFile(t, root, "spec/tickets/"+name+".md", editCaseTicket(""))
	}
	return root
}

// Runs a verb through the registry over the root, and answers its exit code, its stdout and its stderr apart. [[spec/tickets/ticket-verbs-port-to-go]]
func runsApart(t *testing.T, root string, dry bool, words ...string) (int, string, string) {
	t.Helper()
	t.Setenv("QUACKITECT_ROOT", root)
	_, one := twinOf(words, registry)
	if one == nil {
		t.Fatalf("the registry holds no Go answer for %s", strings.Join(words, " "))
	}
	var out, errs strings.Builder
	code := one(words, dry, &out, &errs)
	return code, out.String(), errs.String()
}

const aThing = "spec/tickets/a-thing.md"

func TestTicketSet(t *testing.T) {
	t.Run("set joins the words past the field into one value", func(t *testing.T) {
		root := editCaseTree(t, "a-thing")
		code, out, _ := runsApart(t, root, false, "ticket", "set", "a-thing", "group", "a", "group")
		if got, _ := readsBack(t, root, aThing); code != 0 || out != "spec/tickets/a-thing.md carries group: a group.\n" || !strings.Contains(got, "\ngroup: a group\n") {
			t.Fatalf("set answers %d, %q, and writes %q", code, out, got)
		}
	})
	t.Run("an empty value and a flag standing off drop the field", func(t *testing.T) {
		for _, value := range [][]string{{}, {"false"}} {
			root := t.TempDir()
			t.Setenv(workRootVar, "")
			seedsFile(t, root, "spec/schemas/ticket.schema.yaml", editCaseSchema)
			seedsFile(t, root, aThing, editCaseTicket("todo: true\n"))
			code, out, _ := runsApart(t, root, false, append([]string{"ticket", "set", "a-thing", "todo"}, value...)...)
			want := "spec/tickets/a-thing.md carries todo: " + map[int]string{0: "nothing", 1: "false"}[len(value)] + ".\n"
			if got, _ := readsBack(t, root, aThing); code != 0 || out != want || got != editCaseTicket("") {
				t.Fatalf("set %v answers %d, %q, and writes %q", value, code, out, got)
			}
		}
	})
	t.Run("set weighs the value against the schema, as the tab does", func(t *testing.T) {
		root := editCaseTree(t, "a-thing")
		code, _, errs := runsApart(t, root, false, "ticket", "set", "a-thing", "urgent", "maybe")
		if got, _ := readsBack(t, root, aThing); code != 2 || errs != "urgent takes a boolean, and \"maybe\" reads as none.\n" || got != editCaseTicket("") {
			t.Fatalf("set urgent maybe answers %d, %q, and writes %q", code, errs, got)
		}
	})
	t.Run("set refuses a group that stands closed, and writes nothing", func(t *testing.T) {
		root := editCaseTree(t, "a-thing")
		seedsFile(t, root, "spec/tickets/shut.md", closedGroupTicket)
		code, out, errs := runsApart(t, root, false, "ticket", "set", "a-thing", "group", "shut")
		if got, _ := readsBack(t, root, aThing); code != 2 || out != "" || !strings.HasPrefix(errs, "shut stands closed, so it takes no new child.") || got != editCaseTicket("") {
			t.Fatalf("set group shut answers %d, %q, %q, and writes %q", code, out, errs, got)
		}
	})
	t.Run("set names the call it needs where a word is missing", func(t *testing.T) {
		root := editCaseTree(t, "a-thing")
		for _, one := range []struct {
			argv []string
			want string
		}{
			{[]string{"ticket", "set"}, "ticket set"},
			{[]string{"ticket", "set", "a-thing"}, "a-thing"},
			{[]string{"ticket", "set", "nowhere", "group", "a"}, "nowhere"},
		} {
			code, out, errs := runsApart(t, root, false, one.argv...)
			want := one.want + " needs a ticket, a field and a value: ./RUNME.sh ticket set slow-lint group a-group\n"
			if code != 2 || out != "" || errs != want {
				t.Errorf("%v answers %d, %q, %q", one.argv, code, out, errs)
			}
		}
	})
	t.Run("a dry run says what it writes, and writes nothing", func(t *testing.T) {
		root := editCaseTree(t, "a-thing")
		code, out, _ := runsApart(t, root, true, "ticket", "set", "a-thing", "group", "a-group")
		if got, _ := readsBack(t, root, aThing); code != 0 || out != "spec/tickets/a-thing.md carries group: a-group.\n" || got != editCaseTicket("") {
			t.Fatalf("the dry set answers %d, %q, and writes %q", code, out, got)
		}
	})
}
