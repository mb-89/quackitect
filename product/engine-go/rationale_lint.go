package main

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// design: go-rationale-fill  implements: req-rationale-fill
// Every rendered rationale carries real content or an EXPLICIT not-applicable mark.
// An empty slot or a bare TODO reads as neglect in a shipped book; the explicit mark
// distinguishes judged silence from forgotten homework. The lint scans node files
// (the same fence recognition the loader uses); archives stay history and are skipped.
// selftest:rationale-fill keeps the live workspace clean forever.
func rationaleFillFindings(dir string) []string {
	var fs []string
	filepath.Walk(dir, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() || !strings.HasSuffix(path, ".md") || filepath.Base(path) == archiveName {
			return nil
		}
		raw, e := os.ReadFile(path)
		if e != nil || !nodeFence(raw) {
			return nil
		}
		t := strings.ReplaceAll(string(raw), "\r\n", "\n")
		i := strings.Index(t, "\n## Rationale")
		if i < 0 {
			return nil
		}
		sec := t[i+1:]
		if j := strings.Index(sec, "\n"); j >= 0 {
			sec = sec[j+1:]
		}
		if k := strings.Index(sec, "\n## "); k >= 0 {
			sec = sec[:k]
		}
		body := strings.TrimSpace(sec)
		if body == "" || body == "TODO" || strings.HasPrefix(body, "TODO ") || strings.HasPrefix(body, "TODO\n") {
			fs = append(fs, strings.TrimSuffix(filepath.Base(path), ".md")+
				": rationale is empty or TODO - write the reason, or mark it 'Not applicable - <why>'")
		}
		return nil
	})
	sort.Strings(fs)
	return fs
}

// enddesign
