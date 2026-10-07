// The door test of vale in the branch package: the dispatcher's fix ask runs
// through vale itself, the one case here spawning a process.
// [[spec/design_output/doors#one-contract-test-per-door]]
package branches

import (
	"encoding/json"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"quackitect/src/proc"
)

// The fix ask meets the voice rules Vale holds, as askFaults read them at each run in the JavaScript. [[spec/tickets/dispatch-verbs-port-to-go]]
func TestDispatchWritesAFixAskTheVoiceRulesPass(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose()})
	vale := filepath.Join(one.d.Method, filepath.FromSlash(runtimeFolder), "bin", "vale")
	if listed, _ := one.d.Methods.List(runtimeFolder + "/bin"); !slices.Contains(listed, runtimeFolder+"/bin/vale") {
		vale = "vale"
	}
	one.dpGreen()
	_, fix := one.dpWriteBranch()
	text := one.dpWritten(fix)
	if !strings.Contains(text, "# Ask\n\nThe loose agent tickets") {
		t.Fatalf("the ask holds no line:\n%s", text)
	}
	ran := proc.Real(proc.Command{Argv: []string{vale, "--config=" + filepath.Join(one.d.Method, ".vale.ini"), "--output=JSON", "--no-exit", "--path=" + ticketAt(fix)}, Dir: one.d.Method, Stdin: text})
	if ran.Code == proc.NotStarted {
		t.Skip("this box holds no vale")
	}
	if ran.Code != 0 {
		t.Fatalf("vale answers %d: %s", ran.Code, ran.Err)
	}
	said := []byte(ran.Out)
	var found map[string][]struct {
		Line     int
		Severity string
		Check    string
		Message  string
	}
	if err := json.Unmarshal(said, &found); err != nil {
		t.Fatalf("vale prints no JSON: %s", said)
	}
	ask, last := dpAskSpan(text)
	for _, rows := range found {
		for _, row := range rows {
			if (row.Severity == "error" || row.Severity == "warning") && row.Line >= ask && row.Line <= last {
				t.Errorf("line %d breaks %s: %s", row.Line, row.Check, row.Message)
			}
		}
	}
}

// The lines the Ask chapter spans, its heading first. [[spec/tickets/dispatch-verbs-port-to-go]]
func dpAskSpan(text string) (int, int) {
	lines := strings.Split(text, "\n")
	first := slices.Index(lines, "# Ask") + 1
	for at := first; at < len(lines); at++ {
		if strings.HasPrefix(lines[at], "# ") {
			return first, at
		}
	}
	return first, len(lines)
}
