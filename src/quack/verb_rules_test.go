// The rules verb in Go: each style's rule and its message, and the refusal
// where the style folder stands nowhere.
// [[spec/tickets/config-verbs-port-to-go]]
package main

import (
	"strings"
	"testing"
)

func rulesRan(root string) (int, string, string) {
	var out, errs strings.Builder
	code := rulesVerb(func() (string, error) { return root, nil })([]string{"rules"}, false, &out, &errs)
	return code, out.String(), errs.String()
}

func TestRulesListsEveryStyleMessage(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedFile(t, root, "spec/config/styles/VoiceVale/Antithesis.yml", "extends: existence\nmessage: \"Say what is.\"\n")
	seedFile(t, root, "spec/config/styles/VoiceVale/notes.txt", "no rule\n")
	seedFile(t, root, "spec/config/styles/VoiceShape/Header.yml", "message: The header runs long.\n")
	code, out, _ := rulesRan(root)
	want := "Antithesis           Say what is.\nHeader               The header runs long.\n"
	if code != 0 || out != want {
		t.Fatalf("rules answers %d and\n%s\nand wants\n%s", code, out, want)
	}
}

func TestRulesReadsAMessageEndingInACarriageReturn(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedFile(t, root, "spec/config/styles/VoiceVale/Antithesis.yml", "extends: existence\r\nmessage: \"Say what is.\"\r\nlevel: error\r\n")
	code, out, _ := rulesRan(root)
	if want := "Antithesis           Say what is.\n"; code != 0 || out != want {
		t.Fatalf("rules answers %d and %q, and wants %q", code, out, want)
	}
}

func TestRulesRefusesWhereNoStyleStands(t *testing.T) {
	t.Parallel()
	code, _, errs := rulesRan(t.TempDir())
	if code != exitUsage || errs != "The style folder is missing.\n" {
		t.Fatalf("rules answers %d and %q, and wants the refusal", code, errs)
	}
}
