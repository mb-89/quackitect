package main

import (
	"os"
	"path/filepath"
	"strings"
)

// A DELETE IS THE ONE CHANGE THE TREE DOES NOT CARRY BACK.
//
// WHAT HAPPENED. One command was a sixty-iteration loop: run go vet, take the
// filename out of the first error, delete that file, go round again. It ate
// live code four times. Every other guard here is about a change somebody can
// read afterwards. A deleted file leaves nothing to read.
//
// THE TWO HALVES ARE DIFFERENT QUESTIONS. A removal that names its files can
// be judged file by file, and the question is whether anybody looked. A loop
// names no files at all: the ones it deletes come out of its own output, a
// round at a time, so there is nothing in the command to judge. So the first
// is answered from the read set and the second is refused outright.
//
// AND git clean IS BOTH OF THEM. It is not run as a program the remover list
// holds, so both halves walked past it, and it took a 13MB binary out of the
// source folder minutes after this file was written. With a pathspec it names
// its files and the read set answers it. With none it takes every untracked
// file under the tree, and -d takes whole folders, which is the loop's
// question wearing another word.
//
// THE READ SET IS ALREADY THERE. The engine notes every read to answer the
// stale-write and the dedup guards, so this costs no new bookkeeping: it asks
// a question the evidence already holds the answer to.
//
// OUTSIDE THE TREE THE DISK IS THE AGENT'S OWN, the line the search guard
// draws. Nothing out there is reviewed and nothing out there ships, so a
// removal there is not this rule's business. The scratchpad is inside the
// tree and out of this rule for the reason it is out of the gate: thinking is
// not a change, and an agent that cannot delete its own scrap paper is being
// argued with.

// remover says whether this word runs a program that deletes files, by the
// name it is run as. The name is taken off the path and the suffix the way
// searcher does it, so ./bin/rm and RM.EXE are the same program.
func remover(word string) bool {
	name := strings.Trim(word, "'\"")
	if i := strings.LastIndexAny(name, "/"+string(os.PathSeparator)); i >= 0 {
		name = name[i+1:]
	}
	name = strings.ToLower(strings.TrimSuffix(name, ".exe"))
	switch name {
	case "rm", "rmdir", "unlink", "shred", "del", "erase", "rd", "remove-item":
		return true
	}
	return false
}

// loopWord says whether this word opens a loop. A part's first word is what
// is asked, because these are shell keywords and a keyword is where a
// command starts.
func loopWord(word string) bool {
	switch strings.ToLower(strings.Trim(word, "'\"")) {
	case "for", "while", "until", "foreach", "foreach-object", "%":
		return true
	}
	return false
}

// runner says whether this word leaves the program still to come, so the walk
// goes past it. It is how xargs rm, sudo rm and git rm are found without
// reading every word on the line as a program.
//
// git IS HERE FOR ITS SUBCOMMAND, not because it runs another program. The
// word after it decides what it is, and git rm deletes a file exactly the way
// the others do. git status and git commit walk to a word that is no remover
// and stop, which is the same answer they would get anywhere else.
//
// A SHELL IS HERE FOR ITS -c. sh -c "rm f" runs rm as surely as xargs does,
// and the program inside the quoted command is a word on this line once the
// quotes come off, so the same walk reads it.
func runner(word string) bool {
	switch strings.ToLower(strings.Trim(word, "'\"")) {
	case "sudo", "xargs", "env", "time", "nohup", "command", "exec", "do", "then", "else", "git",
		"sh", "bash", "zsh", "dash", "ksh", "powershell", "pwsh":
		return true
	}
	return false
}

// valueFlags names, per runner, the flags whose value is the next word, so the
// walk steps over the value rather than reading it as the program. A flag
// with its value attached, -n1 or -I{} or --chdir=x, is one word and needs no
// entry. A shell's -c is not here: its value is the command, which is what
// the walk is looking for.
var valueFlags = map[string][]string{
	"sudo":  {"-u", "-g", "-C", "-D", "-h", "-p", "-r", "-t", "-T", "-U", "-R"},
	"git":   {"-C", "-c", "--git-dir", "--work-tree", "--namespace"},
	"xargs": {"-I", "-L", "-n", "-P", "-s", "-E", "-d", "-a", "--replace", "--max-lines", "--max-args", "--max-procs", "--max-chars", "--eof", "--delimiter", "--arg-file"},
	"env":   {"-u", "-C", "-S", "--unset", "--chdir", "--split-string"},
	"time":  {"-f", "-o", "--format", "--output"},
}

// takesAValue says whether this flag, on this runner, has its value in the
// next word.
func takesAValue(runner, flag string) bool {
	for _, f := range valueFlags[runner] {
		if f == flag {
			return true
		}
	}
	return false
}

// removerAt answers where in these words a remover is RUN, or -1.
//
// IT IS A POSITION AND NOT A WORD ANYWHERE ON THE LINE.
//
// MEASURED, ON THIS GUARD'S OWN FIRST USE. It read every word, so the first
// command that carried the word rm inside an argument was refused over the
// word after it: minting a token whose detail said "rm would have been
// refused" was answered with "this command deletes would". Prose goes through
// this door constantly, in a --detail, a commit message, an echo.
//
// SO A PROGRAM IS WHERE A COMMAND STARTS, which is what the search guard
// already assumes when it reads words[0]. The walk goes past only the words
// that run another program, so xargs rm and do rm $f are still found and a
// sentence containing rm is not a deletion.
//
// AND A RUNNER'S FLAGS ARE WALKED PAST TOO. The walk stopped at the first
// word that was neither a runner nor a remover, and every flag is such a
// word, so xargs -n1 rm ran where xargs rm was refused: the guard's own named
// door was one flag from open. A flag after a runner is stepped over, and a
// flag whose value is the next word takes its value with it. A flag before
// any runner still stops the walk, because nothing has said a program is
// coming.
func removerAt(words []string) int {
	past := ""     // the runner most recently walked past
	value := false // the next word is the value of the flag before it
	for i, w := range words {
		if value {
			value = false
			continue
		}
		if remover(w) {
			return i
		}
		if runner(w) {
			past = strings.ToLower(strings.Trim(w, "'\""))
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

// filesAmong answers the words a removal names as files: everything that is
// not a flag and not a redirection.
//
// EVERY BARE WORD IS A PATH HERE, unlike a search, where the first one is the
// pattern. rm takes no pattern.
func filesAmong(args []string) []string {
	var out []string
	for i := 0; i < len(args); i++ {
		a := strings.Trim(args[i], "'\"")
		if a == "" {
			continue
		}
		if a == "--" {
			for _, rest := range args[i+1:] {
				if rest = strings.Trim(rest, "'\""); rest != "" {
					out = append(out, rest)
				}
			}
			break
		}
		if strings.HasPrefix(a, "-") {
			continue
		}
		// A REDIRECTION IS NOT A FILE THIS COMMAND DELETES. It is where the
		// output goes, and refusing over it would name a file nothing was
		// about to lose.
		if strings.ContainsAny(a, "<>") {
			continue
		}
		out = append(out, a)
	}
	return out
}

// underWork answers this path as the engine keys a read by it. A relative
// path is relative to the tree being worked on, never to wherever the engine
// happens to stand.
func underWork(work, p string) string {
	if filepath.IsAbs(p) {
		return filepath.Clean(p)
	}
	return filepath.Clean(filepath.Join(work, p))
}

// readBy answers a question about this actor's read set: has it read this path
// this turn. Both halves of the rule ask it, so it is made once here.
func readBy(r Roots, actor, work string) func(string) bool {
	reads := LoadEvidence(r).Reads
	return func(p string) bool {
		// THE KEY IS WHATEVER THE HARNESS GAVE, so both spellings are asked:
		// the path resolved against the tree, and the path as it stands.
		for _, key := range []string{underWork(work, p), clean(p)} {
			if rec, ok := reads[key]; ok && rec.Actor == actor {
				return true
			}
		}
		return false
	}
}

// ARemovalWithoutARead answers whether this command deletes something inside
// the tree that this actor has not read, and names the file it is about.
func ARemovalWithoutARead(r Roots, actor, command, work string) (string, bool) {
	read := readBy(r, actor, work)
	for _, part := range pipeline(command) {
		words := strings.Fields(part)
		at := removerAt(words)
		if at < 0 {
			continue
		}
		for _, p := range filesAmong(words[at+1:]) {
			if !anyInside([]string{p}, work) {
				continue
			}
			if insideTheScratchpad(r, underWork(work, p)) {
				continue
			}
			if read(p) {
				continue
			}
			return aRemovalNeedsARead(p), true
		}
	}
	return "", false
}

// ALoopThatRemoves answers whether this command runs a remover inside a loop,
// which is refused whatever it names.
//
// OUTSIDE THE TREE THE DISK IS THE AGENT'S OWN, the same line ARemovalWithoutARead
// draws through anyInside. A remover whose files are all outside the work tree is
// not this rule's business, so it does not arm the loop. A remover naming no files
// at all still does, because that is the shape this rule was written for: the files
// come out of the loop's own output, a round at a time.
func ALoopThatRemoves(command, work string) (string, bool) {
	loop, deletes := false, ""
	for _, part := range pipeline(command) {
		words := strings.Fields(part)
		if len(words) == 0 {
			continue
		}
		if loopWord(words[0]) {
			loop = true
		}
		if deletes == "" {
			if at := removerAt(words); at >= 0 {
				files := filesAmong(words[at+1:])
				if len(files) == 0 || anyInside(files, work) {
					deletes = strings.Trim(words[at], "'\"")
				}
			}
		}
	}
	if loop && deletes != "" {
		return aLoopThatDeletes(deletes), true
	}
	return "", false
}

// gitCleanAt answers where in these words git clean is RUN, or -1. It walks
// the way removerAt walks, past the words that run another program and past a
// runner's flags, and asks whether the word after git is clean.
//
// git clean IS NOT IN THE REMOVER LIST, because that list is programs, and the
// word that deletes here is a subcommand. git status walks to a word that is
// no clean and stops, which is the answer it would get anywhere else.
func gitCleanAt(words []string) int {
	past := ""     // the runner most recently walked past
	value := false // the next word is the value of the flag before it
	for i, w := range words {
		if value {
			value = false
			continue
		}
		bare := strings.ToLower(strings.Trim(w, "'\""))
		if past == "git" && bare == "clean" {
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

// cleanPathspec answers the paths a git clean names, which is filesAmong once
// the exclude has been taken out.
//
// AN EXCLUDE IS NOT A PATHSPEC. -e names what the clean will not take, so
// reading its pattern as a path answers the question backwards: git clean -f
// -e keep.go names no pathspec and takes everything else, and counting keep.go
// as one would send it to the read rule and let it through.
func cleanPathspec(args []string) []string {
	var kept []string
	for i := 0; i < len(args); i++ {
		switch strings.Trim(args[i], "'\"") {
		case "-e", "--exclude":
			i++ // the pattern is the flag's value
			continue
		case "--":
			kept = append(kept, args[i:]...)
			return filesAmong(kept)
		}
		kept = append(kept, args[i])
	}
	return filesAmong(kept)
}

// cleansFolders says whether this clean was given -d, which takes whole
// untracked folders. The letter rides in a cluster as often as alone, -fdx, so
// the cluster is read letter by letter. A long flag is never it: git clean
// spells this one -d and nothing else.
func cleansFolders(args []string) bool {
	for _, a := range args {
		a = strings.Trim(a, "'\"")
		if a == "--" {
			return false
		}
		if !strings.HasPrefix(a, "-") || strings.HasPrefix(a, "--") {
			continue
		}
		if strings.ContainsRune(a[1:], 'd') {
			return true
		}
	}
	return false
}

// AGitCleanIsARemoval answers whether this command's git clean is refused, and
// says which of the two questions it failed.
//
// IT IS THE LARGER DELETION, NOT THE SMALLER ONE. git clean -fdx with no
// pathspec removes every untracked and ignored file under the tree, and none of
// them is in the command. That is the loop's question. A clean naming a
// pathspec can be judged path by path, which is the read set's question, so
// both halves are asked here in that order.
func AGitCleanIsARemoval(r Roots, actor, command, work string) (string, bool) {
	read := readBy(r, actor, work)
	for _, part := range pipeline(command) {
		words := strings.Fields(part)
		at := gitCleanAt(words)
		if at < 0 {
			continue
		}
		args := words[at+1:]
		paths := cleanPathspec(args)
		if len(paths) == 0 {
			return aCleanTakesWhatIsNotThere("names no pathspec, so it takes every " +
				"untracked file under the tree"), true
		}
		if cleansFolders(args) {
			return aCleanTakesWhatIsNotThere("was given -d, so it takes whole " +
				"untracked folders, and what is inside them is named nowhere"), true
		}
		for _, p := range paths {
			if !anyInside([]string{p}, work) {
				continue
			}
			if insideTheScratchpad(r, underWork(work, p)) {
				continue
			}
			if read(p) {
				continue
			}
			return aRemovalNeedsARead(p), true
		}
	}
	return "", false
}

// aCleanTakesWhatIsNotThere is the refusal for a clean whose files are not in
// the command, and it says which of the two shapes it is.
func aCleanTakesWhatIsNotThere(why string) string {
	return "A CLEAN IS REFUSED WHERE WHAT IT TAKES IS NOT IN THE COMMAND.\n\n" +
		"git clean deletes files, and this one " + why + ". Nothing here and nobody " +
		"reading it can say what it will take.\n\n" +
		"MEASURED: git clean -fx took a 13MB binary out of the source folder with nothing " +
		"said, through the one door the removal guard did not watch. rm of that same file " +
		"was refused, correctly, because nothing had read it.\n\n" +
		"List the files you mean and read them, then delete those by name."
}

// aRemovalNeedsARead is the refusal, and it names the file it is about.
func aRemovalNeedsARead(path string) string {
	return "NOTHING IS DELETED THAT NOBODY LOOKED AT.\n\n" +
		"This command deletes " + path + ", which is inside the tree and which nothing " +
		"has read this turn. What is in it is unknown, and a delete is the one change " +
		"the tree does not carry back.\n\n" +
		"Read it, and delete it if it should go. If it should go unread, say so to the " +
		"person rather than around them.\n\n" +
		"OUTSIDE THIS TREE THE DISK IS YOURS: a removal naming a path outside it is not " +
		"refused, and neither is one under .se/scratchpad."
}

// aLoopThatDeletes is the refusal for the shape, and it says what to do
// instead rather than only what is wrong.
func aLoopThatDeletes(word string) string {
	return "A LOOP THAT DELETES IS REFUSED.\n\n" +
		"This command runs " + word + " inside a loop, so the files it deletes are the ones " +
		"its own output names, a round at a time. None of them is in the command, so " +
		"nothing here and nobody reading it can say what it will take.\n\n" +
		"MEASURED: a loop of this shape ran go vet sixty times, took the filename out of " +
		"the first error and deleted it, and ate live code four times.\n\n" +
		"List what you mean first and read it, then delete those files by name."
}
