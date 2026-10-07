// A command field missing what it expects logs the command's whole output,
// and its refusal says the log holds it. [[spec/tickets/red-commands-log-their-output]]
package pull // level0: InPackageTest - the case reads the unexported commandsRun and redLogged

import (
	"strings"
	"testing"

	"quackitect/src/yaml"
)

func TestARedCommandLogsItsWholeOutputAndItsRefusalSaysSo(t *testing.T) {
	t.Parallel()
	const said = "a fault the check names\nthe check's parts, in seconds\n  79.6  in all\n"
	var rows []map[string]any
	it := &It{
		Shell: func(string) (string, int, error) { return said, 1, nil },
		Log: func(level, kind, line string, extra map[string]any) {
			rows = append(rows, map[string]any{"level": level, "line": line, "command": extra["command"], "output": extra["output"]})
		},
	}
	for _, expects := range []string{"0", "green"} {
		rows = nil
		field := yaml.New()
		field.Set("name", "check")
		field.Set("form", "command")
		field.Set("expects", expects)
		var faults []string
		it.commandsRun("a/leaf", []*yaml.Doc{field}, Chapter{Fields: map[string][]string{"check": {"./RUNME.sh check"}}}, &faults)
		if len(faults) != 1 || !strings.HasSuffix(faults[0], redLogged) {
			t.Fatalf("expects %s: the refusal reads %q, and wants it to end on %q", expects, faults, redLogged)
		}
		if len(rows) != 1 || rows[0]["level"] != "warn" || rows[0]["command"] != "./RUNME.sh check" || rows[0]["output"] != said {
			t.Fatalf("expects %s: the log takes %v, and wants one warn row holding the command and its whole output", expects, rows)
		}
	}
	it.Log = nil
	var faults []string
	field := yaml.New()
	field.Set("name", "check")
	field.Set("form", "command")
	field.Set("expects", "0")
	it.commandsRun("a/leaf", []*yaml.Doc{field}, Chapter{Fields: map[string][]string{"check": {"./RUNME.sh check"}}}, &faults)
	if len(faults) != 1 || strings.Contains(faults[0], redLogged) {
		t.Fatalf("with no log the refusal reads %q, and wants no word of a log", faults)
	}
}
