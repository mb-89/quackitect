// The names the private folder holds, the rule placing a spelling of one beside
// its owner, and the rule holding the installer's loops to the lists.
// [[spec/design_input/the-runtime-files-stand-apart]]
package check

import (
	"regexp"
	"slices"
	"strings"
)

// The names the runtime half took, its older names, the older places of the log, and a name one side holds alone. [[spec/design_input/the-runtime-files-stand-apart]]
var (
	Moved = []string{
		"bin", "box.json", "check.json", "config.json", "copilot", "copilot-cloud", "hold",
		"identity.json", "index.db", "index.json", "lsp-door.json", "measure", "project.json",
		"registry.json", "review", "session.json", "show-panel", "tools.json", "undo", "vehicle.json",
	}
	Renamed = []string{"run", "runtime"}
	Logged  = []string{"log", "run/log", "runtime/log", ".runtime/log"}
	Apart   = map[string]struct{ Side, Why string }{
		"hold.json":     {"rule", "the hold folder beside it carries the spelling"},
		"registry.json": {"loop", "the home register moves in a block of its own"},
	}
)

// The file owning the folder names, the word a copy names it by, and the file owning the lists. [[spec/design_input/the-runtime-files-stand-apart]]
const (
	foldersJS  = ".claude/skills/level0/lib/folders.js"
	owner      = "folders.js"
	foldersAt  = "src/modules/check/folders.go"
	privateDir = ".se"
)

var (
	ownedFile  = regexp.MustCompile(`^(?:src|\.claude)/.*\.(?:js|go|sh)$`)
	aTestFile  = regexp.MustCompile(`_test\.go$|\.test\.js$`)
	spells     = spellings([]string{".runtime", ".retro"}, Moved)
	loopLine   = regexp.MustCompile(`^\s*for\s+\w+\s+in\s+(.*)$`)
	loopMark   = regexp.MustCompile(`folders\.go\s+owns\s+these\s+names\s+as\s+([A-Z_]+)`)
	shellVar   = regexp.MustCompile(`\$\{?\w+\}?/`)
	privateRun = regexp.MustCompile(regexp.QuoteMeta(privateDir + "/"))
)

// A folder spelled as one path, or as two words joined. [[spec/design_input/the-runtime-files-stand-apart]]
func spellings(names ...[]string) []*regexp.Regexp {
	out := []*regexp.Regexp{}
	dir := regexp.QuoteMeta(privateDir)
	for _, list := range names {
		quoted := []string{}
		for _, one := range list {
			quoted = append(quoted, regexp.QuoteMeta(one))
		}
		either := "(?:" + strings.Join(quoted, "|") + ")"
		out = append(out,
			regexp.MustCompile(dir+`/`+either+`\b`),
			regexp.MustCompile(`"`+dir+`"\s*,\s*"`+either+`"`))
	}
	return out
}

// [[spec/design_input/the-runtime-files-stand-apart]]
func privateFolderOwned(tree *Tree) []Finding {
	out := []Finding{}
	for _, path := range ownedPaths(tree) {
		out = append(out, spelledOver(tree, path)...)
	}
	return out
}

// The editor draws the rule under the installer it holds. [[spec/design_output/tree#the-rules-over-two-files]]
func installerSpellsNoFolder(tree *Tree) []Finding {
	return spelledOver(tree, Install)
}

// [[spec/design_input/the-runtime-files-stand-apart]]
func spelledOver(tree *Tree, path string) []Finding {
	out := []Finding{}
	lines := strings.Split(strings.ReplaceAll(tree.Read(path), "\r\n", "\n"), "\n")
	for at, line := range lines {
		if !spelled(line) || namesOwner(lines, at) {
			continue
		}
		out = append(out, fault("PrivateFolderOwned", path, at+1,
			"This line spells a folder "+foldersJS+" owns. Take the name from there, or name that file in a comment beside the copy."))
	}
	return out
}

// The source the rule reads, and the installer wherever it stands. [[spec/design_input/the-runtime-files-stand-apart]]
func ownedPaths(tree *Tree) []string {
	out := []string{}
	for _, path := range tree.Paths() {
		if (ownedFile.MatchString(path) || path == Install) && !aTestFile.MatchString(path) && path != foldersJS {
			out = append(out, path)
		}
	}
	return out
}

func spelled(line string) bool {
	for _, one := range spells {
		if one.MatchString(line) {
			return true
		}
	}
	return false
}

// A copy names the owner on its own line, or in the comment run above it, so an import excuses no other line. [[spec/design_input/the-runtime-files-stand-apart]]
func namesOwner(lines []string, at int) bool {
	if strings.Contains(lines[at], owner) {
		return true
	}
	for up := at - 1; up >= 0 && commentLine(lines[up]); up-- {
		if strings.Contains(lines[up], owner) {
			return true
		}
	}
	return false
}

func commentLine(line string) bool {
	said := strings.TrimSpace(line)
	return strings.HasPrefix(said, "//") || strings.HasPrefix(said, "#") || strings.HasPrefix(said, "*")
}

// The installer moves a name the spelling rule holds, so one change reaches the shell and the rule alike. [[spec/design_input/the-runtime-files-stand-apart]]
func installerHoldsTheNames(tree *Tree) []Finding {
	rule := "InstallerHoldsTheNames"
	lists := map[string][]string{"MOVED": Moved, "RENAMED": Renamed, "LOGGED": Logged}
	said, unmarked := loopNames(tree.Read(Install), lists)
	out := []Finding{}
	for _, line := range unmarked {
		out = append(out, fault(rule, Install, line, "This loop names no list "+foldersAt+" holds. Name one above it."))
	}
	for _, name := range []string{"MOVED", "RENAMED", "LOGGED"} {
		out = append(out, standingApart(rule, name, lists[name], said[name])...)
	}
	return out
}

// A name one side holds alone stands refused, unless Apart names that side with its reason. [[spec/design_input/the-runtime-files-stand-apart]]
func standingApart(rule, name string, list, loop []string) []Finding {
	if loop == nil {
		return []Finding{fault(rule, Install, 1, name+" stands in "+foldersAt+", and no loop here moves it.")}
	}
	out := []Finding{}
	for _, one := range list {
		if !slices.Contains(loop, one) && Apart[one].Side != "loop" {
			out = append(out, fault(rule, Install, 1, name+" holds "+one+", and this installer moves it nowhere."))
		}
	}
	for _, one := range loop {
		if !slices.Contains(list, one) && Apart[one].Side != "rule" {
			out = append(out, fault(rule, Install, 1, "This installer moves "+one+", and "+name+" holds it nowhere."))
		}
	}
	return out
}

// The names each loop moves by the list its mark names, and the line of each loop naming no list. [[spec/design_input/the-runtime-files-stand-apart]]
func loopNames(text string, lists map[string][]string) (map[string][]string, []int) {
	lines := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
	out := map[string][]string{}
	unmarked := []int{}
	for at, line := range lines {
		found := loopLine.FindStringSubmatch(line)
		if found == nil {
			continue
		}
		names := loopWords(lines, at, found[1])
		mark := markAbove(lines, at)
		if mark == "" {
			// A loop reaching the private folder or moving a name a list holds names that list, and every other loop stands outside this. [[spec/design_input/the-runtime-files-stand-apart]]
			if privateRun.MatchString(found[1]) || meets(names, lists) {
				unmarked = append(unmarked, at+1)
			}
			continue
		}
		out[mark] = append(out[mark], names...)
	}
	return out, unmarked
}

// A name any list holds marks the loop moving it, whatever its header spells. [[spec/design_input/the-runtime-files-stand-apart]]
func meets(names []string, lists map[string][]string) bool {
	for _, list := range lists {
		for _, one := range names {
			if slices.Contains(list, one) {
				return true
			}
		}
	}
	return false
}

// A mark stands in the comment run above its loop. [[spec/design_input/the-runtime-files-stand-apart]]
func markAbove(lines []string, at int) string {
	for up := at - 1; up >= 0 && strings.HasPrefix(strings.TrimSpace(lines[up]), "#"); up-- {
		if found := loopMark.FindStringSubmatch(lines[up]); found != nil {
			return found[1]
		}
	}
	return ""
}

// A loop carries over on a trailing mark, and each word reads as its name under the private folder. [[spec/design_input/the-runtime-files-stand-apart]]
func loopWords(lines []string, at int, first string) []string {
	said := first
	for down := at; strings.HasSuffix(strings.TrimRight(said, " \t"), `\`); down++ {
		next := ""
		if down+1 < len(lines) {
			next = lines[down+1]
		}
		said = strings.TrimSuffix(strings.TrimRight(said, " \t"), `\`) + " " + next
	}
	out := []string{}
	for _, word := range strings.Fields(strings.Split(said, ";")[0]) {
		if one := bareName(word); one != "" {
			out = append(out, one)
		}
	}
	return out
}

func bareName(word string) string {
	said := strings.NewReplacer(`"`, "", "'", "").Replace(word)
	said = shellVar.ReplaceAllString(said, "")
	return strings.TrimSpace(strings.TrimPrefix(said, privateDir+"/"))
}
