package main

import (
	"bufio"
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// GONE IS SILENCE, AND SILENCE IS THE ONE THING THE RECORD ALREADY SAYS.
//
// Two guards decided a holder was gone by counting pulls, and both got the same
// live worker wrong inside one minute. worker-dvorak took a token at 16:58:00
// and was still writing to it at 17:05:38. At 17:04:18 the start sweep put that
// token back as work held by an agent that is gone, and the pull notice named
// the same hold, because eleven pulls had gone past since dvorak last pulled.
//
// A PULL COUNT IS A PROXY FOR STOPPING BETWEEN TOKENS, not for working inside
// one. A worker on one long token pulls once and then says nothing to the queue
// for as long as the work takes, while the room goes on pulling around it. And
// a worker whose shell is broken makes no pulls at all: every se run dvorak made
// exited one, so all of its work went through se apply. A broken shell read as
// death.
//
// SO THE SIGNAL IS THE TIME SINCE THE HOLDER'S LAST CALL. Every call an agent
// makes goes in the record with its name and the moment it was made, whether it
// pulled, applied, ran or asked, and limits.heartbeat_seconds says what the
// engine's own pulse looks like. Nothing new has to be written down for this.
//
// AND ONE FUNCTION ANSWERS IT FOR BOTH GUARDS. The notice stops a worker and
// asks a person to look; the sweep releases the hold on its own, and a released
// hold is one another worker can take mid-change. Two guards answering one
// question apart is how they came to disagree with each other about dvorak
// while agreeing that it was dead.

// heartbeatsBeforeGone is how many of the engine's own beats a holder may say
// nothing for before it is judged gone.
//
// THE QUIETEST HONEST STRETCH IS ONE LONG CALL. A build, a battery or a model
// turn puts minutes between an agent's calls, and the record hears nothing in
// between, so the window is counted in minutes rather than beats: a hundred and
// twenty beats is ten minutes at the default pulse of five seconds.
const heartbeatsBeforeGone = 120

// SilenceBeforeGone answers how long a holder may be silent for. It is read
// from the pulse the engine already declares, so lowering the pulse spots a
// dead hand sooner, which is what that setting says it does.
func SilenceBeforeGone(r Roots) time.Duration {
	beat := LoadConfig(r).HeartbeatSeconds
	if beat <= 0 {
		beat = TheFloor().HeartbeatSeconds
	}
	return time.Duration(beat*heartbeatsBeforeGone) * time.Second
}

// HasGone is the one place a holder is judged gone. It answers how long it has
// been since anything of theirs reached the record, and whether that is past the
// window.
//
// A HOLDER NOTHING HAS EVER BEEN HEARD FROM IS SILENT FROM THE MOMENT THE RECORD
// BEGINS. A hold carried across a restart names somebody who has made no call
// under this record yet, and treating that as gone at once would release every
// such hold the instant the engine came up. So the silence is measured from
// where it could first have been heard, and a record younger than the window
// cannot show a silence longer than itself.
//
// WITH NO RECORD AT ALL, NOBODY IS GONE. A tree the engine has never run in
// cannot tell the living from the dead, and guessing there is the mistake this
// whole function exists to undo.
func HasGone(r Roots, actor string) (silent time.Duration, gone bool) {
	if actor == "" {
		return 0, false
	}
	heard, began := lastHeard(r)
	if began.IsZero() {
		return 0, false
	}
	since, ever := heard[actor]
	if !ever {
		since = began
	}
	silent = time.Since(since)
	if silent < 0 {
		silent = 0
	}
	return silent, silent > SilenceBeforeGone(r)
}

// lastHeard answers when each actor was last heard from, and when the record
// itself begins.
//
// THE FILE THE ENGINE RETIRED IS READ TOO, WHILE THE NEW ONE IS YOUNG. A start
// sets the current log aside and opens an empty one, and the sweep runs on that
// start: read alone, the new file says nothing has ever been heard from anybody,
// which is the same blindness in a new place. Once the running record is older
// than the window it answers on its own, so the second file is read only in the
// first minutes of a session.
func lastHeard(r Roots) (map[string]time.Time, time.Time) {
	dir := r.Private("log")
	heard := map[string]time.Time{}
	began := readHeard(filepath.Join(dir, Current), heard)
	if began.IsZero() || time.Since(began) >= SilenceBeforeGone(r) {
		return heard, began
	}
	if prev := theRetiredRecord(dir); prev != "" {
		if earlier := readHeard(prev, heard); !earlier.IsZero() && earlier.Before(began) {
			began = earlier
		}
	}
	return heard, began
}

// readHeard folds one record file into what has been heard, keeping the latest
// call by each actor, and answers the moment that file begins. A line that will
// not read is skipped: a half-written record is not a death.
func readHeard(path string, heard map[string]time.Time) time.Time {
	f, err := os.Open(path)
	if err != nil {
		return time.Time{}
	}
	defer f.Close()
	var began time.Time
	sc := bufio.NewScanner(f)
	sc.Buffer(make([]byte, 0, 64*1024), 4<<20)
	for sc.Scan() {
		var rec struct {
			T     string `json:"t"`
			Actor string `json:"actor"`
		}
		if json.Unmarshal(sc.Bytes(), &rec) != nil || rec.Actor == "" {
			continue
		}
		at, err := time.Parse(time.RFC3339Nano, rec.T)
		if err != nil {
			continue
		}
		if began.IsZero() || at.Before(began) {
			began = at
		}
		if was, seen := heard[rec.Actor]; !seen || at.After(was) {
			heard[rec.Actor] = at
		}
	}
	return began
}

// theRetiredRecord answers the file the last session was set aside under, which
// is the newest stamped name in the folder, or nothing where there is none.
func theRetiredRecord(dir string) string {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return ""
	}
	var stamped []string
	for _, e := range entries {
		name := e.Name()
		if e.IsDir() || !strings.HasPrefix(name, "session-") || !strings.HasSuffix(name, ".jsonl") {
			continue
		}
		stamped = append(stamped, name)
	}
	if len(stamped) == 0 {
		return ""
	}
	// THE STAMP IS THE TIME, so the names sort into the order they were retired.
	sort.Strings(stamped)
	return filepath.Join(dir, stamped[len(stamped)-1])
}

// briefSilence says how long a holder has been quiet in words a person reads,
// because the notice is addressed to one.
func briefSilence(d time.Duration) string {
	if d < time.Minute {
		return d.Truncate(time.Second).String()
	}
	return d.Truncate(time.Minute).String()
}
