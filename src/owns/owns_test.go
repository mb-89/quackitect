// The declarations and the walks over planted texts: a use outside its door is
// named, one inside is not, and the marker passes a line where it names why.
// [[spec/design_output/doors#a-door-declares-what-it-owns]]
package owns

import (
	"slices"
	"strings"
	"testing"
)

const (
	clockAt  = "src/modules/clock/owns.yaml"
	doorsAt  = "src/doors/owns.yaml"
	clockGo  = "clock:\n  go: [time.Now, time.Sleep, context.WithTimeout, net/http.Get]\n"
	doorsJS  = "clock:\n  js: [Date.now, new Date(), setTimeout]\n  files: [clock.js, fake/clock.js]\ndisk:\n  js: [node:fs]\n  files: [disk.js]\n  report: true\n"
	diskAt   = "src/modules/files/owns.yaml"
	diskGo   = "files:\n  go: [os, os/exec]\n  report: true\n"
	outsider = "src/engine/wait.go"
)

var standing = map[string]bool{"src/doors/clock.js": true, "src/doors/fake/clock.js": true, "src/doors/disk.js": true}

func exists(path string) bool { return standing[path] }

func planted(t *testing.T) []Door {
	t.Helper()
	doors, faults := Read(map[string]string{clockAt: clockGo, doorsAt: doorsJS, diskAt: diskGo}, exists)
	if len(faults) != 0 {
		t.Fatalf("the planted declarations read as faults: %v", faults)
	}
	return doors
}

func named(walks []Walk) []string {
	out := []string{}
	for _, one := range walks {
		out = append(out, one.Name)
	}
	return out
}

func TestADeclarationReadsItsDoors(t *testing.T) {
	t.Parallel()
	doors := planted(t)
	if len(doors) != 4 {
		t.Fatalf("the declarations read %d doors, and want 4: %+v", len(doors), doors)
	}
	for _, one := range doors {
		switch {
		case one.At == "src/modules/clock" && one.Name == "clock":
			if !slices.Equal(one.Go, []string{"time.Now", "time.Sleep", "context.WithTimeout", "net/http.Get"}) || one.Files != nil || one.Report {
				t.Errorf("the Go clock reads %+v", one)
			}
		case one.At == "src/doors" && one.Name == "clock":
			if !slices.Equal(one.JS, []string{"Date.now", "new Date()", "setTimeout"}) || !slices.Equal(one.Files, []string{"src/doors/clock.js", "src/doors/fake/clock.js"}) {
				t.Errorf("the JS clock reads %+v", one)
			}
		case one.At == "src/doors" && one.Name == "disk":
			if !one.Report || !slices.Equal(one.JS, []string{"node:fs"}) {
				t.Errorf("the JS disk reads %+v", one)
			}
		case one.At == "src/modules/files" && one.Name == "files":
			if !one.Report || !slices.Equal(one.Go, []string{"os", "os/exec"}) {
				t.Errorf("the files door reads %+v", one)
			}
		default:
			t.Errorf("a door reads as none planted: %+v", one)
		}
	}
}

func TestADeclarationOfNoFormIsAFault(t *testing.T) {
	t.Parallel()
	cases := map[string]string{
		"a key no declaration takes":  "clock:\n  owner: me\n",
		"a Go name of no form":        "clock:\n  go: [Time.Now!]\n",
		"a JS name of no form":        "clock:\n  js: [\"set Timeout\"]\n",
		"a file standing nowhere":     "clock:\n  js: [Date.now]\n  files: [gone.js]\n",
		"a file outside its folder":   "clock:\n  js: [Date.now]\n  files: [../clock.js]\n",
		"a door holding no entry":     "clock: now\n",
		"a report reading as no flag": "clock:\n  js: [Date.now]\n  report: soon\n",
	}
	for name, text := range cases {
		if _, faults := Read(map[string]string{doorsAt: text}, exists); len(faults) == 0 || faults[0].File != doorsAt || faults[0].Line < 1 {
			t.Errorf("%s reads %v, and wants a fault naming %s and its line", name, faults, doorsAt)
		}
	}
}

func TestOnlyAnOwnsFileDeclares(t *testing.T) {
	t.Parallel()
	for path, want := range map[string]bool{"owns.yaml": true, "src/doors/owns.yaml": true, "src/doors/owns.yml": false, "src/disowns.yaml": false} {
		if Declares(path) != want {
			t.Errorf("Declares(%q) answers %v, and wants %v", path, !want, want)
		}
	}
}

func TestADoorHoldsItsFolderOrItsFiles(t *testing.T) {
	t.Parallel()
	folder := Door{Name: "clock", At: "src/modules/clock"}
	files := Door{Name: "clock", At: "src/doors", Files: []string{"src/doors/clock.js"}, Contract: []string{"test/contract/clock.test.js"}}
	cases := []struct {
		door Door
		path string
		want bool
	}{
		{folder, "src/modules/clock/clock.go", true},
		{folder, "src/modules/clock/clock_contract_test.go", true},
		{folder, "src/modules/clock/deep/clock.go", false},
		{folder, "src/modules/clockwork/clock.go", false},
		{files, "src/doors/clock.js", true},
		{files, "src/doors/disk.js", false},
		{files, "test/contract/clock.test.js", true},
		{files, "test/contract/disk.test.js", false},
	}
	for _, one := range cases {
		if one.door.Holds(one.path) != one.want {
			t.Errorf("%s at %s holds %s: %v, and wants %v", one.door.Name, one.door.At, one.path, !one.want, one.want)
		}
	}
}

func TestAGoCallOutsideTheClockIsAWalk(t *testing.T) {
	t.Parallel()
	text := "package wait\n\nimport (\n\t\"context\"\n\t\"time\"\n)\n\nfunc For(c context.Context) {\n\ttime.Sleep(time.Second)\n\t_, _ = context.WithTimeout(c, time.Minute)\n\t_ = time.Duration(1)\n}\n"
	walks := Walks(outsider, text, planted(t))
	if got := named(walks); !slices.Equal(got, []string{"time.Sleep", "context.WithTimeout"}) {
		t.Fatalf("the walks name %v, and want time.Sleep and context.WithTimeout", got)
	}
	if one := walks[0]; one.File != outsider || one.Line != 9 || one.Column != 2 || !slices.Equal(one.Doors, []string{"clock"}) || one.Marked || one.Report {
		t.Fatalf("the first walk reads %+v", one)
	}
}

func TestAGoMemberOfANestedPackageIsAWalk(t *testing.T) {
	t.Parallel()
	text := "package wait\n\nimport web \"net/http\"\n\nvar _, _ = web.Get(\"a\")\nvar _ = web.StatusOK\n"
	if got := named(Walks(outsider, text, planted(t))); !slices.Equal(got, []string{"net/http.Get"}) {
		t.Fatalf("the walks name %v, and want net/http.Get under its local name", got)
	}
}

func TestAGoCallInsideTheDoorIsNoWalk(t *testing.T) {
	t.Parallel()
	text := "package clock\n\nimport \"time\"\n\nfunc Now() time.Time { return time.Now() }\n"
	if walks := Walks("src/modules/clock/clock.go", text, planted(t)); len(walks) != 0 {
		t.Fatalf("the clock's own call reads as %v", walks)
	}
}

func TestAWholePackageImportIsAWalk(t *testing.T) {
	t.Parallel()
	text := "package wait\n\nimport (\n\t\"fmt\"\n\t\"os\"\n\t_ \"os/exec\"\n)\n\nvar _ = fmt.Sprint(os.Args)\n"
	walks := Walks(outsider, text, planted(t))
	if got := named(walks); !slices.Equal(got, []string{"os", "os/exec"}) {
		t.Fatalf("the walks name %v, and want os and os/exec at their imports", got)
	}
	if walks[0].Line != 5 || !walks[0].Report {
		t.Fatalf("the os walk reads %+v, and wants line 5 at report", walks[0])
	}
}

func TestAnOutsideOwnsItsNamesInItsOwnFilesAlone(t *testing.T) {
	t.Parallel()
	page := "src/extension/drawing/owns.yaml"
	standing := func(at string) bool { return exists(at) || at == "src/extension/drawing/route.mjs" }
	doors, faults := Read(map[string]string{doorsAt: doorsJS, page: "page:\n  js: [setTimeout]\n  files: [route.mjs]\n  outside: true\n"}, standing)
	if len(faults) != 0 {
		t.Fatalf("the outside reads as faults: %v", faults)
	}
	text := "setTimeout(() => {}, 1);\n"
	if walks := Walks("src/extension/drawing/route.mjs", text, doors); len(walks) != 0 {
		t.Fatalf("the outside's own file reads as %v", walks)
	}
	walks := Walks("src/scripts/run.js", text, doors)
	if len(walks) != 1 || !slices.Equal(walks[0].Doors, []string{"clock"}) || walks[0].Report {
		t.Fatalf("a walk past the outside reads %+v, and wants the clock alone, refused", walks)
	}
}

func TestAShadowingLocalIsNoWalk(t *testing.T) {
	t.Parallel()
	text := "package wait\n\nimport \"time\"\n\ntype clock struct{}\n\nfunc (clock) Now() int { return 0 }\n\nvar _ = time.Second\n\nfunc For() int {\n\ttime := clock{}\n\treturn time.Now()\n}\n"
	if walks := Walks(outsider, text, planted(t)); len(walks) != 0 {
		t.Fatalf("a local named time reads as %v", walks)
	}
}

func TestAGoFileOfNoGoNamesNoWalk(t *testing.T) {
	t.Parallel()
	if walks := Walks(outsider, "package wait\n\nfunc {\n\ttime.Sleep(1)\n", planted(t)); len(walks) != 0 {
		t.Fatalf("a file that reads as no Go draws %v", walks)
	}
}

func TestAMarkedLinePasses(t *testing.T) {
	t.Parallel()
	above := "package wait\n\nimport \"time\"\n\nfunc For() {\n\t// " + Marker + "a hung child needs a deadline\n\ttime.Sleep(1)\n}\n"
	beside := "package wait\n\nimport \"time\"\n\nfunc For() {\n\ttime.Sleep(1) // " + Marker + "the contract drives the real clock\n}\n"
	for name, text := range map[string]string{"above": above, "beside": beside} {
		walks := Walks(outsider, text, planted(t))
		if len(walks) != 1 || !walks[0].Marked || walks[0].Reason == "" || strings.Contains(walks[0].Reason, Marker) {
			t.Errorf("a marker %s the line reads %+v, and wants one marked walk with its reason", name, walks)
		}
	}
}

func TestAMarkerWithNoReasonPassesNothing(t *testing.T) {
	t.Parallel()
	text := "package wait\n\nimport \"time\"\n\nfunc For() {\n\ttime.Sleep(1) // " + strings.TrimSpace(Marker) + "\n}\n"
	walks := Walks(outsider, text, planted(t))
	if len(walks) != 1 || walks[0].Marked {
		t.Fatalf("a marker naming no reason reads %+v, and wants one walk standing unmarked", walks)
	}
}

func TestAScriptWalksAroundItsDoors(t *testing.T) {
	t.Parallel()
	text := strings.Join([]string{
		`import { readFileSync } from "node:fs";`,
		`import { join } from "node:path";`,
		`const later = setTimeout(() => {}, 5);`,
		`const at = Date.now();`,
		`const now = new Date();`,
		`const then = new Date(5);`,
		`box.setTimeout(1);`,
		`const key = { setTimeout: 1 };`,
		`// setTimeout(() => {}, 5);`,
		`const said = "Date.now() and setTimeout";`,
		`/* new Date() */ const fs = await import("node:fs/promises");`,
		`globalThis.setTimeout(() => {}, 1);`,
	}, "\n") + "\n"
	walks := Walks("src/scripts/wait.js", text, planted(t))
	want := []string{"node:fs", "setTimeout", "Date.now", "new Date()", "node:fs", "setTimeout"}
	if got := named(walks); !slices.Equal(got, want) {
		t.Fatalf("the walks name %v, and want %v", got, want)
	}
	lines := []int{}
	for _, one := range walks {
		lines = append(lines, one.Line)
	}
	if !slices.Equal(lines, []int{1, 3, 4, 5, 11, 12}) || walks[0].Column != 1 || !walks[0].Report || walks[1].Report {
		t.Fatalf("the walks read %+v", walks)
	}
}

func TestANodeModuleNoDoorDeclaresIsAWalk(t *testing.T) {
	t.Parallel()
	text := "import { spawn } from \"node:child_process\";\nconst net = require(\"node:net\");\n"
	walks := Walks("src/scripts/run.js", text, planted(t))
	if got := named(walks); !slices.Equal(got, []string{"node:child_process", "node:net"}) {
		t.Fatalf("the walks name %v, and want both undeclared modules", got)
	}
	for _, one := range walks {
		if len(one.Doors) != 0 || one.Report || one.Marked {
			t.Fatalf("an undeclared module reads %+v, and wants a walk around no door, refused", one)
		}
	}
}

func TestAWalkSaysTheDoorsItWalksAroundOrThatNoDoorDeclaresIt(t *testing.T) {
	t.Parallel()
	if got := (Walk{Name: "time.Now", Doors: []string{"clock", "process"}}).Says(); got != "time.Now walks around clock, process" {
		t.Fatalf("a walk around two doors says %q", got)
	}
	if got := (Walk{Name: "node:net"}).Says(); got != "node:net is a module no door declares" {
		t.Fatalf("a walk around no door says %q", got)
	}
}

func TestTheGuardsWalkReachesTheSkillsAloneInTheAgentsFolder(t *testing.T) {
	t.Parallel()
	for at, want := range map[string]bool{".claude": true, ".claude/skills/level0/hooks/start.js": true, "src/stub/.claude/skills/level0/hooks/shape.js": true, ".claude/agents/one.md": false, ".claude/settings.json": false, "src/doors/clock.js": false} {
		if got := OnSkills(at); got != want {
			t.Errorf("%s reads %v on the skills road, and wants %v", at, got, want)
		}
	}
}

func TestAPureNodeModuleIsNoWalk(t *testing.T) {
	t.Parallel()
	text := "import { join } from \"node:path\";\nimport { fileURLToPath } from \"node:url\";\nimport { test } from \"node:test\";\nimport assert from \"node:assert\";\nimport strict from \"node:assert/strict\";\n"
	if walks := Walks("src/scripts/pure.js", text, planted(t)); len(walks) != 0 {
		t.Fatalf("the pure modules read as walks %+v", walks)
	}
}

func TestAConstructorWithNoParenthesesIsAWalk(t *testing.T) {
	t.Parallel()
	text := "const now = new Date;\nconst then = new Date(at);\nconst there = new globalThis.Date();\n"
	if got := named(Walks("src/scripts/wait.js", text, planted(t))); !slices.Equal(got, []string{"new Date()"}) {
		t.Fatalf("the walks name %v, and want the bare new Date alone", got)
	}
}

func TestAScriptInsideItsDoorIsNoWalk(t *testing.T) {
	t.Parallel()
	text := "export const clock = () => ({ now: () => new Date(), at: () => Date.now() });\n"
	for _, path := range []string{"src/doors/clock.js", "src/doors/fake/clock.js"} {
		if walks := Walks(path, text, planted(t)); len(walks) != 0 {
			t.Errorf("%s reads its own time as %v", path, walks)
		}
	}
}

func TestAMarkedScriptLinePasses(t *testing.T) {
	t.Parallel()
	text := "// " + Marker + "the editor's own timer, which no door reaches\nsetTimeout(() => {}, 5);\n"
	walks := Walks("src/extension/wait.js", text, planted(t))
	if len(walks) != 1 || !walks[0].Marked || walks[0].Reason != "the editor's own timer, which no door reaches" {
		t.Fatalf("the marked line reads %+v", walks)
	}
}

func TestAFileOfNeitherLanguageNamesNoWalk(t *testing.T) {
	t.Parallel()
	if walks := Walks("spec/a.md", "setTimeout and time.Sleep\n", planted(t)); len(walks) != 0 {
		t.Fatalf("a note reads as %v", walks)
	}
}

func TestTheListsComeOffTheDeclarations(t *testing.T) {
	t.Parallel()
	doors := planted(t)
	if got := Packages(doors); !slices.Equal(got, []string{"context", "net/http", "os", "os/exec", "time"}) {
		t.Errorf("the packages read %v", got)
	}
	if got := Whole(doors); !slices.Equal(got, []string{"os", "os/exec"}) {
		t.Errorf("the whole packages read %v", got)
	}
}

const shimAt = "src/vehicle/shim_contract_test.go"

func contracted(t *testing.T) []Door {
	t.Helper()
	declared := map[string]string{clockAt: clockGo, diskAt: "files:\n  go: [os]\n  contract: [" + shimAt + "]\n"}
	doors, faults := Read(declared, func(at string) bool { return at == shimAt })
	if len(faults) != 0 {
		t.Fatalf("the declaration naming a contract test reads as faults: %v", faults)
	}
	return doors
}

func TestAContractTestUsesItsOwnDoorsNames(t *testing.T) {
	t.Parallel()
	if walks := Walks(shimAt, "package vehicle\n\nimport \"os\"\n\nvar _ = os.Getpid\n", contracted(t)); len(walks) != 0 {
		t.Fatalf("the contract test of files walks around it: %v", named(walks))
	}
}

func TestAContractTestWalksAroundAnotherDoor(t *testing.T) {
	t.Parallel()
	walks := Walks(shimAt, "package vehicle\n\nimport \"time\"\n\nfunc wait() { time.Sleep(1) }\n", contracted(t))
	if !slices.Equal(named(walks), []string{"time.Sleep"}) {
		t.Fatalf("the contract test of files names %v, and wants the walk around the clock", named(walks))
	}
}

func TestAContractPathOfNoContractTestIsAFault(t *testing.T) {
	t.Parallel()
	cases := map[string]string{
		"a contract test standing nowhere": "test/contract/gone.test.js",
		"a path of no contract test":       "src/vehicle/disk.go",
	}
	for name, at := range cases {
		text := "files:\n  go: [os]\n  contract: [" + at + "]\n"
		if _, faults := Read(map[string]string{diskAt: text}, func(one string) bool { return one == "src/vehicle/disk.go" }); len(faults) == 0 || !strings.Contains(faults[0].Says, at) {
			t.Errorf("%s reads %v, and wants a fault naming %s", name, faults, at)
		}
	}
}
