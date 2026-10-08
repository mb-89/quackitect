// The door's reads of a commit, a branch, a staging and a test run.
// [[spec/tickets/cage-command-rules-port]]
package command

import "strings"

// The forms a commit's message takes: carried over, passed, read off a file, or none, which opens an editor. [[spec/design_output/bash#a-commit-message-meets-voice]]
const (
	FormCarried = "carried"
	FormMessage = "message"
	FormFile    = "file"
	FormNone    = "none"
)

// The package runners whose test verb runs the whole suite. [[spec/design_output/bash#a-test-run-points-somewhere]]
var runners = setOf("npm", "pnpm", "yarn", "bun")

// The message a commit carries, and the form it takes. [[spec/design_output/bash#a-commit-message-meets-voice]]
type Commit struct {
	Form string
	Text string
	File string
}

// The first git commit a command runs, and how its message reaches it. [[spec/design_output/bash#a-commit-message-meets-voice]]
func CommitIn(command string) (Commit, bool) {
	segments, bodies := partsOf(command)
	for _, one := range segments {
		words := wordsIn(one)
		rest := afterGit(words)
		if BaseName(first(words)) != "git" || first(rest) != "commit" {
			continue
		}
		args := rest[1:]
		var said []string
		for i := 0; i < len(args); i++ {
			arg := args[i]
			for _, flag := range carried {
				if arg == flag || strings.HasPrefix(arg, flag+"=") {
					return Commit{Form: FormCarried}, true
				}
			}
			if message := flagValue(arg, args, i, "-m", "--message"); message.found {
				said = append(said, message.value)
				if message.took {
					i++
				}
				continue
			}
			file := flagValue(arg, args, i, "-F", "--file")
			if !file.found {
				continue
			}
			if fed := bodiesIn(one, bodies); file.value == "-" && len(fed) > 0 {
				return Commit{Form: FormMessage, Text: fed[0]}, true
			}
			return Commit{Form: FormFile, File: file.value}, true
		}
		if len(said) > 0 {
			return Commit{Form: FormMessage, Text: strings.Join(said, "\n\n")}, true
		}
		return Commit{Form: FormNone}, true
	}
	return Commit{}, false
}

// Whether a git commit the command runs steps past the hook. [[spec/design_output/private#the-escape]]
func SkipsTheHook(command string) bool {
	segments, _ := partsOf(command)
	for _, one := range segments {
		words := wordsIn(one)
		rest := afterGit(words)
		if BaseName(first(words)) == "git" && first(rest) == "commit" && steps(rest[1:]) {
			return true
		}
	}
	return false
}

// Every branch name a checkout or a switch makes. [[spec/design_output/bash#a-branch-meets-the-cap]]
func branchIn(command string) []string {
	var out []string
	segments, _ := partsOf(command)
	for _, one := range segments {
		words := wordsIn(one)
		if BaseName(first(words)) != "git" {
			continue
		}
		rest := afterGit(words)
		var flags []string
		switch first(rest) {
		case "checkout":
			flags = []string{"-b", "-B", "--create"}
		case "switch":
			flags = []string{"-c", "-C", "--create"}
		default:
			continue
		}
		args := rest[1:]
		for i, arg := range args {
			if said := flagValue(arg, args, i, flags...); said.found && said.value != "" {
				out = append(out, said.value)
			}
		}
	}
	return out
}

// Every path under the private half a git add stages. [[spec/design_output/private#the-second-door]]
func addsIn(command string) []string {
	var out []string
	segments, _ := partsOf(command)
	for _, one := range segments {
		words := wordsIn(one)
		rest := afterGit(words)
		if BaseName(first(words)) != "git" || (first(rest) != "add" && first(rest) != "stage") {
			continue
		}
		for _, arg := range rest[1:] {
			said := Clean(arg)
			if !strings.HasPrefix(arg, "-") && (said == home || strings.HasPrefix(said, home+"/")) {
				out = append(out, said)
			}
		}
	}
	return out
}

// Every test run naming no file: node --test bare, or a runner's whole suite. [[spec/design_output/bash#a-test-run-points-somewhere]]
func testIn(command string) []string {
	var out []string
	segments, _ := partsOf(command)
	for _, one := range segments {
		words := wordsIn(one)
		name := BaseName(first(words))
		var args []string
		if len(words) > 0 {
			args = words[1:]
		}
		if name == "node" && holds(args, "--test") && !narrowed(args) {
			out = append(out, strings.Join(words, " "))
			continue
		}
		if whole, rest := wholeSuite(args); runners[name] && whole && !narrowed(rest) {
			out = append(out, strings.Join(words, " "))
		}
	}
	return out
}

// [[spec/design_output/bash#a-test-run-points-somewhere]]
func narrowed(args []string) bool {
	for _, one := range args {
		if (!strings.HasPrefix(one, "-") && one != "--" && one != "--test") || strings.HasPrefix(one, "--test-name-pattern") || strings.HasPrefix(one, "--test-only") {
			return true
		}
	}
	return false
}

// Whether the args run a runner's whole test verb, and the args past it. [[spec/design_output/bash#a-test-run-points-somewhere]]
func wholeSuite(args []string) (bool, []string) {
	var bare []string
	for _, one := range args {
		if !strings.HasPrefix(one, "-") {
			bare = append(bare, one)
		}
	}
	took := 0
	switch {
	case len(bare) > 1 && bare[0] == "run" && bare[1] == "test":
		took = 2
	case len(bare) > 0 && (bare[0] == "test" || bare[0] == "t"):
		took = 1
	}
	if took == 0 {
		return false, nil
	}
	var rest []string
	for _, one := range args {
		if !holds(bare[:took], one) {
			rest = append(rest, one)
		}
	}
	return true, rest
}

// [[spec/tickets/cage-command-rules-port]]
func holds(words []string, word string) bool {
	for _, one := range words {
		if one == word {
			return true
		}
	}
	return false
}
