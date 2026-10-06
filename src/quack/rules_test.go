// The rules-over verb answers Vale's JSON over the text on stdin, keyed by the
// path it reads the text as, and names its usage where no path stands.
// [[spec/tickets/go-rules-replace-vale]]
package main

import (
	"encoding/json"
	"strings"
	"testing"

	"quackitect/src/rules"
)

func TestTheRulesOverVerbAnswersValesJSON(t *testing.T) {
	t.Parallel()
	var asked []string
	lint := func(path, text string) []rules.Finding {
		asked = append(asked, path, text)
		return []rules.Finding{{Check: "VoiceVale.ShoutedLead", Line: 1, Span: [2]int{1, 4}, Match: "THIS", Message: "A paragraph opens plainly.", Severity: "warning", Link: "spec/guidance/voice.md"}}
	}
	code, out, _ := runsTwin(rulesOverVerb(strings.NewReader("THIS line\n"), lint), "rules-over", "--path=spec/a.md")
	var said map[string][]rules.Finding
	if err := json.Unmarshal([]byte(out), &said); err != nil || code != 0 {
		t.Fatalf("rules answers %d, %q, and wants JSON: %v", code, out, err)
	}
	if rows := said["spec/a.md"]; len(rows) != 1 || rows[0].Check != "VoiceVale.ShoutedLead" || rows[0].Span != [2]int{1, 4} {
		t.Fatalf("rules answers %+v, and wants the one row under spec/a.md", said)
	}
	if strings.Join(asked, "|") != "spec/a.md|THIS line\n" {
		t.Fatalf("rules asks %q, and wants the path and the text on stdin", asked)
	}
	if code, _, errs := runsTwin(rulesOverVerb(strings.NewReader(""), lint), "rules-over"); code != exitUsage || !strings.Contains(errs, "--path=") {
		t.Fatalf("rules with no path answers %d, %q, and wants the usage", code, errs)
	}
}

// A rules load that fails names its own rule, past Vale's name. [[spec/tickets/vale-leaves-the-tree]]
func TestARulesLoadThatFailsNamesRulesLoad(t *testing.T) {
	t.Parallel()
	said := lspRules(t.TempDir())("a.md", "a line\n")
	if len(said) != 1 || said[0].Rule != "RulesLoad" {
		t.Fatalf("the rules answer %+v, and want one RulesLoad row", said)
	}
}

func TestAVehicleLendsTheRulesTheWorkRootLacks(t *testing.T) {
	t.Parallel()
	method, work := t.TempDir(), t.TempDir()
	seedsRules(t, method)
	if _, err := rulesAt(work); err == nil {
		t.Fatal("a bare work root loads rules, and wants a failed load")
	}
	if _, err := rulesUnder(work, method); err != nil {
		t.Fatalf("the work root under its vehicle loads no rules: %v", err)
	}
}

func TestTheWorkRootsFileStandsOverTheVehicles(t *testing.T) {
	t.Parallel()
	method, work := t.TempDir(), t.TempDir()
	seedsFile(t, method, "spec/a.yml", "method")
	seedsFile(t, method, "spec/b.yml", "method")
	seedsFile(t, work, "spec/a.yml", "work")
	read := readUnder(work, method)
	if read("spec/a.yml") != "work" || read("spec/b.yml") != "method" || read("spec/c.yml") != "" {
		t.Fatalf("reads %q, %q and %q, and wants work, method and nothing", read("spec/a.yml"), read("spec/b.yml"), read("spec/c.yml"))
	}
}
