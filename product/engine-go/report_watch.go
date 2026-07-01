package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// design: go-report-watch  implements: req-report-live-reload
// `quack report --watch [--port N]` serves the report over a tiny zero-dep net/http server and pushes a
// Server-Sent Event whenever a source input (spec, product, attest) changes — the page's reload hook
// (injected by RenderReport) then reloads. So the open board auto-updates ONLY when the source actually
// changes (not on a blind timer), preserving interactivity between real changes. Static `quack report`
// is unaffected (the reload hook silently no-ops on file://).
func serveWatch(port string) {
	if port == "" {
		port = "8899"
	}
	out := filepath.Join(QUACK, "out", "report.html")
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
		os.Exit(1)
	}
}

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
