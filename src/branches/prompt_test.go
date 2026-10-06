// The prompt verb's cases: the prompt a box starts with, off the group ticket
// and its route, and the refusals where either stands nowhere.
// [[spec/tickets/a-verb-writes-box-prompts]]
package branches

import (
	"bytes"
	"strings"
	"testing"
)

// A route of three steps, in the order a box meets them. [[spec/tickets/a-verb-writes-box-prompts]]
const promptRoute = `steps:
  - name: sync
    does: takes trunk in
  - name: split
    does: reads the children
  - name: children
    by: children
`

// A group ticket on the route the case names. [[spec/tickets/a-verb-writes-box-prompts]]
func promptGroup(route string) string {
	return "---\nkind: [[ticket]]\nstate: open\nprocess: [[spec/processes/" + route + "]]\nstep: split\n---\n\n# Ask\n\nThe group's ask.\n"
}

// A child of the group g, at the state the case names. [[spec/tickets/a-verb-writes-box-prompts]]
func promptChild(state string) string {
	return "---\nkind: [[ticket]]\nstate: " + state + "\nprocess: [[spec/processes/standard]]\ngroup: g\n---\n\n# Ask\n\nBuild it.\n"
}

// Doors over a folder holding the files, and the prompt verb's code, output and errors. [[spec/tickets/a-verb-writes-box-prompts]]
func promptSays(t *testing.T, files map[string]string, argv ...string) (int, string, string) {
	t.Helper()
	disk := newFakeDisk()
	for rel, text := range files {
		if err := disk.Write(rel, text); err != nil {
			t.Fatal(err)
		}
	}
	var out, errs bytes.Buffer
	d := &Doors{Root: testRoot, Disk: disk, Env: map[string]string{}, Out: &out, Errs: &errs}
	code := Cloud(d, append([]string{"prompt"}, argv...))
	return code, out.String(), errs.String()
}

func TestPromptWritesTheGroupsPromptFromItsRoute(t *testing.T) {
	t.Parallel()
	code, out, errs := promptSays(t, map[string]string{
		"spec/processes/group.yaml": promptRoute,
		"spec/tickets/g.md":         promptGroup("group"),
		"spec/tickets/b-child.md":   promptChild("open"),
		"spec/tickets/a-child.md":   promptChild("open"),
		"spec/tickets/c-shut.md":    promptChild("closed"),
	}, "g")
	if code != codeOK {
		t.Fatalf("cloud prompt g answers %d: %s", code, errs)
	}
	if !strings.HasPrefix(out, "run the work skill\n") {
		t.Fatalf("the prompt opens on no work skill line: %q", out)
	}
	holds(t, out, "Your group: g. Its child tickets stand under spec/tickets: a-child, b-child.")
	holds(t, out, "Its route: sync, split, children.")
	holds(t, out, boxRules)
	if strings.Contains(out, "c-shut") {
		t.Fatalf("the prompt names a closed child: %q", out)
	}
	take, done := strings.Index(out, "branch take"), strings.Index(out, "branch done")
	if take < 0 || done < 0 || take > done {
		t.Fatalf("the rules put no take before the done: %q", out)
	}
}

func TestPromptRefusesATicketThatStandsNowhere(t *testing.T) {
	t.Parallel()
	code, out, errs := promptSays(t, map[string]string{"spec/processes/group.yaml": promptRoute}, "gone")
	if code != codeRefused || out != "" {
		t.Fatalf("cloud prompt gone answers %d and prints %q", code, out)
	}
	holds(t, errs, "spec/tickets/gone.md stands nowhere")
}

func TestPromptRefusesARouteThatStandsNowhere(t *testing.T) {
	t.Parallel()
	code, out, errs := promptSays(t, map[string]string{"spec/tickets/g.md": promptGroup("group")}, "g")
	if code != codeRefused || out != "" {
		t.Fatalf("cloud prompt g answers %d and prints %q", code, out)
	}
	holds(t, errs, "spec/processes holds no group.")
}

func TestPromptRefusesATicketNamingNoGroup(t *testing.T) {
	t.Parallel()
	code, out, errs := promptSays(t, map[string]string{
		"spec/processes/standard.yaml": promptRoute,
		"spec/tickets/g.md":            promptGroup("standard"),
	}, "g")
	if code != codeRefused || out != "" {
		t.Fatalf("cloud prompt g answers %d and prints %q", code, out)
	}
	holds(t, errs, "spec/tickets/g.md names no group route")
}

func TestPromptRefusesNoName(t *testing.T) {
	t.Parallel()
	code, _, errs := promptSays(t, nil)
	if code != codeRefused {
		t.Fatalf("cloud prompt answers %d", code)
	}
	holds(t, errs, "cloud prompt needs a group")
}
