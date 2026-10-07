// The ticket verb's bless and bless --desk in Go, over the roads
// test/level0/pull-bless.test.js and test/level0/bless-desk.test.js drive
// through the ticket verb: who blesses where, and the desk's own word.
// [[spec/design_output/pull#the-bless]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"strings"
	"testing"

	"quackitect/src/pull"
)

// The gated ticket's path, and the hash the JS bless writes over the waiting gate. [[spec/design_output/pull#the-bless]]
const (
	blessTicket = "spec/tickets/a-child.md"
	blessHashed = "    blessed: b05d0c39183726cc\n"
)

// A ticket at a gate asking a bless, the design done before it, as GATED in the JS test writes it. [[spec/design_output/pull#the-bless]]
func blessGated(record string) string {
	return `---
kind: [[ticket]]
state: open
urgency: now
step: gate
steps:
  - name: design
    steps:
      - name: draft
        does: writes the approach
        evidence:
          - name: approach
            form: text
            says: the approach
      - name: tests-red
        does: writes the tests
        evidence:
          - name: red
            form: list
            says: the test files standing red
  - name: gate
    gate: the design answers the ask
    bless: true
    input: [design/draft, design/tests-red]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points, or reject
  - name: implement
    steps:
      - name: change
        does: makes the change
        to: retro
        evidence:
          - name: says
            form: text
            says: what changes
group: one-group
` + record + `---

# Ask

One piece of it.

# design

## draft

### approach

The approach.

## tests-red

### red

- test/level0/one.test.js

# gate

## verdict

# implement

## change

### says

# Discussion
`
}

// The gate after its accept, waiting for the bless. [[spec/design_output/pull#the-bless]]
func blessWaiting() string {
	record := "record:\n  - step: gate\n    hand: box d462e994b4cef\n    hash_before: b818c390c02737351bf1b73aba36a573d34d2ecc\n    hash_after: b818c390c02737351bf1b73aba36a573d34d2ecc\n"
	return strings.Replace(blessGated(record), "## verdict\n", "## verdict\n\naccept\n", 1)
}

// A FakeRepo over a folder holding the ticket and the files, committed once, with a hand git names. [[spec/tickets/quack-repos-meet-fake-git]]
func blessTree(t *testing.T, ticket string, files map[string]string) string {
	t.Helper()
	root := t.TempDir()
	t.Setenv(workRootVar, "")
	repo := standsInRepo(t, root)
	repo.Set("user.name", "a hand")
	repo.Set("user.email", "hand@example.invalid")
	seedsFile(t, root, blessTicket, ticket)
	for path, text := range files {
		seedsFile(t, root, path, text)
	}
	commitsAll(t, repo, "the tree opens")
	return root
}

// The hand the verb stands in: a person, an agent at a desk, or an agent on a cloud box. [[spec/design_output/pull#the-hand-rule]]
func blessHand(t *testing.T, agent, cloud bool) {
	t.Helper()
	for _, name := range []string{"CLAUDE_CODE_REMOTE", "SE_CLOUD", "CLAUDECODE"} {
		t.Setenv(name, "")
	}
	if agent {
		t.Setenv("CLAUDECODE", "1")
	}
	if cloud {
		t.Setenv("SE_CLOUD", "1")
	}
}

// The last commit's subject in the repository the verbs reach under the root. [[spec/tickets/quack-repos-meet-fake-git]]
func blessSubject(root string) string { return subjectOf(standingRepo(root), "HEAD") }

func TestTicketBless(t *testing.T) {
	refused := func(t *testing.T, root string, code int, out, errs, want string) {
		t.Helper()
		if code != exitFailed || out != "" || errs != "refused\n  "+want+"\n" {
			t.Fatalf("the bless answers %d, %q, %q, and wants a refusal saying %q", code, out, errs, want)
		}
		if got, _ := readsBack(t, root, blessTicket); pull.FieldOf(got, "step") != "gate" || strings.Contains(got, "blessed:") {
			t.Fatalf("the ticket moves on a refusal:\n%s", got)
		}
	}
	blesses := func(t *testing.T, root string, code int, out, errs string) {
		t.Helper()
		if code != 0 || out != "a-child blesses gate.\n" || errs != "" {
			t.Fatalf("the bless answers %d, %q, %q", code, out, errs)
		}
		got, _ := readsBack(t, root, blessTicket)
		if pull.FieldOf(got, "step") != "implement/change" {
			t.Fatalf("the step stands at %q, and wants implement/change", pull.FieldOf(got, "step"))
		}
		if !strings.Contains(got, blessHashed) {
			t.Fatalf("the record carries no bless of the hash the JS writes:\n%s", got)
		}
		if subject := blessSubject(root); subject != "a-child: blesses gate" {
			t.Fatalf("the last commit reads %q", subject)
		}
	}
	t.Run("a bless naming nothing is refused as usage", func(t *testing.T) {
		blessHand(t, false, false)
		root := blessTree(t, blessWaiting(), nil)
		code, out, errs := runsApart(t, root, false, "ticket", "bless")
		if code != exitUsage || out != "" || errs != "refused\n  nothing names no ticket, so nothing blesses.\n" {
			t.Fatalf("the bless answers %d, %q, %q", code, out, errs)
		}
	})
	t.Run("a bless naming no ticket is refused as usage", func(t *testing.T) {
		blessHand(t, false, false)
		root := blessTree(t, blessWaiting(), nil)
		code, out, errs := runsApart(t, root, false, "ticket", "bless", "no-such")
		if code != exitUsage || out != "" || errs != "refused\n  no-such names no ticket, so nothing blesses.\n" {
			t.Fatalf("the bless answers %d, %q, %q", code, out, errs)
		}
	})
	t.Run("an agent at a desk without the bless file is refused the bless", func(t *testing.T) {
		blessHand(t, true, false)
		root := blessTree(t, blessWaiting(), nil)
		code, out, errs := runsApart(t, root, false, "ticket", "bless", "a-child")
		refused(t, root, code, out, errs, "an agent at a desk blesses where .se/.runtime/bless.json holds agent true, and the sidebar button writes it.")
	})
	t.Run("an agent at a desk blesses where the bless file holds agent true", func(t *testing.T) {
		blessHand(t, true, false)
		root := blessTree(t, blessWaiting(), map[string]string{pull.BlessFile: `{"agent":true}`})
		code, out, errs := runsApart(t, root, false, "ticket", "bless", "a-child")
		blesses(t, root, code, out, errs)
	})
	t.Run("an agent at a desk with the bless file holding agent false is refused", func(t *testing.T) {
		blessHand(t, true, false)
		root := blessTree(t, blessWaiting(), map[string]string{pull.BlessFile: `{"agent":false}`})
		code, out, errs := runsApart(t, root, false, "ticket", "bless", "a-child")
		refused(t, root, code, out, errs, "an agent at a desk blesses where .se/.runtime/bless.json holds agent true, and the sidebar button writes it.")
	})
	t.Run("an agent on a cloud box blesses", func(t *testing.T) {
		blessHand(t, true, true)
		root := blessTree(t, blessWaiting(), nil)
		code, out, errs := runsApart(t, root, false, "ticket", "bless", "a-child")
		blesses(t, root, code, out, errs)
	})
	t.Run("a person blesses at a desk with no bless file", func(t *testing.T) {
		blessHand(t, false, false)
		root := blessTree(t, blessWaiting(), nil)
		code, out, errs := runsApart(t, root, false, "ticket", "bless", "a-child")
		blesses(t, root, code, out, errs)
		if got, _ := readsBack(t, root, blessTicket); !strings.Contains(got, "    hand: person\n"+blessHashed) {
			t.Fatalf("the bless names no person's role:\n%s", got)
		}
	})
	t.Run("a bless on a ticket at no bless gate is refused", func(t *testing.T) {
		blessHand(t, false, false)
		root := blessTree(t, strings.Replace(blessWaiting(), "    bless: true\n", "", 1), nil)
		code, out, errs := runsApart(t, root, false, "ticket", "bless", "a-child")
		refused(t, root, code, out, errs, "a-child stands at gate, which asks no bless.")
	})
	t.Run("a bless gate holding no verdict yet is refused", func(t *testing.T) {
		blessHand(t, false, false)
		root := blessTree(t, blessGated(""), nil)
		code, out, errs := runsApart(t, root, false, "ticket", "bless", "a-child")
		refused(t, root, code, out, errs, "a-child at gate holds no verdict to bless yet.")
	})
	t.Run("bless --desk writes the bless file for a person", func(t *testing.T) {
		blessHand(t, false, false)
		for _, word := range []string{"true", "false"} {
			root := blessTree(t, blessWaiting(), nil)
			code, out, errs := runsApart(t, root, false, "ticket", "bless", pull.Desk+word)
			if code != 0 || out != "an agent at this desk blesses: "+word+"\n" || errs != "" {
				t.Fatalf("--desk=%s answers %d, %q, %q", word, code, out, errs)
			}
			if got, _ := readsBack(t, root, pull.BlessFile); got != `{"agent":`+word+"}\n" {
				t.Fatalf("--desk=%s writes %q", word, got)
			}
		}
	})
	t.Run("bless --desk refuses an agent and writes no bless file", func(t *testing.T) {
		blessHand(t, true, false)
		root := blessTree(t, blessWaiting(), nil)
		code, out, errs := runsApart(t, root, false, "ticket", "bless", pull.Desk+"true")
		if code != exitFailed || out != "" || errs != "refused\n  "+pull.BlessRefusal()+"\n" || !strings.Contains(errs, "sidebar button") {
			t.Fatalf("an agent's --desk answers %d, %q, %q", code, out, errs)
		}
		if _, stands := readsBack(t, root, pull.BlessFile); stands {
			t.Fatal("an agent writes the bless file")
		}
	})
}
