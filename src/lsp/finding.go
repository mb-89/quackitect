// The one shape every door prints. A check answers findings, and the command
// line, the write door and the editor each read this and nothing else.
// [[spec/design_output/lsp#one-shape-every-door-prints]]
package main

import "sort"

const (
	SeverityError   = "error"
	SeverityWarning = "warning"
)

type Finding struct {
	File     string `json:"file"`
	Rule     string `json:"rule"`
	Line     int    `json:"line"`
	Column   int    `json:"column"`
	Message  string `json:"message"`
	Severity string `json:"severity"`
}

func fault(rule, file string, line int, message string) Finding {
	return Finding{File: file, Rule: rule, Line: line, Column: 1, Message: message, Severity: SeverityError}
}

// [[spec/design_output/lsp#one-shape-every-door-prints]]
func sorted(found []Finding) []Finding {
	out := make([]Finding, 0, len(found))
	out = append(out, found...)
	sort.SliceStable(out, func(a, b int) bool {
		if out[a].File != out[b].File {
			return out[a].File < out[b].File
		}
		if out[a].Line != out[b].Line {
			return out[a].Line < out[b].Line
		}
		return out[a].Rule < out[b].Rule
	})
	return out
}
