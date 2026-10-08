// The mint verb writes a new note in the shape its schema names: the route
// and its hash copy in off the process, a ticket a box mints joins the group
// it works, and an empty group stands refused, as mint-verb.js wrote it.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"os" // level0: OutsideInDoors - the case reads the schemas the tree holds, as a build check reads source
	"path/filepath"
	"strings"
	"testing"
)

const mintProcess = `ask:
  - name: why
    form: text
    says: why it matters
steps:
  - name: build
    does: makes the change
    evidence:
      - name: lint
        form: command
        expects: 0
        says: the tree lints
`

// What mint-verb.js wrote for a ticket off mintProcess on work/grp, the hash hashText answers over the canonical route among it. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
const mintedTicket = `---
kind: [[ticket]]
state: draft
steps:
  - name: build
    does: makes the change
    evidence:
      - name: lint
        form: command
        expects: 0
        says: the tree lints
process: [[spec/processes/small]]
process_hash: 61a7767d3f2bb8d1
group: grp
---

# Ask

Some ask that says what it wants.

# build

<!-- makes the change -->

## lint

<!-- the tree lints -->

<!-- the form is command -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
`

// A group that stands closed, which takes no new child. [[spec/design_output/pull#a-closed-group-hands-nothing]]
const closedGroupTicket = "---\nkind: [[ticket]]\nstate: closed\nprocess: [[spec/processes/group]]\n---\n"

// A tree holding the schemas this tree holds and one small process, on the branch named. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func mintTree(t *testing.T, branch string) string {
	t.Helper()
	root := t.TempDir()
	schemas, err := filepath.Glob(filepath.Join("..", "..", "spec", "schemas", "*.yaml"))
	if err != nil || len(schemas) == 0 {
		t.Fatalf("the schemas stand nowhere: %v", err)
	}
	for _, one := range schemas {
		text, err := os.ReadFile(one)
		if err != nil {
			t.Fatal(err)
		}
		seedFile(t, root, "spec/schemas/"+filepath.Base(one), string(text))
	}
	nodes, err := filepath.Glob(filepath.Join("..", "..", "spec", "failures", "*.md"))
	if err != nil {
		t.Fatal(err)
	}
	for _, one := range nodes {
		text, err := os.ReadFile(one)
		if err != nil {
			t.Fatal(err)
		}
		seedFile(t, root, "spec/failures/"+filepath.Base(one), string(text))
	}
	seedFile(t, root, "spec/processes/small.yaml", mintProcess)
	seedFile(t, root, "spec/processes/group.yaml", mintProcess)
	repo := standsInRepo(t, root)
	if branch != "" {
		if err := repo.Switch(branch, true); err != nil {
			t.Fatal(err)
		}
		commitsAll(t, repo, "first")
	}
	return root
}

func TestMintVerb(t *testing.T) {
	// [[spec/tickets/verbs-mint-tickets-and-keys]]
	t.Run("a ticket takes the gain the breaks and the done when as fields", func(t *testing.T) {
		root := mintTree(t, "")
		seedFile(t, root, "spec/processes/standard.yaml", shippedText(t, "spec/processes/standard.yaml"))
		code, said := runsVerb(t, root, "mint", "ticket", "spec/tickets/fresh.md", "--process=standard",
			"--gain=A box mints with no sed.", "--breaks=Clones carry stray fields.", "--done_when=one passes", "--done_when=two passes")
		got, _ := readIn(root, "spec/tickets/fresh.md")
		if code != 0 || !strings.Contains(got, "# Ask\n\nA box mints with no sed.\n\nClones carry stray fields.\n\n- one passes\n- two passes\n") {
			t.Fatalf("the mint answers %d: %s\nand writes:\n%s", code, said, got)
		}
	})
	t.Run("a ticket naming the Ask and an ask field comes back refused", func(t *testing.T) {
		root := mintTree(t, "")
		if code, said := runsVerb(t, root, "mint", "ticket", "spec/tickets/fresh.md", "--process=small", "--Ask=an ask", "--why=a field"); code != exitUsage || !strings.Contains(said, "--Ask") {
			t.Fatalf("the mint answers %d: %s", code, said)
		}
	})
	t.Run("a ticket on a work branch copies the route and its hash in, and joins the group", func(t *testing.T) {
		root := mintTree(t, "work/grp")
		code, said := runsVerb(t, root, "mint", "ticket", "spec/tickets/fresh.md", "--process=small", "--Ask=Some ask that says what it wants.")
		if code != 0 {
			t.Fatalf("the mint answers %d: %s", code, said)
		}
		if got, _ := readIn(root, "spec/tickets/fresh.md"); got != mintedTicket {
			t.Fatalf("the mint writes:\n%s\nand wants:\n%s", got, mintedTicket)
		}
		for _, line := range []string{
			"spec/tickets/fresh.md stands, in the shape ticket names.",
			"Write it, then run ./RUNME.sh lint to read what is left.",
		} {
			if !strings.Contains(said, line) {
				t.Errorf("the mint says %q, and wants %q", said, line)
			}
		}
	})
	t.Run("a ticket naming no ask takes the process's ask rows, and a mint off a handover line writes the from line first", func(t *testing.T) {
		for ask, extra := range map[string][]string{
			"# Ask\n\n<!-- why, as text: why it matters -->\n\n# build": nil,
			"# Ask\n\nfrom: handover\n\nthe owner said so\n":            {"--from=handover", "--Ask=the owner said so"},
		} {
			root := mintTree(t, "")
			if code, said := runsVerb(t, root, append([]string{"mint", "ticket", "spec/tickets/fresh.md", "--process=small"}, extra...)...); code != 0 {
				t.Fatalf("the mint answers %d: %s", code, said)
			}
			if got, _ := readIn(root, "spec/tickets/fresh.md"); !strings.Contains(got, ask) || strings.Contains(got, "group:") {
				t.Fatalf("the mint writes:\n%s", got)
			}
		}
	})
	t.Run("the branch's own ticket, a ticket on main and a note of another kind join no group", func(t *testing.T) {
		for _, one := range [][]string{{"work/fresh", "ticket", "spec/tickets/fresh.md", "--process=small"}, {"main", "ticket", "spec/tickets/fresh.md", "--process=small"}, {"work/grp", "rationale", "spec/rationales/a-why.md"}} {
			root := mintTree(t, one[0])
			if code, said := runsVerb(t, root, append([]string{"mint"}, one[1:]...)...); code != 0 {
				t.Fatalf("the mint on %s answers %d: %s", one[0], code, said)
			}
			if got, stands := readIn(root, one[2]); !stands || strings.Contains(got, "group:") {
				t.Fatalf("the %s on %s stands %v, and writes:\n%s", one[1], one[0], stands, got)
			}
		}
	})
	t.Run("a vehicle's work root takes the note, and the method root hands the schemas and the process", func(t *testing.T) {
		method, work := mintTree(t, ""), t.TempDir()
		t.Setenv("SE_WORK_ROOT", work)
		if code, said := runsVerb(t, method, "mint", "ticket", "spec/tickets/fresh.md", "--process=small"); code != 0 {
			t.Fatalf("the mint answers %d: %s", code, said)
		}
		if _, stands := readIn(work, "spec/tickets/fresh.md"); !stands {
			t.Fatal("the work root holds no note")
		}
		if _, stands := readIn(method, "spec/tickets/fresh.md"); stands {
			t.Fatal("the method root takes the note")
		}
	})
	// [[spec/design_output/failures#the-refusals-move-onto-nodes]]
	t.Run("a path that stands, or a ticket naming a closed group, comes back refused through the failure door, which logs its row", func(t *testing.T) {
		for _, one := range []struct {
			extra, failure string
			says           []string
		}{
			{"--process=small", "mint-path-stands", []string{"spec/tickets/fresh.md stands already.", "remedy: Name a path nothing holds yet"}},
			{"--group=shut", "mint-group-closed", []string{"shut stands closed, so it takes no new child.", "Mint the ticket with no group, or reopen shut", "--back"}},
		} {
			root := mintTree(t, "")
			seedFile(t, root, "spec/tickets/shut.md", closedGroupTicket)
			if one.failure == "mint-path-stands" {
				seedFile(t, root, "spec/tickets/fresh.md", closedGroupTicket)
			}
			code, said := runsVerb(t, root, "mint", "ticket", "spec/tickets/fresh.md", "--process=small", one.extra)
			if code != exitUsage || !strings.Contains(said, "failure "+one.failure+" at warn") {
				t.Fatalf("the mint answers %d: %s, and wants %d naming %s", code, said, exitUsage, one.failure)
			}
			for _, line := range one.says {
				if !strings.Contains(said, line) {
					t.Errorf("the mint says %q, and wants %q", said, line)
				}
			}
			if row, _ := readIn(root, sessionLog); !strings.Contains(row, `"failure":"`+one.failure+`"`) {
				t.Errorf("the session log holds %q, and wants the failure's row", row)
			}
			if text, _ := readIn(root, "spec/tickets/fresh.md"); one.failure == "mint-group-closed" && text != "" {
				t.Fatal("a refused mint writes spec/tickets/fresh.md")
			}
		}
	})
	t.Run("a ticket on a closed group's branch joins no group, and stands free", func(t *testing.T) {
		root := mintTree(t, "work/shut")
		seedFile(t, root, "spec/tickets/shut.md", closedGroupTicket)
		code, said := runsVerb(t, root, "mint", "ticket", "spec/tickets/fresh.md", "--process=small")
		if code != 0 {
			t.Fatalf("the mint answers %d: %s", code, said)
		}
		if got, _ := readIn(root, "spec/tickets/fresh.md"); strings.Contains(got, "group:") {
			t.Fatalf("the ticket joins the closed group:\n%s", got)
		}
		if line := "shut stands closed, so spec/tickets/fresh.md joins no group and stands free."; !strings.Contains(said, line) {
			t.Errorf("the mint says %q, and wants %q", said, line)
		}
	})
}

// level0: FixtureOutsideHome - each refusal reads back a tree of its own, so a stray write shows
func TestMintVerbRefusals(t *testing.T) {
	// [[spec/tickets/verbs-mint-tickets-and-keys]]
	refusals := []struct {
		name string
		argv []string
		says []string
	}{
		{"a call naming no path prints the usage", []string{"ticket"}, []string{"Usage: ./RUNME.sh mint <kind> <path> [--field=value ...]", "spec/schemas holds ", "A ticket takes --process=<name>, and the route and its hash copy in. One off a handover line takes --from=handover."}},
		{"a kind no schema names", []string{"frog", "spec/tickets/fresh.md"}, []string{"spec/schemas holds no frog. It holds ", "failure mint-kind-unknown at warn"}},
		{"a field the schema names nowhere", []string{"ticket", "spec/tickets/fresh.md", "--frog=1"}, []string{"frog names no field of a ticket note. It takes kind, state, ", "failure mint-fields-refused at warn"}},
		{"a process standing nowhere", []string{"ticket", "spec/tickets/fresh.md", "--process=nope"}, []string{"spec/processes holds no nope. It holds group, small.", "failure mint-route-refused at warn"}},
		{"a path standing already", []string{"ticket", "spec/processes/small.yaml", "--process=small"}, []string{"spec/processes/small.yaml stands already.", "failure mint-path-stands at warn", "remedy: Name a path nothing holds yet"}},
		{"a group no child names", []string{"ticket", "spec/tickets/lonely.md", "--process=group"}, []string{"lonely is a group, and no ticket names it under group. Mint a child naming lonely under group first, then the group.", "failure mint-group-empty at warn"}},
	}
	for _, one := range refusals {
		t.Run(one.name+" comes back refused", func(t *testing.T) {
			root := mintTree(t, "")
			code, said := runsVerb(t, root, append([]string{"mint"}, one.argv...)...)
			if code != 2 {
				t.Fatalf("the mint answers %d: %s, and wants 2", code, said)
			}
			for _, line := range one.says {
				if !strings.Contains(said, line) {
					t.Errorf("the mint says %q, and wants %q", said, line)
				}
			}
			for _, path := range []string{"spec/tickets/fresh.md", "spec/tickets/lonely.md"} {
				if _, stands := readIn(root, path); stands {
					t.Fatalf("a refused mint writes %s", path)
				}
			}
		})
	}
}
