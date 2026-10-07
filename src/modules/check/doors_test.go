// The doors' rules over planted trees: a walk-around stands at error in the
// lint, a door at report draws a hint in a held buffer alone, and a door no
// declaration holds is named.
// [[spec/design_output/doors#nothing-walks-around-a-door]]
package check

import (
	"fmt"
	"strings"
	"testing"
)

const (
	waitAt   = "src/engine/wait.go"
	waitText = "package wait\n\nimport \"time\"\n\nfunc For() { time.Sleep(1) }\n"
	clockAt  = "src/modules/clock/owns.yaml"
)

func ruled(found []Finding, rule string) []Finding {
	out := []Finding{}
	for _, one := range found {
		if one.Rule == rule {
			out = append(out, one)
		}
	}
	return out
}

func TestAWalkAroundStandsAtErrorInTheLint(t *testing.T) {
	t.Parallel()
	tree := TreeOver("", Texts{clockAt: "clock:\n  go: [time.Sleep]\n", waitAt: waitText})
	found := ruled(textFaults(tree, waitAt, 0, 0, "tree"), WalksAroundADoor)
	if len(found) != 1 {
		t.Fatalf("the lint reads %+v, and wants one walk-around", found)
	}
	if one := found[0]; one.File != waitAt || one.Line != 5 || one.Column != 14 || one.Severity != SeverityError || one.Source != "tree" || one.Message != fmt.Sprintf(walksSays, "time.Sleep walks around clock") {
		t.Fatalf("the walk-around reads %+v", one)
	}
}

func TestAMarkedWalkAroundPassesTheLint(t *testing.T) {
	t.Parallel()
	marked := strings.Replace(waitText, "func For", "// level0: OutsideInDoors - a hung child needs a deadline\nfunc For", 1)
	tree := TreeOver("", Texts{clockAt: "clock:\n  go: [time.Sleep]\n", waitAt: marked})
	if found := ruled(textFaults(tree, waitAt, 0, 0, "tree"), WalksAroundADoor); len(found) != 0 {
		t.Fatalf("the marked line reads %+v", found)
	}
}

func TestADoorAtReportDrawsAHintInAHeldBufferAlone(t *testing.T) {
	t.Parallel()
	tree := TreeOver("", Texts{clockAt: "clock:\n  go: [time.Sleep]\n  report: true\n", waitAt: waitText})
	if found := ruled(textFaults(tree, waitAt, 0, 0, "tree"), WalksAroundADoor); len(found) != 0 {
		t.Fatalf("the lint reads %+v over a door at report, and wants nothing", found)
	}
	tree.Holds(waitAt, waitText)
	found := ruled(textFaults(tree, waitAt, 0, 0, "tree"), WalksAroundADoor)
	if len(found) != 1 || found[0].Severity != SeverityHint {
		t.Fatalf("the held buffer reads %+v, and wants one hint", found)
	}
}

func TestDoorDeclaresNamesADoorNoDeclarationHolds(t *testing.T) {
	t.Parallel()
	tree := TreeOver("", Texts{
		"src/modules/mail/mail.go":      "package mail\n\nimport \"quackitect/src/q\"\n\nvar flag = q.IO()\n",
		"src/modules/mail/mail_test.go": "package mail\n",
		"src/doors/post.js":             "export const post = () => ({});\n",
		"src/tui/paint/door.go":         "package paint\n",
		"src/modules/plain/plain.go":    "package plain\n\n// q.IO() flags an IO module.\n",
	})
	found := ruled(CheckerOver(tree, 0, 0).Sweep(), DoorDeclares)
	files := []string{}
	for _, one := range found {
		files = append(files, one.File)
	}
	want := []string{"src/doors/post.js", "src/modules/mail/mail.go", "src/tui/paint/door.go"}
	if strings.Join(files, " ") != strings.Join(want, " ") {
		t.Fatalf("DoorDeclares names %v, and wants %v", files, want)
	}
}

func TestAFlagInsideAStringNamesNoDoor(t *testing.T) {
	t.Parallel()
	tree := TreeOver("", Texts{"src/modules/check/doors.go": "package check\n\nconst flag = \"q.IO()\"\n"})
	if found := ruled(CheckerOver(tree, 0, 0).Sweep(), DoorDeclares); len(found) != 0 {
		t.Fatalf("a flag spelled in a string reads %+v", found)
	}
}

func TestDoorDeclaresNamesADeclarationOfNoForm(t *testing.T) {
	t.Parallel()
	tree := TreeOver("", Texts{clockAt: "clock:\n  owner: me\n"})
	found := ruled(CheckerOver(tree, 0, 0).Sweep(), DoorDeclares)
	if len(found) != 1 || found[0].File != clockAt || found[0].Line != 2 {
		t.Fatalf("DoorDeclares reads %+v, and wants the key on line 2", found)
	}
}

func TestADeclaredDoorPasses(t *testing.T) {
	t.Parallel()
	tree := TreeOver("", Texts{
		"src/modules/mail/mail.go":   "package mail\n\nimport \"quackitect/src/q\"\n\nvar flag = q.IO()\n",
		"src/modules/mail/owns.yaml": "mail:\n  go: [net/smtp]\n",
		"src/doors/post.js":          "export const post = () => ({});\n",
		"src/doors/owns.yaml":        "post:\n  js: [fetch]\n  files: [post.js]\n",
	})
	if found := ruled(CheckerOver(tree, 0, 0).Sweep(), DoorDeclares); len(found) != 0 {
		t.Fatalf("the declared doors read %+v", found)
	}
}
