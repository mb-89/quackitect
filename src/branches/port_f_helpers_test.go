// The fixtures the port_f cases share: the method root carrying the ticket
// schema, a hold a hand keeps, and a work branch the clone stands on.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A method root holding the tree's own ticket schema, so an inserted step re-routes. [[spec/tickets/work-verbs-port-to-go]]
func pfMethod(t *testing.T) string {
	t.Helper()
	schema, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(ticketSchema)))
	if err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	at := filepath.Join(root, filepath.FromSlash(ticketSchema))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, schema, 0o644); err != nil {
		t.Fatal(err)
	}
	return root
}

// Writes the hold a hand keeps on a ticket's leaf. [[spec/tickets/work-verbs-port-to-go]]
func pfHold(one *tree, hand, ticket, step string) {
	one.t.Helper()
	said, _ := json.Marshal(map[string]string{"ticket": ticket, "path": ticketAt(ticket), "step": step})
	one.write(map[string]string{holdAt(hand): string(said)})
}

// Puts the clone on a work branch off main, pushed to origin. [[spec/tickets/work-verbs-port-to-go]]
func pfOnBranch(one *tree, name string) {
	one.t.Helper()
	one.git("switch", "-q", "-c", workBranch+name)
	one.git("push", "-q", "-u", "origin", workBranch+name)
}

// The child ticket the escalate cases hold: a design phase with draft and review, and an implement phase. [[spec/tickets/work-verbs-port-to-go]]
func pfChild(step, group string) string {
	text := `---
kind: [[ticket]]
state: open
urgency: now
step: STEP
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        evidence:
          - name: approach
            form: text
            says: the approach
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        input: draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail
  - name: implement
    steps:
      - name: tests-red
        does: writes the tests
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests fail on their own assertion
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree lints
GROUP---

# Ask

One piece of it.

# design

## draft

### approach

<!-- the approach -->

## review

### verdict

<!-- pass or fail -->

# implement

## tests-red

### tests

## change

### lint

# Discussion
`
	groupLine := ""
	if group != "" {
		groupLine = "group: " + group + "\n"
	}
	return strings.Replace(strings.Replace(text, "STEP", step, 1), "GROUP", groupLine, 1)
}
