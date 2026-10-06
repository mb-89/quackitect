// The doors verb in Go: every door under src/doors against the contract test
// that holds it.
// [[spec/tickets/config-verbs-port-to-go]]
package main

import (
	"strings"
	"testing"
)

func doorsRan(root string) (int, string, string) {
	var out, errs strings.Builder
	code := doorsVerb(func() (string, error) { return root, nil })([]string{"doors"}, false, &out, &errs)
	return code, out.String(), errs.String()
}

func TestDoorsCountsWhereEveryDoorHoldsATest(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedFile(t, root, "src/doors/disk.js", "")
	seedFile(t, root, "src/doors/fake/disk.js", "")
	seedFile(t, root, "test/contract/disk.test.js", "")
	if code, out, _ := doorsRan(root); code != 0 || out != "1 doors, and a contract test holds each one.\n" {
		t.Fatalf("doors answers %d and %q", code, out)
	}
}

// A tree with the clock declared, a walk around it, and a line marked past it. [[spec/design_output/doors#nothing-walks-around-a-door]]
func walkedRoot(t *testing.T, report bool) string {
	t.Helper()
	root := t.TempDir()
	declared := "clock:\n  go: [time.Sleep]\n"
	if report {
		declared += "  report: true\n"
	}
	seedFile(t, root, "src/modules/clock/owns.yaml", declared)
	seedFile(t, root, "src/engine/wait.go", "package engine\n\nimport \"time\"\n\nfunc For() { time.Sleep(1) }\n")
	seedFile(t, root, "src/engine/hung.go", "package engine\n\nimport \"time\"\n\nfunc Hung() {\n\ttime.Sleep(1) // level0: OutsideInDoors - a hung child needs a deadline\n}\n")
	seedFile(t, root, ".claude/skills/one/wait.go", "package one\n\nimport \"time\"\n\nfunc For() { time.Sleep(1) }\n")
	return root
}

func TestDoorsListsAWalkAroundADoorAtReport(t *testing.T) {
	t.Parallel()
	code, out, errs := doorsRan(walkedRoot(t, true))
	for _, want := range []string{
		"src/engine/wait.go:5:14: time.Sleep walks around clock\n",
		"src/engine/hung.go:6:2: time.Sleep stands marked: a hung child needs a deadline\n",
	} {
		if !strings.Contains(out, want) {
			t.Errorf("doors prints %q, and wants %q", out, want)
		}
	}
	if code != 0 || strings.Contains(out+errs, ".claude") {
		t.Fatalf("doors answers %d, %q and %q, and wants 0 with nothing the lint's walk passes", code, out, errs)
	}
}

func TestDoorsRefusesAWalkAroundARefusingDoor(t *testing.T) {
	t.Parallel()
	code, out, errs := doorsRan(walkedRoot(t, false))
	if code != exitFailed || !strings.Contains(errs, "src/engine/wait.go:5:14: time.Sleep walks around clock\n") {
		t.Fatalf("doors answers %d, %q and %q, and wants the walk-around refused", code, out, errs)
	}
	if !strings.Contains(out, "src/engine/hung.go:6:2: time.Sleep stands marked: a hung child needs a deadline\n") {
		t.Fatalf("doors prints %q, and wants the marked line listed", out)
	}
}

func TestDoorsListsAScriptWalkingAroundADoor(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedFile(t, root, "src/doors/clock.js", "export const clock = () => ({ now: () => Date.now() });\n")
	seedFile(t, root, "src/doors/owns.yaml", "clock:\n  js: [Date.now]\n  files: [clock.js]\n  report: true\n")
	seedFile(t, root, "test/contract/clock.test.js", "")
	seedFile(t, root, "src/scripts/wait.js", "export const at = () => Date.now();\n")
	code, out, _ := doorsRan(root)
	if code != 0 || !strings.Contains(out, "src/scripts/wait.js:1:25: Date.now walks around clock\n") || strings.Contains(out, "src/doors/clock.js:") {
		t.Fatalf("doors answers %d and %q, and wants the script's walk-around alone", code, out)
	}
}

func TestDoorsNamesADoorWithNoContract(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedFile(t, root, "src/doors/disk.js", "")
	seedFile(t, root, "src/doors/git.js", "")
	seedFile(t, root, "test/contract/disk.test.js", "")
	code, _, errs := doorsRan(root)
	want := "src/doors/git.js has no test/contract/git.test.js.\nA door with no contract test lets its fake drift. Write one.\n"
	if code != exitFailed || errs != want {
		t.Fatalf("doors answers %d and %q, and wants %q", code, errs, want)
	}
}

func TestDoorsListsADeclarationStandingAsItsOwnOutside(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedFile(t, root, "src/extension/drawing/owns.yaml", "page:\n  js: [Date.now]\n  files: [route.mjs]\n  outside: true\n")
	seedFile(t, root, "src/extension/drawing/route.mjs", "export const at = () => Date.now();\n")
	seedFile(t, root, "src/modules/waits/owns.yaml", "waits:\n  go: [os]\n  report: true\n")
	code, out, errs := doorsRan(root)
	if want := "src/extension/drawing/route.mjs stands inside page, its own outside\n"; !strings.Contains(out, want) {
		t.Errorf("doors prints %q, and wants %q", out, want)
	}
	if strings.Contains(out, "inside waits") {
		t.Errorf("doors prints %q, and wants a door missing its contract kept off the outsides", out)
	}
	if code != 0 || strings.Contains(out+errs, "route.mjs:") {
		t.Fatalf("doors answers %d, %q and %q, and wants no walk in the page's own file", code, out, errs)
	}
}

func TestDoorsListsTheContractTestOfTheRootDoor(t *testing.T) {
	t.Parallel()
	_, out, _ := doorsRan(treeRoot)
	if want := "src/quack/box_doors_contract_test.go keeps the contract of quack\n"; !strings.Contains(out, want) {
		t.Fatalf("doors over the tree prints %q, and wants %q", out, want)
	}
}

func TestDoorsPassesAContractTestItsDoorNames(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	seedFile(t, root, "src/modules/clock/owns.yaml", "clock:\n  go: [time.Sleep]\n  contract: [src/engine/clock_contract_test.go]\n  report: true\n")
	seedFile(t, root, "src/engine/clock_contract_test.go", "package engine\n\nimport \"time\"\n\nfunc wait() { time.Sleep(1) }\n")
	seedFile(t, root, "src/engine/wait.go", "package engine\n\nimport \"time\"\n\nfunc For() { time.Sleep(1) }\n")
	code, out, errs := doorsRan(root)
	if code != 0 || !strings.Contains(out, "src/engine/wait.go:5:14: time.Sleep walks around clock\n") || !strings.Contains(out, "src/engine/clock_contract_test.go keeps the contract of clock\n") || strings.Contains(out+errs, "clock_contract_test.go:") {
		t.Fatalf("doors answers %d, %q and %q, and wants the walk in wait.go, the clock's contract test listed under it, and no walk in that test", code, out, errs)
	}
}
