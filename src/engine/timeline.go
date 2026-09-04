package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"quackitect/engine/internal/voice"
)

// One order over the retro folder, woven from the sources it already holds.
//
// The collect leaves the log and the transcripts side by side, each on its own
// clock. Reading what happened then means reading two files and holding the
// order in your head, which is where the reading goes wrong. This writes the
// one file where they are interleaved.
//
// It reads the copies in the folder and writes a third file. The sources are
// evidence and are left exactly as they were, so anything the weave gets wrong
// can be checked against what it read.

// TimelineEntry is one moment, from whichever source recorded it.
type TimelineEntry struct {
	T      string `json:"t"`
	Source string `json:"source"` // log or transcript
	Who    string `json:"who"`
	What   string `json:"what,omitempty"`
	From   string `json:"from"` // the file in the folder it was read from
	// A stamp the source did not carry, placed between its neighbours. It is
	// marked because a guess a reader cannot tell from a reading is worse than
	// no guess at all.
	Interpolated bool `json:"interpolated,omitempty"`
}

// at is the parsed time, and whether the source carried one.
type timed struct {
	entry TimelineEntry
	at    time.Time
	has   bool
}

// TimelineName is the woven file, beside the sources it was woven from.
const TimelineName = "timeline.jsonl"

// weaveTimeline writes the merged timeline into the retro folder and answers
// where it put it, with the number of entries it could not place.
//
// It never fails the retro. A retro is a cycle boundary, and a reading that
// cannot be taken must not take one down.
func weaveTimeline(folder string, transcripts []Transcript) (string, int) {
	var all []timed
	unplaced := 0

	logDir := filepath.Join(folder, "log")
	if entries, err := os.ReadDir(logDir); err == nil {
		names := make([]string, 0, len(entries))
		for _, e := range entries {
			if !e.IsDir() && strings.HasSuffix(e.Name(), ".jsonl") {
				names = append(names, e.Name())
			}
		}
		sort.Strings(names)
		for _, name := range names {
			read, missed := placeInFile(logEntries(filepath.Join(logDir, name), name))
			all = append(all, read...)
			unplaced += missed
		}
	}

	// The transcripts are read from the copies in the folder, under the names
	// the collect gave them, so who they belong to travels with them.
	who := map[string]string{}
	for _, t := range transcripts {
		who[t.Name] = orElse(t.Who, t.Name)
	}
	transcriptDir := filepath.Join(folder, "transcript")
	if entries, err := os.ReadDir(transcriptDir); err == nil {
		names := make([]string, 0, len(entries))
		for _, e := range entries {
			if !e.IsDir() {
				names = append(names, e.Name())
			}
		}
		sort.Strings(names)
		for _, name := range names {
			stem := strings.TrimSuffix(name, filepath.Ext(name))
			read, missed := placeInFile(turnEntries(
				filepath.Join(transcriptDir, name), name, orElse(who[stem], stem)))
			all = append(all, read...)
			unplaced += missed
		}
	}

	// THE ORDER IS THE WHOLE POINT, and a stable sort keeps two things recorded
	// in the same instant in the order their own files had them.
	sort.SliceStable(all, func(i, j int) bool { return all[i].at.Before(all[j].at) })

	var b strings.Builder
	for _, one := range all {
		one.entry.T = one.at.UTC().Format(time.RFC3339Nano)
		line, err := json.Marshal(one.entry)
		if err != nil {
			continue
		}
		b.Write(line)
		b.WriteString(nl)
	}
	path := filepath.Join(folder, TimelineName)
	if err := writeAtomic(path, []byte(b.String()), 0o644); err != nil {
		return "", unplaced
	}
	return path, unplaced
}

// placeInFile fills in the stamps a file did not carry, and answers how many it
// could not place.
//
// A run of unstamped entries is spread evenly between the stamped ones on
// either side, so several in a row do not all land on one instant. With only
// one side, they take that side's time: the order is still right, which is what
// the timeline is read for. A file carrying no stamp at all places none of its
// entries, because there is nothing to place them against, and they are counted
// rather than dropped in silence.
func placeInFile(read []timed) ([]timed, int) {
	var out []timed
	unplaced := 0
	for i := range read {
		if read[i].has {
			out = append(out, read[i])
			continue
		}
		before, okBefore := lastStamped(read[:i])
		after, okAfter := firstStamped(read[i+1:])
		switch {
		case okBefore && okAfter:
			// Where the gap holds several, each takes its own share of it.
			gap := after.Sub(before)
			n := runLength(read, i)
			step := gap / time.Duration(n+1)
			read[i].at = before.Add(step * time.Duration(placeInRun(read, i)))
		case okBefore:
			read[i].at = before
		case okAfter:
			read[i].at = after
		default:
			unplaced++
			continue
		}
		read[i].entry.Interpolated = true
		out = append(out, read[i])
	}
	return out, unplaced
}

// runLength is how many unstamped entries sit together around index i.
func runLength(read []timed, i int) int {
	start := i
	for start > 0 && !read[start-1].has {
		start--
	}
	n := 0
	for j := start; j < len(read) && !read[j].has; j++ {
		n++
	}
	return n
}

// placeInRun is which of that run this entry is, counting from one.
func placeInRun(read []timed, i int) int {
	start := i
	for start > 0 && !read[start-1].has {
		start--
	}
	return i - start + 1
}

func lastStamped(read []timed) (time.Time, bool) {
	for i := len(read) - 1; i >= 0; i-- {
		if read[i].has {
			return read[i].at, true
		}
	}
	return time.Time{}, false
}

func firstStamped(read []timed) (time.Time, bool) {
	for _, one := range read {
		if one.has {
			return one.at, true
		}
	}
	return time.Time{}, false
}

// logEntries reads the engine's own record, the shape Log.Write writes.
func logEntries(path, name string) []timed {
	var out []timed
	for _, line := range jsonRecordLines(path) {
		var rec Record
		if err := json.Unmarshal([]byte(line), &rec); err != nil {
			continue
		}
		at, has := readTime(rec.T)
		what := rec.Kind
		if rec.Msg != "" {
			what = strings.TrimSpace(rec.Kind + " " + rec.Msg)
		}
		out = append(out, timed{at: at, has: has, entry: TimelineEntry{
			Source: "log", Who: rec.Actor, What: voice.Short60(what), From: name}})
	}
	return out
}

// turnEntries reads a harness transcript, which is one JSON object per turn.
//
// Only the two fields every harness carries are read, the stamp and what kind
// of turn it was. Reaching further into another program's format would make
// this break whenever that program changed.
func turnEntries(path, name, who string) []timed {
	var out []timed
	for _, line := range jsonRecordLines(path) {
		var turn struct {
			Timestamp string `json:"timestamp"`
			Type      string `json:"type"`
		}
		if err := json.Unmarshal([]byte(line), &turn); err != nil {
			continue
		}
		at, has := readTime(turn.Timestamp)
		out = append(out, timed{at: at, has: has, entry: TimelineEntry{
			Source: "transcript", Who: who, What: turn.Type, From: name}})
	}
	return out
}

// jsonRecordLines answers the non-empty lines of a file, or nothing when it
// cannot be read.
func jsonRecordLines(path string) []string {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	var out []string
	for _, line := range strings.Split(string(b), "\n") {
		if strings.TrimSpace(line) != "" {
			out = append(out, line)
		}
	}
	return out
}

// readTime takes the one format both sources write, and says when it could not.
func readTime(s string) (time.Time, bool) {
	if s == "" {
		return time.Time{}, false
	}
	at, err := time.Parse(time.RFC3339Nano, s)
	if err != nil {
		return time.Time{}, false
	}
	return at, true
}
