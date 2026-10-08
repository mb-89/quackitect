// The script file a command runs. A write inside it
// reaches the tree the same way a redirection does, so the door reads the
// file the line names.
// [[spec/tickets/cage-command-rules-port]]
package command

import "strings"

// The runner a script falls to where no line names it. [[spec/design_output/bash#a-shell-writes-nothing]]
const defaultRunner = "node"

// Every script under a free path a shell or a reader runs, since a script where a rule reads it meets that rule already. [[spec/design_output/bash#a-shell-writes-nothing]]
func ScriptsIn(command string) []string {
	var out []string
	for _, words := range linesIn(command) {
		name := BaseName(words[0])
		if !shells[name] && !readers[name] {
			continue
		}
		for _, one := range words[1:] {
			if strings.HasPrefix(one, "-") {
				continue
			}
			if freeAt(Clean(one)) {
				out = append(out, Clean(one))
			}
			break
		}
	}
	return out
}

// Every path a script the command runs writes, read through read. [[spec/design_output/bash#a-shell-writes-nothing]]
func scriptWrites(command string, read func(path string) string) []written {
	if read == nil {
		return nil
	}
	var out []written
	for _, path := range ScriptsIn(command) {
		text := read(path)
		if text == "" {
			continue
		}
		for _, one := range insideOf(BaseName(runnerOf(command, path)), text) {
			out = append(out, written{one.path, "the script " + path})
		}
	}
	return out
}

// [[spec/design_output/bash#a-shell-writes-nothing]]
func runnerOf(command, path string) string {
	for _, words := range linesIn(command) {
		for _, one := range words {
			if Clean(one) == path {
				return words[0]
			}
		}
	}
	return defaultRunner
}

// The words of each run of the command, split at every break, heredocs kept. [[spec/design_output/bash#a-shell-writes-nothing]]
func linesIn(command string) [][]string {
	out := [][]string{nil}
	for _, one := range TokensOf(command) {
		if one.Op && breaks[one.Text] {
			out = append(out, nil)
			continue
		}
		if !one.Op {
			out[len(out)-1] = append(out[len(out)-1], one.Text)
		}
	}
	var kept [][]string
	for _, one := range out {
		if len(one) > 0 {
			kept = append(kept, one)
		}
	}
	return kept
}
