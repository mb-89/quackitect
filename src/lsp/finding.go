// The one shape every door prints. A check answers findings, and the command
// line, the write door and the editor each read this and nothing else.
// [[spec/design_output/tree#what-a-rule-answers]]
package main

import "sort"

const (
	SeverityError   = "error"
	SeverityWarning = "warning"
	// A hint draws under the text alone, off the Problems panel. [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
	SeverityHint = "hint"
)

type Finding struct {
	File     string `json:"file"`
	Rule     string `json:"rule"`
	Line     int    `json:"line"`
	Column   int    `json:"column"`
	Message  string `json:"message"`
	Severity string `json:"severity"`
	// The tool a finding comes from, where a tool draws it, and nothing for this server's own rules. [[spec/design_output/lsp#the-server-runs-the-tools]]
	Source string `json:"source,omitempty"`
}

func fault(rule, file string, line int, message string) Finding {
	return Finding{File: file, Rule: rule, Line: line, Column: 1, Message: message, Severity: SeverityError}
}

// A finding a person acts on at their own pace, not one the Problems panel lists. [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
func hint(rule, file string, line int, message string) Finding {
	return Finding{File: file, Rule: rule, Line: line, Column: 1, Message: message, Severity: SeverityHint}
}

// [[spec/design_output/tree#what-a-rule-answers]]
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
