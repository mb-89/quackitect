// The retro's collect over the cloud: the retro chapter of every group trunk
// takes closed inside the window, read off the trunk's log, with the commit
// landing each.
// [[spec/tickets/the-retro-reads-cloud-retros]]
package main

import (
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"time"

	"quackitect/src/modules/hooks/command"
	"quackitect/src/note"
)

// A comment row, an answered row and a fence row, which carry no text of a chapter. [[spec/tickets/the-retro-reads-cloud-retros]]
var (
	retroCollectComment  = regexp.MustCompile(`^\s*<!--.*-->\s*$`)
	retroCollectAnswered = regexp.MustCompile(`^\s*answered:`)
	retroCollectFence    = regexp.MustCompile("^\\s*(```|~~~)")
)

// A ticket trunk closes, and the trunk commit landing it. [[spec/tickets/the-retro-reads-the-backlog]]
type retroLanding struct {
	name, sha, at string
}

// Every ticket trunk closes inside a window, newest first, or the error the log answers. [[spec/tickets/the-retro-reads-the-backlog]]
type retroClosed struct {
	ok       bool
	err      string
	landings []retroLanding
}

// Every group trunk takes closed since the window: its box's retro chapter, and the time of the trunk commit landing it. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroCollectCloudInto(it retroCollectDoors, into string, since time.Time, refused *[]retroCollectRow) ([]string, string, error) {
	disk := it.disk
	bare := []string{}
	closed := retroClosedIn(it.git, since)
	if !closed.ok {
		*refused = append(*refused, retroCollectRow{Path: retroCollectGroups, Refused: closed.err})
		return bare, "", nil
	}
	at := filepath.Join(into, retroCollectGroups)
	closesAt := filepath.Join(at, retroCollectCloses)
	parsed, _ := retroCollectParsed(disk.text(closesAt))
	closes, isObject := parsed.(*retroCollectObject)
	if !isObject {
		closes = retroCollectNewObject()
	}
	wrote := false
	for _, landing := range closed.landings {
		if disk.stands(filepath.Join(at, landing.name+retroCollectNoteEnd)) {
			continue
		}
		path := retroCollectTickets + "/" + landing.name + retroCollectNoteEnd
		shown := it.git("show", landing.sha+":"+path)
		if !shown.ok {
			*refused = append(*refused, retroCollectRow{Path: path, Refused: retroCollectFirst(shown.err, "git show")})
			continue
		}
		if !retroCollectIsGroup(shown.out) || retroCollectFieldOf(shown.out, "state") != retroCollectClosed {
			continue
		}
		chapter := retroCollectChapterOf(shown.out)
		if chapter == "" {
			bare = append(bare, landing.name)
			continue
		}
		if err := disk.makeAll(at, 0o777); err != nil {
			return bare, at, err
		}
		to := filepath.Join(at, landing.name+retroCollectNoteEnd)
		if err := disk.write(to, []byte(chapter), 0o666); err != nil {
			return bare, to, err
		}
		when, _ := retroCollectDate(landing.at)
		closes.set(landing.name, retroCollectISOOf(when))
		wrote = true
	}
	if wrote {
		if err := disk.write(closesAt, []byte(retroCollectPretty(closes)), 0o666); err != nil {
			return bare, closesAt, err
		}
	}
	return bare, "", nil
}

// Every ticket trunk takes closed since the window, and the trunk commit landing each. The first-parent line reads the merge, so a ticket a box closes before the window and trunk takes after it still counts. [[spec/tickets/the-retro-reads-the-backlog]]
func retroClosedIn(git func(args ...string) retroRan, since time.Time) retroClosed {
	args := []string{"log", command.Trunk, "--first-parent", "--diff-merges=first-parent", "-G", "^state: " + retroCollectClosed, "--format=" + retroCollectMark + "%H %cI", "--name-only"}
	if !since.IsZero() {
		args = append(args, "--since="+retroCollectISOOf(since))
	}
	log := git(append(args, "--", retroCollectTickets)...)
	if !log.ok {
		return retroClosed{err: retroCollectFirst(log.err, "git log")}
	}
	landings := []retroLanding{}
	for _, landing := range retroCollectLandingsOf(log.out) {
		when, ok := retroCollectDate(landing.at)
		if since.IsZero() || (ok && !when.Before(since)) {
			landings = append(landings, landing)
		}
	}
	return retroClosed{ok: true, landings: landings}
}

// The newest trunk commit naming each ticket, off a log of marked commit rows and the paths under each. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroCollectLandingsOf(said string) []retroLanding {
	out := []retroLanding{}
	seen := map[string]bool{}
	var sha, at string
	landed := false
	for _, row := range strings.Split(said, "\n") {
		one := strings.TrimSpace(row)
		if rest, found := strings.CutPrefix(one, retroCollectMark); found {
			parts := strings.Split(rest, " ")
			sha, at, landed = parts[0], "", true
			if len(parts) > 1 {
				at = parts[1]
			}
			continue
		}
		if !landed || !strings.HasPrefix(one, retroCollectTickets+"/") || !strings.HasSuffix(one, retroCollectNoteEnd) {
			continue
		}
		name := strings.TrimSuffix(one, retroCollectNoteEnd)
		name = name[strings.LastIndex(name, "/")+1:]
		if !seen[name] {
			seen[name] = true
			out = append(out, retroLanding{name: name, sha: sha, at: at})
		}
	}
	return out
}

// The ticket's retro chapter with its headings, past its comments, or nothing where it holds no text. [[spec/tickets/the-retro-reads-cloud-retros]]
func retroCollectChapterOf(text string) string {
	sections := note.Read(text).Sections
	found := slices.IndexFunc(sections, func(one note.Section) bool { return one.Level == 1 && one.Header == retroCollectChapter })
	if found < 0 {
		return ""
	}
	rows := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
	end, next := len(rows), len(sections)
	for at := found + 1; at < len(sections); at++ {
		if sections[at].Level <= 1 {
			end, next = sections[at].Line-1, at
			break
		}
	}
	if !slices.ContainsFunc(sections[found:next], func(one note.Section) bool { return retroCollectHoldsText(one.Own) }) {
		return ""
	}
	kept := []string{}
	for _, row := range rows[sections[found].Line-1 : end] {
		if !retroCollectComment.MatchString(row) {
			kept = append(kept, row)
		}
	}
	return strings.TrimSpace(strings.Join(kept, "\n")) + "\n"
}

// Whether a section's own rows carry a line of text, past the comments, the answered rows and the fences, as chapterLines in src/pull/pull_chapter.go reads them. [[spec/design_output/pull#the-fields-hold-their-forms]]
func retroCollectHoldsText(own []string) bool {
	return slices.ContainsFunc(own, func(row string) bool {
		return strings.TrimSpace(row) != "" && !retroCollectComment.MatchString(row) && !retroCollectAnswered.MatchString(row) && !retroCollectFence.MatchString(row)
	})
}

// A field of a note's front, bare of its link marks, as fieldOf in src/branches/group.go reads it. [[spec/design_output/work#a-group-is-a-ticket]]
func retroCollectFieldOf(text, key string) string {
	said := note.Read(text).Front.Said.Get(key)
	if said == nil {
		return ""
	}
	bare := strings.TrimSpace(retroCollectText(said))
	bare = strings.TrimSuffix(strings.TrimPrefix(bare, "[["), "]]")
	return strings.TrimSpace(bare)
}

// A group ticket links the group process. [[spec/design_output/work#a-group-is-a-ticket]]
func retroCollectIsGroup(text string) bool {
	process := retroCollectFieldOf(text, "process")
	return text != "" && process[strings.LastIndex(process, "/")+1:] == retroCollectGroup
}
