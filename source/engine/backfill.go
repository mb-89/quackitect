package main

import (
	"bufio"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

// WHAT THE HARNESS SAW AND THE RECORD DID NOT.
//
// MEASURED 2026-08-31, session 20260831-101714: the same guard wrote twenty
// PreToolUse records and one Stop, and no prompt records at all, while four
// messages arrived. UserPromptSubmit does not fire for a message sent into a
// turn that is already running. Driving the hook by hand writes one, so the
// wiring is right and the event does not come.
//
// The record is meant to hold every call. A person's own words missing from it
// is the worst thing to be missing, because it is the only part nothing else
// can reconstruct.
//
// SO THE STOP HOOK READS THE HARNESS TRANSCRIPT and writes what is not there
// yet. The harness owns that file and its shape, so this reads the two fields
// it can rely on and ignores everything else. A shape it does not recognise
// leaves the record as it was, which is what it would have been anyway.

type transcriptLine struct {
	Type    string `json:"type"`
	Message struct {
		Role    string          `json:"role"`
		Content json.RawMessage `json:"content"`
	} `json:"message"`
}

// HOW FAR THIS HAS READ. A transcript is only appended to, so everything
// before the mark has been seen and never has to be read again. Without it
// every tool call re-reads the whole file, and the file grows all session.
type mark struct {
	Path string `json:"path"`
	At   int64  `json:"at"`
}

func markPath(dir string) string { return filepath.Join(dir, "read-so-far.json") }

func readMark(dir, path string) int64 {
	var m mark
	b, err := os.ReadFile(markPath(dir))
	if err != nil || json.Unmarshal(b, &m) != nil || m.Path != path {
		return 0
	}
	return m.At
}

func writeMark(dir, path string, at int64) {
	b, err := json.Marshal(mark{Path: path, At: at})
	if err != nil {
		return
	}
	_ = os.WriteFile(markPath(dir), b, 0o644)
}

// PromptsIn reads the user's own text out of a harness transcript, in order.
// A tool result is also a user message to a harness, and it is not something a
// person said, so only text blocks count.
func PromptsIn(path string) []string {
	out, _ := promptsFrom(path, 0)
	return out
}

// promptsFrom reads from a byte offset and answers where it stopped, so the
// next call reads only what has arrived since.
func promptsFrom(path string, from int64) ([]string, int64) {
	f, err := os.Open(path)
	if err != nil {
		return nil, from
	}
	defer f.Close()
	st, err := f.Stat()
	if err != nil {
		return nil, from
	}
	// A file that shrank is a different file under the same name, so the mark
	// means nothing and the whole of it is read again.
	if from > st.Size() {
		from = 0
	}
	if _, err := f.Seek(from, 0); err != nil {
		return nil, from
	}

	var out []string
	in := bufio.NewScanner(f)
	in.Buffer(make([]byte, 0, 1<<20), 1<<24)
	for in.Scan() {
		var l transcriptLine
		if json.Unmarshal(in.Bytes(), &l) != nil || l.Type != "user" || l.Message.Role != "user" {
			continue
		}
		for _, t := range textIn(l.Message.Content) {
			if theirs(t) {
				out = append(out, t)
			}
		}
	}
	if err := in.Err(); err != nil {
		return out, from
	}
	return out, st.Size()
}

// A PROMPT IS WHAT THE PERSON WROTE. A harness puts other things in the same
// place: its own reminders, and whatever a hook printed, handed back as if the
// person had said it. Writing those into the record fills it with the engine
// talking to itself.
//
// The markers are ours where they can be. The sanctioned list is text this
// program wrote, so recognising it is recognising our own voice rather than
// relying on a decision the harness made and can change.
func theirs(text string) bool {
	for _, ours := range []string{
		"THESE STOPS ARE SANCTIONED",
		"Stop hook feedback:",
		"<system-reminder>",
		"<command-name>",
	} {
		if strings.Contains(text, ours) {
			return false
		}
	}
	return true
}

// The content is a string, or a list of blocks. Both shapes are written by the
// harnesses this runs under.
func textIn(raw json.RawMessage) []string {
	var s string
	if json.Unmarshal(raw, &s) == nil {
		if t := strings.TrimSpace(s); t != "" {
			return []string{t}
		}
		return nil
	}
	var blocks []struct {
		Type string `json:"type"`
		Text string `json:"text"`
	}
	if json.Unmarshal(raw, &blocks) != nil {
		return nil
	}
	var out []string
	for _, b := range blocks {
		if b.Type != "text" {
			continue
		}
		if t := strings.TrimSpace(b.Text); t != "" {
			out = append(out, t)
		}
	}
	return out
}

// BackfillPrompts writes every prompt the record does not already hold, and
// answers how many. It compares on the first line, because that is what the
// record keeps and comparing on what is kept is the only comparison that can
// be right twice.
func BackfillPrompts(dir, transcript, actor string) int {
	from := readMark(dir, transcript)
	said, to := promptsFrom(transcript, from)
	if len(said) == 0 {
		writeMark(dir, transcript, to)
		return 0
	}
	// What is already in the record is only worth asking about on the first
	// pass. After that the mark says what has been seen.
	var missing []string
	if from == 0 {
		held := promptsHeld(dir)
		for _, p := range said {
			if !held[firstLine(p)] {
				missing = append(missing, p)
			}
		}
	} else {
		missing = said
	}
	l, err := OpenExistingLog(dir)
	if err != nil {
		// The mark is not moved. Nothing was written, so nothing may be
		// counted as seen.
		return 0
	}
	defer l.Close()
	for _, p := range missing {
		l.Write("user", "prompt", actor, firstLine(p), nil,
			map[string]any{"backfilled": true})
	}
	writeMark(dir, transcript, to)
	return len(missing)
}

func promptsHeld(dir string) map[string]bool {
	held := map[string]bool{}
	f, err := os.Open(filepath.Join(dir, Current))
	if err != nil {
		return held
	}
	defer f.Close()
	in := bufio.NewScanner(f)
	in.Buffer(make([]byte, 0, 1<<20), 1<<24)
	for in.Scan() {
		var r Record
		if json.Unmarshal(in.Bytes(), &r) == nil && r.Kind == "prompt" {
			held[r.Msg] = true
		}
	}
	return held
}
