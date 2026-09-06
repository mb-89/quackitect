package main

import (
	"bufio"
	"encoding/json"
	"os"
	"strings"

	saidbefore "quackitect/engine/internal/said"
	"quackitect/engine/internal/sessionlog"
)

// THE ENGINE COPIES WHAT THE PERSON SAID, RATHER THAN ASKING THE AGENT TO.
//
// The harness fires UserPromptSubmit for a message that starts a turn. It fires
// nothing for one written into a turn already running, and that was said to
// leave the agent as the only thing that could record those. It does not: the
// harness writes them to its own transcript, verbatim, as an attachment of type
// queued_command whose origin is human.
//
// MEASURED before this was built: 4 occurrences of one mid-turn message and 3
// of another in the session transcript, both complete.
//
// SO THE GUARD COPIES THEM. It runs on every tool call, so a message is in the
// record by the agent's next call whatever the agent does or forgets. The agent
// keeps se_said for the case where no guard event follows.
//
// IT READS ONLY WHAT IS NEW. The transcript is append-only and reaches tens of
// megabytes, so the offset it reached is remembered and the next pass starts
// there.

type heardAt struct {
	Path string `json:"path"`
	At   int64  `json:"at"`
}

func heardPath(r Roots) string { return r.Private("heard.json") }

func loadHeard(r Roots) heardAt {
	var h heardAt
	b, err := os.ReadFile(heardPath(r))
	if err != nil || json.Unmarshal(b, &h) != nil {
		return heardAt{}
	}
	return h
}

func saveHeard(r Roots, h heardAt) {
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return
	}
	if b, err := json.Marshal(h); err == nil {
		_ = writeAtomic(heardPath(r), append(b, '\n'), 0o644) // the copy is retried from the transcript on the next call
	}
}

// One transcript line, read for the one thing wanted from it.
type heardLine struct {
	Type       string `json:"type"`
	Attachment struct {
		Type   string `json:"type"`
		Prompt []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"prompt"`
		Origin struct {
			Kind string `json:"kind"`
		} `json:"origin"`
	} `json:"attachment"`
}

// CopyWhatWasHeard puts every mid-turn message the harness recorded into the
// record, and answers how many it copied.
//
// A TRANSCRIPT THAT WILL NOT READ IS NOT AN ERROR. The guard runs on a tool
// call and a person is waiting for it, so a harness that names no transcript,
// or names one this process cannot open, means nothing is copied and the call
// goes through.
func CopyWhatWasHeard(r Roots, transcript string, log *sessionlog.Log, actor string) int {
	if transcript == "" {
		return 0
	}
	f, err := os.Open(transcript)
	if err != nil {
		return 0
	}
	defer f.Close()

	// ONE GUARD COPIES AT A TIME. Two events arriving together both read the
	// same offset, both copied the same lines, and the person's sentence
	// landed in the record twice with two obligations behind it.
	unlock, err := lockFile(heardPath(r))
	if err != nil {
		return 0
	}
	defer unlock()

	was := loadHeard(r)
	// A TRANSCRIPT THIS ENGINE HAS NOT READ BEFORE STARTS AT ITS END.
	//
	// Everything already in it was said before this engine could copy anything,
	// and whoever heard it dealt with it. Starting at the beginning replayed a
	// whole session: MEASURED, 131 repeats of 102 messages on the first run.
	if was.Path != transcript {
		StartWhereItIs(r, transcript)
		return 0
	}
	from := was.At
	if st, err := f.Stat(); err == nil && st.Size() < from {
		from = 0
	}
	if from > 0 {
		if _, err := f.Seek(from, 0); err != nil {
			from = 0
		}
	}

	read := from
	copied := 0
	// WHAT THE RECORD ALREADY HOLDS, COUNTED RATHER THAN LOOKED FOR. Asking
	// whether the words are there at all swallowed a message the person really
	// sent: two identical messages with no answer between them, which is how
	// somebody interrupts a running turn, became one record.
	have := map[string]int{}
	in := bufio.NewScanner(f)
	in.Buffer(make([]byte, 0, 1<<20), 1<<26)
	for in.Scan() {
		line := in.Bytes()
		read += int64(len(line)) + 1
		var h heardLine
		if json.Unmarshal(line, &h) != nil {
			continue
		}
		if h.Type != "attachment" || h.Attachment.Type != "queued_command" {
			continue
		}
		if h.Attachment.Origin.Kind != "human" {
			continue
		}
		var say []string
		for _, p := range h.Attachment.Prompt {
			if t := strings.TrimSpace(p.Text); t != "" {
				say = append(say, t)
			}
		}
		said := strings.Join(say, "\n\n")
		if said == "" {
			continue
		}
		// ONE PROMPT, ONE RECORD, AND TWO PROMPTS TWO. The agent's said verb
		// writes the same messages, and whichever gets there first is the one
		// that stands. So a copy happens when the transcript holds more of
		// these words than the record does, and a person who said the same
		// thing twice said it twice.
		if _, asked := have[said]; !asked {
			have[said] = saidbefore.Count(SessionLog(r), said)
		}
		if have[said] > 0 {
			have[said]--
			continue
		}
		// THROUGH record(), BECAUSE THERE MAY BE NO LOG. The hook keeps nil
		// when no session is running and says so: the guard still answers,
		// because the answer is about a file and not about a session. This one
		// call went straight to the log and took the tool call down with it,
		// and it is reached PRECISELY when there is no log, because SaidCount
		// reads the record and answers nought for everything without one.
		record(log, "user", "prompt", "owner", said, nil, map[string]any{"heard": "mid-turn"})
		// THE WALKER OWES THE ANSWER, NOT WHOEVER HAPPENED TO COPY IT.
		//
		// Several agents run here at once and any of their tool calls can be
		// the one that reaches the transcript first. Telling that one to answer
		// refused a reviewer every call it made until it answered a message
		// about the walker's work, while the walker answered unrefused. Three
		// answers reached one question, twice in one afternoon.
		//
		// The person is talking to the walker and the walker is the one that
		// can act on what they said.
		_ = TheyAsked(r, Walker, said) // the guard answers whether or not it can note the question
		// A PERSON WITH NO PANEL REACHES A CONTROL BY WRITING ITS KEYWORD.
		// It sits here rather than in the agent, so the text comes from the
		// harness and an agent cannot forge one.
		KeywordSaid(r, log, Walker, said)
		copied++
	}
	// The offset is kept even when nothing was copied, so the next pass does
	// not read the same megabytes again.
	saveHeard(r, heardAt{Path: transcript, At: read})
	return copied
}

// StartWhereItIs marks the transcript as read without copying anything, for the
// start of a session. Everything before this session belongs to another one.
func StartWhereItIs(r Roots, transcript string) {
	if transcript == "" {
		return
	}
	st, err := os.Stat(transcript)
	if err != nil {
		return
	}
	saveHeard(r, heardAt{Path: transcript, At: st.Size()})
}
