package main

import (
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"testing"
)

// EVERY ARGUMENT BUILDER IS DRIVEN AGAINST THE ENGINE, AND A COMMENT DRIVES
// NOTHING.
//
// A control in the panel sent se work --form "test". The engine has no --form,
// it has --title, so it printed its usage and minted nothing. Somebody typed a
// token and watched it vanish. Nothing noticed, because the two halves are two
// programs and the only thing joining them is an array of strings that neither
// one checks. The answer was a census: every builder the extension exports is
// handed to the real binary by a runner, or is excluded by name with a reason.
//
// THE CENSUS READ ITS OWN SOURCE WITH A BARE PATTERN. It swept the runner for
// A.name( and counted every hit, comments and all, so a builder whose name
// appeared only inside a sentence about it counted as driven. A builder could
// be exported, mentioned once in a note saying why it was left out for now,
// called by nobody, and the census stayed green over a call that never
// happened. That is the one thing the census exists to see.
//
// SO THE COMMENTS COME OUT BEFORE THE COUNT, and the string literals stay in,
// because a flag is a string and a builder name is not. Everything below is
// planted in a folder of its own, and the live tree is neither read nor
// written.

var engineArgsExportLine = regexp.MustCompile(`(?m)^\s*export\s+function\s+(\w+)\s*\(`)

var engineArgsCallSite = regexp.MustCompile(`\bA\.(\w+)\s*\(`)

// engineArgsWithoutComments answers the source with its line comments and its
// block comments taken out and its string literals left whole.
func engineArgsWithoutComments(source string) string {
	var out strings.Builder
	letters := []rune(source)
	for i := 0; i < len(letters); i++ {
		c := letters[i]
		switch {
		case c == '/' && i+1 < len(letters) && letters[i+1] == '/':
			for i < len(letters) && letters[i] != '\n' {
				i++
			}
			out.WriteRune('\n')
		case c == '/' && i+1 < len(letters) && letters[i+1] == '*':
			i += 2
			for i+1 < len(letters) && !(letters[i] == '*' && letters[i+1] == '/') {
				i++
			}
			i++
			out.WriteRune(' ')
		case c == '"' || c == '\'' || c == '`':
			quote := c
			out.WriteRune(c)
			i++
			for i < len(letters) && letters[i] != quote {
				if letters[i] == '\\' && i+1 < len(letters) {
					out.WriteRune(letters[i])
					i++
				}
				out.WriteRune(letters[i])
				i++
			}
			if i < len(letters) {
				out.WriteRune(letters[i])
			}
		default:
			out.WriteRune(c)
		}
	}
	return out.String()
}

// engineArgsExported answers the argument builders a module hands out.
func engineArgsExported(module string) []string {
	var names []string
	found := engineArgsExportLine.FindAllStringSubmatch(engineArgsWithoutComments(module), -1)
	for _, one := range found {
		names = append(names, one[1])
	}
	return names
}

// engineArgsDriven answers the builders the runners actually call.
func engineArgsDriven(runners []string) map[string]bool {
	driven := map[string]bool{}
	for _, runner := range runners {
		found := engineArgsCallSite.FindAllStringSubmatch(engineArgsWithoutComments(runner), -1)
		for _, one := range found {
			driven[one[1]] = true
		}
	}
	return driven
}

// engineArgsUndriven answers the exported builders that no runner calls and no
// exclusion names, in one order so a failure reads the same way twice.
func engineArgsUndriven(exported []string, driven map[string]bool, excluded map[string]string) []string {
	var left []string
	for _, name := range exported {
		if driven[name] {
			continue
		}
		if _, said := excluded[name]; said {
			continue
		}
		left = append(left, name)
	}
	sort.Strings(left)
	return left
}

// aPlantedModuleAndRunner writes a module and a runner into a temporary folder
// and answers the census read back out of the files, so the reading is the one
// the check does rather than one done from memory.
func aPlantedModuleAndRunner(t *testing.T, module, runner string) ([]string, map[string]bool) {
	t.Helper()
	dir := t.TempDir()
	modulePath := filepath.Join(dir, "engineargs.ts")
	runnerPath := filepath.Join(dir, "engine-args.mjs")
	if err := os.WriteFile(modulePath, []byte(module), 0o644); err != nil {
		t.Fatalf("the planted module could not be written: %v", err)
	}
	if err := os.WriteFile(runnerPath, []byte(runner), 0o644); err != nil {
		t.Fatalf("the planted runner could not be written: %v", err)
	}
	moduleText, err := os.ReadFile(modulePath)
	if err != nil {
		t.Fatalf("the planted module could not be read: %v", err)
	}
	runnerText, err := os.ReadFile(runnerPath)
	if err != nil {
		t.Fatalf("the planted runner could not be read: %v", err)
	}
	return engineArgsExported(string(moduleText)), engineArgsDriven([]string{string(runnerText)})
}

// aModuleOfThreeBuilders is the smallest module with something to miss: three
// builders, all exported, all reachable from the panel.
const aModuleOfThreeBuilders = `// THE BUILDERS THE PANEL CALLS.
export function mintArgs(text: string): string[] {
  return ["work", "--title", text];
}

export function holdArgs(to: string): string[] {
  return ["hold", "--to", to];
}

export function strayArgs(group: string): string[] {
  return ["view", "--pin", group];
}
`

// aRunnerThatOnlyTalksAboutTheThird calls two builders and writes the third
// one down in a note about why it is not called yet. One note is a line
// comment and one is a block comment, because both hid a call in their day.
const aRunnerThatOnlyTalksAboutTheThird = `import * as A from "./engineargs.mjs";

ask("mint", A.mintArgs("test"));
ask("hold", A.holdArgs("held"));
// A.strayArgs("later") wants a view file with two panes, so it waits for one.
/* When the folder has a view, A.strayArgs("later") goes in beside the rest. */
`

// aRunnerThatCallsAllThree is the same runner with the third call made. The
// note stays, so the clean case is not clean merely because the words are
// gone.
const aRunnerThatCallsAllThree = `import * as A from "./engineargs.mjs";

ask("mint", A.mintArgs("test"));
ask("hold", A.holdArgs("held"));
// A.strayArgs("later") pins a group the folder invents for this run.
ask("pin a group", A.strayArgs("later"));
`

func TestEveryArgumentBuilderIsDrivenByARunner(t *testing.T) {
	t.Run("a builder named only in a comment is not driven", func(t *testing.T) {
		exported, driven := aPlantedModuleAndRunner(t,
			aModuleOfThreeBuilders, aRunnerThatOnlyTalksAboutTheThird)
		if len(exported) != 3 {
			t.Fatalf("the planted module exports three builders, the census found %v", exported)
		}
		undriven := engineArgsUndriven(exported, driven, map[string]string{})
		if strings.Join(undriven, ", ") != "strayArgs" {
			t.Fatalf("strayArgs is exported and only written about in two comments, "+
				"so the census owes a word about it. It answered that these are "+
				"undriven: %v", undriven)
		}
	})

	t.Run("a builder every runner calls is driven", func(t *testing.T) {
		exported, driven := aPlantedModuleAndRunner(t,
			aModuleOfThreeBuilders, aRunnerThatCallsAllThree)
		undriven := engineArgsUndriven(exported, driven, map[string]string{})
		if len(undriven) != 0 {
			t.Fatalf("every builder in the planted module is called outside a comment, "+
				"so nothing is owed. The census called these undriven: %v", undriven)
		}
	})

	t.Run("a builder excluded by name with a reason is forgiven", func(t *testing.T) {
		exported, driven := aPlantedModuleAndRunner(t,
			aModuleOfThreeBuilders, aRunnerThatOnlyTalksAboutTheThird)
		excluded := map[string]string{
			"strayArgs": "it needs a view file with two panes, which this run has not got",
		}
		undriven := engineArgsUndriven(exported, driven, excluded)
		if len(undriven) != 0 {
			t.Fatalf("strayArgs is excluded by name with a reason, so the census has "+
				"its answer. It called these undriven: %v", undriven)
		}
	})
}
