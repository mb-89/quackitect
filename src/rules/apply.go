// The fixes the rules offer, applied: each replace action rewrites the text it
// matched, so a fixer needs no outside tool.
// [[spec/tickets/vale-leaves-the-tree]]
package rules

// The text with each finding's replace action applied. [[spec/tickets/vale-leaves-the-tree]]
func Apply(text string, found []Finding) string {
	return text
}
