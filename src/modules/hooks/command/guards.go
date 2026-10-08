// The bless guard and the version guard: a command reaches neither the bless file nor a variable naming
// the hand, and rewrites or deletes no version branch.
// [[spec/tickets/cage-command-rules-port]]
package command

import (
	"regexp"
	"strings"
)

// The bless file, off src/scripts/pull-bless.js, under the folder src/modules/check/folders.go owns, and the variables naming the hand and the box, off harness and cloudVars in src/pull/pull_holds.go. [[spec/design_output/pull#the-bless]]
const blessFile = ".se/.runtime/bless.json"

// [[spec/design_output/pull#the-bless]]
var (
	handNames  = []string{"CLAUDE_CODE_REMOTE", "SE_CLOUD", "CLAUDECODE"}
	guardNames = append(handNames[:len(handNames):len(handNames)], "SE_MINTED")
	blessName  = regexp.MustCompile(`bless\.json`)
	clearsAll  = regexp.MustCompile(`\benv\s+(?:-\S+\s+)*(?:-i|--ignore-environment)\b|\bdelete\s+process\.env\s*;|os\.environ\.clear\(`)
)

// The refusal a command reaching the bless or the hand's variables meets, or nothing; read hands the text of each script it runs. [[spec/design_output/pull#the-bless]]
func BlessGuard(command string, read func(path string) string) string {
	texts := []string{command}
	for _, path := range ScriptsIn(command) {
		if read != nil {
			texts = append(texts, read(path))
		}
	}
	for _, text := range texts {
		if blessName.MatchString(text) {
			return blessFile + " is the owner's word on who blesses, and the sidebar button alone writes it. An agent reads and writes it nowhere."
		}
	}
	var hit []string
	for _, name := range guardNames {
		for _, text := range texts {
			if movesVariable(text, name) {
				hit = append(hit, name)
				break
			}
		}
	}
	cleared := false
	for _, text := range texts {
		cleared = cleared || clearsAll.MatchString(text)
	}
	if len(hit) == 0 && !cleared {
		return ""
	}
	if len(hit) == 0 {
		hit = handNames
	}
	return strings.Join(hit, ", ") + " name the hand and the box, so a command sets, exports, unsets or clears none of them. The environment decides who blesses."
}

// Whether a text sets, exports, unsets or deletes the variable. [[spec/design_output/pull#the-bless]]
func movesVariable(text, name string) bool {
	bare := regexp.QuoteMeta(name)
	quoted := "[\"'`]" + bare + "[\"'`]"
	for _, form := range []string{
		`(?m)(?:^|[\s;&|("'])(?:export\s+|declare\s+-x\s+)?` + bare + `=`,
		`\bunset\b[^\n;&|]*\b` + bare + `\b`,
		`(?:-u|--unset)[=\s]+` + bare + `\b`,
		`process\.env(?:\.` + bare + `\b|\[\s*` + quoted + `\s*\])\s*=(?:[^=]|$)`,
		`delete\s+process\.env(?:\.` + bare + `\b|\[\s*` + quoted + `\s*\])`,
		`os\.(?:environ|putenv|unsetenv)\W*` + quoted,
	} {
		if regexp.MustCompile(form).MatchString(text) {
			return true
		}
	}
	return false
}

// A version branch, the parts of a command, and its words. [[spec/design_output/work#a-version-branch-stands]]
var (
	version   = regexp.MustCompile(`^v\d+$`)
	commandOf = regexp.MustCompile(`&&|\|\||;`)
)

// One version branch a command rewrites or deletes. [[spec/design_output/work#a-version-branch-stands]]
type versionRef struct {
	name string
	drop bool
}

// The refusal a push or a branch over a version branch meets, or nothing. [[spec/design_output/work#a-version-branch-stands]]
func VersionGuard(command string) string {
	var found []versionRef
	for _, part := range commandOf.Split(command, -1) {
		words := strings.Fields(part)
		for at, one := range words {
			if one == "git" {
				found = append(found, versionsIn(words[at+1:])...)
				break
			}
		}
	}
	if len(found) == 0 {
		return ""
	}
	var names []string
	seen := map[string]bool{}
	drops := false
	for _, one := range found {
		if !seen[one.name] {
			seen[one.name] = true
			names = append(names, one.name)
		}
		drops = drops || one.drop
	}
	return VersionRefusal(names, drops)
}

// The refusal naming each version branch a command or a pushed ref rewrites, or deletes where drops holds. [[spec/tickets/git-hooks-run-in-go]]
func VersionRefusal(names []string, drops bool) string {
	how := "rewrite"
	if drops {
		how = "delete"
	}
	return strings.Join([]string{
		strings.Join(names, ", ") + " is a version branch, and this command would " + how + " it.",
		"",
		"A version branch holds a whole earlier tree. Nothing else carries it, and a",
		"delete has already cost this tree one. So both push doors refuse the command.",
		"",
		"The owner takes it off, in the repository's own branch rules.",
	}, "\n")
}

// Whether a branch name is a version branch. [[spec/tickets/git-hooks-run-in-go]]
func IsVersion(name string) bool { return version.MatchString(name) }

// [[spec/design_output/work#a-version-branch-stands]]
func versionsIn(rest []string) []versionRef {
	verb := ""
	drops, forces := false, false
	for _, one := range rest {
		if verb == "" && !strings.HasPrefix(one, "-") {
			verb = one
		}
		drops = drops || one == "--delete" || one == "-d" || one == "-D"
		forces = forces || one == "--force" || one == "-f" || strings.HasPrefix(one, "--force-with-lease")
	}
	if verb != "push" && verb != "branch" {
		return nil
	}
	var out []versionRef
	for _, word := range rest {
		if strings.HasPrefix(word, "-") {
			continue
		}
		name, empty, plus := refIn(word)
		if name == "" {
			continue
		}
		if drops || empty {
			out = append(out, versionRef{name, true})
		} else if forces || plus {
			out = append(out, versionRef{name, false})
		}
	}
	return out
}

// The version branch a refspec names, whether it pushes an empty source, and whether it forces. [[spec/design_output/work#a-version-branch-stands]]
func refIn(word string) (string, bool, bool) {
	plus := strings.HasPrefix(word, "+")
	rest := strings.TrimPrefix(word, "+")
	from, to := rest, rest
	at := strings.Index(rest, ":")
	if at >= 0 {
		from, to = rest[:at], rest[at+1:]
	}
	name := strings.TrimPrefix(to, "refs/heads/")
	if !version.MatchString(name) {
		name = ""
	}
	return name, at >= 0 && from == "", plus
}
