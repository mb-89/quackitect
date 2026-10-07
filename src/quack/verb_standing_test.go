// The standing verb in Go: the layer level zero hands a session, and the
// canary under it.
// [[spec/tickets/config-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"strings"
	"testing"
)

const standingNote = "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Say what is. *\n2. Name the role.\n\n# Examples\n\n| the rule | do |\n|---|---|\n| 1 | this |\n"

func standingRan(root string, env map[string]string) (int, string, string) {
	var out, errs strings.Builder
	code := standingVerb(func() (string, error) { return root, nil }, func() boxDoors { return boxDoors{env: func(name string) string { return env[name] }, disk: realDisk()} })([]string{"standing"}, false, &out, &errs)
	return code, out.String(), errs.String()
}

func TestStandingPrintsTheLayerAndTheCanary(t *testing.T) {
	t.Parallel()
	root := configRoot(t, `{}`)
	seedFile(t, root, "spec/guidance/voice.md", standingNote)
	seedFile(t, root, "spec/guidance/cloud.md", "---\nkind: [[guidance]]\nenv: [SE_CLOUD]\n---\n\n# Actionables\n\n1. Push.\n")
	seedFile(t, root, "spec/guidance/_draft.md", standingNote)
	code, out, _ := standingRan(root, map[string]string{})
	want := "### voice\n\n1. Say what is.\n2. Name the role.\n\n| the rule | do |\n|---|---|\n| 1 | this |\n\nlevel0 holds this session: 2 rules, 1 notes, the stop hook on.\n"
	if code != 0 || out != want {
		t.Fatalf("standing answers %d and\n%s\nand wants\n%s", code, out, want)
	}
	if _, out, _ = standingRan(root, map[string]string{"SE_CLOUD": "1"}); !strings.Contains(out, "### cloud\n\n1. Push.\n") || !strings.Contains(out, "3 rules, 2 notes") {
		t.Fatalf("standing on a cloud box answers\n%s\nand wants the cloud note", out)
	}
}

func TestStandingSaysTheStopHookOff(t *testing.T) {
	t.Parallel()
	root := configRoot(t, `{"stop": {"enabled": false}}`)
	seedFile(t, root, "spec/guidance/voice.md", standingNote)
	if _, out, _ := standingRan(root, map[string]string{}); !strings.HasSuffix(out, "the stop hook off.\n") {
		t.Fatalf("standing answers\n%s\nand wants the stop hook off", out)
	}
}

func TestStandingRefusesWhereNoGuidanceStands(t *testing.T) {
	t.Parallel()
	code, _, errs := standingRan(t.TempDir(), map[string]string{})
	if code != exitUsage || errs != "There is no spec/guidance, so nothing is handed over.\n" {
		t.Fatalf("standing answers %d and %q, and wants the refusal", code, errs)
	}
}

func TestStandingSaysWhereNoNoteCarriesRules(t *testing.T) {
	t.Parallel()
	root := configRoot(t, `{}`)
	seedFile(t, root, "spec/guidance/empty.md", "---\nkind: [[guidance]]\n---\n\n# Notes\n")
	if code, out, _ := standingRan(root, map[string]string{}); code != 0 || out != "No guidance note carries an Actionables chapter.\n" {
		t.Fatalf("standing answers %d and %q", code, out)
	}
}
