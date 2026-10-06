// The update verb: a changed process copies onto a ticket, every leaf the
// ticket reached keeps what it holds, and a person's edit past them stops the
// copy unless --over says to write over it, off update in src/scripts/ticket.js
// and baseOf and driftOf in ticket-drift.js.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
package main

import (
	"fmt"
	"io"
	"regexp"
	"slices"
	"strings"

	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/modules/git"
	"quackitect/src/note"
	"quackitect/src/pull"
	"quackitect/src/yaml"
)

func init() { register("ticket update", ticketUpdate(index.Root, registeredRepo)) }

// The flag that copies a new route over a person's edit. [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]
const overFlag = "--over"

// The flag naming a process other than the one the ticket carries. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
var processFlag = regexp.MustCompile(`^--process=(.+)$`)

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func ticketUpdate(rootOf func() (string, error), repoAt func(root string) git.Repo) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		words := argv[min(1, len(argv)):]
		said := argv[min(2, len(argv)):]
		disk, err := workDisk(rootOf)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		if wordAt(said, 0) == "" {
			fmt.Fprintln(errs, "ticket update needs a ticket: ./RUNME.sh ticket update slow-lint")
			return exitUsage
		}
		at, found := ticketNamed(disk, said)
		if !found {
			fmt.Fprintf(errs, "%s names no ticket under %s or %s.\n", said[0], pull.Notes, pull.Tickets)
			return exitUsage
		}
		text, _ := disk.Read(at)
		held := note.Read(text).Front.Said
		carried, asked := yaml.AsString(held.Get("process")), false
		for _, one := range words {
			if named := processFlag.FindStringSubmatch(one); named != nil {
				carried, asked = named[1], true
				break
			}
		}
		process, why := pull.ProcessAt(disk, carried)
		if why != "" {
			fmt.Fprintln(errs, why)
			return exitUsage
		}
		hash := yaml.AsString(held.Get("process_hash"))
		if hash == process.Hash && !asked {
			fmt.Fprintf(out, "%s already carries %s as it stands.\n", at, process.Name)
			return 0
		}
		// A person's edit past the reached leaves stops the copy, unless --over says to write over it. [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]
		if !slices.Contains(words, overFlag) {
			base, found := copiedBase(repoAt(disk.Root), yaml.AsString(held.Get("process")), hash, disk)
			if !found {
				fmt.Fprintf(errs, "The process version %s copied stands nowhere in the history, so any drift stays unread. Run it again with %s to copy the new route over the route as it stands.\n", at, overFlag)
				return 1
			}
			if drift := pull.RouteDrift(held, base); len(drift) > 0 {
				fmt.Fprintf(errs, "%s carries drift from the process it copied, at %s. Nothing changes. Run it again with %s to copy the new route over it.\n", at, strings.Join(drift, ", "), overFlag)
				return 1
			}
		}
		steps, kept, why := pull.UpdatedRouteKept(held, process.Route)
		if why != "" {
			fmt.Fprintln(errs, why)
			return 1
		}
		if err := disk.Write(at, check.ReRouted(text, ticketSchema(disk.Root), steps, process.Hash)); err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		fmt.Fprintf(out, "%s carries %s again, and %d leaf/leaves keep what they hold.\n", at, process.Name, kept)
		return 0
	}
}

// The route the version of its process a ticket copied held, off the repository's history of the process file. [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]
func copiedBase(repo git.Repo, carried, hash string, disk pull.Disk) ([]any, bool) {
	own, why := pull.ProcessAt(disk, carried)
	if why != "" {
		return nil, false
	}
	log := func() (string, bool) {
		commits, err := repo.History(own.Path)
		if err != nil {
			return "", false
		}
		var hashes []string
		for _, one := range commits {
			hashes = append(hashes, one.Hash)
		}
		return strings.Join(hashes, "\n"), true
	}
	show := func(sha string) string {
		said, _ := repo.Show(sha, own.Path)
		return said
	}
	return pull.DriftBase(log, show, hash)
}
