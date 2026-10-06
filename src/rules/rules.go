// The prose rules in Go: every rule the voice holds, over a parsed markdown
// tree or the raw text, scoped by path, answering in the shape Vale answered.
// [[spec/tickets/go-rules-replace-vale]]
package rules

// One finding: the rule, its place, the text it matched, and what it says. [[spec/tickets/go-rules-replace-vale]]
type Finding struct {
	Check    string `json:"Check"`
	Line     int    `json:"Line"`
	Span     [2]int `json:"Span"`
	Match    string `json:"Match"`
	Message  string `json:"Message"`
	Severity string `json:"Severity"`
	Link     string `json:"Link"`
}

// The texts the rules read past the file: the paragraph schema and the vocabulary lists, each by its path. [[spec/tickets/go-rules-replace-vale]]
type Read func(path string) string

// The rules loaded once over the texts they read. [[spec/tickets/go-rules-replace-vale]]
type Set struct{}

// Loads the rules over the texts the reader hands. [[spec/tickets/go-rules-replace-vale]]
func Load(read Read) (*Set, error) { return &Set{}, nil }

// Every finding over the text, read as the file at the path. [[spec/tickets/go-rules-replace-vale]]
func (set *Set) Lint(path, text string) []Finding { return nil }
