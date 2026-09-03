package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

// THE MECHANICAL GUARDS LEVEL 0 HOLDS ON ITS OWN, beside the ones in hook.go.
//
// Each one is stated fully by files, identities and this layer's own state,
// so none needs a word from the levels above. Each names the failure it
// prevents, which is the admission test: a guard that cannot is not here.

// A WRITE TO A FILE THAT CHANGED SINCE IT WAS READ IS REFUSED, NEVER FIXED.
//
// More than one hand works over these files: a person in an editor, another
// agent, a script. A write made against content the writer has not seen
// overwrites the other hand's change, and nothing says so. The read evidence
// holds the hash of what was read, so the question is one comparison. It is
// refused rather than corrected because nobody knows what the writer meant
// against content it never saw.
func aStaleWrite(r Roots, path string) (string, bool) {
	if path == "" {
		return "", false
	}
	rec, ok := LoadEvidence(r).Reads[clean(path)]
	if !ok {
		return "", false
	}
	if now := hashFile(path); now != rec.Hash {
		return fmt.Sprintf("%s changed since it was read. Read it again, then write against what is there now.",
			path), true
	}
	return "", false
}

// A READ ALREADY HELD, UNCHANGED, IS NOT PAID FOR TWICE.
//
// The model's context is already the cache. A second read of the same range
// of an unchanged file puts the same tokens in twice. The read set says what
// this agent read and what it said then, and a file that moved since is read
// again without a word. Compaction and a wipe reset the set, so a read the
// context no longer holds is not refused.
func aReadAlreadyHeld(r Roots, actor, path, page string) (string, bool) {
	if path == "" {
		return "", false
	}
	rec, ok := LoadEvidence(r).Reads[clean(path)]
	if !ok || rec.Actor != actor || rec.Page != page {
		return "", false
	}
	if hashFile(path) != rec.Hash {
		return "", false
	}
	return fmt.Sprintf("You already hold %s, and it has not changed since you read it. "+
		"Use what you have, or read a different range of it.", path), true
}

// A READ WITH NO LIMIT OVER A LONG FILE IS CORRECTED TO THE CLAMP.
//
// An oversize read either blows the context or comes back silently cut. The
// correction is unambiguous, so it needs no decision from the agent: the
// same read, with a limit, and the answer says how to read on. Correction
// rather than refusal, because a refusal makes the agent guess the number.
func aReadTooLarge(cfg Config, path string, ti toolInput) (int, bool) {
	if path == "" || ti.Limit > 0 || cfg.ReadClampLines <= 0 {
		return 0, false
	}
	info, err := os.Stat(path)
	if err != nil || info.IsDir() || info.Size() > indexFileLimit {
		return 0, false
	}
	b, err := os.ReadFile(path)
	if err != nil {
		return 0, false
	}
	lines := bytes.Count(b, []byte{'\n'})
	if len(b) > 0 && b[len(b)-1] != '\n' {
		lines++
	}
	from := ti.Offset
	if from < 1 {
		from = 1
	}
	if lines-from+1 <= cfg.ReadClampLines {
		return 0, false
	}
	return lines, true
}

// correctToolUse answers the harness with the call rewritten. It is the
// allow decision carrying a new input, and the reason says what changed.
func (g *guard) correct(updated map[string]any, reason string) {
	out, _ := json.Marshal(map[string]any{
		"hookSpecificOutput": map[string]any{
			"hookEventName":            "PreToolUse",
			"permissionDecision":       "allow",
			"permissionDecisionReason": reason,
			"updatedInput":             updated,
		},
	})
	fmt.Fprintln(g.out, string(out))
}

// pageOf spells the range a read asked for, so two reads of one file with
// different ranges are two reads.
func pageOf(ti toolInput) string { return fmt.Sprintf("%d:%d", ti.Offset, ti.Limit) }

// THE LOOP BREAKER. The same call, with the same input, failing again and
// again is an agent retrying until the turn dies. A counter over input
// hashes needs no domain knowledge: it is mechanical, so it is here. The
// count is fixed, because nothing breaks if it is, and a knob nobody moves
// is a branch nobody tests.
const failuresBeforeRefusal = 3

type failure struct {
	Hash  string `json:"hash"`
	Count int    `json:"count"`
}

func failuresPath(r Roots) string { return r.Private("failures.json") }

func callHash(in hookIn) string {
	sum := sha256.Sum256(append([]byte(in.ToolName+"\n"), in.ToolInput...))
	return hex.EncodeToString(sum[:])
}

func loadFailures(r Roots) map[string]failure {
	out := map[string]failure{}
	b, err := os.ReadFile(failuresPath(r))
	if err != nil || json.Unmarshal(b, &out) != nil {
		return map[string]failure{}
	}
	return out
}

func saveFailures(r Roots, f map[string]failure) error {
	b, err := json.MarshalIndent(f, "", "  ")
	if err != nil {
		return err
	}
	return writeAtomic(failuresPath(r), b, 0o644)
}

// noteFailure counts one more failure of this call for this actor, or the
// first of a new one.
func noteFailure(r Roots, actor string, in hookIn) {
	_ = locked(failuresPath(r), func() error { // a failure it cannot count is counted again next time
		all := loadFailures(r)
		h := callHash(in)
		f := all[actor]
		if f.Hash == h {
			f.Count++
		} else {
			f = failure{Hash: h, Count: 1}
		}
		all[actor] = f
		return saveFailures(r, all)
	})
}

// clearFailures is what a call that came back does: the loop is over.
func clearFailures(r Roots, actor string) {
	_ = locked(failuresPath(r), func() error { // a count it cannot clear is cleared by the next success
		all := loadFailures(r)
		if _, has := all[actor]; !has {
			return nil
		}
		delete(all, actor)
		return saveFailures(r, all)
	})
}

// aRepeatedFailure refuses the call that has failed the same way too many
// times in a row.
func aRepeatedFailure(r Roots, actor string, in hookIn) (string, bool) {
	f := loadFailures(r)[actor]
	if f.Hash != callHash(in) || f.Count < failuresBeforeRefusal {
		return "", false
	}
	return fmt.Sprintf("This exact %s call has failed %d times in a row. Change something before "+
		"trying it again: the input, the approach, or ask.", in.ToolName, f.Count), true
}

// THE STOP THAT RELENTS. The harness gives up on a hook that refuses a stop
// too many times in a row and lets the agent stop anyway, silently. So an
// unbounded refusal is not a stronger guard: it is a guard that stops
// existing without saying so. This one counts, and before the harness would
// override it, it grants the stop and says in the record that it did.
const stopRefusalsBeforeRelenting = 6

func stopsPath(r Roots) string { return r.Private("stops.json") }

type refusedStops struct {
	Session string         `json:"session"`
	Count   map[string]int `json:"count"`
}

func loadStops(r Roots) refusedStops {
	var s refusedStops
	b, err := os.ReadFile(stopsPath(r))
	if err != nil || json.Unmarshal(b, &s) != nil || s.Session != currentSession(r) || s.Count == nil {
		return refusedStops{Session: currentSession(r), Count: map[string]int{}}
	}
	return s
}

// countRefusedStop counts one more refused stop for this actor and answers
// whether the guard relents this time. Relenting resets the count.
func countRefusedStop(r Roots, actor string) (relent bool) {
	_ = locked(stopsPath(r), func() error { // a refusal it cannot count refuses once more, which is the safe side
		s := loadStops(r)
		s.Count[actor]++
		if s.Count[actor] >= stopRefusalsBeforeRelenting {
			relent = true
			delete(s.Count, actor)
		}
		b, err := json.MarshalIndent(s, "", "  ")
		if err != nil {
			return err
		}
		return writeAtomic(stopsPath(r), b, 0o644)
	})
	return relent
}

// forgetRefusedStops is what a granted stop does: the run of refusals ended.
func forgetRefusedStops(r Roots, actor string) {
	_ = locked(stopsPath(r), func() error { // a count it cannot clear relents one refusal sooner
		s := loadStops(r)
		if _, has := s.Count[actor]; !has {
			return nil
		}
		delete(s.Count, actor)
		b, err := json.MarshalIndent(s, "", "  ")
		if err != nil {
			return err
		}
		return writeAtomic(stopsPath(r), b, 0o644)
	})
}

// A HELPER RETURNING WHAT IT READ IS SENT BACK TO DIGEST IT.
//
// The budget is a ratio of the bytes the helper read this session, with a
// floor so a helper given a small job is not held to a ratio of nothing. A
// helper that read nothing and reasoned gets the floor, which is the design's
// absolute floor for that case.
func aHelperReturningTooMuch(r Roots, cfg Config, in hookIn) (string, bool) {
	if in.AgentID == "" || cfg.HelperRatio <= 0 {
		return "", false
	}
	returned := int64(len(in.LastAssistantMessage))
	read := BytesReadBy(r, in.AgentID)
	allowed := max(int64(cfg.HelperFloorBytes), read/int64(cfg.HelperRatio))
	if returned <= allowed {
		return "", false
	}
	return fmt.Sprintf("Your answer is %d bytes, and the budget is %d: one part in %d of the %d bytes you read, "+
		"or %d at least. Whoever asked wants a digest, not the material. Say what you found, "+
		"where it is, and what it means, in that order, and stop again.",
		returned, allowed, cfg.HelperRatio, read, cfg.HelperFloorBytes), true
}

// ensureEngine brings the engine over these roots up when none is running,
// and waits for it to say so. It is what the wake hook and session start do,
// and what makes a crashed engine cost at most the rest of one turn.
func ensureEngine(r Roots) {
	if _, up := LoadRunning(r); up {
		return
	}
	exe := filepath.Join(r.Method, ".bin", exeName("se"))
	if _, err := os.Stat(exe); err != nil {
		fmt.Fprintln(os.Stderr, "quackitect: no engine at", exe)
		return
	}
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return
	}
	out, err := os.OpenFile(r.Private("engine.out"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
	if err != nil {
		return
	}
	defer out.Close()
	cmd := Detached(Quietly(exec.Command(exe, "--work", r.Work, "--method", r.Method)))
	cmd.Stdout, cmd.Stderr = out, out
	if err := cmd.Start(); err != nil {
		fmt.Fprintln(os.Stderr, "quackitect: the engine could not be started:", err)
		return
	}
	_ = cmd.Process.Release() // it is its own process now, and this one returns
	// UP MEANS ANSWERING. The pid is written before the model listens, and
	// a client that arrives in between is refused for an engine that is a
	// moment from answering, so the wait is for the socket.
	deadline := time.Now().Add(engineUpBudget)
	for time.Now().Before(deadline) {
		if v, up := LoadRunning(r); up && v.Socket != "" {
			return
		}
		time.Sleep(50 * time.Millisecond)
	}
	fmt.Fprintln(os.Stderr, "quackitect: the engine was started and has not reported ready")
}

// engineUpBudget is how long the wake waits for a started engine to say it
// is running. It is the ready budget's first part, and a hook that waits
// longer holds the session for an engine that is not coming.
const engineUpBudget = 5 * time.Second
