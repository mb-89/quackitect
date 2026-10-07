// The retro's backlog read: every prose criterion a ticket the window closes
// carries, printed beside the verdict the retro's folder holds for it.
// [[spec/tickets/the-retro-reads-the-backlog]]
package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"strings"

	"quackitect/src/note"
)

// The verdicts a retro's folder holds. [[spec/tickets/the-retro-reads-the-backlog]]
const retroBacklogVerdicts = "backlog.json"

// The words a verdict opens on, a bullet, and a command in backticks. [[spec/tickets/the-retro-reads-the-backlog]]
var (
	retroBacklogWords  = []string{"holds:", "falls short:"}
	retroBacklogBullet = regexp.MustCompile(`^\s*[-*]\s+`)
	retroBacklogTicked = regexp.MustCompile("`[^`]+`")
)

// What backlog reaches: the root and git. [[spec/tickets/the-retro-reads-the-backlog]]
type retroBacklogDoors struct {
	root string
	git  func(args ...string) retroRan
}

func init() { register("retro backlog", retroBacklogVerb(retroBacklogLive)) }

// The doors backlog runs on outside a test. [[spec/tickets/the-retro-reads-the-backlog]]
func retroBacklogLive() retroBacklogDoors {
	root := retroRoot()
	return retroBacklogDoors{root: root, git: retroCollectGitIn(root)}
}

// retro backlog <retro>: prints each prose criterion, and answers 0 once each holds a verdict with its reason. [[spec/tickets/the-retro-reads-the-backlog]]
func retroBacklogVerb(doors func() retroBacklogDoors) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		it := doors()
		home := ""
		if len(argv) > 2 && argv[2] != "" {
			home = retroHome(it.root, argv[2])
		}
		if home == "" || !retroCollectExists(home) {
			fmt.Fprintln(errs, "retro backlog reads the folder of a retro, and none stands.")
			return exitUsage
		}
		record, _ := retroCollectParsed(retroBacklogRead(filepath.Join(home, retroCollectCollected)))
		since, _ := retroCollectDate(retroCollectText(retroCollectGet(record, "since")))
		closed := retroClosedIn(it.git, since)
		if !closed.ok {
			fmt.Fprintf(errs, "retro backlog reads no trunk: %s\n", closed.err)
			return exitFailed
		}
		verdicts, _ := retroCollectParsed(retroBacklogRead(filepath.Join(home, retroBacklogVerdicts)))
		waiting := 0
		for _, landing := range closed.landings {
			shown := it.git("show", landing.sha+":"+retroCollectTickets+"/"+landing.name+retroCollectNoteEnd)
			if !shown.ok || !retroBacklogIsBacklog(shown.out) {
				continue
			}
			for _, criterion := range retroCriteriaOf(shown.out) {
				verdict := strings.TrimSpace(retroCollectText(retroCollectGet(retroCollectGet(verdicts, landing.name), criterion)))
				judged := slices.ContainsFunc(retroBacklogWords, func(word string) bool {
					rest, found := strings.CutPrefix(verdict, word)
					return found && strings.TrimSpace(rest) != ""
				})
				if judged {
					fmt.Fprintf(out, "%s  %s  %s\n", landing.name, criterion, verdict)
					continue
				}
				waiting++
				fmt.Fprintf(out, "%s  %s\n", landing.name, criterion)
			}
		}
		if waiting == 0 {
			return 0
		}
		fmt.Fprintf(errs, "%d criterion(s) wait on a verdict in %s: %s with its reason.\n", waiting, retroBacklogVerdicts, strings.Join(retroBacklogWords, " or "))
		return exitFailed
	}
}

// A file's text, or nothing. [[spec/tickets/the-retro-reads-the-backlog]]
func retroBacklogRead(at string) string {
	text, err := os.ReadFile(at)
	if err != nil {
		return ""
	}
	return string(text)
}

// A backlog ticket closes on trunk and stands in no group. [[spec/tickets/the-retro-reads-the-backlog]]
func retroBacklogIsBacklog(text string) bool {
	return retroCollectFieldOf(text, "state") == retroCollectClosed && !retroCollectIsGroup(text) && retroCollectFieldOf(text, retroCollectGroup) == ""
}

// A prose criterion is an Ask bullet naming no command in backticks. [[spec/tickets/the-retro-reads-the-backlog]]
func retroCriteriaOf(text string) []string {
	out := []string{}
	for _, row := range strings.Split(retroBacklogAskOf(text), "\n") {
		if !retroBacklogBullet.MatchString(row) {
			continue
		}
		if said := strings.TrimSpace(retroBacklogBullet.ReplaceAllString(row, "")); said != "" && !retroBacklogTicked.MatchString(said) {
			out = append(out, said)
		}
	}
	return out
}

// The rows of a note's Ask chapter, as askOf in src/branches/group.go reads them. [[spec/design_output/work#a-group-is-a-ticket]]
func retroBacklogAskOf(text string) string {
	for _, one := range note.Read(text).Sections {
		if strings.ToLower(one.Header) == "ask" {
			return strings.TrimSpace(strings.Join(one.Own, "\n"))
		}
	}
	return ""
}
