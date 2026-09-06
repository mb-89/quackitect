package main

import "strings"

// A COMMIT CARRIES ONLY THE PATHS IT NAMES.
//
// Every agent on a box works in one working tree with one git index, and a
// commit takes whatever the index holds at that moment: what every other
// agent has staged since, under the committer's name, with no line in the
// message saying so.
//
// MEASURED, ON f0c20fa3. The main agent staged four paths by name and
// committed. A worker had staged its move of two files into internal, both
// deletions rode along and the additions did not, and origin stopped building.
// cf8e1d4e put the files back. The committer never saw any of it.
//
// SO A COMMIT NAMES ITS PATHS, and git commits those alone: with a pathspec,
// git commit is --only, and the index of the moment stays where it was. A
// commit naming no path is refused, and so is one that asks for the index
// with -a, --all, -i or --include. A stage of everything, git add -A, --all
// or a lone dot, is refused the same way: it stages what every other hand
// touched, which is the same commit one step earlier.
//
// THE WALK IS gitCleanAt'S. git is found where a program is run, past the
// words that run another program and past a runner's flags, so a message
// that says git commit is prose and git -C dir commit is a commit.
//
// Why a commit names its paths is [[a-write-names-its-token]]'s neighbour:
// the record has to say whose change reached origin.

// gitVerbAt answers where in these words git runs this subcommand, or -1.
func gitVerbAt(words []string, verb string) int {
	past := ""     // the runner most recently walked past
	value := false // the next word is the value of the flag before it
	for i, w := range words {
		if value {
			value = false
			continue
		}
		bare := strings.ToLower(strings.Trim(w, "'\""))
		if past == "git" && bare == verb {
			return i
		}
		if runner(w) {
			past = bare
			continue
		}
		if past != "" && strings.HasPrefix(w, "-") {
			value = takesAValue(past, w)
			continue
		}
		return -1
	}
	return -1
}

// commitValueFlags are the commit flags whose value is the next word, so the
// value is not read as a path. A flag with its value attached, -mx or
// --message=x, is one word and needs no entry.
var commitValueFlags = map[string]bool{
	"-m": true, "--message": true, "-F": true, "--file": true,
	"-C": true, "--reuse-message": true, "-c": true, "--reedit-message": true,
	"--author": true, "--date": true, "-t": true, "--template": true,
	"--cleanup": true, "--fixup": true, "--squash": true, "--trailer": true,
	"--pathspec-from-file": true,
}

// indexFlags are the commit flags that ask for the index, or for every
// tracked change, rather than for the paths named.
var indexFlags = map[string]bool{"-a": true, "--all": true, "-i": true, "--include": true}

// commitPaths answers the paths a commit names and whether it asked for the
// index instead. A cluster of short flags, -am, is read letter by letter: a
// takes the index, and m, F, C, c or t at its end takes the next word.
func commitPaths(args []string) (paths []string, index bool) {
	for i := 0; i < len(args); i++ {
		a := strings.Trim(args[i], "'\"")
		switch {
		case a == "--":
			return append(paths, filesAmong(args[i:])...), index
		case indexFlags[a]:
			index = true
		case commitValueFlags[a]:
			i++
		case strings.HasPrefix(a, "--"):
		case strings.HasPrefix(a, "-") && len(a) > 2:
			if strings.ContainsAny(a[1:], "ai") {
				index = true
			}
			if strings.ContainsAny(a[len(a)-1:], "mFCct") {
				i++
			}
		case strings.HasPrefix(a, "-"):
		case a != "":
			paths = append(paths, a)
		}
	}
	return paths, index
}

// stagesEverything answers whether a git add takes the whole tree rather than
// paths it names.
func stagesEverything(args []string) bool {
	for _, w := range args {
		a := strings.Trim(w, "'\"")
		switch {
		case a == "--":
			return false
		case a == "-A" || a == "--all" || a == ".":
			return true
		case strings.HasPrefix(a, "-") && !strings.HasPrefix(a, "--") && strings.Contains(a[1:], "A"):
			return true
		}
	}
	return false
}

// ACommitCarriesStrangers answers whether this command commits or stages the
// index of the moment rather than paths it names, and says what to run
// instead. It is asked at both doors a shell command comes through: the
// harness's Bash and the run verb.
func ACommitCarriesStrangers(command string) (string, bool) {
	for _, part := range pipeline(command) {
		words := shellWords(part)
		if at := gitVerbAt(words, "commit"); at >= 0 {
			paths, index := commitPaths(words[at+1:])
			switch {
			case index:
				return aCommitTakesTheIndex("asks for the index with -a, -i, --all or --include"), true
			case len(paths) == 0:
				return aCommitTakesTheIndex("names no path"), true
			}
		}
		if at := gitVerbAt(words, "add"); at >= 0 && stagesEverything(words[at+1:]) {
			return aStageOfEverything(), true
		}
	}
	return "", false
}

// aCommitTakesTheIndex is the refusal, and it says which shape it was.
func aCommitTakesTheIndex(why string) string {
	return "A COMMIT CARRIES ONLY THE PATHS IT NAMES.\n\n" +
		"This commit " + why + ", so it takes whatever the index holds at this moment. Every agent " +
		"on this box shares that index, and what another hand staged goes to origin under your name " +
		"with no line saying so.\n\n" +
		"MEASURED: f0c20fa3 carried another agent's two deletions and left origin not building, and " +
		"its message named neither.\n\n" +
		"Name the paths: git commit --only -m \"...\" <paths>. With paths, git commits those and leaves " +
		"the rest of the index where it was."
}

// aStageOfEverything is the refusal for a stage that names no path.
func aStageOfEverything() string {
	return "A STAGE OF EVERYTHING IS REFUSED.\n\n" +
		"git add -A, --all or . stages what every other hand on this box has touched, and the next " +
		"commit takes it all. The index is shared, and a stage that names no path is a commit of " +
		"strangers one step early.\n\n" +
		"Name the paths: git add <paths>, or skip the stage and commit them by name: git commit --only " +
		"-m \"...\" <paths>."
}
