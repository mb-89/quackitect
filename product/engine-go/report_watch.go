package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// design: go-report-watch  implements: req-report-live-reload
// `quack report --watch [--port N]` serves the report over a tiny zero-dep net/http server. It pushes a Server-Sent Event whenever a source input, spec, product, or attest, changes. The page's reload hook, injected by RenderReport, then reloads. So the open board auto-updates ONLY when the source actually changes, not on a blind timer, preserving interactivity between real changes. Static `quack report` is unaffected; the reload hook silently no-ops on file://.
func serveWatch(port string) {
	if port == "" {
		port = "8899"
	}
	out := filepath.Join(dataDirFor("out"), "report.html")
	var mu sync.Mutex
	clients := map[chan struct{}]bool{}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		_ = RenderReport(out) // recompute live on every load
		raw, err := os.ReadFile(out)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write(raw)
	})

	// the register's answer endpoint (go-register-answer): POST node/field/value,
	// the same validated application a console edit makes, 409 with the reason on refusal
	http.HandleFunc("/register-answer", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "POST only", 405)
			return
		}
		s := loadAskStore()
		if err := registerAnswerApply(LoadAll(), r.FormValue("node"), r.FormValue("field"), r.FormValue("value"), "register", s); err != nil {
			http.Error(w, err.Error(), 409)
			return
		}
		if err := saveAskStore(s); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		w.WriteHeader(204)
	})

	// the hand-off page, live (adr-handoff-html): GET renders the gate's page fresh;
	// POST /handoff-answer routes the y/n through the SAME recorded lane a phone tap
	// takes (a resolved gate ask -> BlessIntent -> the bless, actor=user, channel).
	http.HandleFunc("/handoff/", func(w http.ResponseWriter, r *http.Request) {
		gate := strings.TrimPrefix(r.URL.Path, "/handoff/")
		nodes := LoadAll()
		if _, ok := nodes[gate]; !ok {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write([]byte(renderHandoffHTML(gate, nodes, StatusMap(nodes))))
	})
	http.HandleFunc("/handoff-answer", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "POST only", 405)
			return
		}
		gate, verdict := r.FormValue("gate"), r.FormValue("verdict")
		if verdict != "y" && verdict != "n" {
			http.Error(w, "verdict must be y or n", 409)
			return
		}
		if err := handoffBless(gate, verdict); err != nil {
			http.Error(w, err.Error(), 409)
			return
		}
		w.WriteHeader(204)
	})

	http.HandleFunc("/__reload", func(w http.ResponseWriter, r *http.Request) {
		fl, ok := w.(http.Flusher)
		if !ok {
			return
		}
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		ch := make(chan struct{}, 1)
		mu.Lock()
		clients[ch] = true
		mu.Unlock()
		defer func() { mu.Lock(); delete(clients, ch); mu.Unlock() }()
		for {
			select {
			case <-ch:
				fmt.Fprint(w, "data: reload\n\n")
				fl.Flush()
			case <-r.Context().Done():
				return
			}
		}
	})

	go func() {
		last := latestMtime()
		for {
			time.Sleep(time.Second)
			if m := latestMtime(); m.After(last) {
				last = m
				mu.Lock()
				for ch := range clients {
					select {
					case ch <- struct{}{}:
					default:
					}
				}
				mu.Unlock()
			}
		}
	}()

	url := "http://localhost:" + port + "/"
	fmt.Println("watching " + ROOT + " -> " + url + "  (Ctrl+C to stop)")
	openFile(url)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Fprintln(os.Stderr, "watch error:", err)
		quackExit(1)
	}
}

// design: go-register-answer  implements: req-register-ask, req-register-killer-guard
// This is the register's answer lane (adr-register-watch-answers). A red row's ruling arrives over the watch server and dispatches the SAME validated application a console edit would make. The field value and its "user-ruling via <channel>" provenance rewrite the node under one hash (adr-provenance-in-node). The ruling records on the ask store as a resolved DECISION ask carrying the channel (req-register-ask.2). A KILLER row refuses every lane EXCEPT a hand-off channel (req-register-killer-guard). The hand-off page IS the ceremony, so the user rules killer fields there directly. The static render never reaches here; its rows carry the console route instead.
func registerAnswerApply(nodes map[string]Node, id, field, value, channel string, store *AskStore) error {
	n, ok := nodes[id]
	if !ok {
		return fmt.Errorf("no such node: %s", id)
	}
	if n.Killer && !strings.HasPrefix(channel, "handoff") {
		// outside the hand-off ceremony a killer refuses the lane; ON the hand-off
		// page the user IS the ceremony and rules killer fields directly (owner ruling)
		return fmt.Errorf("killer row: adjudicate via the hand-off page (quack progress --pager %s)", id)
	}
	schema := mergedSchema(loadFieldSchemas(schemaConfigDir()), n.Type)
	r, ok := schema.fields[field]
	if !ok {
		return fmt.Errorf("field %q is not in the %s schema", field, n.Type)
	}
	if msg := ruleViolation(r, value); msg != "" {
		return fmt.Errorf("answer refused: field %q %s - fix the value, then answer again", field, msg)
	}
	if err := rewriteNodeField(n.Path, field, value, "user-ruling via "+channel); err != nil {
		return err
	}
	now := time.Now().Unix()
	store.Asks = append(store.Asks, Ask{
		ID: "reg-" + h12(id+"|"+field+"|"+value), CID: h12(id + "|" + field + "|" + fmt.Sprint(now)),
		Kind: "decision", Check: id,
		Question: "field " + field + " of " + id + " ruled over the register",
		Options:  []AskOption{{ID: "applied", Label: field + " = " + value}},
		Created:  now, Updated: now, State: "resolved", Answer: "applied", Sent: true,
	})
	return nil
}

// rewriteNodeField replaces one frontmatter field and its provenance entry in place.
// Bytes stay bytes: only the two target lines change; a missing field or provenance
// block is inserted at the frontmatter end; the body never rewrites.
func rewriteNodeField(path, field, value, source string) error {
	raw, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	parts := strings.SplitN(string(raw), "---", 3)
	if len(parts) < 3 {
		return fmt.Errorf("%s: no frontmatter", path)
	}
	lines := strings.Split(parts[1], "\n")
	fieldDone, provDone := false, false
	provAt := -1
	inProv := false
	for i, l := range lines {
		indented := l != "" && (l[0] == ' ' || l[0] == '\t')
		k, _, hasKV := strings.Cut(l, ":")
		key := strings.TrimSpace(k)
		if !indented {
			inProv = hasKV && key == "provenance"
			if inProv {
				provAt = i
			}
			if hasKV && key == field {
				lines[i] = field + ": " + value
				fieldDone = true
			}
			continue
		}
		if inProv && hasKV && key == field {
			lines[i] = "  " + field + ": " + source
			provDone = true
		}
	}
	if !fieldDone {
		lines = append(lines[:len(lines)-1], field+": "+value, lines[len(lines)-1])
	}
	if !provDone {
		if provAt >= 0 {
			lines = append(lines[:provAt+1], append([]string{"  " + field + ": " + source}, lines[provAt+1:]...)...)
		} else {
			lines = append(lines[:len(lines)-1], "provenance:", "  "+field+": "+source, lines[len(lines)-1])
		}
	}
	out := parts[0] + "---" + strings.Join(lines, "\n") + "---" + parts[2]
	return os.WriteFile(path, []byte(out), 0o644)
}

// handoffBless routes a page tap through the SAME recorded lane a phone answer takes:
// a resolved gate ask on the store, then applyBlessIntent (one event, actor=user,
// channel=handoff). A "n" resolves the ask without a bless - the gate stays open,
// the dissent is on the record.
func handoffBless(gate, verdict string) error {
	nodes := LoadAll()
	sm := StatusMap(nodes)
	checks := []string{gate}
	if group, mergedGate := pagerGroup(gate, nodes, sm); len(group) > 0 && mergedGate != "" {
		checks = append(append([]string{}, group...), mergedGate)
		gate = mergedGate
	}
	s := loadAskStore()
	now := time.Now().Unix()
	s.Asks = append(s.Asks, Ask{
		ID: "hoff-" + h12(gate+"|"+fmt.Sprint(now)), CID: h12("hoff|" + gate + "|" + fmt.Sprint(now)),
		Kind: "gate", Check: gate,
		Question: "Bless " + gate + "? (hand-off page)",
		Options:  []AskOption{{ID: "y", Label: "bless"}, {ID: "n", Label: "reopen"}},
		Created:  now, Updated: now, State: "resolved", Answer: verdict, Sent: true,
	})
	if err := saveAskStore(s); err != nil {
		return err
	}
	if verdict != "y" {
		return nil // recorded dissent; the gate stays open
	}
	// a y accepts everything the page STATES: the defaults write-through lives in
	// applyBlessIntent — ONE home for page, phone and any future channel — and the
	// ripe killer gates travel in the checks group, blessed individually.
	_, killers := handoffAccepts(gate, nodes, StatusMap(nodes))
	seen := map[string]bool{}
	var all []string
	for _, id := range append(checks, killers...) {
		if !seen[id] {
			seen[id] = true
			all = append(all, id)
		}
	}
	return applyBlessIntent(&BlessIntent{Check: gate, Checks: all, Verdict: "y", By: "user", Channel: "handoff"})
}

// design: go-handoff-lifecycle  implements: req-handoff-lifecycle
// serveHandoffOnce is the ONE-SHOT hand-off server, and its life follows the page. An ephemeral port serves the gate's page. The page heartbeats while open, /hb every few seconds, /bye on close. The watchdog ends the server on the first of four events. An answer, y, makes the injected bless fire once. Silence after a connect, "closed", means the user simply closed the page, and the gate stays open. No connect within the bound reads as "unopened". The hard cap reads as "timeout". started, a test seam, receives the base URL once listening; nil skips it.
func serveHandoffOnce(gate string, render func() string, connectWait, beatGap, hardCap time.Duration,
	bless func(g, v string) error, started chan<- string) (string, error) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return "", err
	}
	var mu sync.Mutex
	connected := false
	lastBeat := time.Now()
	answered := ""
	touch := func(conn bool) {
		mu.Lock()
		if conn {
			connected = true
		}
		lastBeat = time.Now()
		mu.Unlock()
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/handoff/", func(w http.ResponseWriter, r *http.Request) {
		touch(true)
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write([]byte(render()))
	})
	mux.HandleFunc("/hb", func(w http.ResponseWriter, r *http.Request) { touch(true); w.WriteHeader(204) })
	mux.HandleFunc("/bye", func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		lastBeat = time.Time{} // an explicit close beats the silence timer
		mu.Unlock()
		w.WriteHeader(204)
	})
	mux.HandleFunc("/handoff-answer", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "POST only", 405)
			return
		}
		v := r.FormValue("verdict")
		if r.FormValue("gate") != gate || (v != "y" && v != "n") {
			http.Error(w, "unknown gate or verdict", 409)
			return
		}
		if v == "y" {
			if err := bless(gate, v); err != nil {
				http.Error(w, err.Error(), 409)
				return
			}
		}
		mu.Lock()
		answered = v
		mu.Unlock()
		w.WriteHeader(204)
	})
	mux.HandleFunc("/register-answer", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "POST only", 405)
			return
		}
		touch(true)
		s := loadAskStore()
		if err := registerAnswerApply(LoadAll(), r.FormValue("node"), r.FormValue("field"), r.FormValue("value"), "handoff", s); err != nil {
			http.Error(w, err.Error(), 409)
			return
		}
		saveAskStore(s)
		w.WriteHeader(204)
	})
	srv := &http.Server{Handler: mux}
	go srv.Serve(ln)
	base := "http://" + ln.Addr().String()
	if started != nil {
		started <- base
	}
	t0 := time.Now()
	outcome := ""
	for outcome == "" {
		time.Sleep(100 * time.Millisecond)
		mu.Lock()
		a, conn, beat := answered, connected, lastBeat
		mu.Unlock()
		switch {
		case a != "":
			outcome = a
		case conn && (beat.IsZero() || time.Since(beat) > beatGap):
			outcome = "closed"
		case !conn && time.Since(t0) > connectWait:
			outcome = "unopened"
		case time.Since(t0) > hardCap:
			outcome = "timeout"
		}
	}
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
	return outcome, nil
}

// enddesign

// latestMtime is the newest mtime across the inputs that can change a check state.
func latestMtime() time.Time {
	var t time.Time
	paths := []string{SPEC, filepath.Join(ROOT, "product"), ATTEST}
	for _, p := range paths {
		filepath.Walk(p, func(_ string, fi os.FileInfo, e error) error {
			if e == nil && !fi.IsDir() && fi.ModTime().After(t) {
				t = fi.ModTime()
			}
			return nil
		})
	}
	return t
}

// enddesign
