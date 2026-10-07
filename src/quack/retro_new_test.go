// The retro's mint, driven through a fake runner: the mint writes the draft,
// the verb writes the reason into its ask, the open opens it and the pull hands
// out its first leaf.
// [[spec/design_input/the-agent-pulls-tickets]]
package main

import (
	"errors"
	"io/fs"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

const (
	retroNewTip   = "a1b2c3d4e5f6a7b8"
	retroNewDraft = "---\nkind: [[ticket]]\nstate: draft\nprocess: [[spec/processes/retro]]\nsteps:\n  - name: collect\n---\n\n# Ask\n\n<!-- why, as text: what calls for it -->\n\n# design\n"
	retroNewWarn  = "spec/tickets/retro-one.md holds an Ask that breaks a rule of form, and it lands. Leave the lines as they stand, and carry on:\n  10:4 breaks Characters\n"
)

// A tree and a runner taught the tip, and the mint, the open and the pull of the named retro, as the verbs answer them. [[spec/design_input/the-agent-pulls-tickets]]
func retroNewTree(t *testing.T, name string) (string, *retroMintFake) {
	t.Helper()
	root := t.TempDir()
	path := "spec/tickets/" + name + ".md"
	fake := &retroMintFake{answers: map[string]func() retroMintRan{
		"git rev-parse HEAD": func() retroMintRan { return retroMintRan{out: retroNewTip + "\n"} },
		"./RUNME.sh mint ticket " + path + " --process=retro": func() retroMintRan {
			retroMintWrite(t, root, path, retroNewDraft)
			return retroMintRan{out: path + " stands, in the shape ticket names.\nWrite it, then run ./RUNME.sh lint to read what is left.\n"}
		},
		"./RUNME.sh ticket open " + name: func() retroMintRan {
			text := retroMintReadFile(t, root, path)
			retroMintWrite(t, root, path, strings.Replace(text, "state: draft\n", "state: open\nstep: collect\n", 1))
			ran := retroMintRan{out: path + " stands open at collect, and the pull hands it out.\n"}
			if strings.Contains(text, "one; two") {
				ran.errs = retroNewWarn
			}
			return ran
		},
		"./RUNME.sh ticket pull " + name: func() retroMintRan {
			return retroMintRan{out: "Pull: " + name + " at collect\n"}
		},
	}}
	return root, fake
}

// Runs retro new over the tree with the fake runner. [[spec/design_input/the-agent-pulls-tickets]]
func retroNewRuns(root string, fake *retroMintFake, words ...string) (int, string, string) {
	return retroMintHeard(retroNewVerb(retroBoxAt(root), fake.run), append([]string{"retro", "new"}, words...)...)
}

// The words of each call the fake heard, one a line. [[spec/design_input/the-agent-pulls-tickets]]
func retroNewCalls(fake *retroMintFake) string {
	rows := []string{}
	for _, one := range fake.ran {
		rows = append(rows, strings.Join(one.argv, " "))
	}
	return strings.Join(rows, "\n")
}

// retro new writes the ticket off the retro route through the mint, and names it for the tip. [[spec/design_input/the-agent-pulls-tickets]]
func TestRetroNewWritesTheTicketOffTheRetroRouteNamedForTheTip(t *testing.T) {
	t.Parallel()
	root, fake := retroNewTree(t, "retro-a1b2c3d")
	code, out, errs := retroNewRuns(root, fake)
	if code != 0 {
		t.Fatalf("retro new answers %d and prints %q, %q", code, out, errs)
	}
	ticket := retroMintReadFile(t, root, "spec/tickets/retro-a1b2c3d.md")
	if !strings.Contains(ticket, "process: [[spec/processes/retro]]") {
		t.Fatalf("the name reads off the commit it stands on, and the ticket reads %q", ticket)
	}
	if strings.Contains(out, "stands, in the shape") || strings.Contains(out, "stands open at") {
		t.Fatalf("the mint's and the open's words pass through: %q", out)
	}
}

// retro new opens the ticket at the route's first leaf, so a hand pulls it without a second command. [[spec/design_input/the-agent-pulls-tickets]]
func TestRetroNewOpensTheTicketSoAHandPullsItWithoutASecondCommand(t *testing.T) {
	t.Parallel()
	root, fake := retroNewTree(t, "retro-a1b2c3d")
	retroNewRuns(root, fake)
	want := "git rev-parse HEAD\n./RUNME.sh mint ticket spec/tickets/retro-a1b2c3d.md --process=retro\n./RUNME.sh ticket open retro-a1b2c3d\n./RUNME.sh ticket pull retro-a1b2c3d"
	if got := retroNewCalls(fake); got != want {
		t.Fatalf("retro new runs %q, want %q", got, want)
	}
	said := retroMintReadFile(t, root, "spec/tickets/retro-a1b2c3d.md")
	if !regexp.MustCompile(`(?m)^state: open$`).MatchString(said) || !regexp.MustCompile(`(?m)^step: collect$`).MatchString(said) || regexp.MustCompile(`(?m)^urgent:`).MatchString(said) {
		t.Fatalf("the ticket reads %q", said)
	}
	for _, one := range fake.ran[1:] {
		if one.dir != root || one.env[workRoot] != root {
			t.Fatalf("%v runs in %q with %v, off the work root", one.argv, one.dir, one.env)
		}
	}
}

// retro new writes the reason into the ask, before the next chapter, and takes a name a hand gives. [[spec/design_input/the-agent-pulls-tickets]]
func TestRetroNewWritesTheReasonIntoTheAskAndTakesANameAHandGives(t *testing.T) {
	t.Parallel()
	root, fake := retroNewTree(t, "retro-one")
	code, out, errs := retroNewRuns(root, fake, "--why", "the window ends", "--name", "retro-one")
	if code != 0 {
		t.Fatalf("retro new answers %d and prints %q, %q", code, out, errs)
	}
	said := retroMintReadFile(t, root, "spec/tickets/retro-one.md")
	at := strings.Index(said, "the window ends")
	if at < 0 || at < strings.Index(said, "# Ask") || at > strings.Index(said, "# design") {
		t.Fatalf("the ask carries no reason: %q", said)
	}
}

// retro new refuses a name a ticket holds already, writes nothing over it and runs no mint. [[spec/design_input/the-agent-pulls-tickets]]
func TestRetroNewRefusesANameATicketHoldsAlready(t *testing.T) {
	t.Parallel()
	root, fake := retroNewTree(t, "retro-one")
	retroMintWrite(t, root, "spec/tickets/retro-one.md", "---\nkind: [[ticket]]\n---\n")
	code, _, errs := retroNewRuns(root, fake, "--name", "retro-one")
	if code != 1 || errs != "spec/tickets/retro-one.md stands already. Name a retro nothing holds yet.\n" {
		t.Fatalf("retro new answers %d and says %q", code, errs)
	}
	if got := retroMintReadFile(t, root, "spec/tickets/retro-one.md"); got != "---\nkind: [[ticket]]\n---\n" {
		t.Fatalf("the ticket reads %q", got)
	}
	if strings.Contains(retroNewCalls(fake), "mint") {
		t.Fatalf("retro new runs %q", retroNewCalls(fake))
	}
}

// retro new hands its retro to the pull by name, and the pull's words and exit stand as its own. [[spec/design_output/config#the-engine-controls]]
func TestRetroNewTakesItsRetroUnderQueue(t *testing.T) {
	t.Parallel()
	root, fake := retroNewTree(t, "retro-one")
	code, out, errs := retroNewRuns(root, fake, "--name", "retro-one")
	if code != 0 || out != "Pull: retro-one at collect\n" || strings.Contains(errs, "behind the queue") {
		t.Fatalf("retro new answers %d and prints %q, %q", code, out, errs)
	}
	pull := fake.ran[len(fake.ran)-1]
	if strings.Join(pull.argv, " ") != "./RUNME.sh ticket pull retro-one" || pull.env["SE_MINTED"] != "retro-one" {
		t.Fatalf("the pull runs %v with %v, and names no minted ticket", pull.argv, pull.env)
	}
}

// retro new removes its draft where the open refuses, so the next run takes the same name. [[spec/design_output/pull#a-draft-opens]]
func TestRetroNewRemovesItsDraftWhereTheOpenRefuses(t *testing.T) {
	t.Parallel()
	root, fake := retroNewTree(t, "retro-one")
	fake.answers["./RUNME.sh ticket open retro-one"] = func() retroMintRan {
		return retroMintRan{code: 1, errs: "the ask breaks a rule\n"}
	}
	code, _, errs := retroNewRuns(root, fake, "--why", "refused", "--name", "retro-one")
	if code != 1 || !strings.Contains(errs, "the ask breaks a rule") {
		t.Fatalf("retro new answers %d and says %q", code, errs)
	}
	if _, err := hq2RetroDisk(root).stat(filepath.Join(root, "spec", "tickets", "retro-one.md")); !errors.Is(err, fs.ErrNotExist) {
		t.Fatalf("the draft stands after a refused open: %v", err)
	}
	if strings.Contains(retroNewCalls(fake), "ticket pull") {
		t.Fatalf("retro new runs %q", retroNewCalls(fake))
	}
}

// retro new writes a --why line the lint warns on, names Characters, and the ticket lands. [[spec/design_output/pull#the-voice-reads-the-evidence]]
func TestRetroNewWritesAWhyLineTheLintWarnsOnAndNamesCharacters(t *testing.T) {
	t.Parallel()
	root, fake := retroNewTree(t, "retro-one")
	code, out, errs := retroNewRuns(root, fake, "--why", "one; two", "--name", "retro-one")
	if code != 0 || !strings.Contains(errs, "breaks a rule of form, and it lands") || !strings.Contains(errs, "breaks Characters") {
		t.Fatalf("retro new answers %d and prints %q, %q", code, out, errs)
	}
	if !strings.Contains(retroMintReadFile(t, root, "spec/tickets/retro-one.md"), "one; two") {
		t.Fatal("the ticket stands with no --why line")
	}
}
