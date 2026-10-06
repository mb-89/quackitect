// The fixtures the port_f cases share: the method root carrying the ticket
// schema, a hold a hand keeps, and a work branch the clone stands on.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"encoding/json"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"testing"

	"quackitect/src/modules/files"
	"quackitect/src/proc"
)

// A method root holding the tree's own ticket schema, so an inserted step re-routes. [[spec/tickets/work-verbs-port-to-go]]
func pfMethod(t *testing.T) *files.FakeDisk {
	t.Helper()
	schema, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(ticketSchema)))
	if err != nil {
		t.Fatal(err)
	}
	root := files.NewFakeDisk()
	if err := root.Write(ticketSchema, string(schema)); err != nil {
		t.Fatal(err)
	}
	return root
}

// Hands a tree the method root holding the ticket schema. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) pfMethodRoot() {
	one.d.Method, one.d.Methods = "/fake/method", pfMethod(one.t)
}

// A whole path under the work root, read back as a path on the fake disk. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) rel(at string) string {
	return strings.TrimPrefix(strings.TrimPrefix(filepath.ToSlash(at), one.root), "/")
}

// A go off the fake disk: a build writes a binary where its package holds a main, and a test run passes or fails each case as its body reads. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) pfGo(ran proc.Command) proc.Said {
	if len(ran.Argv) > 1 && ran.Argv[1] == "build" {
		return one.pfBuild(ran)
	}
	return one.pfGoTest(ran)
}

// go build -o <binary> ./<package>, run in a folder of the work root. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) pfBuild(ran proc.Command) proc.Said {
	if len(ran.Argv) != 5 || ran.Argv[2] != "-o" {
		return proc.Said{Err: "go build: an argv the fake reads not", Code: 2}
	}
	source := path.Join(one.rel(ran.Dir), strings.TrimPrefix(ran.Argv[4], "./"), "main.go")
	if !one.stands(source) {
		return proc.Said{Err: "no Go files in " + ran.Argv[4], Code: 1}
	}
	one.write(map[string]string{one.rel(ran.Argv[3]): "built off " + source})
	return proc.Said{}
}

// The test functions a Go file declares, each with its body. [[spec/tickets/branch-verbs-meet-fake-git]]
var pfGoCase = regexp.MustCompile(`(?s)func (Test\w+)\(t \*testing\.T\) \{(.*?)\n?\}\n`)

// A Go case's guard on a variable, which fails it where the env reads otherwise. [[spec/tickets/branch-verbs-meet-fake-git]]
var pfGoGuard = regexp.MustCompile(`os\.Getenv\("(\w+)"\) != "([^"]*)"`)

// go test [-run ^(names)$] ./<package>/ or ./<package>/...: each case fails where its body calls t.Fatal unguarded, or guarded by a variable the env lacks. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) pfGoTest(ran proc.Command) proc.Said {
	var only *regexp.Regexp
	var packages []string
	for at := 2; at < len(ran.Argv); at++ {
		if ran.Argv[at] == "-run" && at+1 < len(ran.Argv) {
			only = regexp.MustCompile(ran.Argv[at+1])
			at++
			continue
		}
		packages = append(packages, ran.Argv[at])
	}
	var out strings.Builder
	failed := false
	for _, each := range packages {
		folder := strings.TrimSuffix(strings.TrimPrefix(each, "./"), "/...")
		folder = strings.TrimSuffix(folder, "/")
		under, _ := one.disk.List(folder)
		for _, file := range under {
			if !strings.HasSuffix(file, "_test.go") || (!strings.HasSuffix(each, "/...") && path.Dir(file) != folder) {
				continue
			}
			for _, found := range pfGoCase.FindAllStringSubmatch(one.read(file), -1) {
				if only != nil && !only.MatchString(found[1]) {
					continue
				}
				if one.pfGoCaseFails(found[2], ran.Env) {
					failed = true
					out.WriteString("--- FAIL: " + found[1] + "\n")
				}
			}
		}
	}
	if failed {
		out.WriteString("FAIL\n")
		return proc.Said{Out: out.String(), Code: 1}
	}
	return proc.Said{Out: "ok  \tquackitect\n"}
}

func (one *tree) pfGoCaseFails(body string, env []string) bool {
	if !strings.Contains(body, "t.Fatal(") {
		return false
	}
	guard := pfGoGuard.FindStringSubmatch(body)
	return guard == nil || !slices.Contains(env, guard[1]+"="+guard[2])
}

// A case a node test file declares. [[spec/tickets/branch-verbs-meet-fake-git]]
var pfNodeCase = regexp.MustCompile(`test\("([^"]*)"`)

// A node test file's assertion on a variable. [[spec/tickets/branch-verbs-meet-fake-git]]
var pfNodeEnv = regexp.MustCompile(`process\.env\.(\w+), "([^"]*)"`)

// node --test over files on the fake disk: each case a file declares passes, fails on its own assertion where the file asserts one equals two or a variable the env lacks, and throws where it throws; the red probe records what it reads of the sources. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) pfNode(ran proc.Command) proc.Said {
	var out strings.Builder
	total, failed := 0, 0
	for _, file := range ran.Argv[1:] {
		if strings.HasPrefix(file, "--") {
			continue
		}
		text := one.read(path.Join(one.rel(ran.Dir), file))
		fault := ""
		switch env := pfNodeEnv.FindStringSubmatch(text); {
		case strings.Contains(text, "throw new Error"):
			fault = "  error: Error: it ran\n"
		case strings.Contains(text, "assert.equal(1, 2"), env != nil && !slices.Contains(ran.Env, env[1]+"="+env[2]):
			fault = "  code: 'ERR_ASSERTION'\n"
		}
		if strings.Contains(text, ".se/seen.json") {
			one.pfSeen()
		}
		for _, found := range pfNodeCase.FindAllStringSubmatch(text, -1) {
			total++
			if fault != "" {
				failed++
				fmt.Fprintf(&out, "not ok %d - %s\n%s", total, found[1], fault)
				continue
			}
			fmt.Fprintf(&out, "ok %d - %s\n", total, found[1])
		}
	}
	fmt.Fprintf(&out, "# tests %d\n# pass %d\n# fail %d\n", total, total-failed, failed)
	if failed > 0 {
		return proc.Said{Out: out.String(), Code: 1}
	}
	return proc.Said{Out: out.String()}
}

// What the red probe records of the sources as it runs. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) pfSeen() {
	seen := map[string]any{"source": nil, "fresh": one.stands(pfFresh), "held": one.stands(asideAt + "/" + pfSource)}
	if one.stands(pfSource) {
		seen["source"] = one.read(pfSource)
	}
	said, _ := json.Marshal(seen)
	one.write(map[string]string{".se/seen.json": string(said)})
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
	one.cut(workBranch+name, "")
	if pushed := one.repo.Push(workBranch+name, true); !pushed.OK {
		one.t.Fatal(pushed.Err)
	}
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
