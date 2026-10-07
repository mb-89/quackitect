// The rules over the names the private folder holds, each broken on a tree a case
// seeds: a spelling names its owner, and the installer moves what the lists say.
// [[spec/design_input/the-runtime-files-stand-apart]]
package check

import (
	"reflect"
	"strings"
	"testing"
)

// The rule's findings off the sweep's rules, as a file and a line each. [[spec/design_input/the-runtime-files-stand-apart]]
func spelledIn(files Texts, rule string) []string {
	out := []string{}
	for _, one := range treeFaults(TreeOver("/tree", files)) {
		if one.Rule == rule {
			out = append(out, one.File+":"+itoa(one.Line))
		}
	}
	return out
}

func TestPrivateFolderOwnedRefusesASpellingNamingNoOwner(t *testing.T) {
	for _, one := range []struct {
		name  string
		files Texts
		want  []string
	}{
		{"the runtime folder spelled", Texts{
			"src/scripts/stray.js": "const at = \"x\";\nconst hold = \".se/.runtime/hold\";\n",
			"src/index/split.go":   "const at = \".se\", \".runtime\"\n",
		}, []string{"src/index/split.go:1", "src/scripts/stray.js:2"}},
		{"a name the runtime half took, at the old place", Texts{
			"src/bridge/left.js": "const at = join(work, \".se\", \"hold\");\n",
			"src/scripts/old.js": "const bin = \".se/bin\";\nconst log = \".se/.log\";\n",
		}, []string{"src/bridge/left.js:1", "src/scripts/old.js:1"}},
		{"a name the half left", Texts{"src/scripts/rest.js": "const notes = \".se/notes\";\n"}, []string{}},
		{"the owner beside the copy, a test, and the owner itself", Texts{
			"src/extension/copy.js":                "// The folder folders.js owns, spelled again here.\nconst BIN = \".se/.runtime/bin\";\n",
			"test/level0/folders.test.js":          "const at = \".se/.runtime/bin\";\n",
			"src/modules/check/folders_test.go":    "const at = \".se/.runtime/bin\"\n",
			".claude/skills/level0/lib/folders.js": "export const RUN = \".se/.runtime\";\n",
		}, []string{}},
	} {
		t.Run(one.name, func(t *testing.T) {
			if got := spelledIn(one.files, "PrivateFolderOwned"); !reflect.DeepEqual(got, one.want) {
				t.Fatalf("PrivateFolderOwned refuses %q, and wants %q", got, one.want)
			}
		})
	}
}

// The escape binds to the line, so an import of the owner excuses no other spelling. [[spec/design_input/the-runtime-files-stand-apart]]
func TestAnImportAloneExcusesNoSpellingAndACommentAboveDoes(t *testing.T) {
	const imports = "import { inRun } from \"../../.claude/skills/level0/lib/folders.js\";\n"
	loose := Texts{"src/scripts/two.js": imports + "const at = \".se/.runtime/bin\";\n"}
	if got, want := spelledIn(loose, "PrivateFolderOwned"), []string{"src/scripts/two.js:2"}; !reflect.DeepEqual(got, want) {
		t.Fatalf("a spelling under an import alone draws %q, and wants %q", got, want)
	}
	named := Texts{"src/scripts/two.js": imports + "// The folder folders.js owns, spelled again here.\nconst at = \".se/.runtime/bin\";\n"}
	if got := spelledIn(named, "PrivateFolderOwned"); len(got) != 0 {
		t.Fatalf("a spelling under the owner's comment draws %q, and wants nothing", got)
	}
}

// The installer's loop and the list the rule reads move in one change, and the editor draws the gap under the installer. [[spec/design_input/the-runtime-files-stand-apart]]
func TestInstallerHoldsTheNamesRefusesALoopApartFromItsList(t *testing.T) {
	loop := func(names string) string {
		return "# folders.go owns these names as RENAMED.\nfor one in " + names + "; do\n  mv \"$one\" \"$new\"\ndone\n"
	}
	for _, one := range []struct {
		name  string
		text  string
		wants string
	}{
		{"a name the list holds and the loop drops", loop(`"$root/.se/run"`), "runtime"},
		{"a name the loop holds and no list does", loop(`"$root/.se/run" "$root/.se/runtime" "$root/.se/old"`), "old"},
		{"a loop naming no list", "for one in bin hold; do\n  mv \"$one\" \"$new\"\ndone\n", "names no list"},
	} {
		t.Run(one.name, func(t *testing.T) {
			checker := CheckerOver(TreeOver("/tree", Texts{Install: one.text}), 0, 0)
			said := []string{}
			for _, found := range checker.Over(Install) {
				if found.Rule == "InstallerHoldsTheNames" {
					said = append(said, found.Message)
				}
			}
			if !strings.Contains(strings.Join(said, "\n"), one.wants) {
				t.Fatalf("InstallerHoldsTheNames draws %q over %s, and wants a finding naming %q", said, Install, one.wants)
			}
		})
	}
}

// The installer names the list each loop carries, so a rule reads the pair. [[spec/design_input/the-runtime-files-stand-apart]]
func TestLoopNamesReadsEachLoopUnderItsMark(t *testing.T) {
	text := strings.Join([]string{
		"# folders.go owns these names as RENAMED.",
		`for one in "$root/.se/run" "$root/.se/runtime"; do`,
		"  mv $one $new",
		"done",
		"",
		"# folders.go owns these names as MOVED.",
		"for one in bin hold \\",
		"  box.json; do",
		"  mv $one $new",
		"done",
		"",
		`for one in "$root/.se/old"; do`,
		"  echo $one",
		"done",
		"",
	}, "\n")
	names, unmarked := loopNames(text, nil)
	if want := []string{"run", "runtime"}; !reflect.DeepEqual(names["RENAMED"], want) {
		t.Errorf("RENAMED reads %q, and wants %q, a path reading as its name", names["RENAMED"], want)
	}
	if want := []string{"bin", "hold", "box.json"}; !reflect.DeepEqual(names["MOVED"], want) {
		t.Errorf("MOVED reads %q, and wants %q, a line carrying over", names["MOVED"], want)
	}
	if want := []int{12}; !reflect.DeepEqual(unmarked, want) {
		t.Errorf("the unmarked loops read %v, and want %v, a loop naming no list by its line", unmarked, want)
	}
}
