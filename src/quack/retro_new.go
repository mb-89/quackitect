// The retro's mint: one command writes the ticket off the retro route, opens it
// at that route's first leaf, and hands the leaf out, each through the verb
// that owns it.
// [[spec/design_input/the-agent-pulls-tickets]]
package main

import (
	"fmt"
	"io"
	"path/filepath"
	"slices"
	"strings"
)

// The process a retro runs, the length of the commit a name reads off, the reason standing where a hand gives none, and the variable naming the ticket a verb mints for its pull. [[spec/design_input/the-agent-pulls-tickets]]
const (
	retroNewProcess  = "retro"
	retroNewShort    = 7
	retroNewStanding = "the owner asks for it"
	retroNewMinted   = "SE_MINTED"
)

func init() {
	register("retro new", retroNewVerb(quietBox, retroMintRunme))
}

// The verb: mints the retro off its route, writes the reason into its ask, opens it and pulls it. [[spec/design_input/the-agent-pulls-tickets]]
func retroNewVerb(box func() boxDoors, run retroMintRun) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		d := box()
		disk := d.disk
		home := retroRootOf(d)
		rest := argv[min(len(argv), 2):]
		name := retroNewFlag(rest, "--name")
		if name == "" {
			tip := strings.TrimSpace(run(home, []string{"git", "rev-parse", "HEAD"}, nil).out)
			name = retroNewProcess + "-" + tip[:min(len(tip), retroNewShort)]
		}
		why := retroNewFlag(rest, "--why")
		if why == "" {
			why = retroNewStanding
		}
		path := retroMintTickets + "/" + name + ".md"
		at := filepath.Join(home, filepath.FromSlash(path))
		if disk.stands(at) {
			fmt.Fprintf(errs, "%s stands already. Name a retro nothing holds yet.\n", path)
			return exitFailed
		}
		env := map[string]string{workRoot: home}
		if ran := run(home, []string{retroMintRunmeAt, "mint", "ticket", path, "--process=" + retroNewProcess}, env); ran.code != 0 {
			retroNewSays(errs, ran.errs)
			return exitFailed
		}
		text, err := disk.read(at)
		if err == nil {
			err = disk.write(at, []byte(retroNewWithWhy(string(text), why)), 0o644)
		}
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		opened := run(home, []string{retroMintRunmeAt, "ticket", "open", name}, env)
		retroNewSays(errs, opened.errs)
		if opened.code != 0 {
			_ = disk.remove(at)
			return exitFailed
		}
		pulled := run(home, []string{retroMintRunmeAt, "ticket", "pull", name}, map[string]string{workRoot: home, retroNewMinted: name})
		_, _ = io.WriteString(out, pulled.out)
		_, _ = io.WriteString(errs, pulled.errs)
		return pulled.code
	}
}

// The word after a flag, trimmed, or nothing where the flag stands nowhere. [[spec/design_input/the-agent-pulls-tickets]]
func retroNewFlag(rest []string, flag string) string {
	at := slices.Index(rest, flag)
	if at < 0 || at+1 >= len(rest) {
		return ""
	}
	return strings.TrimSpace(rest[at+1])
}

// The ticket with the reason closing its Ask, after the rows the route's ask writes. [[spec/design_output/pull#a-draft-opens]]
func retroNewWithWhy(text, why string) string {
	rows := strings.Split(text, "\n")
	head := slices.IndexFunc(rows, func(one string) bool { return strings.TrimSpace(one) == "# Ask" })
	if head < 0 {
		return strings.TrimRight(text, "\n") + "\n\n# Ask\n\n" + why + "\n"
	}
	end := head + 1
	for end < len(rows) && !strings.HasPrefix(rows[end], "# ") {
		end++
	}
	ask := strings.TrimSpace(strings.Join([]string{strings.Join(rows[head+1:end], "\n"), "", why}, "\n"))
	out := append(slices.Clone(rows[:head+1]), "", ask, "")
	return strings.Join(append(out, rows[end:]...), "\n")
}

// Writes a child's words as a line of their own, or nothing where it says none. [[spec/design_input/the-agent-pulls-tickets]]
func retroNewSays(w io.Writer, said string) {
	if said == "" {
		return
	}
	_, _ = io.WriteString(w, said)
	if !strings.HasSuffix(said, "\n") {
		_, _ = io.WriteString(w, "\n")
	}
}
