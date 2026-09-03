package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"time"
)

// THE MODEL, ASKED DIRECTLY. The engine that lives answers questions on a
// socket it publishes beside its pid, so a question from the lane goes to
// the running process and starts nothing. With no engine over the folder
// there is nothing to ask, and the answer says so and how to start one.

type running struct {
	PID    int    `json:"pid"`
	Socket string `json:"socket"`
}

// askModel puts one question to the engine over the work folder, and
// answers what it said, or why it could not be asked.
func askModel(r roots, method string, params any) (json.RawMessage, error) {
	return askModelWithin(r, method, params, 10*time.Second)
}

// askModelWithin is askModel with the caller's own patience for the answer.
func askModelWithin(r roots, method string, params any, within time.Duration) (json.RawMessage, error) {
	// THE STATUS FILE IS REPLACED ON EVERY BEAT, and on Windows a reader can
	// meet the instant between the old file going and the new one landing.
	// A miss is read again before it is believed.
	var b []byte
	var err error
	for try := 0; try < 20; try++ {
		if b, err = os.ReadFile(filepath.Join(r.work, ".se", "engine.json")); err == nil {
			break
		}
		time.Sleep(25 * time.Millisecond)
	}
	if err != nil {
		return nil, fmt.Errorf("no engine is running over %s, so there is nothing to ask. Start it: se --work %s", r.work, r.work)
	}
	var v running
	if json.Unmarshal(b, &v) != nil || v.Socket == "" {
		return nil, fmt.Errorf("the engine over %s answers no questions yet. Start it again: se --work %s", r.work, r.work)
	}
	conn, err := net.DialTimeout("unix", v.Socket, 200*time.Millisecond)
	if err != nil {
		return nil, fmt.Errorf("the engine over %s is not answering on %s. Start it again: se --work %s", r.work, v.Socket, r.work)
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(within)) // a deadline it cannot set is a wait the read below still ends
	raw, err := json.Marshal(params)
	if err != nil {
		return nil, err
	}
	// The parameters go as the JSON they are, not as a string holding it.
	if err := json.NewEncoder(conn).Encode(map[string]any{"method": method, "params": json.RawMessage(raw)}); err != nil {
		return nil, err
	}
	var a struct {
		OK     bool            `json:"ok"`
		Rev    int64           `json:"rev"`
		Result json.RawMessage `json:"result"`
		Error  string          `json:"error"`
	}
	if err := json.NewDecoder(bufio.NewReader(conn)).Decode(&a); err != nil {
		return nil, fmt.Errorf("the engine's answer will not read: %w", err)
	}
	if !a.OK {
		return nil, fmt.Errorf("%s", a.Error)
	}
	return a.Result, nil
}
